'use client'

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

export default function Page() {
  const centerSquareRef = useRef<HTMLDivElement>(null);
  const linkSquareRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lineRefs = useRef<(SVGLineElement | null)[]>([]);

  useEffect(() => {
    const updateLines = () => {
      if (!centerSquareRef.current) return;

      const centerRect = centerSquareRef.current.getBoundingClientRect();
      const centerX = centerRect.left + centerRect.width / 2;
      const centerY = centerRect.top + centerRect.height / 2;

      linkSquareRefs.current.forEach((linkSquare, index) => {
        if (!linkSquare || !lineRefs.current[index]) return;

        const linkRect = linkSquare.getBoundingClientRect();
        const linkX = linkRect.left + linkRect.width / 2;
        const linkY = linkRect.top + linkRect.height / 2;

        const line = lineRefs.current[index];
        line?.setAttribute('x1', `${centerX}`);
        line?.setAttribute('y1', `${centerY}`);
        line?.setAttribute('x2', `${linkX}`);
        line?.setAttribute('y2', `${linkY}`);
      });
    };

    updateLines();
    window.addEventListener('resize', updateLines);
    return () => window.removeEventListener('resize', updateLines);
  }, [centerSquareRef, linkSquareRefs, lineRefs]);

  return (
    <main className="overflow-hidden h-screen">
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {[0, 1, 2].map((_, index) => (
          <line
            key={index}
            ref={(el) => { lineRefs.current[index] = el; }}
            stroke="#fde047"
            strokeWidth="1"
          />
        ))}
      </svg>

      <Link href="/programa" className="group max-w-80 text-sm p-4 absolute right-1/4 top-1/4 flex flex-col gap-3">
        <h2 className="bg-neutral-800/60 backdrop-blur-lg rounded-md p-1.5 px-2 -ml-2 w-fit relative group-hover:underline flex items-center font-mono uppercase font-medium">
          Programa
          <ArrowUpRight className="opacity-25 ml-1 size-4 group-hover:opacity-100 transition-opacity" />
          <div ref={(el) => { linkSquareRefs.current[0] = el; }} className="size-1.5 bg-yellow-300 aspect-square absolute left-0 top-1/2 -translate-x-full -ml-2.5 -translate-y-1/2" />
        </h2>
        <p className="text-neutral-500">
          Invertimos $200K USD por el 5,5% de tu startup, conecta con los mejores founders de LatAm, y haz crecer tu idea.
        </p>
      </Link>

      <Link href="/programa" className="group max-w-80 text-sm p-4 mt-12 absolute left-1/4 top-1/2 flex flex-col gap-3">
        <h2 className="bg-neutral-800/60 backdrop-blur-lg rounded-md p-1.5 px-2 -ml-2 w-fit relative group-hover:underline flex items-center font-mono uppercase font-medium">
          Portafolio
          <ArrowUpRight className="opacity-25 ml-1 size-4 group-hover:opacity-100 transition-opacity" />
          <div ref={(el) => { linkSquareRefs.current[1] = el; }} className="size-1.5 bg-yellow-300 aspect-square absolute left-0 top-1/2 -translate-x-full -ml-2.5 -translate-y-1/2" />
        </h2>
      </Link>

      <Link href="/programa" className="group max-w-80 text-sm p-4 absolute right-1/4 bottom-1/4 flex flex-col gap-3">
        <h2 className="bg-neutral-800/60 backdrop-blur-lg rounded-md p-1.5 px-2 -ml-2 w-fit relative group-hover:underline flex items-center font-mono uppercase font-medium">
          Equipo
          <ArrowUpRight className="opacity-25 ml-1 size-4 group-hover:opacity-100 transition-opacity" />
          <div ref={(el) => { linkSquareRefs.current[2] = el; }} className="size-1.5 bg-yellow-300 aspect-square absolute left-0 top-1/2 -translate-x-full -ml-2.5 -translate-y-1/2" />
        </h2>
      </Link>

      <div ref={centerSquareRef} className="size-2.5 bg-yellow-300 aspect-square absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute -z-10 w-screen h-screen inset-0">
        <Image
          src="/BananaOptimizado5.gif"
          alt="Banana"
          width={1920}
          height={1080}
          quality={100}
          className="md:w-full h-full scale-150 md:scale-90 object-contain md:object-cover pointer-events-auto select-none saturate-200 brightness-100"
        />
      </div>
    </main>
  )
}
