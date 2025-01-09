"use client"

import Screensaver from "@/components/animated/screensaver";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

export default function NotFound() {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div
      className="h-screen flex flex-col gap-2 items-center justify-center relative"
      ref={containerRef}
    >
      {[...Array(10)].map((_, index) => (
        <Screensaver
          key={index}
          speed={2}
          startPosition={{ x: index * 3, y: index * 3 }}
          startAngle={40}
          containerRef={containerRef as React.RefObject<HTMLElement>}
        >
          <span className="text-9xl">
            🍌
          </span>
        </Screensaver>
      ))}
      <h1 className="leading-loose bg-gradient-to-r from-white to-neutral-500 text-transparent bg-clip-text text-6xl font-medium">page not found</h1>
      <Button className="ml-2" asChild>
        <Link href="/">
          <ArrowLeftIcon />
          Volver al inicio
        </Link>
      </Button>
    </div>
  );
}
