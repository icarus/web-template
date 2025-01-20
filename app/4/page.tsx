import { cn } from "@/lib/utils";
import Image from "next/image";

const imageSources = ["/Banana.gif", "/CloseUp.gif", "/ZoomGif.gif"];

export default function Home() {
  const numImages = imageSources.length;
  const numRows = 2;
  const numCols = 3;

  return (
    <main className="font-mono w-screen h-svh overflow-hidden">
      <div className="grid grid-cols-3 grid-rows-[repeat(auto-fit,minmax(100px,1fr))] w-full h-full">
        {Array.from({ length: numRows }).map((_, rowIndex) => {
          const startIndex = (rowIndex + 1) % numImages;
          return Array.from({ length: numCols }).map((_, colIndex) => {
            const imageIndex = (startIndex + colIndex) % numImages;
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={cn(
                  "relative overflow-hidden [&:nth-child(2n)]:bg-yellow-300 flex items-center justify-center",
                  imageIndex !== 0 && "[&_img]:scale-[2]",
                )}
              >
                <Image
                  src={imageSources[imageIndex]}
                  alt={`Image ${imageIndex + 1}`}
                  width={1920}
                  height={1080}
                  quality={100}
                  priority
                  className="inset-0 select-none pointer-events-none w-full object-cover"
                />
              </div>
            );
          });
        })}
      </div>
    </main>
  );
}
