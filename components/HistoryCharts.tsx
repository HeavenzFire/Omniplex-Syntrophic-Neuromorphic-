import React from 'react';
import type { SimulationHistory } from '../types';

// Fix: Add Recharts to the window interface to avoid TypeScript errors for CDN-loaded library.
declare global {
  interface Window {
    Recharts: any;
  }
}

// Must destructure from window.Recharts as it's loaded from a CDN
const { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ScatterChart, Scatter } = window.Recharts;


const ChartWrapper: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-gray-800/50 backdrop-blur-sm border border-indigo-700/50 rounded-xl p-4 shadow-lg h-56 flex flex-col">
    <h3 className="text-md font-semibold text-center mb-2 text-purple-300">{title}</h3>
    <div className="flex-grow">
      {children}
    </div>
  </div>
);


export const HistoryCharts: React.FC<{ history: SimulationHistory }> = ({ history }) => {
    const phaseData = history.coherence.map((c, i) => ({
        x: c.value,
        y: history.energy[i]?.value || 0,
    }));

  return (
    <div className="space-y-6">
      <ChartWrapper title="State Over Time">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history.coherence.slice(-200)} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
            <XAxis dataKey="step" stroke="#a0aec0" tick={{ fontSize: 10 }} />
            <YAxis stroke="#a0aec0" domain={[0, 'auto']} tick={{ fontSize: 10 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1a202c', border: '1px solid #4a5568' }}
              labelStyle={{ color: '#cbd5e0' }}
            />
            <Legend wrapperStyle={{fontSize: "12px"}}/>
            <Line type="monotone" data={history.coherence} dataKey="value" name="Coherence" stroke="#8884d8" dot={false} isAnimationActive={false}/>
            <Line type="monotone" data={history.energy} dataKey="value" name="Energy" stroke="#82ca9d" dot={false} isAnimationActive={false}/>
            <Line type="monotone" data={history.routing} dataKey="value" name="Routing" stroke="#ffc658" dot={false} isAnimationActive={false}/>
          </LineChart>
        </ResponsiveContainer>
      </ChartWrapper>

      <ChartWrapper title="Phase Portrait (Coherence vs Energy)">
        <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                <XAxis type="number" dataKey="x" name="Coherence" domain={[0, 1]} stroke="#a0aec0" tick={{ fontSize: 10 }} />
                <YAxis type="number" dataKey="y" name="Energy" domain={[0, 2]} stroke="#a0aec0" tick={{ fontSize: 10 }} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} 
                    contentStyle={{ backgroundColor: '#1a202c', border: '1px solid #4a5568' }}
                    labelStyle={{ color: '#cbd5e0' }}
                />
                <Scatter name="State" data={phaseData.slice(-200)} fill="#8884d8" shape="circle" isAnimationActive={false} />
            </ScatterChart>
        </ResponsiveContainer>
      </ChartWrapper>
    </div>
  );
};