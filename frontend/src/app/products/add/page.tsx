'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useCreateProduct } from '@/hooks/useProducts';
import { fetchWithAuth } from '@/lib/api';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Upload, Loader2, X, Image as ImageIcon, Film, Zap } from 'lucide-react';

const productSchema = z.object({
  name:        z.string().min(1, 'Name is required'),
  price:       z.coerce.number().min(0.01, 'Price must be greater than 0'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
});
type FormValues = z.infer<typeof productSchema>;

interface FilePreview { file: File; preview: string; type: 'image' | 'video'; }

export default function AddProductPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(productSchema),
  });
  const createProduct  = useCreateProduct();
  const [previews,     setPreviews]  = useState<FilePreview[]>([]);
  const [isUploading,  setIsUploading] = useState(false);
  const [uploadError,  setUploadError] = useState('');
  const [isDragging,   setIsDragging]  = useState(false);

  const addFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const added: FilePreview[] = Array.from(fileList).map(file => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith('video') ? 'video' : 'image',
    }));
    setPreviews(p => [...p, ...added]);
  };

  const removePreview = (i: number) => setPreviews(p => p.filter((_, idx) => idx !== i));

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const sigData  = await fetchWithAuth('/api/products/upload-signature');
    const formData = new FormData();
    formData.append('file',      file);
    formData.append('api_key',   sigData.apiKey);
    formData.append('timestamp', sigData.timestamp.toString());
    formData.append('signature', sigData.signature);
    const res  = await fetch(`https://api.cloudinary.com/v1_1/${sigData.cloudName}/auto/upload`, { method: 'POST', body: formData });
    const data = await res.json();
    if (!data.secure_url) throw new Error('Cloudinary upload failed');
    return data.secure_url;
  };

  const onSubmit = async (data: FormValues) => {
    setIsUploading(true);
    setUploadError('');
    try {
      const urls   = await Promise.all(previews.map(p => uploadToCloudinary(p.file)));
      const images = urls.filter(u => !u.match(/\.(mp4|webm|ogg)(\?|$)/i));
      const videos = urls.filter(u =>  u.match(/\.(mp4|webm|ogg)(\?|$)/i));
      await createProduct.mutateAsync({ ...data, images, videos });
      router.push('/products');
    } catch (e: any) {
      setUploadError(e.message || 'Failed to save product');
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  }, []);

  const isBusy = isUploading || createProduct.isPending;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">

      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Link href="/products" className="btn-ghost px-2 py-2">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="page-title">Add Product</h1>
          <p className="page-subtitle">Fill in the details for your new product listing</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* Card: Basic info */}
          <div className="card-glass p-6 space-y-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary mb-2">
              <Zap className="h-3.5 w-3.5" /> Basic Information
            </div>

            <div>
              <label className="label">Product Name</label>
              <input {...register('name')} placeholder="e.g. Premium Wireless Headphones" className="input-field" disabled={isBusy} />
              {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div>
              <label className="label">Price (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">$</span>
                <input {...register('price')} type="number" step="0.01" min="0" placeholder="0.00" className="input-field pl-7" disabled={isBusy} />
              </div>
              {errors.price && <p className="mt-1 text-xs text-destructive">{errors.price.message}</p>}
            </div>

            <div>
              <label className="label">Description</label>
              <textarea
                {...register('description')}
                rows={4}
                placeholder="Describe your product in detail…"
                className="input-field resize-none"
                disabled={isBusy}
              />
              {errors.description && <p className="mt-1 text-xs text-destructive">{errors.description.message}</p>}
            </div>
          </div>

          {/* Card: Media upload */}
          <div className="card-glass p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary mb-2">
              <ImageIcon className="h-3.5 w-3.5" /> Media
            </div>

            {/* Drag-drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300 cursor-pointer ${
                isDragging ? 'border-primary bg-primary/10 scale-[1.01]' : 'border-border hover:border-primary/50 hover:bg-secondary/30'
              }`}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <input
                id="file-input"
                type="file"
                multiple
                accept="image/*,video/*"
                className="hidden"
                onChange={e => addFiles(e.target.files)}
              />
              <Upload className={`h-8 w-8 mb-3 transition-colors ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
              <p className="text-sm font-medium text-foreground">Drop files here or <span className="text-primary">browse</span></p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF, MP4, WebM — max 50 MB each</p>
            </div>

            {/* Preview grid */}
            {previews.length > 0 && (
              <div className="grid grid-cols-4 gap-3">
                {previews.map((p, i) => (
                  <div key={i} className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-secondary">
                    {p.type === 'image' ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.preview} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground">
                        <Film className="h-6 w-6" />
                        <span className="text-[10px]">Video</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); removePreview(i); }}
                      className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error */}
          {uploadError && (
            <p className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {uploadError}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link href="/products" className="btn-secondary">Cancel</Link>
            <button type="submit" disabled={isBusy} className="btn-primary">
              {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              {isBusy ? (isUploading ? 'Uploading media…' : 'Saving…') : 'Save Product'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
