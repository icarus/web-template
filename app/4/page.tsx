'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FloatingElement } from "@/components/fancy/parallax-floating";
import Floating from "@/components/fancy/parallax-floating";
import { ModelViewer } from "./simpleModel";
import { exampleImages } from "@/helpers/exampleImages";
import { motion } from "framer-motion";
import { useState } from "react"
import Image from "next/image";

const decorativeImages = [
  {
    src: "https://dfmas.df.cl/dfmas/site/artic/20241129/imag/foto_0000005920241129115939/Captura_de_pantalla_2024-12-02_a_las_9.12.06_a._m..png",
    position: [-1, 0, 0] as [number, number, number], // Left side
    scale: 1.2,
    caption: "Programa",
  },
  {
    src: "/menu/forum.webp",
    position: [1, 0, 0] as [number, number, number], // Right side
    scale: 1.2,
    caption: "Hack Club Forum",
  },
  {
    src: "/menu/hack.png",
    position: [0, 1, 0] as [number, number, number], // Top
    scale: 1.2,
    caption: "sdd Club Logo",
  },
  // Add more images as needed
];

export default function Model() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  // Add animation variants for the images
  const imageVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="relative w-full h-screen">
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogHeader className="sr-only">
          <DialogTitle>Selected Image</DialogTitle>
        </DialogHeader>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0">
          <Image
            src={selectedImage || ''}
            alt="Selected image"
            className="w-full h-full object-contain"
            width={1000}
            height={1000}
          />
        </DialogContent>
      </Dialog>

      <Floating sensitivity={-1} className="z-50 overflow-hidden">
        <FloatingElement depth={0.5} className="top-[8%] left-[11%]">
          <motion.img
            variants={imageVariants}
            initial="hidden"
            animate="visible"
            src={exampleImages[0].url}
            alt="Floating image 1"
            className="w-16 h-16 md:w-24 md:h-24 object-cover hover:scale-125 duration-200 cursor-pointer transition-transform"
            onClick={() => setSelectedImage(exampleImages[0].url)}
          />
        </FloatingElement>
        <FloatingElement depth={1} className="top-[10%] left-[32%]">
          <motion.img
            variants={imageVariants}
            initial="hidden"
            animate="visible"
            src={exampleImages[1].url}
            className="w-20 h-20 md:w-28 md:h-28 object-cover hover:scale-125 duration-200 cursor-pointer transition-transform"
            onClick={() => setSelectedImage(exampleImages[1].url)}
          />
        </FloatingElement>
        <FloatingElement depth={2} className="top-[2%] left-[53%]">
          <motion.img
            variants={imageVariants}
            initial="hidden"
            animate="visible"
            src={exampleImages[2].url}
            className="w-28 h-40 md:w-40 md:h-52 object-cover hover:scale-125 duration-200 cursor-pointer transition-transform"
            onClick={() => setSelectedImage(exampleImages[2].url)}
          />
        </FloatingElement>
        <FloatingElement depth={1} className="top-[0%] left-[83%]">
          <motion.img
            variants={imageVariants}
            initial="hidden"
            animate="visible"
            src={exampleImages[3].url}
            className="w-24 h-24 md:w-32 md:h-32 object-cover hover:scale-125 duration-200 cursor-pointer transition-transform"
            onClick={() => setSelectedImage(exampleImages[3].url)}
          />
        </FloatingElement>

        <FloatingElement depth={1} className="top-[40%] left-[2%]">
          <motion.img
            variants={imageVariants}
            initial="hidden"
            animate="visible"
            src={exampleImages[4].url}
            className="w-28 h-28 md:w-36 md:h-36 object-cover hover:scale-125 duration-200 cursor-pointer transition-transform"
            onClick={() => setSelectedImage(exampleImages[4].url)}
          />
        </FloatingElement>
        <FloatingElement depth={2} className="top-[70%] left-[77%]">
          <motion.img
            variants={imageVariants}
            initial="hidden"
            animate="visible"
            src={exampleImages[7].url}
            className="w-28 h-28 md:w-36 md:h-48 object-cover hover:scale-125 duration-200 cursor-pointer transition-transform"
            onClick={() => setSelectedImage(exampleImages[7].url)}
          />
        </FloatingElement>

        <FloatingElement depth={4} className="top-[73%] left-[15%]">
          <motion.img
            variants={imageVariants}
            initial="hidden"
            animate="visible"
            src={exampleImages[5].url}
            className="w-40 md:w-52 h-full object-cover hover:scale-125 duration-200 cursor-pointer transition-transform"
            onClick={() => setSelectedImage(exampleImages[5].url)}
          />
        </FloatingElement>
        <FloatingElement depth={1} className="top-[80%] left-[50%]">
          <motion.img
            variants={imageVariants}
            initial="hidden"
            animate="visible"
            src={exampleImages[6].url}
            className="w-24 h-24 md:w-32 md:h-32 object-cover hover:scale-125 duration-200 cursor-pointer transition-transform"
            onClick={() => setSelectedImage(exampleImages[6].url)}
          />
        </FloatingElement>
      </Floating>
      <ModelViewer
        modelPath="/models/logo2.gltf"
        floatingImages={decorativeImages}
      />
    </div>
  );
}
