'use client'

import { FloatingElement } from "@/components/fancy/parallax-floating";
import Floating from "@/components/fancy/parallax-floating";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { BananaModel } from "./bananaModel";
import { Cursor } from "@/components/ui/cursor";
import { useIsMobile } from "@/hooks/useIsMobile";

const links = [
  {
    name: "Programa",
    href: "/programa",
    description: "Invertimos $200K USD por el 5,5% de tu startup",
    position: "top-[20%] right-[3%] md:top-[20%] md:right-[11%]",
    depth: 0.5,
    floating: true
  },
  {
    name: "Portafolio",
    href: "/programa",
    description: "Las startups en las que hemos invertido",
    position: "top-[65%] md:top-[35%] left-[55%] md:left-[15%]",
    depth: 1,
    floating: true
  },
  {
    name: "Plata-news",
    href: "/programa",
    description: "Las postulaciones para el Batch 24-2 de Platanus cierran el lunes 24 de junio. Será la primera generación con nuestro nuevo deal de $200.000 USD x un 5.5% de tu startup.",
    blogPost: {
      title: "Pitches, asado japonés y una voz sospechosa",
      excerpt: "Las postulaciones para el Batch 24-2 de Platanus cierran el lunes 24 de junio. Será la primera generación con nuestro nuevo deal de $200.000 USD x un 5.5% de tu startup.",
      date: "2024-07-13",
      image: "/blog.png",
      author: {
        name: "Rafael Fernández",
      }
    },
    position: "bottom-[15%] left-[10%] md:bottom-[7%] md:left-auto md:right-[20%]",
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
  const isMobile = useIsMobile();
  const centerRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lineRefs = useRef<(SVGLineElement | null)[]>([]);
  const modelLoaded = true;
  const rafRef = useRef<number>(0);

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

      rafRef.current = requestAnimationFrame(updateLines);
    };

    updateLines();

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const FloatingLink = ({
    name,
    href,
    description,
    depth,
    position,
    index,
    blogPost
  }: {
    name: string;
    href: string;
    description?: string;
    depth?: number;
    position?: string;
    index: number;
    blogPost?: {
      title: string;
      excerpt: string;
      date: string;
      image?: string;
      author: {
        name: string;
      }
    };
  }) => (
    <FloatingElement depth={depth} className={position}>
      <div ref={el => { linkRefs.current[index] = el }}>
        <Link href={href} className="group">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: modelLoaded ? 1 : 0 }}
            transition={{ delay: 0.1 + (index * 0.1) }}
            className="max-w-64 p-4 rounded-lg hover:bg-white/5 hover:backdrop-blur-lg transition-colors"
          >
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
            {blogPost ? (
              <div className="hidden md:block mt-2">
                {blogPost.image && (
                  <div className="mt-4 relative w-full aspect-video overflow-hidden rounded-md">
                    <Image
                      src={blogPost.image}
                      alt={blogPost.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <h3 className="mt-3 text-sm font-medium text-white">{blogPost.title}</h3>
                <p className="mt-1 text-xs text-neutral-400 line-clamp-2 text-ellipsis">{blogPost.excerpt}</p>
                <Button variant="link" size="sm" className="mt-3 group/blog text-xs gap-1 uppercase font-mono px-0">
                  Leer más
                  <ArrowUpRight className="size-4 opacity-0 group-hover/blog:opacity-50 transition-opacity" />
                </Button>
              </div>
            ) : (
              <p className="text-sm text-neutral-400 mt-1">
                {description}
              </p>
            )}
          </motion.div>
        </Link>
      </div>
    </FloatingElement>
  );

  return (
    <>
      <Cursor />
      <div className="relative w-screen overflow-hidden h-svh">
        <>
          <Link href="/">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={164}
              height={48}
              className="z-50 absolute top-4 left-4 cursor-none"
            />
          </Link>

          <div className="w-full right-0 justify-end z-50 flex flex-wrap p-2 md:p-4 absolute bottom-0 gap-1">
            {links.filter(link => !link.floating).map((link, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="group cursor-pointer font-mono uppercase border-neutral-800 pl-2.5 pr-2 gap-1 hover:bg-white/10 transition-colors"
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
          </div>

          <Floating sensitivity={isMobile ? 0 : -1} className="z-[40] overflow-hidden">
            {links.filter(link => link.floating).map((link, index) => (
              <FloatingLink
                key={index}
                index={index}
                name={link.name}
                href={link.href}
                description={link.description}
                depth={link.depth}
                position={link.position}
                blogPost={link.blogPost}
              />
            ))}
          </Floating>

          <svg className="fixed inset-0 w-screen h-screen pointer-events-none z-[45]">
            <g>
              {links.filter(link => link.floating).map((_, index) => (
                <motion.line
                  key={index}
                  ref={el => { lineRefs.current[index] = el }}
                  stroke="white"
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                  initial={{ pathLength: 0, opacity: 1 }}
                  animate={{ pathLength: modelLoaded ? 1 : 0, opacity: modelLoaded ? 1 : 0 }}
                  transition={{
                    delay: (index * 0.1),
                    duration: 0.5,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </g>
          </svg>

          <div className="z-[60] fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <FloatingElement depth={0.3}>
              <motion.div
                ref={centerRef}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: modelLoaded ? 1 : 0, opacity: modelLoaded ? 1 : 0 }}
                transition={{ duration: 0.5 }}
                className={cn(
                  "scale-100 size-4 bg-white ring-white ring-2 border-[5px] border-black shadow-2xl aspect-square"
                )}
              />
            </FloatingElement>
          </div>

          <BananaModel
            modelPath="/models/logo2.gltf"
          />
        </>
      </div>
    </>
  );
}
