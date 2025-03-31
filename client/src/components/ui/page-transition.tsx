import { motion, AnimatePresence, Variants } from "framer-motion";
import { ReactNode } from "react";

type PageTransitionProps = {
  children: ReactNode;
  location: string;
  mode?: "fade" | "slide" | "scale" | "bounce" | "flip" | "none";
};

// Enhanced transition variants - with reduced intensity for smoother transitions
const fadeVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const slideVariants: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

const scaleVariants: Variants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
};

const bounceVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const flipVariants: Variants = {
  initial: { opacity: 0, rotateX: 5, perspective: 1000 },
  animate: { opacity: 1, rotateX: 0, perspective: 1000 },
  exit: { opacity: 0, rotateX: -5, perspective: 1000 },
};

export default function PageTransition({ children, location, mode = "fade" }: PageTransitionProps) {
  // Select the appropriate variant based on the mode
  const getVariants = () => {
    switch (mode) {
      case "fade":
        return fadeVariants;
      case "slide":
        return slideVariants;
      case "scale":
        return scaleVariants;
      case "bounce":
        return bounceVariants;
      case "flip":
        return flipVariants;
      case "none":
        return {};
      default:
        return fadeVariants;
    }
  };

  // Select the appropriate transition based on the mode - faster transitions
  const getTransition = () => {
    switch (mode) {
      case "fade":
        return { duration: 0.2, ease: "easeInOut" };
      case "slide":
        return { duration: 0.2, ease: "easeInOut" };
      case "scale":
        return { duration: 0.2, ease: "easeInOut" };
      case "bounce":
        return { duration: 0.2, ease: "easeInOut" };
      case "flip":
        return { duration: 0.2, ease: "easeInOut" };
      case "none":
        return { duration: 0 };
      default:
        return { duration: 0.2, ease: "easeInOut" };
    }
  };

  return (
    <AnimatePresence mode="sync">
      <motion.div
        key={location}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={getVariants()}
        transition={getTransition()}
        className="page-transition-container w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}