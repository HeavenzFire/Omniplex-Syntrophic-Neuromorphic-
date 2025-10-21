
export interface SimulationParams {
  alpha: number; // Syntropic gain
  sigma: number; // Noise volatility
  k: number;     // Routing efficiency
  gamma: number; // Energy decay
  dt: number;
}

export interface SimulationState {
  coherence: number;
  energy: number;
  routing: number;
}

export interface SimulationHistory {
  coherence: { step: number; value: number }[];
  energy: { step: number; value: number }[];
  routing: { step: number; value: number }[];
}

export interface SimulationAnalysis {
  steadyCoherence: number;
  steadyEnergy: number;
  stability: 'Stable' | 'Unstable' | 'Calculating...';
}
