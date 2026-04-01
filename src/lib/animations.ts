import { Variants } from 'motion/react';

// Subtle fade and slide variants for page transitions
export const pageVariants: Variants = {
  initial: { 
    opacity: 0, 
    y: 8 
  },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1] // cubic-bezier for smooth feel
    }
  },
  exit: { 
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.1, 0.25, 1]
    }
  }
};

// Fade in variant for simple elements
export const fadeInVariants: Variants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: { opacity: 0 }
};

// Scale fade for modals and overlays
export const scaleVariants: Variants = {
  initial: { 
    opacity: 0, 
    scale: 0.96 
  },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.1, 0.25, 1]
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.96,
    transition: {
      duration: 0.15
    }
  }
};

// Stagger container for lists
export const staggerContainerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

// Stagger item for list children
export const staggerItemVariants: Variants = {
  initial: { 
    opacity: 0, 
    y: 12 
  },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1]
    }
  }
};

// Slide in from right (for detail pages)
export const slideInRightVariants: Variants = {
  initial: { 
    opacity: 0, 
    x: 20 
  },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1]
    }
  },
  exit: { 
    opacity: 0, 
    x: -20,
    transition: {
      duration: 0.2
    }
  }
};

// Button tap animation
export const buttonTapScale = {
  scale: 0.98,
  transition: { duration: 0.1 }
};

// Button hover animation
export const buttonHoverScale = {
  scale: 1.02,
  transition: { duration: 0.2 }
};

// Card hover animation
export const cardHoverVariants = {
  rest: { 
    y: 0,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  hover: { 
    y: -2,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    transition: { duration: 0.2 }
  }
};
