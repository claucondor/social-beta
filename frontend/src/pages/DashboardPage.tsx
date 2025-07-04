import React from 'react';

const DashboardPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-cyber mb-8">CENTRO DE OPERACIONES</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="cyber-card">
          <h2 className="text-xl mb-4">Vínculos Activos</h2>
          <p className="text-4xl text-glitch-primary">3</p>
        </div>
        <div className="cyber-card">
          <h2 className="text-xl mb-4">Mensajes Pendientes</h2>
          <p className="text-4xl text-resistance-400">7</p>
        </div>
        <div className="cyber-card">
          <h2 className="text-xl mb-4">Nivel de Emisario</h2>
          <p className="text-4xl text-glitch-accent">12</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 