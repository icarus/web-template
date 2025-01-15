"use client";

import Spline from "@splinetool/react-spline";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export default function Home() {
  const [isGrayscale, setIsGrayscale] = useState(false);

  return (
    <>
      <main className="relative">
        <Switch
          checked={isGrayscale}
          onCheckedChange={setIsGrayscale}
          className="fixed top-4 left-4 z-20 !bg-transparent"
        />
        <div
          className={cn(
            "z-10 absolute w-screen h-svh inset-0 bg-dither-2",
            isGrayscale && "grayscale invert",
          )}
        />
        <div className="z-10 absolute w-screen h-svh mix-blend-overlay bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-900 inset-0" />
        <Spline
          scene="https://prod.spline.design/y-GdRG8PL3QWLqg7/scene.splinecode"
          className={cn("w-full h-svh fixed opacity-50", isGrayscale && "grayscale")}
        />
      </main>
    </>
  );
}
