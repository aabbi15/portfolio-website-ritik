import { Variants } from "framer-motion";

// Enhanced fade in animation for sections with more natural movement
export const fadeIn = (direction: "up" | "down" | "left" | "right" = "up", delay: number = 0): Variants => {
  return {
    hidden: {
      y: direction === "up" ? 40 : direction === "down" ? -40 : 0,
      x: direction === "left" ? 40 : direction === "right" ? -40 : 0,
      opacity: 0,
      filter: "blur(5px)",
    },
    show: {
      y: 0,
      x: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 20,
        delay,
      },
    },
  };
};

// Stagger children animation with configurable parameters
export const staggerContainer = (
  staggerChildren: number = 0.1, 
  delayChildren: number = 0.2
): Variants => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
});

// Enhanced card hover animation with subtle transform
export const cardHover: Variants = {
  rest: {
    scale: 1,
    y: 0,
    boxShadow: "0 4px 8px -2px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
    },
  },
  hover: {
    scale: 1.03,
    y: -5,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
};

// Button animation for interactive elements
export const buttonAnimation: Variants = {
  rest: {
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10,
    }
  },
  hover: {
    scale: 1.05,
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10,
    }
  },
  tap: {
    scale: 0.95,
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10,
    }
  }
};

// Floating animation for selected UI elements
export const floatingAnimation: Variants = {
  initial: { y: 0 },
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      ease: "easeInOut",
      repeat: Infinity,
    }
  }
};

// Reveal text animation letter by letter
export const revealText = {
  hidden: { opacity: 0 },
  visible: (i = 1) => ({
    opacity: 1,
    transition: { staggerChildren: 0.03, delayChildren: 0.04 * i },
  }),
};

// Reveal letter animation for text reveal
export const revealLetter = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 12,
      stiffness: 100,
    },
  },
};

// Loading ripple animation for buttons or loaders
export const loadingRipple: Variants = {
  animate: {
    scale: [1, 1.5, 1],
    opacity: [0.5, 0, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Attention pulse animation for UI elements that need highlighting
export const attentionPulse: Variants = {
  initial: { 
    scale: 1,
    boxShadow: "0 0 0 0 rgba(var(--primary-rgb), 0.7)" 
  },
  pulse: {
    scale: [1, 1.05, 1],
    boxShadow: [
      "0 0 0 0 rgba(var(--primary-rgb), 0.7)",
      "0 0 0 10px rgba(var(--primary-rgb), 0)",
      "0 0 0 0 rgba(var(--primary-rgb), 0)"
    ],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      repeatType: "loop"
    }
  }
};

// Subtle slide up animation for lists and grids
export const slideUp = (delay: number = 0): Variants => ({
  hidden: { 
    y: 20, 
    opacity: 0,
    filter: "blur(5px)"
  },
  visible: { 
    y: 0, 
    opacity: 1,
    filter: "blur(0px)",
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 20,
      delay
    }
  }
});
