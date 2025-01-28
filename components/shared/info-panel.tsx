import { cn } from "@/lib/utils"
import Image from "next/image"
import { Button } from "../ui/button"
import Link from "next/link"

export const InfoPanel = () => {
  return (
    <div className={cn("z-10 w-full h-full flex flex-col gap-12 justify-between relative overflow-clip p-8")}>
      <div className="flex flex-col gap-8">
        <Image
          src="/logo.svg"
          alt="Logo"
          width={128}
          height={72}
          quality={100}
        />
        <h1 className="text-4xl font-medium">

        </h1>
        {/* <p className="text-sm max-w-sm text-neutral-500">
          Invertimos $200K USD por el 5,5% de tu startup, conecta con los mejores founders de LatAm, y haz crecer tu idea.
        </p> */}
      </div>
      <div className="grid grid-cols-2 gap-12">
        <div className="flex flex-col gap-4 text-3xl">
          <div className="text-sm uppercase text-neutral-500 flex flex-col gap-2 w-full font-mono">
            Postulaciones tempranas
            <hr className="w-full bg-neutral-800 border-0 h-px" />
          </div>
          Feb 3 – Mar 2, 2025
        </div>
        <div className="flex flex-col gap-4 text-3xl">
          <div className="text-sm uppercase text-neutral-500 flex flex-col gap-2 w-full font-mono">
            Postulaciones generales
            <hr className="w-full bg-neutral-800 border-0 h-px" />
          </div>
          Mar 2 - Abr 30, 2025
        </div>
      </div>
      <div className="mt-auto flex flex-col gap-4">
        <div className="sr-only flex gap-2 items-center">
          Las postulaciones cierran en
          <div className="select-none font-mono flex items-center gap-0.5 p-2 rounded-md bg-neutral-800">
            36d
            <span>:</span>
            24h
            <span>:</span>
            12m
            <span>:</span>
            59s
          </div>
        </div>
        <Button variant="white" asChild>
          <Link href="/programa">
            Postula ahora
          </Link>
        </Button>
      </div>
    </div>
  )
}
