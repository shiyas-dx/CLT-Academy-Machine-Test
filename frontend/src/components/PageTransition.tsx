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
      staggerChildren: 0.08,
      delayChildren: 0.15,
    }
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1 as const,
    }
  }
};

// Physics-based wiggle and drop animation for individual components
export const wiggleItemVariants = {
  initial: {
    opacity: 0,
    y: '-100vh',
    rotate: -4,
  },
  animate: {
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: {
      y: { type: 'spring', stiffness: 90, damping: 14, mass: 0.8 },
      opacity: { duration: 0.35 },
      rotate: { type: 'spring', stiffness: 100, damping: 12 },
    }
  },
  exit: {
    opacity: 0,
    y: '100vh',
    rotate: 4,
    transition: {
      y: { type: 'spring', stiffness: 80, damping: 15 },
      opacity: { duration: 0.25 },
      rotate: { type: 'spring', stiffness: 90, damping: 10 },
    }
  }
};

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Dynamic Speed-Ramp Flash/Sweep Overlay */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`sweep-${pathname}`}
          className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {/* Main fast speed ramp sweep layer */}
          <motion.div
            className="absolute inset-y-0 -left-[100%] w-[300%] bg-gradient-to-r from-transparent via-primary/70 to-transparent"
            style={{
              skewX: -25,
            }}
            variants={{
              initial: { x: '-100%' },
              animate: {
                x: '100%',
                transition: {
                  duration: 0.65,
                  ease: [0.85, 0, 0.15, 1], // cinematic speed ramp curve
                },
              },
            }}
          />

          {/* Second brighter, narrower streak for highlights */}
          <motion.div
            className="absolute inset-y-0 -left-[100%] w-[250%] bg-gradient-to-r from-transparent via-cyan-400/80 through-fuchsia-500/80 to-transparent shadow-[0_0_80px_rgba(6,182,212,0.5)]"
            style={{
              skewX: -25,
            }}
            variants={{
              initial: { x: '-110%' },
              animate: {
                x: '110%',
                transition: {
                  duration: 0.65,
                  delay: 0.015,
                  ease: [0.85, 0, 0.15, 1],
                },
              },
            }}
          />
          
          {/* Ambient radial lighting flash */}
          <motion.div
            className="absolute inset-0 bg-primary/5 mix-blend-screen"
            variants={{
              initial: { opacity: 0 },
              animate: {
                opacity: [0, 1, 1, 0],
                transition: {
                  duration: 0.65,
                  times: [0, 0.35, 0.55, 1],
                  ease: [0.85, 0, 0.15, 1],
                },
              },
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Main Page Content - Physical Wiggle, Drop & Bounce Transition */}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={`content-${pathname}`}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={{
            initial: { 
              opacity: 0, 
              y: '-100vh',
              rotate: -3.5,
            },
            animate: { 
              opacity: 1, 
              y: 0, 
              rotate: 0,
              transition: { 
                y: { type: 'spring', stiffness: 80, damping: 13, mass: 0.95 },
                opacity: { duration: 0.4 },
                rotate: { type: 'spring', stiffness: 95, damping: 11 },
              }
            },
            exit: {
              opacity: 0,
              y: '100vh',
              rotate: 3.5,
              transition: {
                y: { type: 'spring', stiffness: 75, damping: 14 },
                opacity: { duration: 0.28 },
                rotate: { type: 'spring', stiffness: 85, damping: 9 },
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
