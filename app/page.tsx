import { Button } from "@/components/ui/button";
import Spline from "@splinetool/react-spline";

export default function Home() {
  return (
    <main className="font-mono uppercase relative flex flex-col justify-end w-screen h-screen">
      <div className="w-1/2 h-full flex items-center justify-center ml-auto">
        <div className="-mt-8 max-w-96 w-full text-white z-10 flex flex-col items-center justify-center">
          <header className="border-2 border-neutral-800 flex w-full h-12 items-center justify-center text-white text-center">
            PLATANUS
          </header>
          <div className="bg-black/60 backdrop-blur-xl -mt-0.5 border-2 border-neutral-800 flex flex-col justify-center pb-b items-center aspect-square w-full">
            <h1 className="text-3xl text-center">
              FOUNDERS
              <br />
              <span className="mr-2">INVESTING</span>IN
              <br />
              FOUNDERS.
            </h1>
          </div>
          <div className="mt-2 w-full flex flex-col *:uppercase gap-1 shadow-xl">
            <Button className="text-base w-full rounded-none *:col-span-full col-span-full h-12 shadow-custom-button">
              POSTULA AL BATCH 25-1 {'>'}
            </Button>
            <Button className="text-base bg-neutral-900 hover:bg-neutral-900/80 w-full rounded-none h-12 shadow-custom-button">
              Conoce el programa
            </Button>
            <div className="grid grid-cols-3 gap-1">
              <Button className="text-base bg-neutral-900 hover:bg-neutral-900/80 rounded-none h-12 shadow-custom-button">
                HISTORIA
              </Button>
              <Button className="text-base bg-neutral-900 hover:bg-neutral-900/80 rounded-none h-12 shadow-custom-button">
                EQUIPO
              </Button>
              <Button className="text-base bg-neutral-900 hover:bg-neutral-900/80 rounded-none h-12 shadow-custom-button">
                BLOG
              </Button>
            </div>
          </div>
        </div>
      </div>
        {/* <Image
          src="/public/platanus.gif"
          alt="platanus"
          width={1920}
          height={1080}
          className="size-full object-cover"
        /> */}
      <Spline
        scene="https://prod.spline.design/WGxyp8AnbwTseFgu/scene.splinecode"
        className="-z-10 absolute top-1/2 -translate-y-1/2 -mt-8 -translate-x-1/2 left-1/4 m-16"
      />
    </main>
  );
}
