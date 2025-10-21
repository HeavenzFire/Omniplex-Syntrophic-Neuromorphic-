
import React, { useState, useRef, useEffect } from 'react';

interface OmniplexVisualizationProps {
  coherence: number;
  energy: number;
  onApplyInfluence: (influence: { coherence: number; energy: number }) => void;
}

export const OmniplexVisualization: React.FC<OmniplexVisualizationProps> = ({ coherence, energy, onApplyInfluence }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const prevPosRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>();

  const size = 300;
  const center = size / 2;

  // Map energy to radius (0-2 energy -> 20-140 radius)
  const radius = 20 + (energy / 2) * 120;
  
  // Map coherence to color (0-1 -> purple-cyan)
  const blue = 150 + coherence * 105;
  const red = 200 - coherence * 100;
  const green = 100 + coherence * 100;
  const color = `rgb(${Math.round(red)}, ${Math.round(green)}, ${Math.round(blue)})`;

  const strokeWidth = 5 + (energy / 2) * 15;
  const rotationSpeed = 5 + coherence * 15; // Slower for low coherence

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsDragging(true);
    prevPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    const currentPos = { x: e.clientX, y: e.clientY };
    const delta = {
      x: currentPos.x - prevPosRef.current.x,
      y: currentPos.y - prevPosRef.current.y,
    };

    setRotation(prev => ({
      x: prev.x - delta.y * 0.5, // vertical drag rotates on X-axis
      y: prev.y + delta.x * 0.5, // horizontal drag rotates on Y-axis
    }));

    const influence = {
      coherence: delta.x * 0.001,
      energy: -delta.y * 0.001, // Y is inverted in screen coordinates
    };
    onApplyInfluence(influence);

    prevPosRef.current = currentPos;
  };
  
  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };
  
  // Effect to slowly return the toroid to neutral position when not dragging
  useEffect(() => {
    if (!isDragging) {
      const animateRotation = () => {
        setRotation(prev => {
          const newX = prev.x * 0.92;
          const newY = prev.y * 0.92;

          if (Math.abs(newX) < 0.1 && Math.abs(newY) < 0.1) {
            return { x: 0, y: 0 };
          }
          
          animationFrameRef.current = requestAnimationFrame(animateRotation);
          return { x: newX, y: newY };
        });
      };
      animationFrameRef.current = requestAnimationFrame(animateRotation);

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [isDragging]);

  return (
    <div
      className={`relative w-[300px] h-[300px] flex items-center justify-center select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{ perspective: '1000px' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
    >
      {/* This inner div is the one that rotates */}
      <div
        className="absolute w-full h-full"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        }}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute">
          {/* Outer pulsating glow */}
          <circle
            cx={center}
            cy={center}
            r={radius + strokeWidth / 2}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeOpacity="0.2"
            style={{ animation: `pulse ${2 / (energy + 0.1)}s infinite` }}
          />
          <style>
            {`
              @keyframes pulse {
                0% { transform: scale(0.95); opacity: 0.2; }
                70% { transform: scale(1.05); opacity: 0.4; }
                100% { transform: scale(0.95); opacity: 0.2; }
              }
              @keyframes rotate {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}
          </style>
        </svg>
        {/* Torus Rings */}
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute" style={{ animation: `rotate ${rotationSpeed}s linear infinite`, transformOrigin: 'center' }}>
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Main Torus Body */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            filter="url(#glow)"
          />
          {/* Inner detail ring */}
          <circle
            cx={center}
            cy={center}
            r={radius - strokeWidth * 0.7}
            fill="none"
            stroke={color}
            strokeOpacity="0.5"
            strokeWidth="1"
          />
          {/* Outer detail ring */}
          <circle
            cx={center}
            cy={center}
            r={radius + strokeWidth * 0.7}
            fill="none"
            stroke={color}
            strokeOpacity="0.5"
            strokeWidth="1"
          />
        </svg>
      </div>
       {/* This div is for the text and does NOT rotate */}
      <div className="absolute text-center">
         <div className="text-4xl font-bold" style={{ color: color, textShadow: `0 0 10px ${color}` }}>{energy.toFixed(2)}</div>
         <div className="text-sm uppercase tracking-widest" style={{ color }}>Energy</div>
      </div>
    </div>
  );
};
