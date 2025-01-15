import Image from "next/image";

export default function Exploration1() {
  return (
    <Image
      src="/Platanus v6.gif"
      alt="Exploration 1"
      width={1000}
      height={1000}
      className="size-3/4 -z-10 absolute -translate-x-1/2 left-1/4 h-full object-cover m-16"
    />
    // <Spline
    //   scene="https://prod.spline.design/De3GR2R4brUaw86J/scene.splinecode"
    //   className="size-1/2 -z-10 absolute -translate-x-1/2 left-1/2 m-16"
    // />
  );
}
