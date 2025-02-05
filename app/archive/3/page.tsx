'use client'

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Cursor } from "@/components/shared/cursor";
import { AnimatePresence, motion } from "motion/react";

export default function Page() {
  const centerSquareRef = useRef<HTMLDivElement>(null);
  const linkSquareRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lineRefs = useRef<(SVGLineElement | null)[]>([]);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

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

  const handlePositionChange = (x: number, y: number) => {
    const links = document.querySelectorAll('.link-hover-target');
    let isHoveringAny = false;

    links.forEach((link) => {
      const rect = link.getBoundingClientRect();
      if (
        x >= rect.left &&
        x <= rect.right &&
        y >= rect.top &&
        y <= rect.bottom
      ) {
        setHoveredLink(link.getAttribute('data-name'));
        isHoveringAny = true;
      }
    });

    if (!isHoveringAny) {
      setHoveredLink(null);
    }
  };

  return (
    <>
      <Cursor
        attachToParent
        variants={{
          initial: { scale: 0.3, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          exit: { scale: 0.3, opacity: 0 },
        }}
        springConfig={{
          bounce: 0.001,
        }}
        transition={{
          ease: 'linear',
          duration: 0.15,
        }}
        onPositionChange={handlePositionChange}
      >
        <motion.div
          animate={{
            width: hoveredLink ? 128 : 16,
            height: hoveredLink ? 32 : 16,
          }}
          className="flex items-center justify-center rounded-md bg-gray-500/40 backdrop-blur-md"
        >
          <AnimatePresence>
            {hoveredLink && (
              <motion.div
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                className="inline-flex w-full items-center justify-center"
              >
                <div className="text-nowrap inline-flex items-center text-sm text-white">
                  Ir a {hoveredLink} <ArrowUpRight className="ml-1 size-4" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </Cursor>

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

        <Link
          href="/programa"
          className="group max-w-80 text-sm p-4 absolute right-1/4 top-1/4 flex flex-col gap-1"
        >
          <h2 className="link-hover-target w-fit relative group-hover:underline flex items-center font-mono uppercase font-medium"
              data-name="programa">
            Programa
            <div ref={(el) => { linkSquareRefs.current[0] = el; }}
                 className="size-1.5 bg-yellow-300 aspect-square absolute left-0 top-1/2 -translate-x-full -ml-2.5 -translate-y-1/2" />
          </h2>
          <p className="text-neutral-500">
            Invertimos $200K USD por el 5,5% de tu startup, conecta con los mejores founders de LatAm, y haz crecer tu idea.
          </p>
        </Link>

        <Link
          href="/programa"
          className="group max-w-80 text-sm p-4 mt-12 absolute left-1/4 top-1/2 flex flex-col gap-1"
        >
          <h2 className="link-hover-target w-fit relative group-hover:underline flex items-center font-mono uppercase font-medium"
              data-name="portafolio">
            Portafolio
            <div ref={(el) => { linkSquareRefs.current[1] = el; }}
                 className="size-1.5 bg-yellow-300 aspect-square absolute right-0 top-1/2 translate-x-full -mr-2.5 -translate-y-1/2" />
          </h2>
        </Link>

        <Link
          href="/programa"
          className="group max-w-80 text-sm p-4 absolute right-1/4 bottom-1/4 flex flex-col gap-1"
        >
          <h2 className="link-hover-target w-fit relative group-hover:underline flex items-center font-mono uppercase font-medium"
              data-name="equipo">
            Equipo
            <div ref={(el) => { linkSquareRefs.current[2] = el; }}
                 className="size-1.5 bg-yellow-300 aspect-square absolute left-0 top-1/2 -translate-x-full -ml-2.5 -translate-y-1/2" />
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
    </>
  )
}
