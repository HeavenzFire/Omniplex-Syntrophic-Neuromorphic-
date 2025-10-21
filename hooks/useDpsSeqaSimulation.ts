
import { useState, useRef, useCallback, useEffect } from 'react';
import type { SimulationParams, SimulationState, SimulationHistory, SimulationAnalysis } from '../types';

// Box-Muller transform to get a normally distributed random number
const gaussianRandom = (mean = 0, stdev = 1) => {
    let u = 1 - Math.random(); //Converting [0,1) to (0,1]
    let v = Math.random();
    let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return z * stdev + mean;
};

const INITIAL_STATE: SimulationState = { coherence: 0.5, energy: 1.0, routing: 0.4 };
const INITIAL_HISTORY: SimulationHistory = { coherence: [], energy: [], routing: [] };

export const useDpsSeqaSimulation = (params: SimulationParams) => {
  const [isRunning, setIsRunning] = useState(false);
  const [state, setState] = useState<SimulationState>(INITIAL_STATE);
  const [history, setHistory] = useState<SimulationHistory>(INITIAL_HISTORY);
  const [analysis, setAnalysis] = useState<SimulationAnalysis>({
    steadyCoherence: 0,
    steadyEnergy: 0,
    stability: 'Calculating...',
  });

  const simulationStateRef = useRef({ ...INITIAL_STATE });
  const historyRef = useRef({ ...INITIAL_HISTORY });
  const stepCountRef = useRef(0);
  const intervalRef = useRef<number | null>(null);
  const influenceRef = useRef({ coherence: 0, energy: 0 });

  const performAnalysis = useCallback(() => {
    const histLen = historyRef.current.coherence.length;
    if (histLen < 100) {
      setAnalysis({ steadyCoherence: 0, steadyEnergy: 0, stability: 'Calculating...' });
      return;
    }
    const last100C = historyRef.current.coherence.slice(-100).map(p => p.value);
    const last100E = historyRef.current.energy.slice(-100).map(p => p.value);
    
    const steadyC = last100C.reduce((a, b) => a + b, 0) / 100;
    const steadyE = last100E.reduce((a, b) => a + b, 0) / 100;
    const stability = Math.abs(steadyE - 1.0) < 0.2 ? 'Stable' : 'Unstable';
    
    setAnalysis({
      steadyCoherence: steadyC,
      steadyEnergy: steadyE,
      stability,
    });
  }, []);

  const applyInfluence = useCallback((influence: { coherence: number; energy: number }) => {
    influenceRef.current.coherence += influence.coherence;
    influenceRef.current.energy += influence.energy;
  }, []);

  const simulationStep = useCallback(() => {
    let { coherence: C, energy: E } = simulationStateRef.current;
    const { alpha, sigma, k, gamma, dt } = params;

    // Apply and decay user influence
    C += influenceRef.current.coherence;
    E += influenceRef.current.energy;
    influenceRef.current.coherence *= 0.95; // Decay factor
    influenceRef.current.energy *= 0.95;   // Decay factor

    // SEQA coherence: Ornstein-Uhlenbeck process
    const dW = gaussianRandom(0, Math.sqrt(dt));
    C += alpha * (1 - C) * dt + sigma * dW;
    C = Math.max(0, Math.min(1, C)); // clip between 0 and 1

    // DPS energy: Regulation with routing
    const R = k * C;
    E += (R - gamma * E) * dt;
    E = Math.max(0, Math.min(2, E)); // clip between 0 and 2

    simulationStateRef.current = { coherence: C, energy: E, routing: R };
    stepCountRef.current += 1;

    if (stepCountRef.current % 5 === 0) { // Update state for UI less frequently for performance
      historyRef.current.coherence.push({ step: stepCountRef.current, value: C });
      historyRef.current.energy.push({ step: stepCountRef.current, value: E });
      historyRef.current.routing.push({ step: stepCountRef.current, value: R });
      
      // Keep history from getting too large
      if (historyRef.current.coherence.length > 500) {
        historyRef.current.coherence.shift();
        historyRef.current.energy.shift();
        historyRef.current.routing.shift();
      }

      setState(simulationStateRef.current);
      setHistory({
        coherence: [...historyRef.current.coherence],
        energy: [...historyRef.current.energy],
        routing: [...historyRef.current.routing],
      });
      performAnalysis();
    }
  }, [params, performAnalysis]);

  const start = useCallback(() => {
    setIsRunning(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(simulationStep, 10);
  }, [simulationStep]);

  const stop = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    stop();
    simulationStateRef.current = { ...INITIAL_STATE };
    historyRef.current = { ...INITIAL_HISTORY };
    stepCountRef.current = 0;
    setState(INITIAL_STATE);
    setHistory(INITIAL_HISTORY);
    setAnalysis({ steadyCoherence: 0, steadyEnergy: 0, stability: 'Calculating...' });
  }, [stop]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { state, history, analysis, isRunning, start, stop, reset, applyInfluence };
};
