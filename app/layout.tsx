"use client";

import { Ubuntu } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils"
import Header from "@/components/layout/header";
import Image from "next/image";
import { usePathname } from "next/navigation";

const vcr = localFont({
  src: "../fonts/VCR_OSD_MONO.ttf",
  variable: "--font-vcr",
});

const ubuntu = Ubuntu({
  subsets: ["latin"],
  variable: "--font-ubuntu",
  weight: ["400", "500", "700"],
});

// export const metadata: Metadata = {
//   title: "Felipe Mandiola's Web Template",
//   description: "A template for my (and yours) web projects",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  return (
    <html lang="es">
      <body
        className={cn(
          vcr.variable,
          ubuntu.variable,
          "font-sans antialiased w-screen min-h-svh overflow-x-hidden"
        )}
      >
        <main>
          {pathname !== "/1" && pathname !== "/2" && pathname !== "/4" && pathname !== "/6" && <Header />}
          {children}
          {pathname === "/programa" && (
            <div className="fixed top-0 -z-20 w-screen h-screen">
            <Image
              src="/BananaOptimizado5.gif"
              alt="Banana"
              width={1920}
              height={1080}
              quality={100}
              className="md:w-full h-full scale-150 md:scale-90 md:scale-x-[-1] object-contain md:object-cover pointer-events-auto select-none saturate-200 brightness-100"
            />
          </div>
          )}
        </main>
      </body>
    </html>
  );
}
