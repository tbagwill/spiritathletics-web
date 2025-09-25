'use client';

import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  fill?: boolean;
  style?: React.CSSProperties;
  onClick?: () => void;
}

// Generate a simple blur placeholder
const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#f3f4f6" offset="20%" />
      <stop stop-color="#e5e7eb" offset="50%" />
      <stop stop-color="#f3f4f6" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#f3f4f6" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" opacity="0.5">
    <animateTransform attributeName="transform" type="translate" values="-${w} 0; ${w} 0; ${w} 0" dur="1s" repeatCount="indefinite"/>
  </rect>
</svg>`;

const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str);

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 85,
  placeholder = 'blur',
  fill = false,
  style,
  onClick
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Generate blur data URL for placeholder
  const blurDataURL = placeholder === 'blur' 
    ? `data:image/svg+xml;base64,${toBase64(shimmer(width || 700, height || 475))}`
    : undefined;

  // Handle error state
  if (hasError) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 ${className}`}
        style={{ 
          width: fill ? '100%' : width, 
          height: fill ? '100%' : height,
          minHeight: height || 200,
          ...style 
        }}
      >
        <div className="text-center text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm">Image not available</p>
        </div>
      </div>
    );
  }

  const imageProps = {
    src,
    alt,
    priority,
    quality,
    sizes,
    onLoad: () => setIsLoading(false),
    onError: () => {
      setIsLoading(false);
      setHasError(true);
    },
    className: `
      duration-700 ease-in-out
      ${isLoading ? 'scale-105 blur-sm' : 'scale-100 blur-0'}
      ${className}
    `,
    style,
    onClick,
    ...(placeholder === 'blur' && blurDataURL ? { 
      placeholder: 'blur' as const, 
      blurDataURL 
    } : {}),
    ...(fill ? { fill: true } : { width, height }),
  };

  return (
    <div className={fill ? 'relative' : undefined}>
      <Image {...imageProps} />
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}

// Convenience component for avatar images
export function AvatarImage({ 
  src, 
  alt, 
  size = 40,
  className = '' 
}: { 
  src: string; 
  alt: string; 
  size?: number;
  className?: string;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full object-cover ${className}`}
      sizes={`${size}px`}
      quality={90}
    />
  );
}

// Convenience component for hero images
export function HeroImage({ 
  src, 
  alt, 
  className = '',
  priority = true 
}: { 
  src: string; 
  alt: string; 
  className?: string;
  priority?: boolean;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      priority={priority}
      className={`object-cover ${className}`}
      sizes="100vw"
      quality={90}
    />
  );
}

// Convenience component for product images
export function ProductImage({ 
  src, 
  alt, 
  className = '',
  onClick 
}: { 
  src: string; 
  alt: string; 
  className?: string;
  onClick?: () => void;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={400}
      height={400}
      className={`object-cover rounded-lg ${onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''} ${className}`}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
      quality={85}
      onClick={onClick}
    />
  );
}
