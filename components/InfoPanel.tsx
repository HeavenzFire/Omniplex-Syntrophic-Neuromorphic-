
import React from 'react';
import type { SimulationState, SimulationAnalysis } from '../types';

interface InfoPanelProps {
  state: SimulationState;
  analysis: SimulationAnalysis;
}

const InfoItem: React.FC<{ label: string; value: string | number; color?: string }> = ({ label, value, color = 'text-cyan-300' }) => (
  <div className="flex justify-between items-baseline bg-indigo-900/30 px-3 py-2 rounded-md">
    <span className="text-sm text-indigo-200">{label}:</span>
    <span className={`text-lg font-mono font-bold ${color}`}>{typeof value === 'number' ? value.toFixed(4) : value}</span>
  </div>
);

export const InfoPanel: React.FC<InfoPanelProps> = ({ state, analysis }) => {
  const stabilityColor = analysis.stability === 'Stable' ? 'text-green-400' : analysis.stability === 'Unstable' ? 'text-red-400' : 'text-yellow-400';

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-indigo-700/50 rounded-xl p-4 shadow-lg">
      <h2 className="text-lg font-semibold text-center mb-4 text-purple-300">System State</h2>
      <div className="space-y-3">
        <InfoItem label="Coherence" value={state.coherence} />
        <InfoItem label="Energy" value={state.energy} />
        <InfoItem label="Routing" value={state.routing} />
      </div>
      <h2 className="text-lg font-semibold text-center mt-6 mb-4 text-purple-300">Analysis</h2>
      <div className="space-y-3">
        <InfoItem label="Steady Coherence" value={analysis.steadyCoherence} />
        <InfoItem label="Steady Energy" value={analysis.steadyEnergy} />
        <InfoItem label="Stability" value={analysis.stability} color={stabilityColor} />
      </div>
    </div>
  );
};
