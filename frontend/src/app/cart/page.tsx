'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart, useUpdateCartQuantity, useRemoveFromCart } from '@/hooks/useCart';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, CreditCard, Package, Loader2, Tag, Sparkles } from 'lucide-react';
import { pageContainerVariants, wiggleItemVariants } from '@/components/PageTransition';

export default function CartPage() {
  const { data: cartData, isLoading } = useCart();
  const updateQty  = useUpdateCartQuantity();
  const removeItem = useRemoveFromCart();

  const items = cartData?.items || [];
  const subtotal = items.reduce(
    (sum: number, item: any) => sum + (item.product?.price || 0) * item.quantity, 0
  );
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
        <div className="relative">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="absolute inset-0 h-8 w-8 rounded-full animate-ping bg-primary/20" />
        </div>
        <p className="text-sm text-muted-foreground font-medium">Loading your cart…</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={pageContainerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="relative mx-auto max-w-5xl px-4 py-6 sm:px-6"
    >

      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-20 right-1/3 w-80 h-80 rounded-full bg-primary/6 blur-3xl -z-10" />

      {/* Subtle 3D grid behind header */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[160px] overflow-hidden -z-10 opacity-50">
        <div className="bg-grid-3d absolute inset-0" />
      </div>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <motion.div
        variants={wiggleItemVariants}
        className="mb-8 flex items-center gap-4"
      >
        <Link href="/products" className="btn-ghost h-9 w-9 p-0 rounded-xl border border-border/60">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-display font-extrabold tracking-tight">
            Shopping{' '}<span className="text-gradient-warm">Cart</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {items.length === 0
              ? 'Your cart is empty'
              : `${items.length} item${items.length !== 1 ? 's' : ''} · $${subtotal.toFixed(2)} subtotal`}
          </p>
        </div>
      </motion.div>

      <motion.div variants={wiggleItemVariants}>
        {items.length === 0 ? (
        /* ── Empty state ─────────────────────────────────────────── */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 90 }}
          className="flex h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-border/50 text-center space-y-5"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="flex h-20 w-20 items-center justify-center rounded-3xl bg-secondary/60"
          >
            <ShoppingCart className="h-10 w-10 text-muted-foreground/40" />
          </motion.div>
          <div>
            <p className="font-display font-bold text-xl text-foreground">Your cart is empty</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
              Looks like you haven't added anything yet. Browse products to get started.
            </p>
          </div>
          <Link href="/products" className="btn-primary">
            <Package className="h-4 w-4" /> Browse Products
          </Link>
        </motion.div>

      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* ── Items ───────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-3">
            <AnimatePresence initial={false}>
              {items.map((item: any, idx: number) => {
                if (!item.product) return null;
                const p = item.product;
                return (
                  <motion.div
                    key={p._id}
                    layout
                    initial={{ opacity: 0, x: -24, scale: 0.97 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 40, scale: 0.95, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.28, delay: idx * 0.04 }}
                    className="card-glass flex items-center gap-4 p-4 group"
                  >
                    {/* Thumbnail */}
                    <Link
                      href={`/products/${p._id}`}
                      className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-secondary border border-border/60 hover:border-primary/40 transition-colors"
                    >
                      {p.images?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
                          <Package className="h-6 w-6" />
                        </div>
                      )}
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${p._id}`} className="font-semibold text-sm text-foreground hover:text-primary transition-colors truncate block">
                        {p.name}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="badge-violet text-xs">${p.price?.toFixed(2)}</span>
                        <span className="text-[11px] text-muted-foreground">each</span>
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center rounded-xl border border-border/60 bg-secondary/50 overflow-hidden">
                      <button
                        onClick={() => item.quantity > 1 && updateQty.mutate({ productId: p._id, quantity: item.quantity - 1 })}
                        disabled={item.quantity <= 1}
                        className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30 transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-bold tabular-nums">{item.quantity}</span>
                      <button
                        onClick={() => updateQty.mutate({ productId: p._id, quantity: item.quantity + 1 })}
                        className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Line total */}
                    <div className="text-right min-w-[68px]">
                      <span className="font-black text-sm text-foreground">
                        ${(p.price * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeItem.mutate(p._id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 opacity-0 group-hover:opacity-100"
                      title="Remove"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* ── Order Summary ────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 90 }}
            className="lg:sticky lg:top-24 h-fit"
          >
            <div className="card-glass p-5 space-y-5" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.05) 0%, transparent 60%)' }}>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h2 className="font-display font-bold text-base text-foreground">Order Summary</h2>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({items.length} items)</span>
                  <span className="font-medium text-foreground">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="text-emerald-400 font-semibold">Free</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Estimated Tax (5%)</span>
                  <span className="font-medium text-foreground">${tax.toFixed(2)}</span>
                </div>
              </div>

              {/* Divider shimmer */}
              <div className="shimmer-line" />

              <div className="flex justify-between font-bold text-foreground">
                <span>Total</span>
                <span className="text-lg text-gradient">${total.toFixed(2)}</span>
              </div>

              {/* Promo field */}
              <div className="flex gap-2">
                <input type="text" placeholder="Promo code" className="input-field text-xs py-2 flex-1" />
                <button className="btn-secondary text-xs px-3 py-2 rounded-xl">Apply</button>
              </div>

              <button
                onClick={() => alert('Checkout: integrate your payment gateway here.')}
                className="btn-primary w-full py-3"
              >
                <CreditCard className="h-4 w-4" />
                Proceed to Checkout
              </button>

              <Link href="/products" className="btn-ghost w-full justify-center text-xs">
                ← Continue Shopping
              </Link>

              <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground pt-1">
                <Tag className="h-3 w-3" />
                Secure checkout · All prices in USD
              </div>
            </div>
          </motion.div>
        </div>
      )}
      </motion.div>
    </motion.div>
  );
}
