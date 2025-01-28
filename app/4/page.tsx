'use client'

import { FloatingElement } from "@/components/fancy/parallax-floating";
import Floating from "@/components/fancy/parallax-floating";
import { ModelViewer } from "./simpleModel";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const links = [
  {
    name: "Programa",
    href: "/programa",
    description: "Invertimos $200K USD por el 5,5% de tu startup",
    position: "top-[20%] right-[11%]",
    depth: 0.5
  },
  {
    name: "Portafolio",
    href: "/programa",
    description: "Conoce las startups en las que hemos invertido",
    position: "top-[35%] left-[15%]",
    depth: 1
  },
  {
    name: "Equipo",
    href: "/programa",
    description: "Conoce al equipo detrás de Platanus",
    position: "bottom-[15%] right-[20%]",
    depth: 2
  },
];

export default function Model() {
  const centerRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lineRefs = useRef<(SVGLineElement | null)[]>([]);

  useEffect(() => {
    const updateLines = () => {
      if (!centerRef.current) return;

      const centerRect = centerRef.current.getBoundingClientRect();
      const centerX = centerRect.left + centerRect.width / 2;
      const centerY = centerRect.top + centerRect.height / 2;

      linkRefs.current.forEach((linkRef, index) => {
        if (!linkRef || !lineRefs.current[index]) return;

        // Find the yellow square within this link
        const yellowSquare = linkRef.querySelector('[data-yellow-square]');
        if (!yellowSquare) return;

        const squareRect = yellowSquare.getBoundingClientRect();
        const squareX = squareRect.left + squareRect.width / 2;
        const squareY = squareRect.top + squareRect.height / 2;

        const line = lineRefs.current[index];
        line?.setAttribute('x1', `${centerX}`);
        line?.setAttribute('y1', `${centerY}`);
        line?.setAttribute('x2', `${squareX}`);
        line?.setAttribute('y2', `${squareY}`);
      });
    };

    // Initial update
    updateLines();

    // Update on resize
    window.addEventListener('resize', updateLines);

    // Update on mousemove for parallax effect
    const handleMouseMove = () => {
      requestAnimationFrame(updateLines);
    };
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', updateLines);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [centerRef, linkRefs, lineRefs]);

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
    description: string;
    depth: number;
    position: string;
    index: number;
  }) => (
    <FloatingElement depth={depth} className={position}>
      <div ref={el => linkRefs.current[index] = el}>
        <Link href={href} className="group">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-64 p-4 rounded-lg hover:bg-white/5 transition-colors"
          >
            <h2 className="w-full relative flex items-center gap-1 text-sm font-mono uppercase font-medium group-hover:underline transition-colors">
              {name}
              <ArrowUpRight className="size-4 opacity-0 group-hover:opacity-50 transition-opacity" />
              <div
                data-yellow-square
                className={cn(
                  "absolute top-1/2 -translate-x-1/2 -translate-y-1/2 size-1.5 bg-white aspect-square",
                  index % 2 !== 0 ? "right-0" : "-ml-4"
                )}
              />
            </h2>
            <p className="text-sm text-neutral-400 mt-1">
              {description}
            </p>
          </motion.div>
        </Link>
      </div>
    </FloatingElement>
  );

  return (
    <div className="relative w-full h-screen">
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {links.map((_, index) => (
          <line
            key={index}
            ref={el => lineRefs.current[index] = el}
            stroke="white"
            strokeWidth="1"
          />
        ))}
      </svg>

      <Floating sensitivity={-1} className="z-20 overflow-hidden">
        {links.map((link, index) => (
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
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-3 bg-white z-10 shadow-2xl aspect-square"
      />

      <ModelViewer
        modelPath="/models/logo2.gltf"
      />
    </div>
  );
}
