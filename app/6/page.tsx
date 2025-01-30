'use client'

import { FloatingElement } from "@/components/fancy/parallax-floating";
import Floating from "@/components/fancy/parallax-floating";
import { motion } from "framer-motion";
import { ArrowUpRight, Info } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { BananaModel } from "./bananaModel";

const links = [
  {
    name: "Programa",
    href: "/programa",
    description: "Invertimos $200K USD por el 5,5% de tu startup",
    position: "top-[15%] right-[5%] md:top-[20%] md:right-[11%]",
    depth: 0.5,
    floating: true
  },
  {
    name: "Portafolio",
    href: "/programa",
    description: "Las startups en las que hemos invertido",
    position: "bottom-[25%] md:top-[35%] left-[50%] md:left-[15%]",
    depth: 1,
    floating: true
  },
  {
    name: "Equipo",
    href: "/programa",
    description: "El equipo detrás de Platanus",
    position: "bottom-[10%] left-[15%] md:bottom-[15%] md:left-auto md:right-[20%]",
    depth: 2,
    floating: true
  },
  {
    name: "Blog",
    href: "/blog",
    floating: false
  },
  {
    name: "Documentos",
    href: "/documentos",
    floating: false
  },
  {
    name: "Demo Day",
    href: "/demo-day",
    floating: false
  },
  {
    name: "Hackathon",
    href: "/hackathon",
    floating: false
  }
];

export default function Model() {
  const centerRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lineRefs = useRef<(SVGLineElement | null)[]>([]);

  useEffect(() => {
    const updateLines = () => {
      if (!centerRef.current) return;

      // Get center point accounting for transforms
      const centerRect = centerRef.current.getBoundingClientRect();
      const centerX = centerRect.left + (centerRect.width / 2);
      const centerY = centerRect.top + (centerRect.height / 2);

      linkRefs.current.forEach((linkRef, index) => {
        if (!linkRef || !lineRefs.current[index]) return;

        const yellowSquare = linkRef.querySelector('[data-yellow-square]');
        if (!yellowSquare) return;

        // Get square position accounting for transforms
        const squareRect = yellowSquare.getBoundingClientRect();
        const squareX = squareRect.left + (squareRect.width / 2);
        const squareY = squareRect.top + (squareRect.height / 2);

        const line = lineRefs.current[index];
        if (line) {
          // Update line positions
          line.setAttribute('x1', String(centerX));
          line.setAttribute('y1', String(centerY));
          line.setAttribute('x2', String(squareX));
          line.setAttribute('y2', String(squareY));
        }
      });
    };

    let rafId: number;

    // Continuous update loop
    const animate = () => {
      updateLines();
      rafId = requestAnimationFrame(animate);
    };

    // Start the animation loop
    animate();

    // Update on resize as well
    window.addEventListener('resize', updateLines);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', updateLines);
    };
  }, []);

  const FloatingLink = ({
    name,
    href,
    description,
    depth,
    position,
    index
  }: {
    name: string;
    href: string;
    description?: string;
    depth?: number;
    position?: string;
    index: number;
  }) => (
    <FloatingElement depth={depth} className={position}>
      <div ref={el => { linkRefs.current[index] = el }}>
        <Link href={href} className="group">
          <div className="max-w-64 p-4 rounded-lg hover:bg-white/10 hover:backdrop-blur-sm transition-colors">
            <h2 className="w-full relative flex items-center gap-1 text-sm font-mono uppercase font-medium group-hover:underline transition-colors">
              {name}
              <ArrowUpRight className="size-4 opacity-0 group-hover:opacity-50 transition-opacity" />
              <div
                data-yellow-square
                className={cn(
                  "absolute top-1/2 -translate-x-1/2 -translate-y-1/2 size-1.5 bg-white aspect-square",
                  index % 2 !== 0 ? "-ml-4 md:right-0" : "-ml-4"
                )}
              />
            </h2>
            <p className="text-sm text-neutral-400 mt-1">
              {description}
            </p>
          </div>
        </Link>
      </div>
    </FloatingElement>
  );

  return (
    <>
      <div className="relative w-screen overflow-hidden h-screen">
        <>
          <Image
            src="/logo.svg"
            alt="Logo"
            width={164}
            height={48}
            className="absolute top-4 left-4 -rotate-90 origin-top-right -translate-x-full"
          />

          <div className="w-full right-3 justify-end z-50 flex p-4 absolute bottom-0 gap-1">
            {links.filter(link => !link.floating).map((link, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="group font-mono uppercase border-neutral-800 pl-2.5 pr-2 gap-1 hover:bg-white/10 transition-colors"
                asChild
              >
                <Link href={link.href}>
                  {link.name === "asadasdas" && (
                    <div className="relative mr-1 size-1 flex items-center justify-center">
                      <span className="size-1.5 animate-ping bg-yellow-300 aspect-square" />
                      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-1 bg-yellow-300 aspect-square" />
                    </div>
                  )}
                  {link.name}
                  <ArrowUpRight className="opacity-50" />
                </Link>
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="group font-mono uppercase border-neutral-800 pl-2.5 pr-2 gap-1 hover:bg-white/10 transition-colors"
            >
              <div className="relative mr-1 size-1 flex items-center justify-center">
                <span className="size-1.5 animate-ping bg-yellow-300 aspect-square" />
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-1 bg-yellow-300 aspect-square" />
              </div>
              Postula
            </Button>
            <div className="text-neutral-400 text-sm flex uppercase font-mono h-7 items-center px-2 rounded-md gap-px bg-neutral-800/75">
              <span>34d</span>
              <span>:</span>
              <span>12h</span>
              <span>:</span>
              <span>59m</span>
              <span>:</span>
              <span>59s</span>
            </div>
            <Button variant="outline" size="icon" className="size-7 group font-mono uppercase border-neutral-800 pl-2.5 pr-2 gap-1 hover:bg-white/10 transition-colors">
              <Info />
            </Button>
          </div>

          <svg className="fixed inset-0 w-screen h-screen pointer-events-none z-30">
            <g>
              {links.filter(link => link.floating).map((_, index) => (
                <line
                  key={index}
                  ref={el => { lineRefs.current[index] = el }}
                  stroke="white"
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </g>
          </svg>

          <Floating sensitivity={-1} className="z-20 overflow-hidden">
            {links.filter(link => link.floating).map((link, index) => (
              <FloatingLink
                key={index}
                index={index}
                name={link.name}
                href={link.href}
                description={link.description}
                depth={link.depth}
                position={link.position}
              />
            ))}
          </Floating>

          <div
            ref={centerRef}
            className={cn(
              "z-50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-4 bg-white ring-white ring-2 border-[5px] border-black shadow-2xl aspect-square"
            )}
          />

          <BananaModel modelPath="/models/logo2.gltf" />
        </>
      </div>
    </>
  );
}
