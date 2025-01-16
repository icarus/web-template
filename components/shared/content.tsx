import Link from "next/link";

export const Content = () => {
  return (
    <>
      <div className="text-white text-center z-10 h-full absolute top-0 p-8 w-full items-center justify-center flex flex-col gap-8">
        <h1 className="text-4xl md:text-5xl font-medium">No se qué poner aquí, y tú?</h1>
        <p className="text-sm max-w-sm">
          Invertimos $200K USD por el 5,5% de tu startup, conecta con los mejores founders de LatAm, y haz crecer tu idea.
        </p>
      </div>
      <div className="flex gap-6 w-full justify-center absolute bottom-0 p-6 md:p-10 md:hidden underline bg-gradient-to-t from-black to-transparent">
        <Link href="/">
          Programa
        </Link>
        <Link href="/">
          Portafolio
        </Link>
        <Link href="/">
          Blog
        </Link>
      </div>
      <div className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 absolute w-96 md:w-1/4 aspect-square z-0 bg-black/60 rounded-full blur-[128px]" />
    </>
  );
};
