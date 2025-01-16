"use client"

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button";
import Menu from "./menu";

export default function Header() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [hoveredItem, setHoveredItem] = useState<string | null>("Platanus Hack");

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleScroll = () => {
    if (typeof window !== 'undefined') {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll, lastScrollY]);

  return (
    <>
      <div
        className={cn(
          "absolute -translate-x-1/2 left-1/2 top-2 md:top-4 flex items-center justify-center mx-auto max-w-screen-xl w-full z-50 h-16 transition-transform duration-300",
          isVisible ? "translate-y-0" : "-translate-y-full"
        )}
      >
        <header className="flex pr-4 pl-6 md:px-6 w-full items-center justify-between max-w-screen-xl">
          <Link href="/">
            <Image src="/logo.svg" alt="Logo" width={128} height={24} />
          </Link>
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <Link href="#" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Programa
                </NavigationMenuLink>
              </Link>
              <Link href="#" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Portafolio
                </NavigationMenuLink>
              </Link>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Eventos</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 gap-y-0 p-2 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                    <li className="row-span-3">
                      {hoveredItem === "Forum" ? (
                        <Image
                          src="/menu/forum.webp"
                          alt="Forum"
                          width={256}
                          height={256}
                          className="rounded-md w-full h-full object-cover"
                        />
                      ) : hoveredItem === "Demo Dev" ? (
                        <video
                          src="https://cdn.platan.us/videos/demodev.mp4"
                          width={256}
                          height={256}
                          className="rounded-md w-full h-full object-cover"
                          autoPlay
                        />
                      ) : (
                        <Image
                          src="/menu/hack.webp"
                          alt="Hackathon"
                          width={256}
                          height={256}
                          className="rounded-md w-full h-full object-cover"
                        />
                      )}
                    </li>
                    <ListItem
                      href="#"
                      title="Platanus Hack"
                      onMouseEnter={() => setHoveredItem("Platanus Hack")}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      De cero a producto en 36 horas.
                    </ListItem>
                    <ListItem
                      href="#"
                      title="Demo Dev"
                      onMouseEnter={() => setHoveredItem("Demo Dev")}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      Conoce los desafíos técnicos de las startups más exitosas de LatAm.
                    </ListItem>
                    <ListItem
                      href="#"
                      title="Forum"
                      onMouseEnter={() => setHoveredItem("Forum")}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      Juntamos a nuestros founders, inversionistas y cercanos para hablar de un tema.
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              {/* <NavigationMenuItem>
                <NavigationMenuTrigger>Recursos</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-2 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        daasdasd
                      </NavigationMenuLink>
                    </li>
                    <ListItem href="/docs" title="Introduction">
                      Re-usable components built using Radix UI and Tailwind CSS.
                    </ListItem>
                    <ListItem href="/docs/installation" title="Installation">
                      How to install dependencies and structure your app.
                    </ListItem>
                    <ListItem href="/docs/primitives/typography" title="Typography">
                      Styles for headings, paragraphs, lists...etc
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem> */}
            </NavigationMenuList>
          </NavigationMenu>
          <Button size="sm" variant="white" className="hidden md:flex">
            Postula
          </Button>
          <Menu />
        </header>
      </div>
      <div className="absolute w-screen h-24 bg-gradient-to-b from-black inset-x-0 top-0" />
    </>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none hover:bg-white/5 space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"
