'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="relative min-h-screen w-full">
      {/* Cinematic Curtains */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`curtain-${pathname}`}
          className="fixed inset-0 pointer-events-none z-50 flex flex-col justify-end"
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {/* Main Solid Curtain */}
          <motion.div
            className="absolute inset-0 bg-[#070412]"
            variants={{
              initial: { y: '100%' },
              animate: { 
                y: ['100%', '0%', '0%', '-100%'],
                transition: {
                  duration: 1.1,
                  times: [0, 0.4, 0.6, 1],
                  ease: [0.76, 0, 0.24, 1],
                }
              }
            }}
          />
          
          {/* Second Accent Curtain */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-primary/25 via-fuchsia-500/10 to-transparent"
            variants={{
              initial: { y: '100%' },
              animate: { 
                y: ['100%', '0%', '0%', '-100%'],
                transition: {
                  duration: 1.1,
                  times: [0.05, 0.45, 0.55, 0.95],
                  ease: [0.76, 0, 0.24, 1],
                }
              }
            }}
          />

          {/* Glowing Line Separator */}
          <motion.div
            className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 via-primary to-fuchsia-500 shadow-[0_0_20px_rgba(124,58,237,0.8)]"
            variants={{
              initial: { y: '100vh' },
              animate: {
                y: ['100vh', '0vh', '0vh', '-100vh'],
                transition: {
                  duration: 1.1,
                  times: [0, 0.4, 0.6, 1],
                  ease: [0.76, 0, 0.24, 1],
                }
              }
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Main Page Content */}
      <motion.div
        key={`content-${pathname}`}
        initial="initial"
        animate="animate"
        variants={{
          initial: { opacity: 0, scale: 0.97, y: 12, filter: 'blur(8px)' },
          animate: { 
            opacity: 1, 
            scale: 1, 
            y: 0, 
            filter: 'blur(0px)',
            transition: { 
              delay: 0.45, // syncs with when the curtain covers the page
              duration: 0.55,
              ease: [0.22, 1, 0.36, 1] 
            }
          }
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
