'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
  ArrowRight, Sparkles, KeyRound, ShoppingCart,
  Image as ImageIcon, Github, Zap, Database,
  Shield, RefreshCw, Play
} from 'lucide-react';

const TECH = [
  'Next.js 14', 'Express.js', 'MongoDB Atlas', 'Cloudinary',
  'NextAuth.js', 'React Query', 'Tailwind CSS', 'Framer Motion',
  'TanStack Table', 'Zod + RHF', 'TypeScript', 'JWT Cookies',
];

const FEATURES = [
  {
    icon: KeyRound,
    title: 'Secure Auth System',
    desc: 'Google OAuth + Credentials login with httpOnly cookie-based JWT tokens and silent 401 refresh cycles.',
    color: 'from-violet-500/20 to-violet-500/5',
    glow: 'rgba(139,92,246,0.25)',
  },
  {
    icon: ImageIcon,
    title: 'Cloudinary Media Flow',
    desc: 'Direct frontend upload using backend-signed Cloudinary payloads. Image slider + HTML5 video player.',
    color: 'from-blue-500/20 to-blue-500/5',
    glow: 'rgba(59,130,246,0.25)',
  },
  {
    icon: ShoppingCart,
    title: 'Reactive Cart Engine',
    desc: 'TanStack Query mutations for real-time cart ops with animated Framer Motion item transitions.',
    color: 'from-emerald-500/20 to-emerald-500/5',
    glow: 'rgba(16,185,129,0.25)',
  },
  {
    icon: Database,
    title: 'MongoDB Atlas',
    desc: 'Persistent cloud database with Mongoose schemas for Products and embedded User cart items.',
    color: 'from-pink-500/20 to-pink-500/5',
    glow: 'rgba(236,72,153,0.25)',
  },
  {
    icon: Shield,
    title: 'Protected Routes',
    desc: 'NextAuth middleware guards all /products and /cart routes — unauthenticated access redirects to /login.',
    color: 'from-amber-500/20 to-amber-500/5',
    glow: 'rgba(245,158,11,0.25)',
  },
  {
    icon: RefreshCw,
    title: 'Product CRUD',
    desc: 'Full create, read, update, delete for products with rich form validation and drag-and-drop media upload.',
    color: 'from-cyan-500/20 to-cyan-500/5',
    glow: 'rgba(6,182,212,0.25)',
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 90, damping: 18 } },
};

export default function IntroPage() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';

  return (
    <div className="relative min-h-screen overflow-hidden">

      {/* ── Animated background orbs ── */}
      <div className="orb orb-1 w-[600px] h-[600px] top-[-200px] left-[-200px]" />
      <div className="orb orb-2 w-[500px] h-[500px] bottom-[-100px] right-[-100px]" />
      <div className="orb orb-3 w-[400px] h-[400px] top-[40%] left-[50%]" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-20"
        >

          {/* ── Hero ─────────────────────────────────────────────────────── */}
          <div className="text-center space-y-8">
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-bold text-violet-300 shadow-glow-sm">
                <Sparkles className="h-3.5 w-3.5" />
                Full-Stack Production · CLT Academy Machine Test
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-5xl font-display font-black tracking-tight sm:text-7xl leading-[1.05]"
            >
              <span className="text-foreground">Build.</span>{' '}
              <span className="text-gradient">Ship.</span>{' '}
              <span className="text-foreground">Repeat.</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed"
            >
              A high-fidelity, production-spec full-stack application showcasing secure
              authentication, real-time cart operations, direct cloud media uploads, and
              a polished dark UI system — all built within the assessment window.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-4">
              {isAuthenticated ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex flex-wrap justify-center gap-3">
                    <Link href="/products" className="btn-primary py-3 px-7 text-base">
                      <Zap className="h-4 w-4" />
                      Open Catalog
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link href="/cart" className="btn-secondary py-3 px-7 text-base">
                      <ShoppingCart className="h-4 w-4" />
                      View Cart
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="btn-ghost py-3 px-5"
                    >
                      Sign Out
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Signed in as{' '}
                    <span className="font-semibold text-primary">
                      {session?.user?.name ?? session?.user?.email}
                    </span>
                  </p>
                </div>
              ) : (
                <>
                  <Link href="/login" className="btn-primary py-3 px-8 text-base">
                    <KeyRound className="h-4 w-4" />
                    Sign In to App
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a
                    href="https://github.com/shiyas-dx/CLT-Academy-Machine-Test"
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary py-3 px-7 text-base"
                  >
                    <Github className="h-4 w-4" />
                    View on GitHub
                  </a>
                </>
              )}
            </motion.div>

            {/* Demo video/preview pill */}
            <motion.div variants={itemVariants}>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-full bg-secondary/60 border border-border/60 px-5 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all duration-200"
              >
                <Play className="h-3.5 w-3.5 text-primary" />
                See live demo ↗
              </Link>
            </motion.div>
          </div>

          {/* ── Tech stack badges ─────────────────────────────────────────── */}
          <motion.div variants={itemVariants} className="text-center space-y-5">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Built with
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {TECH.map((t, i) => (
                <motion.span
                  key={t}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 + 0.5 }}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-full bg-secondary/80 border border-border/80 text-foreground hover:border-primary/50 hover:text-primary transition-all duration-200 cursor-default"
                >
                  {t}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* ── Feature grid ─────────────────────────────────────────────── */}
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-display font-bold text-foreground">
                Everything included
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Every phase of the spec, implemented to a production standard.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FEATURES.map(({ icon: Icon, title, desc, color, glow }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 + 0.8, type: 'spring', stiffness: 80 }}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className="card-glass p-5 space-y-3 cursor-default group"
                  style={{ '--glow': glow } as React.CSSProperties}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-white transition-all duration-300 group-hover:scale-110`}
                    style={{ boxShadow: `0 4px 16px ${glow}` }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-foreground text-sm">{title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── Bottom CTA strip ─────────────────────────────────────────── */}
          <motion.div
            variants={itemVariants}
            className="relative rounded-3xl overflow-hidden border border-violet-500/20 p-8 text-center space-y-5"
            style={{
              background: 'linear-gradient(135deg, rgba(109,40,217,0.12) 0%, rgba(67,56,202,0.06) 100%)',
            }}
          >
            <div className="shimmer-line absolute top-0 inset-x-0" />
            <h2 className="text-2xl font-display font-bold text-foreground">
              Ready to explore?
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Sign in with Google or a test credential to browse products, upload media, and manage your cart.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/login" className="btn-primary py-3 px-7">
                <KeyRound className="h-4 w-4" /> Get Started
              </Link>
              <a
                href="https://github.com/shiyas-dx/CLT-Academy-Machine-Test"
                target="_blank"
                rel="noreferrer"
                className="btn-secondary py-3 px-6"
              >
                <Github className="h-4 w-4" /> Source Code
              </a>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}
