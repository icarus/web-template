"use client";

import { cn } from '@/lib/utils';

interface BackdropProps {
  direction?: 'to-bottom' | 'to-top' | 'to-right' | 'to-left' | 'radial-center';
}

const Backdrop: React.FC<BackdropProps> = ({ direction = 'radial-center' }) => {
  const gradientDirection = direction === 'to-bottom'
    ? 'linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 100%)'
    : direction === 'to-top'
      ? 'linear-gradient(to top, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 100%)'
      : direction === 'to-right'
        ? 'linear-gradient(to left, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 100%)'
        : direction === 'to-left'
          ? 'linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 100%)'
          : 'radial-gradient(circle, rgba(0, 0, 0, 0) 100%, rgba(0, 0, 0, 0.5) 0%)';

  const maskImageStyle = {
    maskImage: gradientDirection,
    WebkitMaskImage: gradientDirection,
  };

  const containerPositionClass = direction === 'to-bottom' ? 'bottom-0' :
  direction === 'to-top' ? 'top-0' :
  direction === 'to-right' ? 'left-0' :
  direction === 'to-left' ? 'right-0' :
  'inset-0';

  const sizeClass = direction === 'to-right' || direction === 'to-left' ? 'h-full w-full' : 'w-full h-full';

  return (
    <div className={cn('fixed left-0 z-0 pointer-events-none', sizeClass, containerPositionClass)}>
      <div className={cn('absolute z-10 backdrop-blur-sm', sizeClass, containerPositionClass)} style={maskImageStyle} />
      <div className={cn('absolute z-20 backdrop-blur-sm', sizeClass, containerPositionClass)} style={maskImageStyle} />
      <div className={cn('absolute z-30 backdrop-blur-sm', sizeClass, containerPositionClass)} style={maskImageStyle} />
    </div>
  );
};

export default Backdrop;
