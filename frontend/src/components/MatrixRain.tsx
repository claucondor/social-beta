import React, { useEffect, useRef } from 'react';

const MatrixRain: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // ÉPICO Matrix characters - More symbols for the resistance
    const chars = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ※⚡✦✧ΨΦΩ◉◎●○◇◆■□▲▼►◄↑↓←→∞∂∆∇∈∉⊂⊃∪∩∧∨';
    const fontSize = 12;
    const columns = Math.floor(canvas.width / fontSize / 1.2);
    const drops: number[] = [];
    const speeds: number[] = [];
    const brightnesses: number[] = [];

    // Initialize drops with random properties
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * canvas.height / fontSize;
      speeds[i] = Math.random() * 0.5 + 0.5; // Variable speed
      brightnesses[i] = Math.random();
    }

    const draw = () => {
      // Black background with fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px 'Fira Code', monospace`;

      for (let i = 0; i < drops.length; i++) {
        // Random character
        const char = chars[Math.floor(Math.random() * chars.length)];
        
        // Dynamic brightness and color
        brightnesses[i] += (Math.random() - 0.5) * 0.1;
        brightnesses[i] = Math.max(0, Math.min(1, brightnesses[i]));
        
        const brightness = brightnesses[i];
        
        if (brightness > 0.98) {
          ctx.fillStyle = '#ffffff'; // Bright white flash
          ctx.shadowColor = '#ffffff';
          ctx.shadowBlur = 10;
        } else if (brightness > 0.9) {
          ctx.fillStyle = '#00ff88'; // Bright green
          ctx.shadowColor = '#00ff88';
          ctx.shadowBlur = 5;
        } else if (brightness > 0.7) {
          ctx.fillStyle = '#00ff41'; // Matrix green
          ctx.shadowColor = '#00ff41';
          ctx.shadowBlur = 3;
        } else if (brightness > 0.4) {
          ctx.fillStyle = '#008f11'; // Medium green
          ctx.shadowColor = '#008f11';
          ctx.shadowBlur = 1;
        } else {
          ctx.fillStyle = '#004400'; // Dark green
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
        }

        // Draw character with glow effect
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);

        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        // Reset drop to top with variable probability
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.97) {
          drops[i] = 0;
          speeds[i] = Math.random() * 0.5 + 0.5;
          brightnesses[i] = Math.random();
        }

        // Move drop down at variable speed
        drops[i] += speeds[i];
      }
    };

    // Smoother animation - 60fps but optimized
    const animate = () => {
      draw();
      requestAnimationFrame(animate);
    };

    let frameCount = 0;
    const optimizedAnimate = () => {
      frameCount++;
      if (frameCount % 2 === 0) { // 30fps for performance
        draw();
      }
      requestAnimationFrame(optimizedAnimate);
    };

    optimizedAnimate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-40"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

export default MatrixRain; 