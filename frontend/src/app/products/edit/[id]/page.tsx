"use client";

import { pageContainerVariants, wiggleItemVariants } from "@/components/PageTransition";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { ArrowLeft, Save, Loader2, Sparkles, Image as ImageIcon } from "lucide-react";
import { useGetProductById, useUpdateProduct } from "@/hooks/useProducts";
import { fetchWithAuth } from "@/lib/api";

const productSchema = zod.object({
  name: zod.string().min(1, "Name is required"),
  price: zod.coerce.number().min(0.01, "Price is required"),
  description: zod.string().min(10, "Description needs at least 10 characters"),
  images: zod.array(zod.string()).default([]),
  videos: zod.array(zod.string()).default([]),
});

type ProductFormValues = zod.infer<typeof productSchema>;

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string || "";
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadedVideos, setUploadedVideos] = useState<string[]>([]);

  const { data: product, isLoading: isFetching } = useGetProductById(id);
  const { mutateAsync: updateProduct, isPending: isSaving } = useUpdateProduct();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        description: product.description,
        price: product.price,
        images: product.images,
        videos: product.videos,
      });
      setUploadedImages(product.images || []);
      setUploadedVideos(product.videos || []);
    }
  }, [product, reset]);

  const uploadToCloudinary = async (file: File) => {
    // 1. Get Signature from Backend
    const sigData = await fetchWithAuth('/products/upload-signature');
    
    // 2. Upload to Cloudinary
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', sigData.apiKey);
    formData.append('timestamp', sigData.timestamp.toString());
    formData.append('signature', sigData.signature);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${sigData.cloudName}/auto/upload`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    return data.secure_url;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const imagesList = [...uploadedImages];
    const videosList = [...uploadedVideos];

    try {
      const uploadedUrls = await Promise.all(Array.from(files).map(f => uploadToCloudinary(f)));
      
      for (const url of uploadedUrls) {
        if (url.match(/\.(mp4|webm|ogg)$/i)) {
          videosList.push(url);
        } else {
          imagesList.push(url);
        }
      }

      setUploadedImages(imagesList);
      setUploadedVideos(videosList);
      setValue("images", imagesList);
      setValue("videos", videosList);
    } catch (err) {
      alert("Failed to upload file(s) to Cloudinary.");
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: ProductFormValues) => {
    try {
      await updateProduct({ id, ...data });
      router.push("/products");
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  if (isFetching) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground mt-2 font-medium">
          Loading listing details...
        </p>
      </div>
    );
  }

  return (
    <motion.div
      variants={pageContainerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6 lg:px-8 bg-background"
    >
      <motion.div variants={wiggleItemVariants} className="mb-8 flex items-center justify-between">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Catalog
        </Link>
        <div className="flex items-center gap-1 font-bold text-xs text-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          Edit Listing
        </div>
      </motion.div>

      <motion.div variants={wiggleItemVariants} className="rounded-2xl border border-border bg-card p-8 shadow-sm">
        <h1 className="text-xl font-bold tracking-tight text-foreground">Edit Product</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Modify the catalog details. Update form inputs and save changes.
        </p>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-xs font-medium text-foreground mb-1">
                Product Name
              </label>
              <input
                id="name"
                type="text"
                disabled={isSaving}
                {...register("name")}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                placeholder="Product Name"
              />
              {errors.name && (
                <p className="mt-1 text-[10px] text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-xs font-medium text-foreground mb-1">
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                disabled={isSaving}
                {...register("description")}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                placeholder="Product description..."
              />
              {errors.description && (
                <p className="mt-1 text-[10px] text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="price" className="block text-xs font-medium text-foreground mb-1">
                Price (USD)
              </label>
              <input
                id="price"
                type="number"
                step="0.01"
                disabled={isSaving}
                {...register("price")}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                placeholder="Price"
              />
              {errors.price && (
                <p className="mt-1 text-[10px] text-destructive">{errors.price.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Product Media
              </label>
              <div className="mt-1 flex justify-center rounded-lg border-2 border-dashed border-border px-6 py-8 transition-colors hover:border-muted">
                <div className="space-y-1 text-center">
                  <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground" />
                  <div className="flex text-xs text-muted-foreground justify-center">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md font-semibold text-primary focus-within:outline-none hover:text-primary/80"
                    >
                      <span>Upload files</span>
                      <input
                        id="file-upload"
                        type="file"
                        multiple
                        className="sr-only"
                        onChange={handleFileUpload}
                        disabled={isSaving || isUploading}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground">PNG, JPG, MP4 up to 10MB</p>
                </div>
              </div>

              {isUploading && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin text-primary" />
                  Uploading media...
                </div>
              )}

              {(uploadedImages.length > 0 || uploadedVideos.length > 0) && (
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {uploadedImages.map((url, i) => (
                    <div
                      key={`img-${i}`}
                      className="relative aspect-square overflow-hidden rounded-lg border border-border"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="upload" className="h-full w-full object-cover" />
                    </div>
                  ))}
                  {uploadedVideos.map((url, i) => (
                    <div
                      key={`vid-${i}`}
                      className="relative aspect-square overflow-hidden rounded-lg border border-border flex items-center justify-center bg-black/10 text-xs text-muted-foreground"
                    >
                      Video
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-border pt-6">
            <Link
              href="/products"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-input bg-background px-4 text-xs font-medium hover:bg-accent"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-medium text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
