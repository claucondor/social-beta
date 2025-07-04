import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MatrixRain from './components/MatrixRain';
import ParticleField from './components/ParticleField';
import WelcomePage from './pages/WelcomePage';
import DashboardPage from './pages/DashboardPage';
import { useAuthStore } from './stores/authStore';

// Placeholder components for routes
const MessagesPage = () => (
  <div className="min-h-screen bg-matrix-dark text-matrix-green flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-orbitron mb-4">Correspondencia</h1>
      <p className="opacity-70">Sistema de mensajería con delay - Próximamente</p>
    </div>
  </div>
);

const BondsPage = () => (
  <div className="min-h-screen bg-matrix-dark text-matrix-green flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-orbitron mb-4">Vínculos</h1>
      <p className="opacity-70">Corazones Clandestinos NFT - Próximamente</p>
    </div>
  </div>
);

const SkillsPage = () => (
  <div className="min-h-screen bg-matrix-dark text-matrix-green flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-orbitron mb-4">Habilidades</h1>
      <p className="opacity-70">Árbol de Habilidades de Emisario - Próximamente</p>
    </div>
  </div>
);

const GiftsPage = () => (
  <div className="min-h-screen bg-matrix-dark text-matrix-green flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-orbitron mb-4">Regalos</h1>
      <p className="opacity-70">Sistema de Regalos On-Chain - Próximamente</p>
    </div>
  </div>
);

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isInitialized } = useAuthStore();
  
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-matrix-dark flex items-center justify-center">
        <div className="text-matrix-green text-xl">Inicializando...</div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <div className="min-h-screen bg-matrix-dark relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <MatrixRain />
        <ParticleField />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<WelcomePage />} />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/messages" 
            element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/bonds" 
            element={
              <ProtectedRoute>
                <BondsPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/skills" 
            element={
              <ProtectedRoute>
                <SkillsPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/gifts" 
            element={
              <ProtectedRoute>
                <GiftsPage />
              </ProtectedRoute>
            } 
          />

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default App; 