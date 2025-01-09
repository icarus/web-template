import Spline from "@splinetool/react-spline";

export default function Home() {
  return (
    <main className="p-8 relative flex flex-col justify-end w-screen h-screen">
      <div className="ml-auto w-1/2 h-full bg-black/80 backdrop-blur-xl rounded-lg border border-white/20 text-white z-10 max-w-4xl flex flex-col items-center justify-center gap-6">
        <h1 className="font-mono uppercase text-5xl text-center text-balance font-medium">
          FOUNDERS
          <br />
          INVESTING IN
          <br />
          FOUNDERS.
        </h1>
      </div>
      <div className="absolute bg-black/25 rounded-full blur-4xl w-1/2 h-1/2" />
      <Spline
        scene="https://prod.spline.design/WGxyp8AnbwTseFgu/scene.splinecode"
        className="-z-10 absolute top-0 -translate-x-1/2 left-1/4 w-full h-full"
      />
    </main>
  );
}
