import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
}

interface AnimatedBackgroundProps {
  count?: number;
  colorPrimary?: string;
  colorSecondary?: string;
  minSize?: number;
  maxSize?: number;
  speed?: number;
  opacity?: number;
  className?: string;
}

export default function AnimatedBackground({
  count = 50,
  colorPrimary = 'var(--accent-color)',
  colorSecondary = 'var(--primary)',
  minSize = 1,
  maxSize = 5,
  speed = 0.5,
  opacity = 0.3,
  className = '',
}: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const animationFrameId = useRef<number | null>(null);
  const colorPrimaryRef = useRef(colorPrimary);
  const colorSecondaryRef = useRef(colorSecondary);

  // Setup and animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles.current = [];
      for (let i = 0; i < count; i++) {
        particles.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * (maxSize - minSize) + minSize,
          speedX: (Math.random() - 0.5) * speed,
          speedY: (Math.random() - 0.5) * speed,
          color: Math.random() > 0.5 ? colorPrimaryRef.current : colorSecondaryRef.current,
        });
      }
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      particles.current.forEach((particle, index) => {
        // Move particle
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Wrap around screen
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.y > canvas.height) particle.y = 0;
        if (particle.y < 0) particle.y = canvas.height;
        
        // Draw particle
        ctx.globalAlpha = opacity;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw connections
        ctx.globalAlpha = opacity * 0.5;
        ctx.strokeStyle = particle.color;
        ctx.lineWidth = 0.5;
        
        for (let j = index + 1; j < particles.current.length; j++) {
          const otherParticle = particles.current[j];
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 120) {
            ctx.globalAlpha = opacity * (1 - distance / 120);
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
          }
        }
      });
      
      animationFrameId.current = requestAnimationFrame(drawParticles);
    };

    // Initialize
    handleResize();
    window.addEventListener('resize', handleResize);
    drawParticles();

    // Watch for color changes
    const observer = new MutationObserver(() => {
      colorPrimaryRef.current = getComputedStyle(document.documentElement).getPropertyValue('--accent-color') || colorPrimary;
      colorSecondaryRef.current = getComputedStyle(document.documentElement).getPropertyValue('--primary') || colorSecondary;
      initParticles();
    });
    
    observer.observe(document.documentElement, { 
      attributes: true,
      attributeFilter: ['class', 'data-theme']
    });

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, [count, maxSize, minSize, opacity, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 -z-10 ${className}`}
      style={{ opacity }}
    />
  );
}