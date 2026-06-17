'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Loader2, Zap, ArrowLeft, CheckCircle } from 'lucide-react';

// ── Google SVG Icon ──────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

type Step = 'login' | 'forgot-email' | 'forgot-otp' | 'forgot-reset' | 'forgot-done';

export default function LoginPage() {
  const router = useRouter();

  // Login state
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loginErr, setLoginErr] = useState('');
  const [loading,  setLoading]  = useState<'google' | 'creds' | null>(null);

  // Forgot-password state
  const [step,       setStep]       = useState<Step>('login');
  const [fpEmail,    setFpEmail]    = useState('');
  const [fpOtp,      setFpOtp]      = useState('');
  const [fpPassword, setFpPassword] = useState('');
  const [fpLoading,  setFpLoading]  = useState(false);
  const [fpError,    setFpError]    = useState('');

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleGoogle = async () => {
    setLoading('google');
    await signIn('google', { callbackUrl: '/products' });
    setLoading(null);
  };

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErr('');
    setLoading('creds');
    const result = await signIn('credentials', {
      email, password,
      redirect: false,
    });
    setLoading(null);
    if (result?.error) {
      setLoginErr('Invalid email or password. Please try again.');
    } else {
      router.push('/products');
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFpLoading(true); setFpError('');
    try {
      const res  = await fetch(`${API}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fpEmail }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message);
      setStep('forgot-otp');
    } catch (err: any) {
      setFpError(err.message || 'Failed to send OTP');
    } finally {
      setFpLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFpLoading(true); setFpError('');
    try {
      const res  = await fetch(`${API}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fpEmail, otp: fpOtp, newPassword: fpPassword }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message);
      setStep('forgot-done');
    } catch (err: any) {
      setFpError(err.message || 'Password reset failed');
    } finally {
      setFpLoading(false);
    }
  };

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center px-4 overflow-hidden">

      {/* Animated background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-violet-500/20 blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-indigo-500/20 blur-[100px]"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        {/* ── Login panel ────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {step === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: 0 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
              className="card-glass p-8"
            >
              {/* Logo */}
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-glow">
                  <Zap className="h-6 w-6" />
                </div>
                <h1 className="font-display text-2xl font-bold text-foreground">Welcome back</h1>
                <p className="mt-1 text-sm text-muted-foreground">Sign in to your CLT Academy account</p>
              </div>

              {/* Google Sign-In */}
              <button onClick={handleGoogle} disabled={!!loading} className="btn-google mb-4">
                {loading === 'google' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <GoogleIcon />
                )}
                Continue with Google
              </button>

              {/* Divider */}
              <div className="divider mb-4">or sign in with email</div>

              {/* Credentials form */}
              <form onSubmit={handleCredentials} className="space-y-4">
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="input-field"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="label mb-0">Password</label>
                    <button
                      type="button"
                      onClick={() => setStep('forgot-email')}
                      className="text-[11px] text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="input-field pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {loginErr && (
                  <p className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs text-destructive">
                    {loginErr}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={!!loading}
                  className="btn-primary w-full"
                >
                  {loading === 'creds' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {loading === 'creds' ? 'Signing in…' : 'Sign In'}
                </button>
              </form>
            </motion.div>
          )}

          {/* ── OTP Step 1: Email ──────────────────────────────────────── */}
          {step === 'forgot-email' && (
            <motion.div
              key="forgot-email"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="card-glass p-8"
            >
              <button onClick={() => setStep('login')} className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to login
              </button>
              <h2 className="font-display text-xl font-bold text-foreground mb-1">Reset Password</h2>
              <p className="text-sm text-muted-foreground mb-6">Enter your email and we'll send you a 6-digit OTP.</p>
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="label">Email</label>
                  <input type="email" value={fpEmail} onChange={e => setFpEmail(e.target.value)} required className="input-field" placeholder="you@example.com" />
                </div>
                {fpError && <p className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs text-destructive">{fpError}</p>}
                <button type="submit" disabled={fpLoading} className="btn-primary w-full">
                  {fpLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {fpLoading ? 'Sending OTP…' : 'Send OTP'}
                </button>
              </form>
            </motion.div>
          )}

          {/* ── OTP Step 2: Enter OTP + new password ──────────────────── */}
          {step === 'forgot-otp' && (
            <motion.div
              key="forgot-otp"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="card-glass p-8"
            >
              <button onClick={() => setStep('forgot-email')} className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </button>
              <h2 className="font-display text-xl font-bold text-foreground mb-1">Enter OTP</h2>
              <p className="text-sm text-muted-foreground mb-6">
                We sent a 6-digit code to <span className="text-primary font-medium">{fpEmail}</span>. Enter it below along with your new password.
              </p>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="label">OTP Code</label>
                  <input
                    type="text"
                    value={fpOtp}
                    onChange={e => setFpOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required maxLength={6}
                    placeholder="000000"
                    className="input-field text-center tracking-[0.5em] text-xl font-bold"
                  />
                </div>
                <div>
                  <label className="label">New Password</label>
                  <input type="password" value={fpPassword} onChange={e => setFpPassword(e.target.value)} required minLength={6} placeholder="Min 6 characters" className="input-field" />
                </div>
                {fpError && <p className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs text-destructive">{fpError}</p>}
                <button type="submit" disabled={fpLoading} className="btn-primary w-full">
                  {fpLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {fpLoading ? 'Resetting…' : 'Reset Password'}
                </button>
                <button type="button" onClick={handleSendOtp} disabled={fpLoading} className="btn-ghost w-full text-xs">
                  Resend OTP
                </button>
              </form>
            </motion.div>
          )}

          {/* ── OTP Step 3: Done ───────────────────────────────────────── */}
          {step === 'forgot-done' && (
            <motion.div
              key="forgot-done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card-glass p-8 text-center"
            >
              <CheckCircle className="mx-auto h-12 w-12 text-emerald-400 mb-4" />
              <h2 className="font-display text-xl font-bold text-foreground mb-2">Password Reset!</h2>
              <p className="text-sm text-muted-foreground mb-6">Your password has been updated. Sign in with your new credentials.</p>
              <button onClick={() => { setStep('login'); setPassword(''); }} className="btn-primary w-full">
                Back to Sign In
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
