import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";

export default function OurProgram() {
  return (
    <div className="min-h-screen w-screen py-16 flex flex-col gap-14 items-center justify-start">
      <div className="flex flex-col items-center max-w-lg gap-2">
        <Badge variant="gradient">
          <Image
            src="/icons/bolt.svg"
            alt="Bolt Icon"
            width={24}
            height={24}
          />
          Construye
        </Badge>
        <h2 className="inline flex-wrap items-center text-6xl text-center font-medium bg-gradient-to-r from-white to-neutral-500 text-transparent bg-clip-text">
          De
          <Image
            src="/icons/bulb.svg"
            alt="Bulb Icon"
            width={48}
            height={48}
            className="mx-2 w-12 h-12"
          />
          idea a
          <Image
            src="/icons/star.svg"
            alt="Star Icon"
            width={48}
            height={48}
            className="mx-2 w-12 h-12"
          />
          startup en 3 meses
        </h2>
        <p className="max-w-lg text-center text-lg text-neutral-500">
          Te ayudamos a construir una startup rentable, preparándote para levantar capital en el
          <Link href="/demo-day" className="ml-1.5 inline underline cursor-pointer">
            Demo Day
          </Link>.
        </p>
      </div>
    </div>
  )
}
