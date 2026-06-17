'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, LayoutGrid, List, Search, Package } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/ProductCard';
import ProductTable from '@/components/ProductTable';

// Skeleton loader
const CardSkeleton = () => (
  <div className="card-glass p-0 overflow-hidden">
    <div className="skeleton-shimmer h-48 w-full rounded-t-2xl" />
    <div className="p-4 space-y-2">
      <div className="skeleton h-4 w-3/4" />
      <div className="skeleton h-3 w-1/2" />
      <div className="skeleton h-8 w-full mt-3" />
    </div>
  </div>
);

export default function ProductsPage() {
  const { data: products, isLoading } = useProducts();
  const [view,   setView]   = useState<'grid' | 'table'>('grid');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!products) return [];
    const q = search.toLowerCase();
    return products.filter(p =>
      p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
    );
  }, [products, search]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">
            <span className="text-gradient">Products</span>
          </h1>
          <p className="page-subtitle">
            {isLoading ? 'Loading catalog…' : `${filtered.length} item${filtered.length !== 1 ? 's' : ''} in your catalog`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products…"
              className="input-field pl-9 w-48 sm:w-64"
            />
          </div>

          {/* View toggle */}
          <div className="flex rounded-xl border border-border bg-secondary/40 p-1">
            <button
              onClick={() => setView('grid')}
              className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-200 ${
                view === 'grid' ? 'bg-primary/20 text-primary shadow-glow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView('table')}
              className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-200 ${
                view === 'table' ? 'bg-primary/20 text-primary shadow-glow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Table view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Add button */}
          <Link href="/products/add" className="btn-primary">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Product</span>
            <span className="sm:hidden">Add</span>
          </Link>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="skeletons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
          </motion.div>
        ) : filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-border text-center"
          >
            <Package className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="font-semibold text-foreground">
              {search ? 'No products match your search' : 'No products yet'}
            </p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              {search ? 'Try a different keyword' : 'Add your first product to get started'}
            </p>
            {!search && (
              <Link href="/products/add" className="btn-primary">
                <Plus className="h-4 w-4" /> Add Product
              </Link>
            )}
          </motion.div>
        ) : view === 'grid' ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {filtered.map((p, i) => (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
              >
                <ProductCard product={p} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="table"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ProductTable products={filtered} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
