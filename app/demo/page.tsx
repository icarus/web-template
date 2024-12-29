'use client';

import { PixelTransition } from '@/components/shared/pixel-transition';
import { AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DemoPage() {
  const pathname = usePathname();

  return (
    <>
      <AnimatePresence mode="wait">
        {pathname === '/demo' && <PixelTransition key="pixel-transition" />}
      </AnimatePresence>
      <div className="flex flex-col gap-8 min-h-screen items-center justify-center">
        <h1 className="text-4xl font-serif">Demo</h1>
        <Link href="/" className="underline">Volver</Link>
      </div>
    </>
  );
}
