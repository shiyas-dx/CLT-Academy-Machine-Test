'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Package, LogOut, User, ChevronDown, Zap, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/hooks/useCart';

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router   = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const { data: cartData } = useCart();

  const cartCount = (cartData?.items || []).reduce(
    (sum: number, item: any) => sum + (item.quantity || 0), 0
  );

  // Don't render on auth pages
  if (status === 'loading' || !session) return null;

  const navLinks = [
    { href: '/products', label: 'Products', icon: Package },
    { href: '/cart',     label: 'Cart',     icon: ShoppingCart, badge: cartCount },
  ];

  const user = session.user;
  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? '?';

  return (
    <motion.nav
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0,  opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="fixed top-0 inset-x-0 z-50 h-16 border-b border-border/60 bg-background/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Brand */}
        <Link href="/products" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shadow-glow-sm group-hover:shadow-glow transition-all duration-300">
            <Zap className="h-4 w-4" />
          </div>
          <span className="font-display font-bold text-foreground tracking-tight">CLT<span className="text-primary">Shop</span></span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon, badge }) => {
            const isActive = pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`nav-link relative ${isActive ? 'active' : ''}`}
              >
                <Icon className="h-4 w-4" />
                {label}
                {badge != null && badge > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-glow-sm">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Desktop User Menu */}
        <div className="hidden md:flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(v => !v)}
              className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-secondary/40 px-3 py-1.5 text-sm font-medium text-foreground transition-all duration-200 hover:bg-secondary hover:border-border"
            >
              {/* Avatar */}
              {user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.image} alt={user.name ?? ''} className="h-6 w-6 rounded-full object-cover" />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-[10px] font-bold">
                  {initials}
                </div>
              )}
              <span className="max-w-[120px] truncate">{user?.name ?? user?.email}</span>
              <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit ={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-border bg-popover p-1 shadow-card"
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-border mb-1">
                    <p className="text-xs font-semibold text-foreground truncate">{user?.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
                  </div>

                  <Link
                    href="/products"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                  >
                    <Package className="h-3.5 w-3.5" /> Products
                  </Link>
                  <Link
                    href="/cart"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                  >
                    <ShoppingCart className="h-3.5 w-3.5" /> Cart {cartCount > 0 && <span className="badge-violet ml-auto">{cartCount}</span>}
                  </Link>

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

        {/* Mobile hamburger */}
        <button
          className="md:hidden btn-ghost p-2"
          onClick={() => setMobileOpen(v => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit ={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map(({ href, label, icon: Icon, badge }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`nav-link w-full ${pathname?.startsWith(href) ? 'active' : ''}`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  {badge != null && badge > 0 && <span className="badge-violet ml-auto">{badge}</span>}
                </Link>
              ))}
              <div className="border-t border-border pt-2 mt-2">
                <div className="flex items-center gap-2.5 px-3 py-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">{user?.name}</p>
                    <p className="text-[11px] text-muted-foreground">{user?.email}</p>
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
  );
}
