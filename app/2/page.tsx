import { Content } from "@/components/shared/content";
import FrameOverlay from "@/components/shared/frame-overlay";
import Image from "next/image";

export default function ThreeBanansPage() {
  return (
    <main className="font-sans w-screen h-svh max-h-screen overflow-hidden">
      <Content/>

      <FrameOverlay />

      <div className="absolute -z-10 w-screen h-screen">
        <Image
          src="/Banana4.gif"
          alt="3bananas"
          width={1920}
          height={1080}
          quality={100}
          className="md:w-full h-full scale-150 md:scale-100 object-contain md:object-cover pointer-events-auto select-none saturate-200 brightness-100"
        />
      </div>
    </main>
  );
}
