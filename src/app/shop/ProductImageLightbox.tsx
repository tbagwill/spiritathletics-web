'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';

interface ProductImageLightboxProps {
  images: string[];
  startIndex: number;
  alt: string;
  onClose: () => void;
}

/**
 * Full-screen viewer for product images. Rendered into document.body so the
 * product card's hover transform can't trap the fixed overlay inside the card.
 */
export function ProductImageLightbox({ images, startIndex, alt, onClose }: ProductImageLightboxProps) {
  const [index, setIndex] = useState(startIndex);
  const [mounted, setMounted] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const count = images.length;

  const prev = () => setIndex((i) => (i - 1 + count) % count);
  const next = () => setIndex((i) => (i + 1) % count);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock page scroll, handle keyboard, restore focus on close.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft' && count > 1) setIndex((i) => (i - 1 + count) % count);
      else if (e.key === 'ArrowRight' && count > 1) setIndex((i) => (i + 1) % count);
    };
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [count, onClose, mounted]);

  if (!mounted || count === 0) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${alt} images`}
      className="fixed inset-0 z-[70] flex flex-col bg-black/90"
      onClick={onClose}
      onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchStartX.current === null || count < 2) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        touchStartX.current = null;
        if (Math.abs(dx) > 50) {
          if (dx > 0) prev();
          else next();
        }
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <span className="text-sm text-white/80">
          {count > 1 ? `${index + 1} / ${count}` : ''}
        </span>
        <button
          ref={closeRef}
          type="button"
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-2xl leading-none hover:bg-white/20"
          aria-label="Close image viewer"
        >
          ×
        </button>
      </div>

      <div className="relative flex-1">
        <Image
          key={images[index]}
          src={images[index]}
          alt={count > 1 ? `${alt} (image ${index + 1} of ${count})` : alt}
          fill
          sizes="100vw"
          className="object-contain"
          onClick={(e) => e.stopPropagation()}
        />

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-2xl text-white hover:bg-black/70"
              aria-label="Previous image"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-2xl text-white hover:bg-black/70"
              aria-label="Next image"
            >
              ›
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="flex justify-center gap-2 py-4">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => { e.stopPropagation(); setIndex(i); }}
              className={`h-2.5 w-2.5 rounded-full ${i === index ? 'bg-white' : 'bg-white/40'}`}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>,
    document.body
  );
}
