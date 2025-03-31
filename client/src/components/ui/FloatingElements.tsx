import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface FloatingElementsProps {
  count?: number;
  children?: ReactNode;
  className?: string;
  minSize?: number;
  maxSize?: number;
}

export default function FloatingElements({
  count = 5,
  children,
  className = '',
  minSize = 20,
  maxSize = 80,
}: FloatingElementsProps) {
  // Generate random elements
  const generateElements = () => {
    const elements = [];
    
    for (let i = 0; i < count; i++) {
      const size = Math.random() * (maxSize - minSize) + minSize;
      const posX = Math.random() * 100;
      const posY = Math.random() * 100;
      const duration = Math.random() * 20 + 10;
      const delay = Math.random() * -20;
      
      elements.push(
        <motion.div
          key={i}
          className="absolute z-0 opacity-30 dark:opacity-20 blur-sm"
          style={{
            top: `${posY}%`,
            left: `${posX}%`,
            width: size,
            height: size,
          }}
          animate={{
            y: [0, -30, 30, -15, 0],
            x: [0, 20, -20, 15, 0],
            rotate: [0, 45, -45, 10, 0],
          }}
          transition={{
            duration,
            delay,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        >
          {children || (
            <div 
              className="w-full h-full rounded-full bg-gradient-to-tr from-primary/50 to-primary-foreground/50"
            />
          )}
        </motion.div>
      );
    }
    
    return elements;
  };

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {generateElements()}
    </div>
  );
}