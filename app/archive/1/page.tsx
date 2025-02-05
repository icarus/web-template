"use client";

import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { InfoPanel } from "@/components/shared/info-panel";

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
