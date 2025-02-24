'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import type { ImageProps } from 'next/image';

interface PixelatedImageProps extends Omit<ImageProps, 'ref'> {
  pixelationLevels?: number[];
  transitionDuration?: number;
  canvasProps?: React.CanvasHTMLAttributes<HTMLCanvasElement>;
}

export function PixelatedImage({
  src,
  alt,
  className,
  pixelationLevels = [128, 64, 32, 16],
  transitionDuration = 200,
  priority,
  canvasProps,
  ...imageProps
}: PixelatedImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const processedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof src !== 'string' || processedRef.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    processedRef.current = true;
    const img = new window.Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      const processNextLevel = (index: number) => {
        if (index >= pixelationLevels.length) {
          requestAnimationFrame(() => setIsLoading(false));
          return;
        }

        ctx.imageSmoothingEnabled = false;
        const pixelSize = pixelationLevels[index];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const w = Math.floor(canvas.width / pixelSize);
        const h = Math.floor(canvas.height / pixelSize);

        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return;

        tempCanvas.width = w;
        tempCanvas.height = h;

        tempCtx.drawImage(canvas, 0, 0, w, h);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(tempCanvas, 0, 0, w, h, 0, 0, canvas.width, canvas.height);

        setTimeout(() => processNextLevel(index + 1), transitionDuration);
      };

      processNextLevel(0);
    };

    img.src = src;

    return () => {
      processedRef.current = false;
    };
  }, [src, pixelationLevels, transitionDuration]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-100' : 'opacity-0',
          className
        )}
        {...canvasProps}
      />
      <Image
        src={src}
        alt={alt}
        className={cn(
          'absolute inset-0',
          isLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
        priority={priority}
        {...imageProps}
      />
    </div>
  );
}
