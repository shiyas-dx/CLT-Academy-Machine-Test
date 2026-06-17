'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetProductById } from '@/hooks/useProducts';
import { useAddToCart } from '@/hooks/useCart';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  ShoppingCart, 
  Tag, 
  Film, 
  Image as ImageIcon, 
  Loader2,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export default function ProductInspectPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string || '';
  
  const { data: product, isLoading, error } = useGetProductById(id);
  const addToCart = useAddToCart();
  const [quantity, setQuantity] = useState(1);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground mt-2 font-medium">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center p-4">
        <p className="text-destructive font-semibold mb-2">Error Loading Product</p>
        <p className="text-sm text-muted-foreground mb-4">The product could not be found or has been deleted.</p>
        <Link href="/products" className="btn-primary">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Products
        </Link>
      </div>
    );
  }

  // Combine images and videos into a single media array
  const mediaItems: { url: string; type: 'image' | 'video' }[] = [];
  if (product.images && product.images.length > 0) {
    product.images.forEach((url: string) => mediaItems.push({ url, type: 'image' }));
  }
  if (product.videos && product.videos.length > 0) {
    product.videos.forEach((url: string) => mediaItems.push({ url, type: 'video' }));
  }

  const handlePrev = () => {
    if (mediaItems.length <= 1) return;
    setCurrentMediaIndex(prev => (prev === 0 ? mediaItems.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (mediaItems.length <= 1) return;
    setCurrentMediaIndex(prev => (prev === mediaItems.length - 1 ? 0 : prev + 1));
  };

  const handleAddToCart = async () => {
    try {
      for (let i = 0; i < quantity; i++) {
        await addToCart.mutateAsync(product._id);
      }
      alert(`Added ${quantity} item(s) to your cart!`);
    } catch (err) {
      console.error(err);
      alert('Failed to add items to cart.');
    }
  };

  const currentMedia = mediaItems[currentMediaIndex];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back link */}
      <div className="mb-6">
        <Link 
          href="/products" 
          className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Catalog
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
        {/* Left Column: Media Slider */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border/60 bg-secondary/30 card-glass flex items-center justify-center">
            {mediaItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-muted-foreground/30 p-8">
                <ImageIcon className="h-16 w-16 mb-2" />
                <span className="text-xs">No media uploaded for this product</span>
              </div>
            ) : (
              <div className="relative w-full h-full flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentMediaIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full flex items-center justify-center"
                  >
                    {currentMedia.type === 'image' ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={currentMedia.url} 
                        alt={product.name} 
                        className="h-full w-full object-contain p-2"
                      />
                    ) : (
                      <video 
                        src={currentMedia.url} 
                        controls 
                        className="w-full h-full object-contain rounded-2xl p-2"
                        autoPlay
                        muted
                      />
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Left/Right buttons */}
                {mediaItems.length > 1 && (
                  <>
                    <button
                      onClick={handlePrev}
                      className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm border border-white/10 hover:bg-black/80 hover:scale-105 transition-all"
                      title="Previous"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={handleNext}
                      className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm border border-white/10 hover:bg-black/80 hover:scale-105 transition-all"
                      title="Next"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}

                {/* Media type indicators */}
                <div className="absolute top-4 left-4 bg-black/60 text-white text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-md border border-white/10 backdrop-blur-sm flex items-center gap-1">
                  {currentMedia.type === 'image' ? (
                    <>
                      <ImageIcon className="h-3 w-3" /> Image {currentMediaIndex + 1} of {mediaItems.length}
                    </>
                  ) : (
                    <>
                      <Film className="h-3 w-3" /> Video {currentMediaIndex + 1} of {mediaItems.length}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Thumbnails grid */}
          {mediaItems.length > 1 && (
            <div className="grid grid-cols-6 gap-2">
              {mediaItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentMediaIndex(idx)}
                  className={`relative aspect-square overflow-hidden rounded-xl border-2 transition-all ${
                    currentMediaIndex === idx ? 'border-primary scale-[1.02]' : 'border-border/60 hover:border-primary/50'
                  }`}
                >
                  {item.type === 'image' ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center bg-secondary/80 text-muted-foreground">
                      <Film className="h-5 w-5" />
                      <span className="text-[8px] uppercase font-bold mt-0.5">Video</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Info details */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              <Sparkles className="h-4 w-4" /> Catalog Listing
            </div>
            
            <h1 className="text-3xl font-display font-extrabold tracking-tight text-foreground sm:text-4xl">
              {product.name}
            </h1>

            {/* Price section */}
            <div className="inline-block">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black bg-gradient-to-r from-primary via-violet-400 to-primary bg-clip-text text-transparent">
                  ${product.price?.toFixed(2)}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground bg-secondary px-2 py-0.5 rounded border border-border">
                  In Stock
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="border-t border-border/60 pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            </div>
          </div>

          <div className="space-y-5 pt-6 border-t border-border/60">
            {/* Quantity Selector */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Quantity</span>
              <div className="flex items-center gap-2 rounded-xl bg-secondary border border-border/60 px-2 py-1">
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-2 py-1 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
                >
                  -
                </button>
                <span className="w-8 text-center text-xs font-bold text-foreground">{quantity}</span>
                <button 
                  onClick={() => setQuantity(q => q + 1)}
                  className="px-2 py-1 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart button */}
            <button
              onClick={handleAddToCart}
              disabled={addToCart.isPending}
              className="btn-primary w-full py-3 text-sm shadow-glow flex items-center justify-center gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              {addToCart.isPending ? 'Adding to Cart...' : `Add ${quantity} to Cart`}
            </button>

            {/* Extra assurance */}
            <div className="grid grid-cols-2 gap-3 text-[10px] text-muted-foreground font-medium border-t border-border/40 pt-4">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Genuine Products
              </div>
              <div className="flex items-center gap-1">
                <Tag className="h-3.5 w-3.5 text-primary" /> Cloudinary Verified Media
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
