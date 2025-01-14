"use client";

import PixelTrail from "@/components/animated/pixel-trail";
import { RippleBackground } from "@/components/animated/ripple";
import ScrambleHover from "@/components/fancy/scramble-hover";
import LetterSwapForward from "@/components/fancy/swap-text";
import Backdrop from "@/components/layout/backdrop";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

const links = [
  {
    title: "Programa",
    href: "/",
  },
  {
    title: "Portafolio",
    href: "/",
  },
  {
    title: "Plata-news",
    href: "/",
  },
  {
    title: "Postula",
    href: "/",
  },
];

const imageSources = ["/Banana.gif", "/CloseUp.gif", "/ZoomGif.gif"];

export default function Home() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageSources.length);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="font-sans w-screen h-svh overflow-hidden">
      <Header />

      <Content />

      <div className="absolute -z-10 w-screen h-screen">
        <Image
          src={imageSources[currentImageIndex]}
          alt={`Image ${currentImageIndex + 1}`}
          width={1920}
          height={1080}
          className="w-full h-full object-cover pointer-events-auto select-none"
        />
      </div>
    </main>
  );
}


const Header = () => {
  return (
    <header className="z-[999] left-1/2 -translate-x-1/2 bg-gradient-to-b from-black/60 absolute top-0 items-center mx-auto max-w-screen-xl px-2 md:px-16 h-16 *:h-full flex justify-between w-screen border-t border-white/5">
      <Link href="/" className="flex items-center gap-2">
        <Image
          src="/logo.svg"
          alt="Logo Platanus"
          width={128}
          height={24}
        />
      </Link>

      <div className="text-yellow-300 flex items-center gap-2">
        <ScrambleHover
          text="Postula"
          className={cn(
            "underline text-base cursor-pointer",
          )}
        />
        <div className="relative">
          <div className="flex size-1.5 bg-yellow-300" />
          <div className="flex size-1.5 bg-yellow-300 absolute top-0 left-0 animate-ping" />
        </div>
      </div>
    </header>
  );
};

const Content = () => {
  const [daysLeft, setDaysLeft] = useState(25);
  const [hoursLeft, setHoursLeft] = useState(4);
  const [minutesLeft, setMinutesLeft] = useState(20);
  const [secondsLeft, setSecondsLeft] = useState(40);

  const padWithZero = (number: number) => number.toString().padStart(2, '0');

  useEffect(() => {
    const timer = setInterval(() => {
      setDaysLeft((prevDays) => (prevDays > 0 ? prevDays - 1 : 0));
    }, 86400000); // 86400000 ms = 1 day

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setHoursLeft((prevHours) => (prevHours < 23 ? prevHours - 1 : 0));
    }, 3600000); // 3600000 ms = 1 hour

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMinutesLeft((prevMinutes) => (prevMinutes < 59 ? prevMinutes - 1 : 0));
    }, 60000); // 60000 ms = 1 minute

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prevSeconds) => (prevSeconds < 59 ? prevSeconds - 1 : 0));
    }, 1000); // 1000 ms = 1 second

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="text-white md:text-center z-10 h-full absolute top-0 p-4 w-full items-center justify-center flex flex-col gap-8">
        <h1 className="text-3xl md:text-5xl font-medium">Acelera tu startup en LatAm.</h1>
        <p className="opacity-70 text-sm max-w-lg">
          Platanus es una startup de capital privado que invierte en founders de LatAm. Invertimos $200K USD por el 5,5% de tu startup, conecta con los mejores founders de LatAm, y haz crecer tu idea.
        </p>

        {/* <div className="font-mono shadow-2xl mt-8 flex w-fit bg-white/5 backdrop-blur-sm border *:border-0 border-white/10 rounded-xl px-12 p-8">
          <div className="flex flex-col items-center gap-1">
            <LetterSwapForward
              label={padWithZero(daysLeft)}
              className={cn(
                "text-4xl",
              )}
            />
            <span className="text-sm font-mono uppercase">
              Días
            </span>
          </div>
          <hr className="mx-12 my-auto w-px h-1/2 bg-white/20" />
          <div className="flex flex-col items-center gap-1">
            <LetterSwapForward
              label={padWithZero(hoursLeft)}
              className={cn(
                "text-4xl",
              )}
            />
            <span className="text-sm font-mono uppercase">
              Horas
            </span>
          </div>
          <hr className="mx-12 my-auto w-px h-1/2 bg-white/20" />
          <div className="flex flex-col items-center gap-1">
            <LetterSwapForward
              label={padWithZero(minutesLeft)}
              className={cn(
                "text-4xl",
              )}
            />
            <span className="text-sm font-mono uppercase">
              Minutos
            </span>
          </div>
          <hr className="mx-12 my-auto w-px h-1/2 bg-white/20" />
          <div className="flex flex-col items-center gap-1">
            <LetterSwapForward
              label={padWithZero(secondsLeft)}
              className={cn(
                "text-4xl",
              )}
            />
            <span className="text-sm font-mono uppercase">
              Segundos
            </span>
          </div>
        </div> */}
      </div>
      <ul className="z-10 absolute bottom-0 w-screen p-8 bg-gradient-to-t from-black/60 flex gap-8 items-center justify-center">
        {links.map((link, index) => (
          <li
            key={index}
            className="flex items-center gap-2"
          >
            <ScrambleHover
              text={link.title}
              className={cn(
                "underline text-base cursor-pointer",
                index === links.length - 1 && "text-yellow-300"
              )}
            />
            {index === links.length - 1 && (
              <div className="relative">
                <div className="flex size-1.5 bg-yellow-300" />
                <div className="flex size-1.5 bg-yellow-300 absolute top-0 left-0 animate-ping" />
              </div>
            )}
          </li>
        ))}
      </ul>
      <div className="absolute inset-96 bg-black/80 blur-3xl rounded-3xl from-black/60" />
    </>
  );
};
