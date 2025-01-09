"use client"
import ImageTrail from "@/components/animated/image-trail";
import { exampleImages } from "@/helpers/exampleImages";
import { useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Marquee from "@/components/animated/marquee";
import { portfolioImages } from "@/helpers/portfolioImages";

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  return (
    <section className="w-screen h-screen">
      <div className="h-5/6 flex flex-col gap-2 items-center justify-center">
        <div className="max-w-2xl flex flex-col items-center gap-6">
          <h1 className="text-7xl text-center text-balance font-medium bg-gradient-to-r from-white to-neutral-500 text-transparent bg-clip-text">
            Invertimos $200K en tu startup
          </h1>
          <p className="max-w-lg text-center text-lg text-neutral-500">
            Invertimos $200K USD por el 5,5% de tu startup, conecta con los mejores founders de LatAm, y haz crecer tu idea.
          </p>
          <Button
            className="mt-4"
            variant="gradient"
            size="lg"
            asChild
          >
            <Link href="/">
              Postula al Batch 25-1
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
      <PortfolioGallery />
      <div className="hidden absolute top-0 left-0 z-10" ref={ref as React.RefObject<HTMLDivElement>}>
        <ImageTrail containerRef={ref as React.RefObject<HTMLElement>}>
          {exampleImages.map((image, index) => (
            <div
            key={index}
            className="flex relative overflow-hidden w-24 h-24 "
            >
              <Image
                src={image.url}
                alt="image"
                width={100}
                height={100}
                className="object-cover absolute inset-0"
              />
              </div>
            ))}
        </ImageTrail>
      </div>
    </section>
  )
}

const PortfolioGallery = () => {
  return (
    <div className="pt-12 pb-16">
      <Marquee pauseOnHover>
        {portfolioImages.map((logo, index) => (
          <Logo key={index} {...logo} />
        ))}
      </Marquee>
    </div>
  )
}

const Logo = ({
  img,
  name,
  href
}: {
  img: string;
  name: string;
  href: string;
}) => {
  return (
    <figure className="mx-8 flex items-center w-32 cursor-pointer overflow-hidden">
      <Link href={href} target="_blank">
        <Image
          width="128"
          height="24"
          alt={name}
          src={img}
        />
      </Link>
    </figure>
  );
};
