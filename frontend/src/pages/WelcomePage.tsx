import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Zap, Users, Eye, ArrowRight, Globe, Lock } from 'lucide-react';

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-dark-950 text-glitch-primary relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
      
      {/* Hero Section */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Title */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="mb-8"
          >
            <h1 className="text-6xl md:text-8xl font-cyber font-black mb-4">
              <span className="glitch-text text-shadow-neon" data-text="LA RESISTENCIA">
                LA RESISTENCIA
              </span>
            </h1>
            <div className="text-xl md:text-2xl text-resistance-400 font-mono">
              <span className="typing-effect">
                Red Clandestina de Vínculos Humanos
              </span>
            </div>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            En un mundo donde <span className="text-resistance-400">El Conductor</span> controla 
            todas las conexiones humanas, únete a la resistencia clandestina. 
            Forja vínculos reales, esquiva la vigilancia, y crea 
            <span className="text-glitch-primary"> arte generativo</span> de tu rebeldía.
          </motion.p>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
          >
            <div className="cyber-card">
              <Shield className="w-12 h-12 text-glitch-primary mb-4 mx-auto" />
              <h3 className="text-lg font-cyber mb-2">Comunicación Encriptada</h3>
              <p className="text-sm text-gray-400">
                Mensajes con delay estratégico para evitar detección
              </p>
            </div>
            
            <div className="cyber-card">
              <Zap className="w-12 h-12 text-resistance-400 mb-4 mx-auto" />
              <h3 className="text-lg font-cyber mb-2">Vínculos NFT</h3>
              <p className="text-sm text-gray-400">
                Cada relación se vuelve arte generativo único
              </p>
            </div>
            
            <div className="cyber-card">
              <Users className="w-12 h-12 text-glitch-accent mb-4 mx-auto" />
              <h3 className="text-lg font-cyber mb-2">Progresión Colaborativa</h3>
              <p className="text-sm text-gray-400">
                Desbloquea habilidades y fortalece tu célula
              </p>
            </div>
          </motion.div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.5 }}
            className="space-y-6"
          >
            <button
              onClick={() => navigate('/login')}
              className="cyber-button text-lg px-8 py-4 font-cyber tracking-wider group"
            >
              <span className="flex items-center">
                INFILTRAR LA RED
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Lock className="w-4 h-4 mr-1" />
                <span>Blockchain Segura</span>
              </div>
              <div className="flex items-center">
                <Globe className="w-4 h-4 mr-1" />
                <span>Red Global</span>
              </div>
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                <span>Privacidad Total</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Warning */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center"
      >
        <div className="bg-glitch-warning/20 border border-glitch-warning/50 rounded-none px-4 py-2">
          <div className="flex items-center text-glitch-warning text-sm">
            <Eye className="w-4 h-4 mr-2" />
            <span className="font-mono">
              ADVERTENCIA: El Conductor está observando. Procede con cautela.
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default WelcomePage; 