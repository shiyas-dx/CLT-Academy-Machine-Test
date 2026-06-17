'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingCart, Edit, Trash2, Eye, Tag, Check } from 'lucide-react';
import { useAddToCart } from '@/hooks/useCart';
import { useDeleteProduct } from '@/hooks/useProducts';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function ProductCard({ product }: { product: any }) {
  const { data: session } = useSession();
  const addToCart     = useAddToCart();
  const deleteProduct = useDeleteProduct();
  const [deleting,  setDeleting]  = useState(false);
  const [cartAdded, setCartAdded] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const productOwnerId = typeof product.createdBy === 'object' ? product.createdBy?._id : product.createdBy;
  const isOwner = session?.user && (session.user as any).id === productOwnerId;

  const handleDelete = async () => {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try { await deleteProduct.mutateAsync(product._id); }
    finally { setDeleting(false); }
  };

  const handleAddToCart = async () => {
    try {
      await addToCart.mutateAsync(product._id);
      setCartAdded(true);
      setTimeout(() => setCartAdded(false), 1800);
    } catch {}
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Tilt calculations (-6 to 6 deg)
    const tiltX = -((y / rect.height) - 0.5) * 12;
    const tiltY = ((x / rect.width) - 0.5) * 12;
    
    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const imageUrl = product.images?.[0];

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        '--tilt-x': `${tilt.x}deg`,
        '--tilt-y': `${tilt.y}deg`,
      } as React.CSSProperties}
      whileHover={{ scale: 1.015 }}
      transition={{ type: 'spring', stiffness: 350, damping: 20 }}
      className="card-glass tilt-card group relative flex flex-col overflow-hidden"
    >
      {/* ── Image area ──────────────────────────────────────────────── */}
      <div className="relative h-48 overflow-hidden rounded-t-2xl bg-secondary/50">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <motion.img
            layoutId={`product-image-${product._id}`}
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground/30">
            <Tag className="h-10 w-10" />
            <span className="text-[11px] uppercase tracking-widest font-semibold">No Image</span>
          </div>
        )}

        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Hover action buttons */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <motion.div
            initial={false}
            animate={{ scale: [0.8, 1], opacity: [0, 1] }}
            className="flex items-center gap-2"
          >
            <Link
              href={`/products/${product._id}`}
              title="View Details"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/60 text-white border border-white/20 hover:bg-primary hover:border-primary transition-all duration-200 backdrop-blur-sm"
            >
              <Eye className="h-4 w-4" />
            </Link>
            {isOwner && (
              <>
                <Link
                  href={`/products/edit/${product._id}`}
                  title="Edit"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/60 text-white border border-white/20 hover:bg-secondary hover:border-white/40 transition-all duration-200 backdrop-blur-sm"
                >
                  <Edit className="h-4 w-4" />
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  title="Delete"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/60 text-destructive border border-destructive/30 hover:bg-destructive hover:text-white transition-all duration-200 backdrop-blur-sm disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
          </motion.div>
        </div>

        {/* Price badge */}
        <motion.div
          layoutId={`product-price-${product._id}`}
          className="absolute top-3 right-3 badge-violet font-black text-sm px-3 py-1 shadow-glow-sm"
        >
          ${product.price?.toFixed(2)}
        </motion.div>

        {/* Media count indicator */}
        {product.images?.length > 1 && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
            <span>+{product.images.length - 1} more</span>
          </div>
        )}
      </div>

      {/* ── Info area ───────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div>
          <motion.h3
            layoutId={`product-title-${product._id}`}
            className="font-display font-bold text-sm text-foreground truncate leading-tight"
          >
            {product.name}
          </motion.h3>
          {product.description && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        {/* Footer action */}
        <div className="mt-auto pt-3 flex items-center gap-2">
          <button
            onClick={handleAddToCart}
            disabled={addToCart.isPending || cartAdded}
            className={`btn-primary flex-1 py-2 text-xs transition-all duration-300 ${
              cartAdded ? 'bg-emerald-600 hover:bg-emerald-600' : ''
            }`}
          >
            {cartAdded ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Added!
              </>
            ) : (
              <>
                <ShoppingCart className="h-3.5 w-3.5" />
                {addToCart.isPending ? 'Adding…' : 'Add to Cart'}
              </>
            )}
          </button>
          <Link
            href={`/products/${product._id}`}
            className="btn-ghost border border-border/60 px-3 py-2 text-xs rounded-xl"
            title="View"
          >
            <Eye className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
