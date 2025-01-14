"use client";

import ScrambleHover from "@/components/fancy/scramble-hover";
import Menu from "@/components/layout/menu";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const links = [
  {
    title: "Programa",
    href: "/",
  },
  {
    title: "Portafolio",
    href: "/",
  },
  {
    title: "Demo Day",
    href: "/",
  },
  {
    title: "Blog",
    href: "/",
  },
  {
    title: "Documentos",
    href: "/",
  },
  {
    title: "Empleos",
    href: "/",
  },
];

const stats = [
  {
    title: "Postulaciones",
    value: "1,000",
  },
  {
    title: "Dinero invertido",
    value: "$5,000,000 USD",
  },
  {
    title: "Startups",
    value: "104",
  },
  {
    title: "XX",
    value: "XX",
  },
  {
    title: "XX",
    value: "XX",
  },
  {
    title: "XX",
    value: "XX",
  },
  {
    title: "XX",
    value: "XX",
  },
];

const imageSources = ["/Banana.gif", "/CloseUp.gif", "/ZoomGif.gif"];

export default function Home() {
  const numImages = imageSources.length;
  const numRows = 2;
  const numCols = 3;

  return (
    <main className="font-mono w-screen h-svh overflow-hidden">
      <Header />

      <div className="grid grid-cols-3 grid-rows-[repeat(auto-fit,minmax(100px,1fr))] w-full h-full">
        {Array.from({ length: numRows }).map((_, rowIndex) => {
          const startIndex = (rowIndex + 1) % numImages;
          return Array.from({ length: numCols }).map((_, colIndex) => {
            const imageIndex = (startIndex + colIndex) % numImages;
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={cn(
                  "relative overflow-hidden [&:nth-child(2n)]:bg-yellow-300 flex items-center justify-center",
                  imageIndex !== 0 && "[&_img]:scale-[2]",
                )}
              >
                <Image
                  src={imageSources[imageIndex]}
                  alt={`Image ${imageIndex + 1}`}
                  width={1920}
                  height={1080}
                  quality={100}
                  priority
                  className="inset-0 select-none pointer-events-none w-full object-cover"
                />
              </div>
            );
          });
        })}
      </div>

      <Stats />
    </main>
  );
}


const Header = () => {
  return (
    <header className="hidden bg-black/15 backdrop-blur-xl left-1/2 -translate-x-1/2 z-10 bg-gradient-to-b from-black/60 absolute top-0 items-center mx-auto max-w-screen-xl px-16 h-16 *:h-full font-mono uppercase flex justify-between w-screen border-t border-white/5">
      <Link href="/" className="flex items-center gap-2">
        <Image
          src="/logo.svg"
          alt="Logo Platanus"
          width={128}
          height={24}
        />
      </Link>

      {/* <nav className="ml-auto mr-32 !h-4 text-sm *:*:underline grid grid-cols-2 gap-2 gap-x-32 underline uppercase">
        {links.map((link, index) => (
          <Link key={index} href={link.href}>
            <ScrambleHover text={link.title} />
          </Link>
        ))}
      </nav> */}
      <Menu />
    </header>
  );
};

const Stats = () => {
  return (
    <div className="hidden bg-black/15 backdrop-blur-xl absolute bottom-0 h-16 *:h-full uppercase flex w-screen border-t border-white/5">
      <div className="text-nowrap border-r border-white/5 flex items-center gap-3 px-8">
        Estadísticas en vivo
        <div className="relative">
          <div className="flex size-1.5 bg-red-500" />
          <div className="flex size-1.5 bg-red-500 absolute top-0 left-0 animate-ping" />
        </div>
      </div>

      <ul className="w-full flex items-center justify-between px-8">
        {stats.map((stat, index) => (
          <li
            key={index}
            className="flex flex-col gap-0 text-base overflow-hidden"
          >
            <span className="text-xs text-white">{stat.title}</span>
            <ScrambleHover
              text={stat.value}
              className="text-base cursor-pointer"
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

const GridElement = (index: number) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={cn(
        "[&:nth-child(2n)]:bg-neutral-400 flex flex-1 transition-[flex] duration-1000 ease-out",
        hovered ? "flex-[10]" : "flex-1"
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Image
        src={imageSources[index % imageSources.length]}
        alt="Banana"
        width={1920}
        height={1080}
        className="w-full h-full object-cover"
      />
    </div>
  );
};
