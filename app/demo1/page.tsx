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
  );
}
