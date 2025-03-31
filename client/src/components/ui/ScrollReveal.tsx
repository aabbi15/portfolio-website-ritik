import { ReactNode, useEffect, useRef } from 'react';
import { motion, useAnimation, Variant } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface ScrollRevealProps {
  children: ReactNode;
  width?: 'fit-content' | '100%';
  delay?: number;
  duration?: number;
  from?: 'bottom' | 'top' | 'left' | 'right';
  distance?: number;
  scale?: number;
  triggerOnce?: boolean;
  threshold?: number;
  className?: string;
}

export default function ScrollReveal({
  children,
  width = 'fit-content',
  delay = 0,
  duration = 0.6,
  from = 'bottom',
  distance = 50,
  scale = 1,
  triggerOnce = true,
  threshold = 0.1,
  className = '',
}: ScrollRevealProps) {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce,
    threshold,
  });

  const getDirectionalProps = (): Record<string, Variant> => {
    let initial: { opacity: number; y?: number; x?: number; scale?: number } = { 
      opacity: 0,
      scale: scale !== 1 ? scale : undefined
    };

    switch (from) {
      case 'bottom':
        initial.y = distance;
        break;
      case 'top':
        initial.y = -distance;
        break;
      case 'left':
        initial.x = -distance;
        break;
      case 'right':
        initial.x = distance;
        break;
    }

    return {
      hidden: initial,
      visible: { 
        opacity: 1, 
        y: 0, 
        x: 0, 
        scale: 1,
        transition: { 
          duration, 
          delay,
          ease: [0.25, 0.1, 0.25, 1.0],
        } 
      },
    };
  };

  const motionProps = getDirectionalProps();

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    } else if (!triggerOnce) {
      controls.start('hidden');
    }
  }, [controls, inView, triggerOnce]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={motionProps}
      style={{ width }}
      className={className}
    >
      {children}
    </motion.div>
  );
}