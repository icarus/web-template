import { Inter } from "next/font/google";
import localFont from "next/font/local";
import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils"
import HeaderTest from "@/components/layout/headerTest";

const vcr = localFont({
  src: "../fonts/VCR_OSD_MONO.ttf",
  variable: "--font-vcr",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Felipe Mandiola's Web Template",
  description: "A template for my (and yours) web projects",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="es">
      <body
        className={cn(
          vcr.variable,
          inter.variable,
          "font-sans antialiased"
        )}
      >
        <HeaderTest />
        {children}
      </body>
    </html>
  );
}
