"use client";

import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const menuItems = [
  {
    title: "Programa",
    src: "/CloseUp.gif",
    className: "col-span-1"
  },
  {
    title: "Portafolio",
    src: "/Banana.gif",
    className: "col-span-1"
  },
  {
    title: "Equipo",
    src: "/ZoomGif.gif",
    className: "col-span-1"
  },
  {
    title: "Demo Day",
    src: "/Banana.gif",
    className: "col-span-1"
  },
]
const imageSources = ["/Banana.gif", "/CloseUp.gif", "/ZoomGif.gif"];

export default function Page() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageSources.length);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="grid grid-cols-3 h-svh grid-rows-2 overflow-hidden">
      <InfoPanel />
      {menuItems.map((item, index) => (
        <Link
          href="/programa"
          className={cn("group relative overflow-clip cursor-pointer",
            index % 2 === 0 ? "bg-black" : "bg-yellow-300",
            "hover:bg-opacity-50 transition-all duration-300",
            item.className
          )}
          key={index}
        >
          <h2 className="text-white text-2xl font-medium absolute z-10 inset-0 flex items-center justify-center group-hover:underline">
            {item.title}
          </h2>
          <Image
            src={item.src}
            alt={`Image ${currentImageIndex + 1}`}
            width={1920}
            height={1080}
            quality={100}
            className={cn(
              "object-cover saturate-200 brightness-100 size-full",
              index % 2 === 0 ? "" : "saturate-0 grayscale brightness-50",
              "group-hover:scale-110 transition-all duration-300"
            )}
          />
        </Link>
      ))}
    </main>
  );
}

export const InfoPanel = () => {
  return (
    <div className={cn("z-10 w-full h-full flex flex-col gap-12 justify-between relative overflow-clip p-8")}>
      <div className="flex flex-col gap-8">
        <Image
          src="/logo.svg"
          alt="Logo"
          width={128}
          height={72}
          quality={100}
        />
        <h1 className="text-4xl font-medium">
          
        </h1>
        {/* <p className="text-sm max-w-sm text-neutral-500">
          Invertimos $200K USD por el 5,5% de tu startup, conecta con los mejores founders de LatAm, y haz crecer tu idea.
        </p> */}
      </div>
      <div className="grid grid-cols-2 gap-12">
        <div className="flex flex-col gap-4 text-3xl">
          <div className="text-sm uppercase text-neutral-500 flex flex-col gap-2 w-full font-mono">
            Postulaciones tempranas
            <hr className="w-full bg-neutral-800 border-0 h-px" />
          </div>
          Feb 3 – Mar 2, 2025
        </div>
        <div className="flex flex-col gap-4 text-3xl">
          <div className="text-sm uppercase text-neutral-500 flex flex-col gap-2 w-full font-mono">
            Postulaciones generales
            <hr className="w-full bg-neutral-800 border-0 h-px" />
          </div>
          Mar 2 - Abr 30, 2025
        </div>
      </div>
      <div className="mt-auto flex flex-col gap-4">
        <div className="sr-only flex gap-2 items-center">
          Las postulaciones cierran en
          <div className="select-none font-mono flex items-center gap-0.5 p-2 rounded-md bg-neutral-800">
            36d
            <span>:</span>
            24h
            <span>:</span>
            12m
            <span>:</span>
            59s
          </div>
        </div>
        <Button variant="white" asChild>
          <Link href="/programa">
            Postula ahora
          </Link>
        </Button>
      </div>
    </div>
  )
}
