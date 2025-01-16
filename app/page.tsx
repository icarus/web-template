"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import FrameOverlay from "@/components/shared/frame-overlay";

const imageSources = ["/Banana.gif", "/CloseUp.gif", "/ZoomGif.gif"];

export default function Home() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageSources.length);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="font-sans w-screen h-svh max-h-screen overflow-hidden">
      <Content />

      <FrameOverlay />

      <div className="absolute -z-10 w-screen h-screen">
        <Image
          src={imageSources[currentImageIndex]}
          alt={`Image ${currentImageIndex + 1}`}
          width={1920}
          height={1080}
          quality={100}
          className="w-full h-full object-cover pointer-events-auto select-none saturate-200 brightness-100"
        />
      </div>
    </main>
  );
}

export const Content = () => {
  return (
    <>
      <div className="text-white text-center z-10 h-full absolute top-0 p-8 w-full items-center justify-center flex flex-col gap-8">
        <h1 className="text-4xl md:text-5xl font-medium">No se qué poner aquí, y tú?</h1>
        <p className="text-sm max-w-sm">
          Invertimos $200K USD por el 5,5% de tu startup, conecta con los mejores founders de LatAm, y haz crecer tu idea.
        </p>
      </div>
      <div className="flex gap-6 w-full justify-center absolute bottom-0 p-6 md:p-10 md:hidden underline bg-gradient-to-t from-black to-transparent">
        <Link href="/">
          Programa
        </Link>
        <Link href="/">
          Portafolio
        </Link>
        <Link href="/">
          Blog
        </Link>
      </div>
      <div className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 absolute w-96 md:w-1/4 aspect-square z-0 bg-black/60 rounded-full blur-[128px]" />
    </>
  );
};
