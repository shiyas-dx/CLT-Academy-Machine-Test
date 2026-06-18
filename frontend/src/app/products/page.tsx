'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, LayoutGrid, List, Search, Package, Filter, X } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/ProductCard';
import ProductTable from '@/components/ProductTable';
import { pageContainerVariants, wiggleItemVariants } from '@/components/PageTransition';
import { useSession } from 'next-auth/react';

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

  const { data: session } = useSession();
  const currentUserId = (session?.user as any)?.id;

  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [ownerFilter, setOwnerFilter] = useState<'all' | 'mine'>('all');
  const [sortBy, setSortBy] = useState<string>('name-asc');
  const [showFilters, setShowFilters] = useState(false);

  // Filtered list for Table view (keeps columns sorting independent)
  const filteredOnly = useMemo(() => {
    if (!products) return [];
    let result = [...products];

    // 1. Text Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
      );
    }

    // 2. Min Price Filter
    if (minPrice) {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) {
        result = result.filter(p => p.price >= min);
      }
    }

    // 3. Max Price Filter
    if (maxPrice) {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) {
        result = result.filter(p => p.price <= max);
      }
    }

    // 4. Owner Filter
    if (ownerFilter === 'mine' && currentUserId) {
      result = result.filter(p => {
        const productOwnerId = typeof p.createdBy === 'object' ? p.createdBy?._id : p.createdBy;
        return productOwnerId === currentUserId;
      });
    }

    return result;
  }, [products, search, minPrice, maxPrice, ownerFilter, currentUserId]);

  // Fully filtered & sorted list for Grid view
  const filteredAndSorted = useMemo(() => {
    let result = [...filteredOnly];

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'name-asc') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'name-desc') return (b.name || '').localeCompare(a.name || '');
      if (sortBy === 'price-asc') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price-desc') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'newest') return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      return 0;
    });

    return result;
  }, [filteredOnly, sortBy]);

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
              : `${filteredAndSorted.length} item${filteredAndSorted.length !== 1 ? 's' : ''} in catalog`}
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

          {/* Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-ghost gap-2 text-xs h-9 px-3 border transition-all duration-200 ${
              showFilters ? 'border-primary bg-primary/10 text-primary' : 'border-border/60 text-muted-foreground'
            }`}
          >
            {showFilters ? <X className="h-3.5 w-3.5" /> : <Filter className="h-3.5 w-3.5" />}
            Filters
          </button>

          {/* Add */}
          <Link href="/products/add" className="btn-primary">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Product</span>
            <span className="sm:hidden">Add</span>
          </Link>
        </div>
      </motion.div>

      {/* ── Slide-Down Filter Panel ─────────────────────────────────── */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden mb-6"
          >
            <div className="card-glass p-5 grid grid-cols-1 gap-4 sm:grid-cols-4 items-end">
              {/* Min Price */}
              <div>
                <label className="label text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1 block">Min Price ($)</label>
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={e => setMinPrice(e.target.value)}
                  className="input-field py-2 px-3 text-xs"
                />
              </div>

              {/* Max Price */}
              <div>
                <label className="label text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1 block">Max Price ($)</label>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value)}
                  className="input-field py-2 px-3 text-xs"
                />
              </div>

              {/* Ownership */}
              <div>
                <label className="label text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1 block">Listing Scope</label>
                <select
                  value={ownerFilter}
                  onChange={e => setOwnerFilter(e.target.value as any)}
                  className="input-field py-2 px-3 text-xs bg-secondary"
                >
                  <option value="all">All Products</option>
                  <option value="mine">My Products Only</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="label text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1 block">Sort By</label>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="input-field py-2 px-3 text-xs bg-secondary"
                >
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

        ) : filteredAndSorted.length === 0 ? (
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
                {search || minPrice || maxPrice || ownerFilter !== 'all' ? 'No results found' : 'No products yet'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {search || minPrice || maxPrice || ownerFilter !== 'all' ? 'Try adjusting your search filters' : 'Add your first product to get started'}
              </p>
            </div>
            {!(search || minPrice || maxPrice || ownerFilter !== 'all') && (
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
            {filteredAndSorted.map((p, i) => (
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
            <ProductTable products={filteredOnly} />
          </motion.div>
        )}
      </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
