"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";

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
    <main className="font-sans w-screen h-svh overflow-hidden">
      <div className="mx-auto max-w-screen-xl py-2 absolute flex flex-col justify-between inset-0">
        <hr className="absolute inset-y-0 w-px h-full bg-neutral-700 ml-2 border-0" />
        <hr className="absolute inset-y-0 right-0 w-px h-full bg-neutral-700 mr-2 border-0" />
        <div className="relative flex w-full justify-between">
          <X className="size-4 rotate-45 stroke-1 z-10" />
          <hr className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-screen h-px bg-neutral-700 border-0" />
          <X className="size-4 rotate-45 stroke-1 z-10" />
        </div>
        <div className="relative flex w-full justify-between">
          <X className="size-4 rotate-45 stroke-1 z-10" />
          <hr className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-screen h-px bg-neutral-700 border-0" />
          <X className="size-4 rotate-45 stroke-1 z-10" />
        </div>
      </div>
      <Content />

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
      <div className="text-white md:text-center z-10 h-full absolute top-0 p-4 w-full items-center justify-center flex flex-col gap-8">
        <h1 className="text-3xl md:text-5xl font-medium">No se qué poner aquí, y tú?</h1>
        <p className="text-sm max-w-sm">
          Invertimos $200K USD por el 5,5% de tu startup, conecta con los mejores founders de LatAm, y haz crecer tu idea.
        </p>
      </div>
      <div className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 absolute w-1/4 aspect-square z-0 bg-black/60 rounded-full blur-[128px]" />
    </>
  );
};
