'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface PixelatedImageProps extends React.ComponentProps<typeof Image> {
  pixelationLevels?: number[];
  transitionDuration?: number;
}

export function PixelatedImage({
  src,
  alt,
  className,
  pixelationLevels = [512, 256, 128, 64, 4, 1],
  transitionDuration = 400,
  ...props
}: PixelatedImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [, setCurrentLevel] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof src !== 'string') return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new window.Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      let currentPixelation = 0;

      const animate = () => {
        if (currentPixelation >= pixelationLevels.length) {
          setIsLoading(false);
          return;
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const pixelSize = pixelationLevels[currentPixelation];
        const w = canvas.width / pixelSize;
        const h = canvas.height / pixelSize;

        ctx.drawImage(canvas, 0, 0, w, h);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(canvas, 0, 0, w, h, 0, 0, canvas.width, canvas.height);

        currentPixelation++;
        setCurrentLevel(currentPixelation);

        setTimeout(() => {
          requestAnimationFrame(animate);
        }, transitionDuration);
      };

      animate();
    };

    img.src = src;
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
        {...props}
      />
      <Image
        src={src}
        alt={alt}
        className={cn(
          'absolute inset-0 transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
        {...props}
      />
    </div>
  );
}
