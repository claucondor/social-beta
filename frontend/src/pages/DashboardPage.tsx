import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { useGameStore } from '../stores/gameStore';
import { useNavigate } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const { user, signOut, registerUser } = useAuthStore();
  const { bonds, messages, fetchMessages, fetchBonds, searchUsers, createBond } = useGameStore();
  const [showRegistration, setShowRegistration] = useState(false);
  const [showNewBond, setShowNewBond] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.address) {
      fetchMessages(user.address);
      fetchBonds(user.address);
    }
  }, [user?.address, fetchMessages, fetchBonds]);

  // Show registration modal if user is not registered
  useEffect(() => {
    if (user && !user.isRegistered) {
      setShowRegistration(true);
    }
  }, [user]);

  const handleRegister = async () => {
    if (user?.address) {
      const success = await registerUser(displayName || undefined);
      if (success) {
        setShowRegistration(false);
        setDisplayName('');
      }
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchUsers(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreateBond = async (partnerAddress: string) => {
    const success = await createBond(partnerAddress);
    if (success) {
      setShowNewBond(false);
      setSearchQuery('');
      setSearchResults([]);
      // Refresh bonds
      if (user?.address) {
        fetchBonds(user.address);
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-matrix-dark flex items-center justify-center">
        <div className="text-matrix-green text-xl">Conexión perdida...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-matrix-dark text-matrix-green">
      {/* Header */}
      <header className="border-b border-matrix-green/30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-orbitron font-bold">
              La Red de Autómatas
            </h1>
            <div className="text-sm opacity-70">
              Emisario: {user.displayName || 'Sin nombre'}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              XP: {user.totalXP || 0} | Vínculos: {user.totalBonds || bonds.length}
            </div>
            <button
              onClick={signOut}
              className="px-4 py-2 border border-matrix-green/50 hover:bg-matrix-green/10 transition-colors"
            >
              Desconectar
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Status Panel */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-matrix-green/30 p-6 bg-matrix-dark/50"
            >
              <h2 className="text-xl font-orbitron mb-4">Estado de la Red</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Mensajes Recientes:</span>
                  <span>{messages.length}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Vínculos Activos:</span>
                  <span>{bonds.length}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Estado de Conexión:</span>
                  <span className="text-resistance-green">Estable</span>
                </div>
                
                <div className="pt-4 border-t border-matrix-green/20">
                  <button
                    onClick={() => setShowNewBond(true)}
                    className="w-full py-3 border border-matrix-green/50 hover:bg-matrix-green/10 transition-colors"
                  >
                    + Forjar Nuevo Vínculo
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main Dashboard */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              
              {/* Navigation Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/messages')}
                  className="p-6 border border-matrix-green/30 hover:border-matrix-green/60 transition-all text-left"
                >
                  <h3 className="text-lg font-orbitron mb-2">Correspondencia</h3>
                  <p className="text-sm opacity-70">
                    Gestiona tus mensajes y conversaciones clandestinas
                  </p>
                  <div className="mt-4 text-xs">
                    {messages.length} mensajes recientes
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/bonds')}
                  className="p-6 border border-matrix-green/30 hover:border-matrix-green/60 transition-all text-left"
                >
                  <h3 className="text-lg font-orbitron mb-2">Vínculos</h3>
                  <p className="text-sm opacity-70">
                    Explora tus conexiones y su evolución artística
                  </p>
                  <div className="mt-4 text-xs">
                    {bonds.length} vínculos activos
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/skills')}
                  className="p-6 border border-matrix-green/30 hover:border-matrix-green/60 transition-all text-left"
                >
                  <h3 className="text-lg font-orbitron mb-2">Habilidades</h3>
                  <p className="text-sm opacity-70">
                    Desarrolla tu árbol de habilidades de Emisario
                  </p>
                  <div className="mt-4 text-xs">
                    Nivel {user.totalXP ? Math.floor(user.totalXP / 100) + 1 : 1}
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/gifts')}
                  className="p-6 border border-matrix-green/30 hover:border-matrix-green/60 transition-all text-left"
                >
                  <h3 className="text-lg font-orbitron mb-2">Regalos</h3>
                  <p className="text-sm opacity-70">
                    Sistema de intercambio y generosidad clandestina
                  </p>
                  <div className="mt-4 text-xs">
                    Sistema on-chain seguro
                  </div>
                </motion.button>
              </div>

              {/* Recent Activity */}
              <div className="border border-matrix-green/30 p-6">
                <h3 className="text-lg font-orbitron mb-4">Actividad Reciente</h3>
                <div className="space-y-3">
                  {messages.slice(0, 3).map((message, index) => (
                    <div key={message.id || index} className="flex items-center justify-between py-2 border-b border-matrix-green/10">
                      <div>
                        <div className="text-sm">
                          Mensaje de {message.senderAddress?.slice(0, 8)}...
                        </div>
                        <div className="text-xs opacity-60">
                          {new Date(message.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-xs text-resistance-green">
                        Entregado
                      </div>
                    </div>
                  ))}
                  
                  {messages.length === 0 && (
                    <div className="text-center py-8 opacity-60">
                      No hay actividad reciente. Comienza forjando tu primer vínculo.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Registration Modal */}
      <AnimatePresence>
        {showRegistration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-matrix-dark border border-matrix-green/50 p-8 max-w-md w-full"
            >
              <h2 className="text-2xl font-orbitron mb-4">Bienvenido, Emisario</h2>
              <p className="mb-6 opacity-80">
                Para unirte a la resistencia, necesitas registrar tu identidad en la blockchain de Flow.
              </p>
              
              <div className="mb-6">
                <label className="block text-sm mb-2">Nombre de Emisario (opcional)</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Ej: CorrespondenteSombra"
                  className="w-full px-4 py-2 bg-black/50 border border-matrix-green/30 focus:border-matrix-green/60 outline-none"
                />
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={handleRegister}
                  className="flex-1 py-3 bg-matrix-green/20 border border-matrix-green/50 hover:bg-matrix-green/30 transition-colors"
                >
                  Registrar en Blockchain
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Bond Modal */}
      <AnimatePresence>
        {showNewBond && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-matrix-dark border border-matrix-green/50 p-8 max-w-md w-full"
            >
              <h2 className="text-2xl font-orbitron mb-4">Forjar Nuevo Vínculo</h2>
              <p className="mb-6 opacity-80">
                Busca otro Emisario para establecer una conexión clandestina.
              </p>
              
              <div className="mb-6">
                <label className="block text-sm mb-2">Buscar Emisario</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Dirección 0x... o nombre"
                  className="w-full px-4 py-2 bg-black/50 border border-matrix-green/30 focus:border-matrix-green/60 outline-none"
                />
              </div>
              
              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mb-6 max-h-48 overflow-y-auto border border-matrix-green/30">
                  {searchResults.map((user) => (
                    <button
                      key={user.address}
                      onClick={() => handleCreateBond(user.address)}
                      className="w-full p-3 text-left hover:bg-matrix-green/10 border-b border-matrix-green/10 last:border-b-0"
                    >
                      <div className="font-mono text-sm">{user.displayName || 'Sin nombre'}</div>
                      <div className="text-xs opacity-60">{user.address}</div>
                    </button>
                  ))}
                </div>
              )}
              
              {isSearching && (
                <div className="mb-6 text-center py-4 opacity-60">
                  Buscando emisarios...
                </div>
              )}
              
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowNewBond(false)}
                  className="flex-1 py-3 border border-matrix-green/30 hover:bg-matrix-green/10 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardPage; 