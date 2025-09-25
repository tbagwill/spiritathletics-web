'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import OptimizedImage from './OptimizedImage';

interface ImageUploadProps {
  onUpload: (imageData: {
    id: string;
    url: string;
    variants: {
      original: string;
      medium: string;
      thumbnail: string;
    };
    metadata: {
      width: number;
      height: number;
      size: number;
      type: string;
    };
  }) => void;
  onError?: (error: string) => void;
  type: 'product' | 'campaign' | 'profile' | 'content';
  currentImage?: string;
  className?: string;
  maxSizeMB?: number;
  acceptedTypes?: string[];
}

export default function ImageUpload({
  onUpload,
  onError,
  type,
  currentImage,
  className = '',
  maxSizeMB = 10,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp']
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      const error = `Invalid file type. Accepted types: ${acceptedTypes.join(', ')}`;
      onError?.(error);
      return;
    }

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      const error = `File too large. Maximum size: ${maxSizeMB}MB`;
      onError?.(error);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      onUpload(data.image);
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      onError?.(errorMessage);
      setPreview(currentImage || null); // Revert preview on error
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleChange}
        className="hidden"
      />

      {preview ? (
        // Image preview
        <div className="relative group">
          <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200">
            <OptimizedImage
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
            />
            
            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-white text-center">
                  <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />
                  <p className="text-sm">Uploading...</p>
                </div>
              </div>
            )}
          </div>

          {!isUploading && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={handleRemove}
                className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {!isUploading && (
            <button
              type="button"
              onClick={handleClick}
              className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100"
            >
              <div className="text-white text-center">
                <Upload className="w-6 h-6 mx-auto mb-1" />
                <p className="text-sm">Change Image</p>
              </div>
            </button>
          )}
        </div>
      ) : (
        // Upload area
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleClick}
          className={`
            relative w-full h-48 border-2 border-dashed rounded-lg cursor-pointer
            transition-all duration-200 flex flex-col items-center justify-center
            ${dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }
            ${isUploading ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          {isUploading ? (
            <div className="text-center">
              <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-blue-500" />
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          ) : (
            <>
              <ImageIcon className="w-12 h-12 text-gray-400 mb-4" />
              <div className="text-center">
                <p className="text-lg font-medium text-gray-700 mb-1">
                  {dragActive ? 'Drop image here' : 'Upload Image'}
                </p>
                <p className="text-sm text-gray-500 mb-2">
                  Drag and drop or click to browse
                </p>
                <p className="text-xs text-gray-400">
                  Max {maxSizeMB}MB • {acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')}
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Specialized component for profile pictures
export function ProfileImageUpload({
  onUpload,
  onError,
  currentImage,
  className = ''
}: Omit<ImageUploadProps, 'type'>) {
  return (
    <div className={`w-32 h-32 ${className}`}>
      <ImageUpload
        type="profile"
        onUpload={onUpload}
        onError={onError}
        currentImage={currentImage}
        maxSizeMB={5}
        acceptedTypes={['image/jpeg', 'image/png']}
        className="h-full"
      />
    </div>
  );
}

// Specialized component for product images
export function ProductImageUpload({
  onUpload,
  onError,
  currentImage,
  className = ''
}: Omit<ImageUploadProps, 'type'>) {
  return (
    <ImageUpload
      type="product"
      onUpload={onUpload}
      onError={onError}
      currentImage={currentImage}
      maxSizeMB={10}
      acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
      className={className}
    />
  );
}

// Specialized component for campaign hero images
export function CampaignImageUpload({
  onUpload,
  onError,
  currentImage,
  className = ''
}: Omit<ImageUploadProps, 'type'>) {
  return (
    <ImageUpload
      type="campaign"
      onUpload={onUpload}
      onError={onError}
      currentImage={currentImage}
      maxSizeMB={15}
      acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
      className={className}
    />
  );
}
