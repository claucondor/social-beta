import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuthStore } from './store/authStore';
import { useGameStore } from './store/gameStore';

// Pages
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MessagesPage from './pages/MessagesPage';
import ProfilePage from './pages/ProfilePage';
import SkillTreePage from './pages/SkillTreePage';
import VinculoPage from './pages/VinculoPage';
import LibraryPage from './pages/LibraryPage';

// Components
import Layout from './components/Layout';
import MatrixRain from './components/MatrixRain';
import LoadingScreen from './components/LoadingScreen';
import AuthGuard from './components/AuthGuard';

// Hooks
import { useEffect } from 'react';

function App() {
  const { isAuthenticated, isLoading, initializeAuth } = useAuthStore();
  const { initializeGame } = useGameStore();

  useEffect(() => {
    initializeAuth();
    initializeGame();
  }, [initializeAuth, initializeGame]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-dark-950 text-glitch-primary font-mono overflow-hidden">
      <MatrixRain />
      
      <AnimatePresence mode="wait">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<WelcomePage />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <AuthGuard>
              <Layout>
                <DashboardPage />
              </Layout>
            </AuthGuard>
          } />
          
          <Route path="/messages" element={
            <AuthGuard>
              <Layout>
                <MessagesPage />
              </Layout>
            </AuthGuard>
          } />
          
          <Route path="/messages/:vinculoId" element={
            <AuthGuard>
              <Layout>
                <MessagesPage />
              </Layout>
            </AuthGuard>
          } />
          
          <Route path="/profile" element={
            <AuthGuard>
              <Layout>
                <ProfilePage />
              </Layout>
            </AuthGuard>
          } />
          
          <Route path="/skills" element={
            <AuthGuard>
              <Layout>
                <SkillTreePage />
              </Layout>
            </AuthGuard>
          } />
          
          <Route path="/vinculo/:vinculoId" element={
            <AuthGuard>
              <Layout>
                <VinculoPage />
              </Layout>
            </AuthGuard>
          } />
          
          <Route path="/library" element={
            <AuthGuard>
              <Layout>
                <LibraryPage />
              </Layout>
            </AuthGuard>
          } />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default App; 