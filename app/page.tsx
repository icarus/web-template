import { useTranslations } from 'next-intl';
import { PixelatedImage } from '@/components/ui/pixelated-image';

export default function Home() {
  const t = useTranslations("HomePage");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <PixelatedImage
          className="aspect-video w-1/2 object-contain m-auto rounded-lg"
          src="/image.jpg"
          alt="Random"
          width={1920}
          height={1080}
          pixelationLevels={[32, 16, 8, 4, 1]}
          transitionDuration={300}
        />
      </main>
      <footer className="row-start-3 flex gap-1 flex-wrap items-center justify-center">
        {t('footer')}
      </footer>
    </div>
  );
}
