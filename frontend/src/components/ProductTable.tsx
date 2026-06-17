'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Edit, Trash2, ShoppingCart, ArrowUpDown, Eye } from 'lucide-react';

import { useDeleteProduct } from '@/hooks/useProducts';
import { useAddToCart } from '@/hooks/useCart';

type SortKey = 'name' | 'price';
type SortDir = 'asc' | 'desc';

export default function ProductTable({ products }: { products: any[] }) {
  const deleteProduct = useDeleteProduct();
  const addToCart     = useAddToCart();
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sorted = [...products].sort((a, b) => {
    const valA = sortKey === 'price' ? a.price : a.name?.toLowerCase();
    const valB = sortKey === 'price' ? b.price : b.name?.toLowerCase();
    if (valA < valB) return sortDir === 'asc' ? -1 : 1;
    if (valA > valB) return sortDir === 'asc' ?  1 : -1;
    return 0;
  });

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await deleteProduct.mutateAsync(id);
    } finally {
      setDeletingId(null);
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => (
    <ArrowUpDown
      className={`h-3.5 w-3.5 ml-1 inline transition-opacity ${sortKey === col ? 'opacity-100 text-primary' : 'opacity-30'}`}
    />
  );

  return (
    <div className="card-glass overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-5 py-3 text-left">
                <button
                  onClick={() => toggleSort('name')}
                  className="flex items-center text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
                >
                  Product <SortIcon col="name" />
                </button>
              </th>
              <th className="px-5 py-3 text-left">
                <button
                  onClick={() => toggleSort('price')}
                  className="flex items-center text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
                >
                  Price <SortIcon col="price" />
                </button>
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Description
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sorted.map((p, i) => (
              <tr
                key={p._id}
                className="group transition-colors hover:bg-secondary/40"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                {/* Product */}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-xl bg-secondary border border-border">
                      {p.images?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">—</div>
                      )}
                    </div>
                    <span className="font-medium text-foreground truncate max-w-[180px]">{p.name}</span>
                  </div>
                </td>

                {/* Price */}
                <td className="px-5 py-3.5">
                  <span className="badge-violet font-bold">${p.price?.toFixed(2)}</span>
                </td>

                {/* Description */}
                <td className="px-5 py-3.5 text-muted-foreground text-xs max-w-[250px]">
                  <p className="line-clamp-2">{p.description || '—'}</p>
                </td>

                {/* Actions */}
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => addToCart.mutate(p._id)}
                      disabled={addToCart.isPending}
                      title="Add to cart"
                      className="btn-ghost px-2 py-1.5 text-xs"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                    </button>
                    <Link
                      href={`/products/${p._id}`}
                      title="View Details"
                      className="btn-ghost px-2 py-1.5 text-xs"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Link>
                    <Link
                      href={`/products/edit/${p._id}`}
                      title="Edit"
                      className="btn-ghost px-2 py-1.5 text-xs"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(p._id, p.name)}
                      disabled={deletingId === p._id}
                      title="Delete"
                      className="btn-destructive px-2 py-1.5 text-xs"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
