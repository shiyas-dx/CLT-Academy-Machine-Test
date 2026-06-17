'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

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

      {/* Main Page Content - Zoom, Blur & Fade with popLayout */}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={`content-${pathname}`}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={{
            initial: { 
              opacity: 0, 
              scale: 0.96, 
              filter: 'blur(15px)',
            },
            animate: { 
              opacity: 1, 
              scale: 1, 
              filter: 'blur(0px)',
              transition: { 
                delay: 0.15, // matches the sweep highlight center
                duration: 0.5,
                ease: [0.25, 1, 0.5, 1], // smooth deceleration
              }
            },
            exit: {
              opacity: 0,
              scale: 0.96,
              filter: 'blur(15px)',
              transition: {
                duration: 0.35,
                ease: [0.25, 0.1, 0.25, 1],
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
