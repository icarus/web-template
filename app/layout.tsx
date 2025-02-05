"use client";

import { Ubuntu } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils"
import Header from "@/components/layout/header";
import { usePathname } from "next/navigation";
import { FinalModel } from "./final-model";
import { Cursor } from "@/components/ui/cursor";

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
          <Cursor />
          {pathname === "/" || pathname === "/3" || pathname === "/programa" && <Header />}
          {children}
          <div className={cn(
            "-z-10 fixed inset-0 transition-opacity duration-500",
            pathname === '/' ? 'opacity-100' : 'opacity-50'
          )}
          >
            <FinalModel modelPath="/models/logo2.gltf" />
          </div>
        </main>
      </body>
    </html>
  );
}
