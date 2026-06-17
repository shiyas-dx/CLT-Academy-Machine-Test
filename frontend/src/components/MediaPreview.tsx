"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, Play, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MediaPreviewProps {
  images?: string[];
  videos?: string[];
}

export default function MediaPreview({ images = [], videos = [] }: MediaPreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const mediaUrls = [...images, ...videos];

  if (mediaUrls.length === 0) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-muted/20 text-muted-foreground border border-dashed border-border text-xs">
        No Media Available
      </div>
    );
  }

  const isVideo = (url: string) => {
    return (
      url.endsWith(".mp4") ||
      url.endsWith(".webm") ||
      url.endsWith(".ogg") ||
      url.includes("video") ||
      videos.includes(url)
    );
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % mediaUrls.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + mediaUrls.length) % mediaUrls.length);
  };

  const currentUrl = mediaUrls[currentIndex];

  return (
    <div className="relative w-full">
      {/* Main Carousel Display */}
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-black/5 dark:bg-black/40">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="relative h-full w-full flex items-center justify-center"
          >
            {isVideo(currentUrl) ? (
              <video
                src={currentUrl}
                controls
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="relative h-full w-full">
                <Image
                  src={currentUrl}
                  alt={`Media item ${currentIndex + 1}`}
                  fill
                  className="object-contain cursor-pointer"
                  onClick={() => setIsLightboxOpen(true)}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Carousel controls */}
        {mediaUrls.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white backdrop-blur-sm transition-all hover:bg-black/60 active:scale-95"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white backdrop-blur-sm transition-all hover:bg-black/60 active:scale-95"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        {/* Zoom Lightbox Trigger */}
        {!isVideo(currentUrl) && (
          <button
            onClick={() => setIsLightboxOpen(true)}
            className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-black/40 text-white backdrop-blur-sm transition-all hover:bg-black/60"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        )}

        {/* Indicators */}
        {mediaUrls.length > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/30 px-2.5 py-1 backdrop-blur-sm">
            {mediaUrls.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                className={`h-1.5 w-1.5 rounded-full transition-all ${
                  index === currentIndex ? "bg-white w-3" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails list below */}
      {mediaUrls.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {mediaUrls.map((url, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`relative h-12 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 bg-muted/10 transition-all ${
                index === currentIndex
                  ? "border-primary scale-95 shadow-sm"
                  : "border-transparent hover:border-muted"
              }`}
            >
              {isVideo(url) ? (
                <div className="flex h-full w-full items-center justify-center bg-black/40 text-white">
                  <Play className="h-4 w-4 fill-white" />
                </div>
              ) : (
                <Image
                  src={url}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm">
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-h-[85vh] max-w-[90vw] aspect-video"
            >
              <Image
                src={currentUrl}
                alt="Enlarged media preview"
                width={1200}
                height={675}
                className="max-h-[85vh] w-auto object-contain rounded-lg shadow-2xl"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
