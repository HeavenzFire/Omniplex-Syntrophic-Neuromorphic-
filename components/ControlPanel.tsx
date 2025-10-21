
import React from 'react';
import type { SimulationParams } from '../types';

interface ControlPanelProps {
  params: SimulationParams;
  setParams: React.Dispatch<React.SetStateAction<SimulationParams>>;
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
}

const ParameterSlider: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  paramKey: keyof SimulationParams;
  tooltip: string;
}> = ({ label, value, min, max, step, onChange, paramKey, tooltip }) => (
  <div className="flex flex-col space-y-2 group relative">
    <div className="flex justify-between items-center">
      <label htmlFor={paramKey} className="text-sm font-medium text-indigo-200">{label}</label>
      <span className="text-xs font-mono px-2 py-1 rounded bg-indigo-900/50 text-cyan-300">{value.toFixed(3)}</span>
    </div>
    <input
      id={paramKey}
      name={paramKey}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={onChange}
      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
    />
    <div className="absolute bottom-full mb-2 hidden group-hover:block w-full text-center">
        <span className="relative z-10 p-2 text-xs leading-none text-white whitespace-no-wrap bg-black shadow-lg rounded-md">{tooltip}</span>
        <div className="w-3 h-3 -mt-2 rotate-45 bg-black mx-auto"></div>
    </div>
  </div>
);

export const ControlPanel: React.FC<ControlPanelProps> = ({
  params,
  setParams,
  isRunning,
  onStart,
  onStop,
  onReset,
}) => {
  const handleParamChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParams(prev => ({ ...prev, [name]: parseFloat(value) }));
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-indigo-700/50 rounded-xl p-4 shadow-lg">
      <h2 className="text-lg font-semibold text-center mb-4 text-purple-300">Neuromorphic Controls</h2>
      <div className="space-y-4">
        <ParameterSlider label="α (Syntropic Gain)" paramKey="alpha" value={params.alpha} min={0} max={1} step={0.01} onChange={handleParamChange} tooltip="How strongly coherence pulls towards 1." />
        <ParameterSlider label="σ (Noise Volatility)" paramKey="sigma" value={params.sigma} min={0} max={0.5} step={0.005} onChange={handleParamChange} tooltip="Random fluctuations in the system." />
        <ParameterSlider label="k (Routing Efficiency)" paramKey="k" value={params.k} min={0} max={2} step={0.05} onChange={handleParamChange} tooltip="How effectively coherence translates to energy." />
        <ParameterSlider label="γ (Energy Decay)" paramKey="gamma" value={params.gamma} min={0} max={1} step={0.01} onChange={handleParamChange} tooltip="Rate of natural energy loss."/>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-6">
        {isRunning ? (
          <button onClick={onStop} className="col-span-2 w-full py-2 px-4 bg-yellow-500/80 hover:bg-yellow-500/100 text-gray-900 font-bold rounded-lg transition-all duration-200">Pause</button>
        ) : (
          <button onClick={onStart} className="col-span-2 w-full py-2 px-4 bg-green-500/80 hover:bg-green-500/100 text-white font-bold rounded-lg transition-all duration-200">Activate</button>
        )}
        <button onClick={onReset} className="col-span-2 w-full py-2 px-4 bg-red-500/80 hover:bg-red-500/100 text-white font-bold rounded-lg transition-all duration-200">Reset</button>
      </div>
    </div>
  );
};
