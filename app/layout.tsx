import { Ubuntu } from "next/font/google";
import localFont from "next/font/local";
import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils"
import CustomCursor from "@/components/shared/custom-cursor";

const vcr = localFont({
  src: "../fonts/VCR_OSD_MONO.ttf",
  variable: "--font-vcr",
});

const ubuntu = Ubuntu({
  subsets: ["latin"],
  variable: "--font-ubuntu",
  weight: ["400", "500", "700"],
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
          ubuntu.variable,
          "font-sans antialiased w-screen h-svh overflow-hidden"
        )}
      >
        <main>
          <CustomCursor />
          {children}
        </main>
      </body>
    </html>
  );
}
