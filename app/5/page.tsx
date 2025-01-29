'use client'

import { exampleImages } from "@/helpers/exampleImages";
import { ImageCloud } from "./image-cloud";

export default function OrbitGallery() {
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <div className="absolute inset-0 z-0">
        <ImageCloud images={exampleImages} />
      </div>
    </div>
  );
}
