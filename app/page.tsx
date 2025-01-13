import Spline from "@splinetool/react-spline";

export default function Home() {
  return (
    <div className="flex items-center justify-start w-screen h-svh overflow-hidden">
      {/* <div className="m-8 h-1/2 flex items-center my-auto w-1/2 rounded-lg p-8 bg-black/5 backdrop-blur-lg border-2 border-neutral-800 items-center justify-center left-0">
        <h1 className="text-4xl">
          Builders investing in founders.
        </h1>
      </div> */}
      <Spline
        scene="https://prod.spline.design/TZtLZGKmk4SB7237/scene.splinecode"
        className="-z-10 absolute top-1/2 -translate-y-1/2 -translate-x-1/2 left-1/2 w-screen"
      />
    </div>
  );
}
