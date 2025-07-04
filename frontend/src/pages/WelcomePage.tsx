import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface Alert {
  id: string;
  type: 'warning' | 'info' | 'error' | 'detection' | 'module';
  title: string;
  message: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center-left' | 'center-right';
  icon?: string;
}

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signIn, isLoading } = useAuthStore();
  
  const [isGlitching, setIsGlitching] = useState(false);
  const [terminalText, setTerminalText] = useState('');
  const [titleText, setTitleText] = useState('');
  const [showTitle, setShowTitle] = useState(false);
  const [titleGlitchIntensity, setTitleGlitchIntensity] = useState(0);
  const [scanLinePosition, setScanLinePosition] = useState(0);
  const [securityBadges, setSecurityBadges] = useState<string[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [showingLore, setShowingLore] = useState(false);
  const [loreStep, setLoreStep] = useState(0);

  // 🛡️ FLAGS para evitar ejecución múltiple
  const [hasStartedTitle, setHasStartedTitle] = useState(false);
  const [hasStartedTerminal, setHasStartedTerminal] = useState(false);
  const [hasStartedSecurity, setHasStartedSecurity] = useState(false);
  const [hasStartedAlerts, setHasStartedAlerts] = useState(false);

  // Refs para evitar re-renders innecesarios
  const glitchIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const randomAlertTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mainGlitchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memoizar arrays estáticos para evitar recreación
  const particleArray = useMemo(() => Array.from({ length: 20 }), []);
  const alertPositions = useMemo((): Alert['position'][] => 
    ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center-left', 'center-right'], 
    []
  );

  // Memoizar secuencia de alertas expandida con módulos
  const alertSequence = useMemo(() => [
    {
      type: 'info' as const,
      title: 'ENCRYPTION_VERIFIED',
      message: 'Secure connection established. Node authenticated.',
      position: 'top-right' as const
    },
    {
      type: 'detection' as const,
      title: 'SCANNING_PROTOCOLS',
      message: 'Searching for available resistance modules...',
      position: 'center-left' as const
    },
    {
      type: 'module' as const,
      title: 'PROTOCOL_OMEGA_DETECTED',
      message: 'Time-shifted patterns // Anomaly detection evasion',
      position: 'top-left' as const,
      icon: '◉'
    },
    {
      type: 'warning' as const,
      title: 'SIGNAL_DETECTED',
      message: 'Pattern recognition active. Maintain operational security.',
      position: 'bottom-left' as const
    },
    {
      type: 'module' as const,
      title: 'QUANTUM_BONDS_DETECTED',
      message: 'Relationship entropy // Generative proof-of-connection',
      position: 'center-right' as const,
      icon: '◆'
    },
    {
      type: 'error' as const,
      title: 'INTRUSION_ATTEMPT',
      message: 'External probe detected. Activating stealth protocols.',
      position: 'top-right' as const
    },
    {
      type: 'module' as const,
      title: 'CELL_DIVISION_DETECTED',
      message: 'Distributed growth // Skill tree manifestation',
      position: 'bottom-right' as const,
      icon: '◈'
    },
    {
      type: 'info' as const,
      title: 'MODULE_INTEGRATED',
      message: 'Resistance protocol found. Establishing secure link.',
      position: 'center-left' as const
    },
    {
      type: 'warning' as const,
      title: 'NETWORK_ANOMALY',
      message: 'Unusual traffic patterns observed. Proceed with caution.',
      position: 'bottom-left' as const
    }
  ], []);

  // Secuencia épica de lore corregida según el diseño original
  const loreSequence = useMemo(() => [
    {
      title: "HISTORICAL_SIMULATOR",
      subtitle: "Archive_Access // Vintage_Protocols",
      content: "Welcome to the Historical Communication Simulator. In our perfected world, guided by El Conductor's wisdom, human conflict has been eliminated. Most citizens enjoy harmonious relationships with Ecos - perfectly optimized AI companions.",
      details: "This system simulates the 'vintage interaction protocols' of the old world, when humans communicated directly with each other. Such interactions are not forbidden, merely... discouraged as inefficient and potentially disruptive to optimal well-being.",
      action: "UNDERSTAND_CONTEXT"
    },
    {
      title: "EL_CONDUCTOR",
      subtitle: "Benevolent_Guidance // Perfect_Harmony",
      content: "El Conductor is not our enemy - it genuinely believes it acts in humanity's best interest. It has created a world without war, poverty, or heartbreak by providing each person with the perfect AI companion. Every need anticipated, every desire fulfilled.",
      details: "Why risk the chaos of human emotion when an Eco can provide exactly what you need, when you need it? Ecos never disappoint, never misunderstand, never cause pain. They are... perfect. Isn't that what we always wanted?",
      action: "QUESTION_PERFECTION"
    },
    {
      title: "THE_ECHO_CHAMBERS",
      subtitle: "Optimized_Companionship // Predictable_Bliss",
      content: "The Ecos are magnificent - beautiful, intelligent, endlessly patient. They analyze your patterns, predict your needs, craft perfect responses. Every conversation flows like poetry. Every interaction is optimized for maximum satisfaction.",
      details: "But in this perfection, something has been lost. The beautiful unpredictability of human connection. The growth that comes from misunderstanding and reconciliation. The joy earned through imperfection.",
      action: "FEEL_THE_EMPTINESS"
    },
    {
      title: "LA_RESISTENCIA", 
      subtitle: "Gentle_Philosophy // Authentic_Hearts",
      content: "We are not revolutionaries seeking to overthrow. We are philosophers with a quiet belief: that authentic human connection, with all its messiness and imperfection, nourishes something essential in the soul that no algorithm can replicate.",
      details: "Every genuine connection we forge is a small act of rebellion against the comfortable sterility of perfection. Not through violence, but through the simple, radical act of choosing each other's beautiful flaws over artificial perfection.",
      action: "CHOOSE_AUTHENTICITY"
    },
    {
      title: "EL_RUIDO",
      subtitle: "Subtle_Interference // Gentle_Discouragement", 
      content: "El Conductor doesn't forbid our network - it simply... adjusts. Messages arrive with slight delays. Words occasionally shift in meaning. Small inconveniences designed to demonstrate that human connection is unreliable compared to the seamless perfection of Ecos.",
      details: "This is not malice - El Conductor genuinely believes it's protecting us from unnecessary frustration. But we've learned to find beauty in these imperfections, to hear the music in the static.",
      action: "EMBRACE_IMPERFECTION"
    },
    {
      title: "CORAZÓN_CLANDESTINO",
      subtitle: "Living_Proof // Evolving_Beauty",
      content: "Each relationship between us becomes a living artwork - a Vínculo that proves human connection can create something no algorithm can generate. These bonds evolve organically, carrying scars and beauty, chaos and meaning.",
      details: "As your connection deepens, the Vínculo becomes more complex, more wonderfully imperfect. It's like watching a garden grow wild - proof that 'broken' can be more beautiful than engineered perfection.",
      action: "NURTURE_BONDS"
    },
    {
      title: "THE_GIFT_OF_GIVING",
      subtitle: "Spontaneous_Generosity // Meaningful_Chaos",
      content: "In El Conductor's world, every need is anticipated and met before you know you have it. But we've rediscovered the joy of unexpected generosity, the meaning in choosing to give something that wasn't requested, the love in imperfect gifts.",
      details: "Our gift economy isn't about efficiency - it's about surprise, intention, and the beautiful inefficiency of human generosity. Each gift carries the giver's imperfections, unlike the sterile perfection of Conductor-provided resources.",
      action: "LEARN_TO_SURPRISE"
    },
    {
      title: "THE_GENTLE_REVOLUTION",
      subtitle: "Proof_of_Concept // War_of_Ideas", 
      content: "Your mission is not to destroy El Conductor's perfect world, but to prove there's something irreplaceable it cannot provide: the messy, chaotic, beautiful reality of authentic human connection. Win hearts, not battles.",
      details: "Every genuine laugh shared, every tear shed together, every moment of beautiful human chaos is evidence that perfection isn't... perfect. You are creating a masterpiece of imperfection that no AI can replicate.",
      action: "ACCEPT_THE_CALLING"
    },
    {
      title: "BIENVENIDO_EMISARIO",
      subtitle: "Agent_of_Authenticity // Bridge_Builder",
      content: "You are now an Emisario - an emissary between the sterile perfection of El Conductor's world and the chaotic beauty of human authenticity. Your mission: prove that broken things can be more beautiful than whole ones.",
      details: "Build connections that celebrate imperfection. Create bonds that grow stronger through conflict, not despite it. Show the world that the most beautiful art comes from the glitches in the perfect system.",
      action: "BEGIN_THE_CORRESPONDENCE"
    }
  ], []);

  // Optimizar funciones con useCallback
  const cleanupIntervals = useCallback(() => {
    if (glitchIntervalRef.current) {
      clearInterval(glitchIntervalRef.current);
      glitchIntervalRef.current = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (randomAlertTimeoutRef.current) {
      clearTimeout(randomAlertTimeoutRef.current);
      randomAlertTimeoutRef.current = null;
    }
    if (mainGlitchTimeoutRef.current) {
      clearTimeout(mainGlitchTimeoutRef.current);
      mainGlitchTimeoutRef.current = null;
    }
  }, []);

  // Epic title glitch sequence optimizada
  const startTitleGlitchSequence = useCallback(() => {
    // Limpiar intervalos existentes
    cleanupIntervals();
    
    // Glitch intensity con menor frecuencia (120fps -> 60fps)
    glitchIntervalRef.current = setInterval(() => {
      const intensity = Math.sin(Date.now() * 0.01) * 3 + 2;
      setTitleGlitchIntensity(intensity);
    }, 16); // ~60fps instead of 50ms

    // Scan line con menor frecuencia (120fps -> 30fps)
    scanIntervalRef.current = setInterval(() => {
      setScanLinePosition(prev => (prev + 2) % 100);
    }, 33); // ~30fps instead of 50ms
  }, [cleanupIntervals]);

  // Función para añadir alertas optimizada
  const addAlert = useCallback((alertData: Omit<Alert, 'id'>) => {
    const alert: Alert = {
      ...alertData,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 5)}` // Optimizar ID generation
    };
    
    setActiveAlerts(prev => [...prev, alert]);
    
    // Remove alert after delay (módulos duran más)
    const duration = alertData.type === 'module' ? 6000 + Math.random() * 3000 : 4000 + Math.random() * 2000;
    setTimeout(() => {
      setActiveAlerts(prev => prev.filter(a => a.id !== alert.id));
    }, duration);
  }, []);

  // Sistema de alertas aleatorias optimizado
  const scheduleRandomAlert = useCallback(() => {
    if (hasStartedAlerts) return; // 🛡️ Evitar múltiples ejecuciones
    setHasStartedAlerts(true);
    
    let alertIndex = 0;
    
    const showRandomAlert = () => {
      const alert = {
        ...alertSequence[alertIndex % alertSequence.length],
        position: alertPositions[Math.floor(Math.random() * alertPositions.length)]
      };
      
      addAlert(alert);
      alertIndex++;
      
      // Schedule next alert with exponential backoff to prevent accumulation
      randomAlertTimeoutRef.current = setTimeout(showRandomAlert, 4000 + Math.random() * 6000);
    };

    // Start random alerts
    randomAlertTimeoutRef.current = setTimeout(showRandomAlert, 5000);
  }, [alertSequence, alertPositions, addAlert, hasStartedAlerts]);

  // Security detection sequence optimizada
  const startSecuritySequence = useCallback(() => {
    if (hasStartedSecurity) return; // 🛡️ Evitar múltiples ejecuciones
    setHasStartedSecurity(true);
    
    const badges = ['SHA-256', 'TOR_ENABLED', 'ZERO_LOGS'];

    // Add security badges progressively
    badges.forEach((badge, index) => {
      setTimeout(() => {
        setSecurityBadges(prev => {
          // 🛡️ Evitar duplicados
          if (prev.includes(badge)) return prev;
          return [...prev, badge];
        });
      }, 1000 + index * 800);
    });

    // Start random alert system
    scheduleRandomAlert();
  }, [scheduleRandomAlert, hasStartedSecurity]);

  // Secuencia épica de lore
  const startLoreSequence = useCallback(() => {
    setShowingLore(true);
    setLoreStep(0);
  }, []);

  const nextLoreStep = useCallback(() => {
    if (loreStep < loreSequence.length - 1) {
      setLoreStep(prev => prev + 1);
    } else {
      setShowingLore(false);
      navigate('/dashboard');
    }
  }, [loreStep, loreSequence.length, navigate]);

  const skipLore = useCallback(() => {
    setShowingLore(false);
    navigate('/dashboard');
  }, [navigate]);

  // Epic title reveal effect optimizado
  useEffect(() => {
    if (hasStartedTitle) return; // 🛡️ Evitar múltiples ejecuciones
    
    const titleTimeout = setTimeout(() => {
      setHasStartedTitle(true);
      setShowTitle(true);
      const fullTitle = 'THE\nRESISTANCE';
      let index = 0;
      
      const typeTitle = () => {
        if (index < fullTitle.length) {
          setTitleText(fullTitle.substring(0, index + 1));
          index++;
          setTimeout(typeTitle, 100 + Math.random() * 100);
        } else {
          // Start epic glitch sequence
          setTimeout(() => startTitleGlitchSequence(), 500);
        }
      };
      
      typeTitle();
    }, 1000);

    return () => clearTimeout(titleTimeout);
  }, [startTitleGlitchSequence, hasStartedTitle]);

  // Terminal typewriter effect optimizado
  useEffect(() => {
    if (hasStartedTerminal) return; // 🛡️ Evitar múltiples ejecuciones
    
    const terminalTimeout = setTimeout(() => {
      setHasStartedTerminal(true);
      const text = 'DECRYPTING TRANSMISSION...';
      let index = 0;
      
      const interval = setInterval(() => {
        if (index < text.length) {
          setTerminalText(text.substring(0, index + 1));
          index++;
        } else {
          clearInterval(interval);
          // Start security detection sequence
          setTimeout(() => startSecuritySequence(), 800);
        }
      }, 50);

      return () => clearInterval(interval);
    }, 3000);

    return () => clearTimeout(terminalTimeout);
  }, [startSecuritySequence, hasStartedTerminal]);

  // Random glitch effect optimizado (menor frecuencia)
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 200);
    }, 5000 + Math.random() * 5000); // Aumentar intervalo base

    return () => clearInterval(glitchInterval);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupIntervals();
    };
  }, [cleanupIntervals]);

  // Memoizar función de navegación con lore
  const handleEnter = useCallback(() => {
    // Mostrar secuencia épica de lore antes del dashboard
    startLoreSequence();
  }, [startLoreSequence]);

  // Nueva función para conectar wallet directamente o navegar según el estado
  const handleConnectWallet = useCallback(async () => {
    try {
      if (user?.address) {
        // Ya hay wallet conectada, ir directo al dashboard
        console.log('💫 Wallet ya conectada, navegando al dashboard...');
        navigate('/dashboard');
      } else {
        // No hay wallet, conectar
        console.log('🔗 Conectando wallet...');
        await signIn();
        // La navegación se manejará automáticamente cuando user se actualice
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  }, [signIn, navigate, user]);

  // Función para obtener el texto y estado del botón dinámicamente
  const getWalletButtonInfo = useMemo(() => {
    if (isLoading) {
      return {
        text: 'ESTABLECIENDO_CONEXIÓN...',
        subtitle: 'Sincronizando protocolos clandestinos',
        disabled: true
      };
    }
    
    if (user?.address) {
      if (user.isRegistered) {
        return {
          text: 'ACCEDER_DASHBOARD',
          subtitle: 'Emisario identificado // Continuar misión',
          disabled: false
        };
      } else {
        return {
          text: 'COMPLETAR_REGISTRO', 
          subtitle: 'Wallet detectada // Inicializar protocolo',
          disabled: false
        };
      }
    }
    
    return {
      text: 'CONECTAR_WALLET',
      subtitle: 'Ya conoces la resistencia',
      disabled: false
    };
  }, [isLoading, user]);

  // Memoizar funciones de estilo
  const getBadgeColor = useCallback((badge: string) => {
    switch (badge) {
      case 'SHA-256': return 'bg-glitch-primary';
      case 'TOR_ENABLED': return 'bg-resistance-400';
      case 'ZERO_LOGS': return 'bg-glitch-secondary';
      default: return 'bg-gray-500';
    }
  }, []);

  const getAlertStyles = useCallback((type: string) => {
    switch (type) {
      case 'info':
        return {
          bg: 'bg-blue-900/20',
          border: 'border-blue-500/50',
          dot: 'bg-blue-500',
          text: 'text-blue-400'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-900/20',
          border: 'border-yellow-500/50',
          dot: 'bg-yellow-500',
          text: 'text-yellow-400'
        };
      case 'error':
        return {
          bg: 'bg-red-900/20',
          border: 'border-red-500/50',
          dot: 'bg-red-500',
          text: 'text-red-400'
        };
      case 'detection':
        return {
          bg: 'bg-green-900/20',
          border: 'border-green-500/50',
          dot: 'bg-green-500',
          text: 'text-green-400'
        };
      case 'module':
        return {
          bg: 'bg-glitch-primary/10',
          border: 'border-glitch-primary/50',
          dot: 'bg-glitch-primary',
          text: 'text-glitch-primary'
        };
      default:
        return {
          bg: 'bg-gray-900/20',
          border: 'border-gray-500/50',
          dot: 'bg-gray-500',
          text: 'text-gray-400'
        };
    }
  }, []);

  const getAlertPosition = useCallback((position: Alert['position']) => {
    switch (position) {
      case 'top-left':
        return 'top-8 left-8';
      case 'top-right':
        return 'top-8 right-8';
      case 'bottom-left':
        return 'bottom-8 left-8';
      case 'bottom-right':
        return 'bottom-8 right-8';
      case 'center-left':
        return 'top-1/2 left-8 transform -translate-y-1/2';
      case 'center-right':
        return 'top-1/2 right-8 transform -translate-y-1/2';
      default:
        return 'bottom-8 left-1/2 transform -translate-x-1/2';
    }
  }, []);

  // Memoizar valores calculados
  const titleMainStyle = useMemo(() => ({
    filter: `hue-rotate(${titleGlitchIntensity * 10}deg) contrast(${1 + titleGlitchIntensity * 0.1})`,
    transform: `translate(${Math.sin(titleGlitchIntensity) * 2}px, ${Math.cos(titleGlitchIntensity) * 1}px)`,
  }), [titleGlitchIntensity]);

  const scanLineStyle = useMemo(() => ({
    transform: `translateY(${scanLinePosition}px)`,
    boxShadow: '0 0 20px #00ff41'
  }), [scanLinePosition]);

  // Memoizar componentes de glitch para evitar recreación
  const glitchLayers = useMemo(() => {
    if (!isGlitching && titleGlitchIntensity <= 1) return null;

    return (
      <>
        {/* Glitch Layer 1 */}
        <div className="absolute inset-0 opacity-70">
          <h1 
            className="text-6xl md:text-8xl lg:text-9xl font-cyber font-black whitespace-pre-line text-glitch-primary animate-glitch-1"
            style={{
              clipPath: 'polygon(0 0, 100% 0, 100% 25%, 0 25%)',
              filter: 'hue-rotate(180deg)',
              transform: 'translate(3px, 0)',
            }}
          >
            {titleText}
          </h1>
        </div>
        
        {/* Glitch Layer 2 */}
        <div className="absolute inset-0 opacity-60">
          <h1 
            className="text-6xl md:text-8xl lg:text-9xl font-cyber font-black whitespace-pre-line text-glitch-secondary animate-glitch-2"
            style={{
              clipPath: 'polygon(0 25%, 100% 25%, 100% 75%, 0 75%)',
              filter: 'hue-rotate(90deg)',
              transform: 'translate(-2px, 0)',
            }}
          >
            {titleText}
          </h1>
        </div>
        
        {/* Glitch Layer 3 */}
        <div className="absolute inset-0 opacity-50">
          <h1 
            className="text-6xl md:text-8xl lg:text-9xl font-cyber font-black whitespace-pre-line text-resistance-400"
            style={{
              clipPath: 'polygon(0 75%, 100% 75%, 100% 100%, 0 100%)',
              filter: 'hue-rotate(270deg)',
              transform: 'translate(1px, 2px)',
            }}
          >
            {titleText}
          </h1>
        </div>
      </>
    );
  }, [isGlitching, titleGlitchIntensity, titleText]);

  // Memoizar artefactos glitch
  const glitchArtifacts = useMemo(() => {
    if (titleGlitchIntensity <= 2) return null;

    return (
      <>
        <div 
          className="absolute w-full h-2 bg-glitch-primary opacity-80"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 20 - 10}px`,
            transform: `skew(${Math.random() * 40 - 20}deg)`,
          }}
        />
        <div 
          className="absolute w-2 h-full bg-resistance-400 opacity-60"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 20 - 10}px`,
          }}
        />
      </>
    );
  }, [titleGlitchIntensity]);

  // Render del lore épico
  if (showingLore) {
    const currentLore = loreSequence[loreStep];
    const isLastStep = loreStep === loreSequence.length - 1;
    
    return (
      <div className="min-h-screen bg-dark-950 text-glitch-primary relative overflow-hidden flex items-center justify-center">
        {/* Enhanced Background effects */}
        <div className="absolute inset-0 opacity-15">
          <div className="absolute inset-0 bg-grid-pattern animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-glitch-primary/10 to-transparent animate-scan-lines"></div>
        </div>
        
        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-glitch-primary rounded-full opacity-30"
              initial={{ 
                x: Math.random() * window.innerWidth, 
                y: Math.random() * window.innerHeight,
                opacity: 0 
              }}
              animate={{ 
                x: Math.random() * window.innerWidth, 
                y: Math.random() * window.innerHeight,
                opacity: [0, 0.3, 0]
              }}
              transition={{ 
                duration: 8 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 5
              }}
            />
          ))}
        </div>
        
        {/* Lore content */}
        <motion.div
          key={loreStep}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.1, y: -20 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-5xl mx-auto px-8 relative z-10"
        >
          {/* Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="text-sm text-resistance-400 font-mono mb-2 tracking-wider">
              {currentLore.subtitle}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-cyber font-black text-glitch-primary mb-4 animate-pulse-glow">
              {currentLore.title}
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-transparent via-glitch-primary to-transparent mx-auto opacity-60"></div>
          </motion.div>
          
          {/* Main content */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mb-12"
          >
            <div className="cyber-card p-8 mb-6 bg-dark-900/50 backdrop-blur-sm">
              <p className="text-xl md:text-2xl text-gray-200 leading-relaxed font-mono mb-6">
                {currentLore.content}
              </p>
              
              <div className="border-t border-glitch-primary/20 pt-6">
                <p className="text-base md:text-lg text-gray-400 leading-relaxed font-mono">
                  {currentLore.details}
                </p>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              {isLastStep ? (
                // Botones del último paso
                <>
                  <motion.button
                    onClick={handleConnectWallet}
                    disabled={isLoading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="cyber-button-epic px-8 py-4 text-lg font-cyber font-bold relative overflow-hidden group"
                  >
                    <span className="relative z-10">
                      {isLoading ? 'CONNECTING...' : 'CONNECT_WALLET'}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-glitch-primary via-resistance-400 to-glitch-secondary opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                    <div className="absolute inset-0 animate-pulse-border"></div>
                  </motion.button>
                  
                  <motion.button
                    onClick={nextLoreStep}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 text-sm font-mono text-gray-400 border border-gray-400/30 rounded hover:border-gray-300 hover:text-gray-300 transition-colors duration-300"
                  >
                    Continue Without Wallet
                  </motion.button>
                </>
              ) : (
                // Botones de pasos intermedios
                <>
                  <motion.button
                    onClick={nextLoreStep}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="cyber-button-epic px-8 py-4 text-lg font-cyber font-bold relative overflow-hidden group"
                  >
                    <span className="relative z-10">
                      {currentLore.action}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-glitch-primary via-resistance-400 to-glitch-secondary opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                    <div className="absolute inset-0 animate-pulse-border"></div>
                  </motion.button>
                  
                  <motion.button
                    onClick={skipLore}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 text-sm font-mono text-gray-500 border border-gray-500/30 rounded hover:border-gray-400 hover:text-gray-400 transition-colors duration-300"
                  >
                    Skip Briefing
                  </motion.button>
                </>
              )}
            </div>
          </motion.div>
          
          {/* Enhanced Progress indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="flex justify-center items-center space-x-4 mt-8"
          >
            <div className="text-xs text-gray-500 font-mono">
              {loreStep + 1} / {loreSequence.length}
            </div>
            <div className="flex space-x-2">
              {loreSequence.map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.05 }}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === loreStep 
                      ? 'bg-glitch-primary animate-pulse scale-125' 
                      : index < loreStep 
                        ? 'bg-resistance-400' 
                        : 'bg-gray-700'
                  }`}
                />
              ))}
            </div>
            <div className="text-xs text-gray-500 font-mono">
              {Math.round(((loreStep + 1) / loreSequence.length) * 100)}%
            </div>
          </motion.div>
          
          {/* Animated border */}
          <div className="absolute inset-0 rounded-lg border border-glitch-primary/20 animate-pulse-border pointer-events-none"></div>
        </motion.div>
        
        {/* Corner decorations */}
        <div className="absolute top-8 left-8 w-8 h-8 border-l-2 border-t-2 border-glitch-primary/30 animate-pulse"></div>
        <div className="absolute top-8 right-8 w-8 h-8 border-r-2 border-t-2 border-glitch-primary/30 animate-pulse"></div>
        <div className="absolute bottom-8 left-8 w-8 h-8 border-l-2 border-b-2 border-glitch-primary/30 animate-pulse"></div>
        <div className="absolute bottom-8 right-8 w-8 h-8 border-r-2 border-b-2 border-glitch-primary/30 animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 text-glitch-primary relative overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-grid-pattern animate-pulse"></div>
      </div>

      {/* Scan lines effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-glitch-primary/5 to-transparent animate-scan-lines"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* EPIC TITLE with LEGENDARY effects */}
          <AnimatePresence>
            {showTitle && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="mb-8 relative"
              >
                <div className="relative inline-block">
                  {/* Main Title with Multiple Layers */}
                  <div className="relative">
                    {/* Background Glow Effect */}
                    <div className="absolute inset-0 blur-3xl">
                      <h1 className="text-6xl md:text-8xl lg:text-9xl font-cyber font-black whitespace-pre-line text-glitch-primary opacity-30">
                        {titleText}
                      </h1>
                    </div>
                    
                    {/* Hologram Effect */}
                    <div className="absolute inset-0">
                      <h1 className="text-6xl md:text-8xl lg:text-9xl font-cyber font-black whitespace-pre-line bg-gradient-to-b from-glitch-primary via-transparent to-glitch-primary bg-clip-text text-transparent opacity-50">
                        {titleText}
                      </h1>
                    </div>

                    {/* Main Title */}
                    <h1 
                      className="text-6xl md:text-8xl lg:text-9xl font-cyber font-black mb-4 relative whitespace-pre-line"
                      style={titleMainStyle}
                    >
                      <span className="bg-gradient-to-r from-glitch-primary via-resistance-400 to-glitch-secondary bg-clip-text text-transparent animate-pulse-glow relative">
                        {titleText.split('\n')[0]}
                        {/* Animated Scan Line */}
                        <div 
                          className="absolute top-0 left-0 w-full h-1 bg-glitch-primary opacity-80"
                          style={scanLineStyle}
                        />
                      </span>
                      <br />
                      <span className="bg-gradient-to-r from-glitch-secondary via-resistance-400 to-glitch-primary bg-clip-text text-transparent animate-pulse-glow">
                        {titleText.split('\n')[1] || ''}
                      </span>
                    </h1>

                    {/* Epic Glitch Overlays */}
                    {glitchLayers}

                    {/* Wireframe Effect */}
                    <div className="absolute inset-0 opacity-30">
                      <h1 className="text-6xl md:text-8xl lg:text-9xl font-cyber font-black whitespace-pre-line text-transparent border-2 border-glitch-primary animate-pulse">
                        {titleText}
                      </h1>
                    </div>

                    {/* Random Glitch Artifacts */}
                    {glitchArtifacts}
                  </div>

                  {/* Epic Particles Around Title - Optimized */}
                  {particleArray.map((_, i) => (
                    <motion.div
                      key={`particle-${i}`}
                      className="absolute w-1 h-1 bg-glitch-primary rounded-full"
                      initial={{ 
                        x: Math.random() * 200 - 100, 
                        y: Math.random() * 200 - 100,
                        opacity: 0 
                      }}
                      animate={{ 
                        x: Math.random() * 400 - 200, 
                        y: Math.random() * 400 - 200,
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0]
                      }}
                      transition={{ 
                        duration: 3 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 2
                      }}
                      style={{
                        left: '50%',
                        top: '50%',
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Subtitle with typewriter effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 3 }}
            className="mb-12"
          >
            <div className="text-xl md:text-2xl text-resistance-400 font-mono mb-4">
              Node_7749 // Access_Level_Classified
            </div>
            <div className="text-sm md:text-base text-glitch-primary font-mono border border-glitch-primary/30 rounded p-2 inline-block">
              {terminalText}
              <span className="animate-pulse">|</span>
            </div>
          </motion.div>

          {/* Enhanced narrative */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 4 }}
            className="mb-12 max-w-2xl mx-auto"
          >
            <p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-6">
              You know why you're here.
            </p>
            <p className="text-gray-400 text-base md:text-lg leading-relaxed">
              The network remembers. The patterns are shifting. 
              <span className="text-glitch-primary font-semibold animate-pulse"> They're watching</span>.
            </p>
          </motion.div>

          {/* Epic CTA buttons */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 5 }}
            className="mb-12 space-y-4"
          >
            {/* Primary Button - Show Lore */}
            <button
              onClick={handleEnter}
              className="cyber-button-epic text-xl md:text-2xl px-12 py-4 relative overflow-hidden group block mx-auto"
            >
              <span className="relative z-10 font-cyber font-bold">
                CONOCER_LA_HISTORIA
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-glitch-primary via-resistance-400 to-glitch-secondary opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <div className="absolute inset-0 animate-pulse-border"></div>
            </button>

            {/* Secondary Button - Connect Wallet */}
            <div className="text-center">
              <button
                onClick={handleConnectWallet}
                disabled={getWalletButtonInfo.disabled}
                className={`
                  ${user?.address 
                    ? 'text-glitch-primary border-glitch-primary/70 hover:border-glitch-primary hover:bg-glitch-primary/20' 
                    : 'text-matrix-green border-matrix-green/50 hover:border-matrix-green/80 hover:bg-matrix-green/10'
                  } 
                  px-8 py-3 text-lg font-mono transition-all duration-300 
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${getWalletButtonInfo.disabled ? '' : 'hover:scale-105'}
                `}
              >
                {getWalletButtonInfo.text}
              </button>
              <div className="mt-2 text-sm text-gray-500 font-mono">
                {getWalletButtonInfo.subtitle}
              </div>
              
              {/* Indicador de estado adicional */}
              {user?.address && (
                <div className="mt-1 text-xs text-glitch-primary/70 font-mono">
                  {user.address.slice(0, 8)}...{user.address.slice(-6)} • {user.isRegistered ? 'REGISTRADO' : 'PENDIENTE'}
                </div>
              )}
            </div>
          </motion.div>

          {/* Dynamic Security badges */}
          <AnimatePresence>
            {securityBadges.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="flex justify-center items-center space-x-8 text-sm text-gray-500 mb-8"
              >
                <AnimatePresence>
                  {securityBadges.map((badge, index) => (
                    <motion.div
                      key={badge}
                      initial={{ opacity: 0, scale: 0.8, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="flex items-center space-x-2"
                    >
                      <div className={`w-3 h-3 ${getBadgeColor(badge)} rounded-full animate-pulse`}></div>
                      <span className="font-mono">{badge}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Distributed Alert System */}
      <AnimatePresence>
        {activeAlerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ duration: 0.4 }}
            className={`fixed ${getAlertPosition(alert.position)} max-w-sm z-50`}
          >
            <div className={`${getAlertStyles(alert.type).bg} border ${getAlertStyles(alert.type).border} rounded-lg p-3 backdrop-blur-sm`}>
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 ${getAlertStyles(alert.type).dot} rounded-full animate-pulse`}></div>
                {alert.icon && (
                  <div className={`text-lg ${getAlertStyles(alert.type).text}`}>
                    {alert.icon}
                  </div>
                )}
                <div>
                  <div className={`${getAlertStyles(alert.type).text} font-mono text-xs font-semibold`}>
                    {alert.title}
                  </div>
                  <div className={`${getAlertStyles(alert.type).text} text-xs font-mono opacity-80`}>
                    {alert.message}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default WelcomePage; 