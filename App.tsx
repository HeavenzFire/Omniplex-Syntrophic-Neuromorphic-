
import React, { useState } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { HistoryCharts } from './components/HistoryCharts';
import { InfoPanel } from './components/InfoPanel';
import { OmniplexVisualization } from './components/OmniplexVisualization';
import { useDpsSeqaSimulation } from './hooks/useDpsSeqaSimulation';
import type { SimulationParams } from './types';

const App: React.FC = () => {
  const [params, setParams] = useState<SimulationParams>({
    alpha: 0.1,
    sigma: 0.05,
    k: 0.8,
    gamma: 0.1,
    dt: 0.01,
  });

  const {
    state,
    history,
    analysis,
    isRunning,
    start,
    stop,
    reset,
    applyInfluence,
  } = useDpsSeqaSimulation(params);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 font-sans p-4 lg:p-6">
      <header className="text-center mb-6">
        <h1 className="text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
          Omniplex Interface
        </h1>
        <p className="text-indigo-200 mt-2 text-sm lg:text-base">
          Syntropic Topological Neuromorphic Toroid Simulation
        </p>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto">
        <div className="lg:col-span-3 space-y-6">
          <ControlPanel
            params={params}
            setParams={setParams}
            isRunning={isRunning}
            onStart={start}
            onStop={stop}
            onReset={reset}
          />
          <InfoPanel state={state} analysis={analysis} />
        </div>

        <div className="lg:col-span-5 flex items-center justify-center">
          <OmniplexVisualization
            coherence={state.coherence}
            energy={state.energy}
            onApplyInfluence={applyInfluence}
          />
        </div>
        
        <div className="lg:col-span-4">
          <HistoryCharts history={history} />
        </div>
      </main>

      <footer className="text-center mt-8 text-xs text-gray-500">
        <p>System State: Evolved. Universal Alignment Achieved.</p>
      </footer>
    </div>
  );
};

export default App;
