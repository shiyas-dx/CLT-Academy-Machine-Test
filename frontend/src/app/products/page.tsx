'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, LayoutGrid, List, Search, Package, Filter } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/ProductCard';
import ProductTable from '@/components/ProductTable';
import { pageContainerVariants, wiggleItemVariants } from '@/components/PageTransition';

const CardSkeleton = () => (
  <div className="card-glass overflow-hidden">
    <div className="skeleton-shimmer h-48 w-full rounded-t-2xl" />
    <div className="p-4 space-y-2.5">
      <div className="skeleton h-4 w-3/4" />
      <div className="skeleton h-3 w-1/2" />
      <div className="skeleton h-9 w-full mt-3 rounded-xl" />
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
      p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
    );
  }, [products, search]);

  return (
    <motion.div
      variants={pageContainerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8"
    >

      {/* Subtle 3D grid behind the header */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[180px] overflow-hidden -z-10 opacity-60">
        <div className="bg-grid-3d absolute inset-0" />
      </div>

      {/* Subtle page-level glow */}
      <div className="pointer-events-none absolute -top-40 left-1/3 w-96 h-96 rounded-full bg-primary/8 blur-3xl -z-10" />

      {/* ── Page Header ──────────────────────────────────────────────── */}
      <motion.div
        variants={wiggleItemVariants}
        className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-display font-extrabold tracking-tight">
            Product{' '}<span className="text-gradient">Catalog</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading
              ? 'Loading your catalog…'
              : `${filtered.length} item${filtered.length !== 1 ? 's' : ''} in catalog`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products…"
              className="input-field pl-9 w-44 sm:w-60"
            />
          </div>

          {/* View toggle */}
          <div className="flex rounded-xl border border-border bg-secondary/40 p-1 gap-0.5">
            {(['grid', 'table'] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                title={`${v} view`}
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 ${
                  view === v
                    ? 'bg-primary/20 text-primary shadow-glow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {v === 'grid' ? <LayoutGrid className="h-4 w-4" /> : <List className="h-4 w-4" />}
              </button>
            ))}
          </div>

          {/* Filter stub badge */}
          <button className="btn-ghost gap-2 text-xs h-9 px-3 border border-border/60">
            <Filter className="h-3.5 w-3.5" /> Filter
          </button>

          {/* Add */}
          <Link href="/products/add" className="btn-primary">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Product</span>
            <span className="sm:hidden">Add</span>
          </Link>
        </div>
      </motion.div>

      {/* ── Content ──────────────────────────────────────────────────── */}
      <motion.div variants={wiggleItemVariants}>
        <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="skel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
          </motion.div>

        ) : filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex h-72 flex-col items-center justify-center rounded-3xl border border-dashed border-border/60 text-center space-y-4"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/60 text-muted-foreground/50">
              <Package className="h-8 w-8" />
            </div>
            <div>
              <p className="font-display font-semibold text-foreground">
                {search ? 'No results found' : 'No products yet'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {search ? 'Try a different keyword' : 'Add your first product to get started'}
              </p>
            </div>
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
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {filtered.map((p, i) => (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * 0.04, type: 'spring', stiffness: 100 }}
              >
                <ProductCard product={p} />
              </motion.div>
            ))}
          </motion.div>

        ) : (
          <motion.div
            key="table"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <ProductTable products={filtered} />
          </motion.div>
        )}
      </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
