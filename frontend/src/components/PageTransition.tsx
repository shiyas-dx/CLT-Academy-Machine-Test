'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

// Staggered parent variants for page elements
export const pageContainerVariants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    }
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1 as const,
    }
  }
};

// Subtle fade-up animation for individual components (replaces wiggle/drop)
export const wiggleItemVariants = {
  initial: {
    opacity: 0,
    y: 12,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      y: { type: 'spring', stiffness: 120, damping: 18 },
      opacity: { duration: 0.25 },
    }
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: {
      y: { duration: 0.15, ease: 'easeIn' },
      opacity: { duration: 0.15 },
    }
  }
};

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="relative min-h-screen w-full">
      {/* Main Page Content - Clean and subtle fade transition */}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={`content-${pathname}`}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={{
            initial: { 
              opacity: 0,
              y: 8,
            },
            animate: { 
              opacity: 1,
              y: 0,
              transition: { 
                y: { type: 'spring', stiffness: 150, damping: 20 },
                opacity: { duration: 0.25 },
              }
            },
            exit: {
              opacity: 0,
              y: -8,
              transition: {
                y: { duration: 0.18, ease: 'easeIn' },
                opacity: { duration: 0.18 },
              }
            }
          }}
          className="w-full min-h-screen"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
