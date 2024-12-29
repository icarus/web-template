import {useTranslations} from 'next-intl';
import Image from "next/image";

export default function Home() {
  const t = useTranslations("HomePage");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <Image
          className="aspect-video w-1/2 object-contain m-auto rounded-lg"
          src="/image.jpg"
          alt="Random"
          width={1920}
          height={1080}
          priority
        />
      </main>
      <div className="flex flex-col items-center gap-2">
        Using i18next
        <ol className="flex gap-4">
          <li>
            En Español 🇪🇸
            <p>{t('title')}</p>
          </li>
          <li>
            In English 🇬🇧
            <p>{t('title',)}</p>
          </li>
        </ol>
      </div>
      <footer className="row-start-3 flex gap-1 flex-wrap items-center justify-center">
        Creado con amor
        <span className="animate-heartbeat">🖤</span>
        por <a href="https://icarusmind.com/" className="underline">Felipe Mandiola</a>
      </footer>
    </div>
  );
}
