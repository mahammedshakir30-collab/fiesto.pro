"use client";

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { getOptimizedImageUrl, ImagePreset } from '@/lib/cloudinary-url';
import { ImageIcon } from 'lucide-react';

interface CloudinaryImageProps extends Omit<ImageProps, 'src'> {
  src: string | null | undefined;
  preset?: ImagePreset;
  fallbackIcon?: boolean;
}

export function CloudinaryImage({
  src,
  alt,
  preset = 'full',
  className = '',
  width,
  height,
  fill,
  fallbackIcon = true,
  ...rest
}: CloudinaryImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    if (!fallbackIcon) return null;
    return (
      <div className={`flex items-center justify-center bg-muted text-muted-foreground/40 ${className}`}>
        <ImageIcon className="w-1/3 h-1/3 max-w-8 max-h-8" />
      </div>
    );
  }

  const optimizedSrc = getOptimizedImageUrl(src, preset);

  // If using fill mode
  if (fill) {
    return (
      <Image
        src={optimizedSrc}
        alt={alt || 'Image'}
        fill
        className={className}
        onError={() => setHasError(true)}
        {...rest}
      />
    );
  }

  return (
    <Image
      src={optimizedSrc}
      alt={alt || 'Image'}
      width={width || 400}
      height={height || 400}
      className={className}
      onError={() => setHasError(true)}
      {...rest}
    />
  );
}
