'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Package, LogOut, User, ChevronDown, Zap, Menu, X, Home } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCart } from '@/hooks/useCart';

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [scrolled,     setScrolled]     = useState(false);
  const { data: cartData } = useCart();

  const cartCount = (cartData?.items || []).reduce(
    (sum: number, item: any) => sum + (item.quantity || 0), 0
  );

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const close = () => setDropdownOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [dropdownOpen]);

  if (status === 'loading' || !session) return null;

  const navLinks = [
    { href: '/',         label: 'Home',     icon: Home },
    { href: '/products', label: 'Products', icon: Package },
    { href: '/cart',     label: 'Cart',     icon: ShoppingCart, badge: cartCount },
  ];

  const user = session.user;
  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? '?';

  return (
    <>
      <motion.nav
        initial={{ y: -72, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 inset-x-0 z-50 h-16 transition-all duration-300 ${
          scrolled
            ? 'border-b border-border/70 bg-background/90 backdrop-blur-2xl shadow-[0_4px_24px_rgba(0,0,0,0.4)]'
            : 'bg-background/60 backdrop-blur-xl border-b border-transparent'
        }`}
      >
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6">

          {/* ── Brand ─────────────────────────────── */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ scale: 1.12, rotate: 8 }}
              transition={{ type: 'spring', stiffness: 400 }}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15 text-primary"
              style={{ boxShadow: '0 0 16px rgba(124,58,237,0.3)' }}
            >
              <Zap className="h-4 w-4" />
            </motion.div>
            <span className="font-display font-extrabold text-foreground tracking-tight text-lg">
              CLT<span className="text-gradient">Shop</span>
            </span>
          </Link>

          {/* ── Desktop nav links ──────────────────── */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon, badge }) => {
              const isActive = href === '/' ? pathname === '/' : pathname?.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`nav-link relative ${isActive ? 'active' : ''}`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-xl bg-secondary/80 -z-10"
                      style={{ boxShadow: '0 0 0 1px rgba(139,92,246,0.2)' }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  {badge != null && badge > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white"
                      style={{ boxShadow: '0 0 8px rgba(124,58,237,0.5)' }}
                    >
                      {badge > 9 ? '9+' : badge}
                    </motion.span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* ── Desktop user menu ──────────────────── */}
          <div className="hidden md:flex items-center gap-2">
            <div className="relative" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setDropdownOpen(v => !v)}
                className="flex items-center gap-2.5 rounded-xl border border-border/50 bg-secondary/40 px-3 py-1.5 text-sm font-medium text-foreground transition-all duration-200 hover:bg-secondary hover:border-border/80"
              >
                {user?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.image} alt="" className="h-6 w-6 rounded-full ring-1 ring-primary/30" />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-[10px] font-bold ring-1 ring-primary/30">
                    {initials}
                  </div>
                )}
                <span className="max-w-[120px] truncate text-sm">{user?.name ?? user?.email}</span>
                <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit ={{ opacity: 0, y: 6, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-border bg-popover/95 backdrop-blur-xl p-1.5 shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
                  >
                    {/* User info */}
                    <div className="px-3 py-2.5 mb-1 border-b border-border">
                      <p className="text-xs font-semibold text-foreground truncate">{user?.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
                    </div>

                    {navLinks.map(({ href, label, icon: Icon }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {label}
                      </Link>
                    ))}

                    <div className="border-t border-border mt-1 pt-1">
                      <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <LogOut className="h-3.5 w-3.5" /> Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Mobile hamburger ───────────────────── */}
          <button
            className="md:hidden btn-ghost p-2"
            onClick={() => setMobileOpen(v => !v)}
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileOpen
                ? <motion.div key="x"  initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><X    className="h-5 w-5" /></motion.div>
                : <motion.div key="mn" initial={{ rotate: 90, opacity: 0 }}  animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><Menu className="h-5 w-5" /></motion.div>
              }
            </AnimatePresence>
          </button>
        </div>

        {/* ── Mobile menu ───────────────────────────── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit ={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="md:hidden overflow-hidden border-t border-border/60 bg-background/95 backdrop-blur-2xl"
            >
              <div className="px-4 py-3 space-y-1">
                {navLinks.map(({ href, label, icon: Icon, badge }) => {
                  const isActive = href === '/' ? pathname === '/' : pathname?.startsWith(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className={`nav-link w-full justify-between ${isActive ? 'active' : ''}`}
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="h-4 w-4" /> {label}
                      </span>
                      {badge != null && badge > 0 && <span className="badge-violet">{badge}</span>}
                    </Link>
                  );
                })}

                <div className="border-t border-border pt-2 mt-2 space-y-1">
                  <div className="flex items-center gap-3 px-3 py-2">
                    {user?.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.image} alt="" className="h-8 w-8 rounded-full ring-2 ring-primary/30" />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary text-sm font-bold">
                        {initials}
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-semibold text-foreground">{user?.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate max-w-[180px]">{user?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="nav-link w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Spacer for fixed navbar */}
      <div className="h-16" />
    </>
  );
}
