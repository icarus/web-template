import Image from "next/image";
import { InfoPanel } from "../1/page";

export default function Page() {
  return (
    <main className="overflow-hidden h-screen">
      <div className="flex flex-col gap-2 m-2 h-full w-fit">
        <div className="py-8 h-full flex flex-col items-center justify-between bg-neutral-800/40 backdrop-blur-lg">
          <InfoPanel />
        </div>
      </div>

      <div className="absolute -z-10 w-screen h-screen inset-0">
        <Image
          src="/BananaOptimizado5.gif"
          alt="Banana"
          width={1920}
          height={1080}
          quality={100}
          className="md:w-full h-full scale-150 md:scale-90 object-contain md:object-cover pointer-events-auto select-none saturate-200 brightness-100"
        />
      </div>
    </main>
  )
}
