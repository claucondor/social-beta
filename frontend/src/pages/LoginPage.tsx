import React from 'react';

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark-950 text-glitch-primary flex items-center justify-center">
      <div className="cyber-card max-w-md w-full">
        <h1 className="text-2xl font-cyber mb-6 text-center">
          ACCEDER A LA RED
        </h1>
        <p className="text-center text-gray-400 mb-8">
          Conecta tu wallet Flow para unirte a la resistencia
        </p>
        <button className="cyber-button w-full py-3">
          CONECTAR WALLET
        </button>
      </div>
    </div>
  );
};

export default LoginPage; 