import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-dark-950 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="mb-8">
          <div className="text-4xl font-cyber font-black text-glitch-primary mb-2">
            LA RESISTENCIA
          </div>
          <div className="text-resistance-400 font-mono">
            Red Clandestina
          </div>
        </div>
        
        <div className="relative">
          <div className="w-64 h-1 bg-dark-800 rounded-full overflow-hidden">
            <div className="h-full bg-glitch-primary rounded-full animate-pulse-glow"></div>
          </div>
          <div className="mt-4 text-sm text-gray-500 font-mono">
            Inicializando protocolo clandestino...
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen; 