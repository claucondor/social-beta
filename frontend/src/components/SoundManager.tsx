import React, { useEffect, useState } from 'react';

interface SoundManagerProps {
  isEnabled?: boolean;
}

const SoundManager: React.FC<SoundManagerProps> = ({ isEnabled = false }) => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    if (!isEnabled) return;

    // Initialize Web Audio API
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(ctx);
    } catch (error) {
      console.warn('Web Audio API not supported');
    }

    return () => {
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [isEnabled]);

  // Generate cyberpunk-style synth tones
  const playTone = (frequency: number, duration: number, volume: number = 0.1) => {
    if (!audioContext || isMuted) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = 'square'; // Cyberpunk synth sound
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  };

  // Ambient background drone (very subtle)
  const playAmbientDrone = () => {
    if (!audioContext || isMuted) return;

    const oscillator1 = audioContext.createOscillator();
    const oscillator2 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator1.frequency.setValueAtTime(55, audioContext.currentTime); // Low A
    oscillator2.frequency.setValueAtTime(82.4, audioContext.currentTime); // Low E
    
    oscillator1.type = 'sine';
    oscillator2.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.02, audioContext.currentTime);
    
    oscillator1.start(audioContext.currentTime);
    oscillator2.start(audioContext.currentTime);
    
    // Stop after 5 seconds
    setTimeout(() => {
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1);
      oscillator1.stop(audioContext.currentTime + 1);
      oscillator2.stop(audioContext.currentTime + 1);
    }, 5000);
  };

  // Glitch sound effect
  const playGlitch = () => {
    if (!audioContext || isMuted) return;
    
    const frequencies = [220, 440, 880, 1760];
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        playTone(freq, 0.05, 0.05);
      }, index * 20);
    });
  };

  // Matrix-style digital blip
  const playBlip = () => {
    playTone(1200, 0.1, 0.08);
  };

  // Button click sound
  const playClick = () => {
    playTone(800, 0.05, 0.06);
    setTimeout(() => playTone(1200, 0.03, 0.04), 50);
  };

  // Expose sound functions globally (optional)
  useEffect(() => {
    if (isEnabled) {
      (window as any).resistanceSounds = {
        playGlitch,
        playBlip,
        playClick,
        playAmbientDrone
      };
    }
  }, [isEnabled, isMuted]);

  if (!isEnabled) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-dark-900/80 border border-glitch-primary/30 rounded p-2 backdrop-blur-sm">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="text-xs text-glitch-primary hover:text-glitch-secondary transition-colors"
          title={isMuted ? 'Activar sonidos' : 'Silenciar sonidos'}
        >
          {isMuted ? '🔇' : '🔊'} AUDIO
        </button>
      </div>
    </div>
  );
};

export default SoundManager; 