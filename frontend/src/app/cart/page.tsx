'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart, useUpdateCartQuantity, useRemoveFromCart } from '@/hooks/useCart';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, CreditCard, Package, Loader2 } from 'lucide-react';

export default function CartPage() {
  const { data: cartData, isLoading }   = useCart();
  const updateQty = useUpdateCartQuantity();
  const removeItem = useRemoveFromCart();

  const items = cartData?.items || [];
  const subtotal = items.reduce(
    (sum: number, item: any) => sum + (item.product?.price || 0) * item.quantity,
    0
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading your cart…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Link href="/products" className="btn-ghost px-2 py-2">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="page-title">Shopping Cart</h1>
          <p className="page-subtitle">
            {items.length === 0 ? 'Your cart is empty' : `${items.length} item${items.length !== 1 ? 's' : ''} in your cart`}
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        /* Empty state */
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-border text-center"
        >
          <ShoppingCart className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <p className="font-display font-semibold text-lg text-foreground mb-1">Your cart is empty</p>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs">
            Looks like you haven't added anything yet. Browse products to get started.
          </p>
          <Link href="/products" className="btn-primary">
            <Package className="h-4 w-4" /> Browse Products
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

          {/* ── Items list ──────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-3">
            <AnimatePresence initial={false}>
              {items.map((item: any) => {
                if (!item.product) return null;
                const p = item.product;
                return (
                  <motion.div
                    key={p._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.25 }}
                    className="card-glass flex items-center gap-4 p-4"
                  >
                    {/* Thumbnail */}
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-secondary border border-border">
                      {p.images?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <Package className="h-6 w-6" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-foreground truncate">{p.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">${p.price?.toFixed(2)} each</p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-1 rounded-xl border border-border bg-secondary/50 p-1">
                      <button
                        onClick={() => item.quantity > 1 && updateQty.mutate({ productId: p._id, quantity: item.quantity - 1 })}
                        disabled={item.quantity <= 1 || updateQty.isPending}
                        className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-accent disabled:opacity-30 transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold tabular-nums">{item.quantity}</span>
                      <button
                        onClick={() => updateQty.mutate({ productId: p._id, quantity: item.quantity + 1 })}
                        disabled={updateQty.isPending}
                        className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-accent transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Line total */}
                    <div className="text-right min-w-[64px]">
                      <span className="font-bold text-sm text-foreground">
                        ${(p.price * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeItem.mutate(p._id)}
                      disabled={removeItem.isPending}
                      className="btn-destructive p-2 ml-1"
                      title="Remove item"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* ── Order Summary ────────────────────────────────────────── */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="card-glass p-6 space-y-4">
              <h2 className="font-display font-bold text-base text-foreground">Order Summary</h2>

              <div className="space-y-2 border-b border-border pb-4 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({items.length} items)</span>
                  <span className="text-foreground font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="text-emerald-400 font-medium">Free</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax</span>
                  <span className="text-foreground font-medium">$0.00</span>
                </div>
              </div>

              <div className="flex justify-between font-bold text-foreground">
                <span>Total</span>
                <span className="text-gradient text-lg">${subtotal.toFixed(2)}</span>
              </div>

              <button
                onClick={() => alert('Checkout not yet configured. Replace with your payment gateway.')}
                className="btn-primary w-full py-3"
              >
                <CreditCard className="h-4 w-4" />
                Proceed to Checkout
              </button>

              <Link href="/products" className="btn-ghost w-full text-xs justify-center">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
