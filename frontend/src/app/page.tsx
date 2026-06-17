'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Sparkles, 
  KeyRound, 
  ShoppingCart, 
  Image as ImageIcon
} from 'lucide-react';

export default function IntroPage() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  const techBadge = (text: string) => (
    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-secondary/80 text-foreground border border-border/80 hover:border-primary/50 transition-colors">
      {text}
    </span>
  );

  return (
    <div className="relative min-h-[90vh] flex flex-col justify-center items-center px-4 overflow-hidden py-16">
      
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/20 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '2s' }} />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl text-center space-y-8"
      >
        {/* Project Badge */}
        <motion.div variants={itemVariants} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary shadow-glow-sm">
          <Sparkles className="h-3.5 w-3.5" /> Full-Stack Production Spec
        </motion.div>

        {/* Title */}
        <motion.div variants={itemVariants} className="space-y-3">
          <h1 className="text-4xl font-display font-black tracking-tight sm:text-6xl text-foreground">
            CLT Academy <span className="bg-gradient-to-r from-primary via-violet-400 to-primary bg-clip-text text-transparent">Machine Test</span>
          </h1>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed">
            A high-fidelity project showcasing secure cookie-based token flows, direct Cloudinary uploads via signed endpoints, a dynamic media slider, and reactive cart integrations.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-4">
          {isAuthenticated ? (
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-3">
                <Link href="/products" className="btn-primary py-3 px-6 text-sm shadow-glow">
                  Go to Catalog Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <button 
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="btn-secondary py-3 px-6 text-sm"
                >
                  Log Out
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Logged in as <span className="font-semibold text-primary">{session?.user?.name || session?.user?.email}</span>
              </p>
            </div>
          ) : (
            <>
              <Link href="/login" className="btn-primary py-3 px-6 text-sm shadow-glow">
                Access Application / Log In <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link href="/products" className="btn-secondary py-3 px-6 text-sm">
                Browse Products (Protected)
              </Link>
            </>
          )}
        </motion.div>

        {/* Technology Stack Grid */}
        <motion.div variants={itemVariants} className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Tech Stack Showcase</h2>
          <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
            {techBadge('Next.js 14 (App Router)')}
            {techBadge('Express.js API')}
            {techBadge('MongoDB Atlas')}
            {techBadge('Cloudinary Storage')}
            {techBadge('NextAuth.js')}
            {techBadge('React Query')}
            {techBadge('Tailwind CSS')}
            {techBadge('Framer Motion')}
            {techBadge('TanStack Table')}
            {techBadge('Zod & React Hook Form')}
          </div>
        </motion.div>

        {/* Feature Grid */}
        <motion.div 
          variants={itemVariants} 
          className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left pt-8 border-t border-border/60"
        >
          {/* Item 1 */}
          <div className="card-glass p-5 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <KeyRound className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-foreground text-sm">Secure Authentication</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Google OAuth integration combined with Credentials log-in. Secured with HTTPOnly signed tokens and automated silent 401 refresh cycles.
            </p>
          </div>

          {/* Item 2 */}
          <div className="card-glass p-5 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ImageIcon className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-foreground text-sm">Cloudinary Media Flow</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Direct frontend media upload via secure, backend-signed signature payloads. Displays images and renders interactive HTML5 video players.
            </p>
          </div>

          {/* Item 3 */}
          <div className="card-glass p-5 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-foreground text-sm">Reactive Shopping Cart</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Fully reactive shopping cart utilizing TanStack Query query/mutation pipelines, offering fluid Framer Motion list transition exits.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
