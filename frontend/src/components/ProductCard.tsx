'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingCart, Edit, Trash2, Eye, Tag } from 'lucide-react';
import { useAddToCart } from '@/hooks/useCart';
import { useDeleteProduct } from '@/hooks/useProducts';
import { useState } from 'react';

export default function ProductCard({ product }: { product: any }) {
  const addToCart    = useAddToCart();
  const deleteProduct = useDeleteProduct();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await deleteProduct.mutateAsync(product._id);
    } finally {
      setDeleting(false);
    }
  };

  const imageUrl = product.images?.[0];

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="card-glass group relative overflow-hidden flex flex-col"
    >
      {/* Image area */}
      <div className="relative h-48 overflow-hidden rounded-t-2xl bg-secondary/60">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
            <Tag className="h-12 w-12" />
          </div>
        )}

        {/* Hover overlay with action buttons */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px]">
          <Link
            href={`/products/edit/${product._id}`}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/80 text-foreground hover:bg-primary/20 hover:text-primary transition-all duration-200 border border-border/50"
            title="Edit product"
          >
            <Edit className="h-4 w-4" />
          </Link>
          <button
            onClick={() => addToCart.mutate(product._id)}
            disabled={addToCart.isPending}
            title="Add to cart"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/80 text-white hover:bg-primary transition-all duration-200 shadow-glow-sm"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            title="Delete product"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-destructive/20 text-destructive hover:bg-destructive hover:text-white transition-all duration-200 border border-destructive/30"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Price badge */}
        <div className="absolute top-3 right-3 badge-violet font-bold text-sm px-3 py-1 shadow-glow-sm">
          ${product.price?.toFixed(2)}
        </div>
      </div>

      {/* Info area */}
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="font-display font-semibold text-foreground truncate leading-tight">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}

        {/* Footer actions */}
        <div className="mt-auto pt-3 flex items-center gap-2">
          <button
            onClick={() => addToCart.mutate(product._id)}
            disabled={addToCart.isPending}
            className="btn-primary flex-1 py-2 text-xs"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            {addToCart.isPending ? 'Adding…' : 'Add to Cart'}
          </button>
          <Link
            href={`/products/edit/${product._id}`}
            className="btn-secondary px-3 py-2 text-xs"
            title="Edit"
          >
            <Edit className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
