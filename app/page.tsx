import { useTranslations } from 'next-intl';
import { PixelatedImage } from '@/components/ui/pixelated-image';
import Link from 'next/link';
import { TextShimmer } from '@/components/motion-ui/text-shimmer';

export default function Home() {
  const t = useTranslations("HomePage");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 row-start-2 items-center">
        <PixelatedImage
          className="pointer-events-none aspect-video w-1/2 object-contain m-auto rounded-lg"
          src="/image.webp"
          alt="Placeholder"
          width={1920}
          height={1080}
          priority
        />
      </main>
      <Link href="/demo" className="px-4 py-1.5 rounded-full border border-black/20 hover:scale-105 transition-all duration-300">
        <TextShimmer>Transición de páginas</TextShimmer>
      </Link>
      <footer className="row-start-3 flex gap-1 flex-wrap items-center justify-center">
        {t('footer')}
      </footer>
    </div>
  );
}
