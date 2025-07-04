import React, { useEffect, useState } from 'react';

const CyberCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [trail, setTrail] = useState<{ x: number; y: number; id: number }[]>([]);

  useEffect(() => {
    let trailId = 0;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      
      // Add trail point
      setTrail(prev => {
        const newTrail = [...prev, { x: e.clientX, y: e.clientY, id: trailId++ }];
        // Keep only last 5 points
        return newTrail.slice(-5);
      });
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = target.matches('button, a, input, textarea, select, [tabindex], [role="button"], .cursor-pointer');
      setIsHovering(isInteractive);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseover', handleMouseOver);

    // Hide default cursor
    document.body.style.cursor = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseover', handleMouseOver);
      document.body.style.cursor = 'auto';
    };
  }, []);

  // Remove old trail points
  useEffect(() => {
    const interval = setInterval(() => {
      setTrail(prev => prev.slice(1));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Cursor Trail */}
      {trail.map((point, index) => (
        <div
          key={point.id}
          className="fixed pointer-events-none z-[9999] transition-opacity duration-100"
          style={{
            left: point.x - 2,
            top: point.y - 2,
            opacity: (index + 1) / trail.length * 0.5,
          }}
        >
          <div className="w-1 h-1 bg-glitch-primary rounded-full"></div>
        </div>
      ))}

      {/* Main Cursor */}
      <div
        className="fixed pointer-events-none z-[9999] transition-transform duration-100"
        style={{
          left: position.x - 12,
          top: position.y - 12,
          transform: `scale(${isClicking ? 0.8 : isHovering ? 1.3 : 1})`,
        }}
      >
        {/* Outer Ring */}
        <div className={`w-6 h-6 border-2 rounded-full transition-all duration-200 ${
          isClicking 
            ? 'border-glitch-secondary animate-pulse' 
            : isHovering 
              ? 'border-resistance-400 animate-pulse-glow' 
              : 'border-glitch-primary'
        }`}>
          
          {/* Inner Crosshair */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-3 h-0.5 transition-all duration-200 ${
              isClicking ? 'bg-glitch-secondary' : 'bg-glitch-primary'
            }`}></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-0.5 h-3 transition-all duration-200 ${
              isClicking ? 'bg-glitch-secondary' : 'bg-glitch-primary'
            }`}></div>
          </div>
          
          {/* Corner Brackets */}
          <div className="absolute -top-1 -left-1 w-2 h-2 border-l-2 border-t-2 border-glitch-primary"></div>
          <div className="absolute -top-1 -right-1 w-2 h-2 border-r-2 border-t-2 border-glitch-primary"></div>
          <div className="absolute -bottom-1 -left-1 w-2 h-2 border-l-2 border-b-2 border-glitch-primary"></div>
          <div className="absolute -bottom-1 -right-1 w-2 h-2 border-r-2 border-b-2 border-glitch-primary"></div>
        </div>

        {/* Scanning Effect */}
        <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
          isHovering ? 'animate-ping border-2 border-resistance-400' : ''
        }`}></div>
      </div>

      {/* Click Ripple Effect */}
      {isClicking && (
        <div
          className="fixed pointer-events-none z-[9998] animate-ping"
          style={{
            left: position.x - 20,
            top: position.y - 20,
          }}
        >
          <div className="w-10 h-10 border-2 border-glitch-secondary rounded-full opacity-50"></div>
        </div>
      )}
    </>
  );
};

export default CyberCursor; 