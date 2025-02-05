"use client";

import { Ubuntu } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils"
import Header from "@/components/layout/header";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FinalModel } from "./8/final-model";

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
          {pathname === "/" || pathname === "/3" && <Header />}
          {children}
          {pathname === "/programa" && (
            <div className="fixed top-0 -z-20 w-screen h-screen pointer-events-none">
              <FinalModel
                modelPath="/models/logo2.gltf"
              />
            </div>
          )}
        </main>
      </body>
    </html>
  );
}
