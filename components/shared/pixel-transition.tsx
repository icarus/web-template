'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const expand = {
  initial: {
    top: 0
  },
  enter: (i: number) => ({
    top: "100vh",
    transition: {
      duration: 0.4,
      delay: 0.05 * i,
      ease: [0.215, 0.61, 0.355, 1],
    },
    transitionEnd: { height: "0", top: "0" }
  }),
  exit: (i: number) => ({
    height: "100vh",
    transition: {
      duration: 0.4,
      delay: 0.05 * i,
      ease: [0.215, 0.61, 0.355, 1]
    }
  })
};

const opacity = {
  initial: {
    opacity: 0.5
  },
  enter: {
    opacity: 0
  },
  exit: {
    opacity: 0.5
  }
};

interface PixelTransitionProps {
  columns?: number;
  className?: string;
}

export function PixelTransition({ columns = 5, className }: PixelTransitionProps) {
  return (
    <div className={cn("fixed inset-0 pointer-events-none z-50", className)}>
      <motion.div
        initial="initial"
        animate="enter"
        exit="exit"
        variants={opacity}
        className="absolute inset-0 bg-black"
      />
      <div className="flex h-full">
        {[...Array(columns)].map((_, i) => (
          <motion.div
            key={i}
            initial="initial"
            animate="enter"
            exit="exit"
            custom={columns - i}
            variants={expand}
            className="relative flex-1 bg-black"
          />
        ))}
      </div>
    </div>
  );
}
