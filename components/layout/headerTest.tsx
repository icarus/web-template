import Link from "next/dist/client/link";
import Image from "next/image";

export default function HeaderTest() {
  return (
    <header className="z-10 backdrop-blur-lg border-b-2 border-neutral-800 px-6 py-2 flex items-center justify-between w-full h-12">
    <Link href="/">
      <Image src="/logo.svg" alt="Logo" width={104} height={20} />
      </Link>
      <span className="font-mono uppercase text-sm ml-auto">
        Jue 9 ene. 1:55 p. m.
      </span>
    </header>
  )
}
