"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import FrameOverlay from "@/components/shared/frame-overlay";
import { Content } from "@/components/shared/content";

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
