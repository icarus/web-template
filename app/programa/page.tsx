import { BlurFade } from "@/components/ui/blur-fade";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

export default function Programa() {
  return (
    <BlurFade delay={0.4} className="mt-48 text-white mx-auto max-w-screen-xl">
      <div className="flex flex-col gap-16 md:gap-24 pb-32 max-w-screen-lg mx-auto w-full px-6">
        <BlurFade className="text-3xl md:text-5xl leading-normal text-balance">
          Invertimos $200,000 USD por el 5,5% de tu startup.
        </BlurFade>
        <BlurFade delay={0.55} className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="flex flex-col gap-2">
            Las postulaciones ya abrieron
            <Button variant="white" className="mt-4">
              Postula ahora
            </Button>
            <Button>
              Nuestro portafolio
            </Button>
          </div>
          <div className="md:w-[512px] grid grid-cols-1 md:grid-cols-2 gap-6">
            {program.map((item, index) => (
              <div key={index} className="flex items-start gap-2.5 text-base">
                <div className="size-1 my-2.5 aspect-square bg-yellow-300" />
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </BlurFade>
      </div>

      <BlurFade delay={1} className="grid grid-cols-2 md:grid-cols-4 py-32 max-w-screen-lg mx-auto w-full">
        {requirements.map((item, index) => (
          <div key={index} className="flex flex-col gap-4 p-4 md:p-6">
            {item.icon}
            <p className="font-medium">{item.title}</p>
            <p className="-mt-4 text-neutral-500">{item.description}</p>
          </div>
        ))}
      </BlurFade>

      <BlurFade delay={0.15} inView className="grid grid-cols-2 md:grid-cols-4 py-32 max-w-screen-lg mx-auto w-full">
        {mentors.map((mentor, index) => (
          <div key={index} className="flex flex-col gap-2 md:gap-4 p-6">
            <Image
              src={mentor.image}
              alt={mentor.name}
              width={200}
              height={200}
              className="aspect-square w-full rounded-md object-cover"
            />
            <p className="font-medium text-lg md:text-xl">{mentor.name}</p>
            <p className="md:-mt-2 flex gap-2.5 items-center">
              <Image src={mentor.company.logo} alt={mentor.company.name} width={24} height={24} className="rounded-md size-6" />
              {mentor.company.name}
            </p>
          </div>
        ))}
      </BlurFade>

      <BlurFade delay={0.15} className="flex flex-col gap-24 py-32 max-w-screen-lg mx-auto w-full">
        {dates.map((date, index) => (
          <div key={index} className="grid grid-cols-4 gap-4">
            <div className="flex gap-8 items-start col-span-2">
              <span className="font-mono text-5xl text-neutral-500">0{index + 1}</span>
              <span className="text-5xl">{date.title}</span>
            </div>
            <span className="text-neutral-500">{date.date}</span>
            <span className="text-neutral-500">{date.description}</span>
          </div>
        ))}
      </BlurFade>

      <BlurFade delay={0.15} inView className="grid grid-cols-4 gap-y-12 py-32">
        {activities.map((item, index) =>
          index === activities.length - 1 ? (
            <div key={index} className="bg-gradient-to-r items-start from-neutral-950 col-span-full rounded-lg overflow-clip relative flex flex-col gap-4 p-4 md:p-6">
              {item.icon}
              <p className="font-medium">{item.title}</p>
              <p className="-mt-4 text-neutral-500 w-96">{item.description}</p>
              <Button variant="link" className="mt-4 decoration-neutral-600 [&_svg]:text-neutral-500 hover:decoration-white underline uppercase font-mono px-0">
                Conoce más
                <ArrowUpRight />
              </Button>
              <Image
                src="/demoday.png"
                alt="Demo Day"
                width={1024}
                height={256}
                className="absolute inset-0 -z-10 h-full w-full object-cover"
              />
            </div>
          ) : (
            <div key={index} className="relative flex flex-col gap-4 p-4 md:p-6">
              {item.icon}
              <p className="font-medium">{item.title}</p>
              <p className="-mt-4 text-neutral-500">{item.description}</p>
            </div>
          )
        )}
      </BlurFade>
    </BlurFade>
  );
}

const Puzzle = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M4.00001 1.33337H2.66667V2.66671H4.00001V1.33337Z" fill="white"/>
      <path d="M5.33333 2.66663H4V3.99996H5.33333V2.66663Z" fill="white"/>
      <path d="M6.66666 4H5.33333V5.33333H6.66666V4Z" fill="white"/>
      <path d="M2.66666 21.3334H1.33333V22.6667H2.66666V21.3334Z" fill="white"/>
      <path d="M4.00001 20H2.66667V21.3333H4.00001V20Z" fill="white"/>
      <path d="M5.33333 18.6666H4V20H5.33333V18.6666Z" fill="white"/>
      <path d="M30.6667 21.3334H29.3333V22.6667H30.6667V21.3334Z" fill="white"/>
      <path d="M29.3333 20H28V21.3333H29.3333V20Z" fill="white"/>
      <path d="M28 18.6666H26.6667V20H28V18.6666Z" fill="white"/>
      <path d="M29.3333 1.33337H28V2.66671H29.3333V1.33337Z" fill="white"/>
      <path d="M28 2.66663H26.6667V3.99996H28V2.66663Z" fill="white"/>
      <path d="M26.6667 4H25.3333V5.33333H26.6667V4Z" fill="white"/>
      <path d="M3.99999 10.6666H1.33333V12H3.99999V10.6666Z" fill="white"/>
      <path d="M20 24V28H18.6667V29.3333H17.3333V30.6667H14.6667V29.3333H13.3333V28H12V24H20Z" fill="white"/>
      <path d="M25.3333 6.66671H24V5.33337H22.6667V4.00004H21.3333V2.66671H18.6667V1.33337H13.3333V2.66671H10.6667V4.00004H9.33333V5.33337H7.99999V6.66671H6.66666V9.33337H5.33333V14.6667H6.66666V17.3334H7.99999V18.6667H9.33333V20H10.6667V21.3334H12V22.6667H20V21.3334H21.3333V20H22.6667V18.6667H24V17.3334H25.3333V14.6667H26.6667V9.33337H25.3333V6.66671ZM9.33333 9.33337H10.6667V8.00004H12V6.66671H13.3333V5.33337H17.3333V6.66671H13.3333V8.00004H12V9.33337H10.6667V12H9.33333V9.33337Z" fill="white"/>
      <path d="M30.6667 10.6666H28V12H30.6667V10.6666Z" fill="white"/>
    </svg>
  )
}

const TechFounder = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="33" height="32" viewBox="0 0 33 32" fill="none">
      <path d="M22.0833 13.3333H23.4167V22.6666H22.0833V24H20.75V25.3333H19.4167V26.6666H18.0833V28H16.75V29.3333H15.4167V30.6666H7.41668V29.3333H6.08334V28H4.75001V26.6666H3.41668V25.3333H2.08334V18.6666H3.41668V17.3333H4.75001V16H6.08334V14.6666H7.41668V20H6.08334V24H7.41668V25.3333H8.75001V26.6666H12.75V25.3333H14.0833V24H15.4167V22.6666H16.75V21.3333H18.0833V20H19.4167V16H18.0833V14.6666H16.75V13.3333H18.0833V12H19.4167V10.6666H20.75V12H22.0833V13.3333Z" fill="white"/>
      <path d="M31.4167 6.66671V13.3334H30.0833V14.6667H28.75V16H27.4167V17.3334H26.0833V12H27.4167V8.00004H26.0833V6.66671H24.75V5.33337H20.75V6.66671H19.4167V8.00004H18.0833V9.33337H16.75V10.6667H15.4167V12H14.0833V16H15.4167V17.3334H16.75V18.6667H15.4167V20H14.0833V21.3334H12.75V20H11.4167V18.6667H10.0833V9.33337H11.4167V8.00004H12.75V6.66671H14.0833V5.33337H15.4167V4.00004H16.75V2.66671H18.0833V1.33337H26.0833V2.66671H27.4167V4.00004H28.75V5.33337H30.0833V6.66671H31.4167Z" fill="white"/>
    </svg>
  )
}

const Brain = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="33" height="32" viewBox="0 0 33 32" fill="none">
      <path d="M20.5 5.33333H21.8334V8H20.5V12H19.1667V16H17.8334V18.6667H16.5V22.6667H15.1667V26.6667H13.8334V28H12.5V26.6667H11.1667V24H12.5V20H13.8334V16H15.1667V13.3333H16.5V9.33333H17.8334V5.33333H19.1667V4H20.5V5.33333Z" fill="white"/>
      <path d="M31.1667 14.6667V17.3334H29.8334V18.6667H28.5V20H27.1667V21.3334H25.8334V22.6667H23.1667V20H24.5V18.6667H25.8334V17.3334H27.1667V14.6667H25.8334V13.3334H24.5V12H23.1667V9.33337H25.8334V10.6667H27.1667V12H28.5V13.3334H29.8334V14.6667H31.1667Z" fill="white"/>
      <path d="M9.83331 9.33337V12H8.49998V13.3334H7.16665V14.6667H5.83331V17.3334H7.16665V18.6667H8.49998V20H9.83331V22.6667H7.16665V21.3334H5.83331V20H4.49998V18.6667H3.16665V17.3334H1.83331V14.6667H3.16665V13.3334H4.49998V12H5.83331V10.6667H7.16665V9.33337H9.83331Z" fill="white"/>
    </svg>
  )
}

const World = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="33" height="32" viewBox="0 0 33 32" fill="none">
      <path d="M29.5833 12V9.33337H28.25V6.66671H26.9166V5.33337H25.5833V4.00004H22.9166V2.66671H20.25V1.33337H12.25V2.66671H9.58331V4.00004H6.91665V5.33337H5.58331V6.66671H4.24998V9.33337H2.91665V12H1.58331V20H2.91665V22.6667H4.24998V25.3334H5.58331V26.6667H6.91665V28H9.58331V29.3334H12.25V30.6667H20.25V29.3334H22.9166V28H25.5833V26.6667H26.9166V25.3334H28.25V22.6667H29.5833V20H30.9166V12H29.5833ZM24.25 16V12H25.5833V10.6667H26.9166V12H28.25V17.3334H25.5833V16H24.25ZM18.9166 25.3334V28H16.25V24H14.9166V22.6667H13.5833V18.6667H12.25V17.3334H10.9166V16H9.58331V14.6667H8.24998V13.3334H6.91665V12H5.58331V9.33337H6.91665V8.00004H8.24998V6.66671H9.58331V5.33337H13.5833V4.00004H16.25V5.33337H17.5833V10.6667H14.9166V13.3334H16.25V14.6667H13.5833V13.3334H10.9166V16H14.9166V17.3334H20.25V18.6667H21.5833V22.6667H20.25V25.3334H18.9166Z" fill="white"/>
    </svg>
  )
}

const program = [
  {
    description: "Construye, escala y conecta en un programa de 3 meses.",
  },
  {
    description: "Forma parte de una red de +400 founders en toda LatAm.",
  },
  {
    description: "Participa en actividades para founders, por founders.",
  },
  {
    description: "Al terminar, sigue levantando dinero en el Demo Day.",
  },
];

const requirements = [
  {
    icon: <Puzzle />,
    title: "En etapa temprana",
    description: "Invertimos desde la fase de la idea, en adelante.",
  },
  {
    icon: <TechFounder />,
    title: "Tecnológicos",
    description: "Aceptamos startups tech de cualquier industria.",
  },
  {
    icon: <Brain />,
    title: "Fundador técnico",
    description: "Uno de los fundadores debe poder construir el producto.",
  },
  {
    icon: <World />,
    title: "De todo el mundo",
    description: "Postula dónde sea, sólo necesitas hablar español.",
  },
]

const mentors = [
  {
    image: "/mentors/ian.png",
    name: "Ian Lee",
    company: {
      name: "Examedi",
      logo: "/companies/examedi.png"
    }
  },
  {
    image: "/mentors/cristina.png",
    name: "Cristina Etcheverry",
    company: {
      name: "Toku",
      logo: "/companies/toku.png"
    }
  },
  {
    image: "/mentors/alejandro.png",
    name: "Alejandro Matamala",
    company: {
      name: "Runway",
      logo: "/companies/runway.png"
    }
  },
  {
    image: "/mentors/jaime.png",
    name: "Jaime Arrieta",
    company: {
      name: "Buk",
      logo: "/companies/buk.png"
    }
  }
]

const dates = [
  {
    title: "Postulación temprana",
    date: "Febrero 15 a las 23:59 GMT -3",
    description: "Te entrevistaremos antes, y te tendremos en consideración más tiempo.",
  },
  {
    title: "Postulación General",
    date: "Marzo 30 a las 23:59 GMT -3",
    description: "",
  },
  {
    title: "Resultados",
    date: "Generales: Abril 25 Tempranas: Marzo 29",
    description: "Hasta esta fecha sabrás si avanzaste en el proceso de postulación.",
  },
  {
    title: "Programa",
    date: "Desde Mayo a Agosto",
    description: "",
  }
]

const Coliseums = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="33" viewBox="0 0 32 33" fill="none">
      <path d="M30.6663 27.4166V30.0833H29.333V31.4166H2.66634V30.0833H1.33301V27.4166H3.99967V26.0833H5.33301V14.0833H7.99967V26.0833H10.6663V14.0833H13.333V26.0833H18.6663V14.0833H21.333V26.0833H23.9997V14.0833H26.6663V26.0833H27.9997V27.4166H30.6663Z" fill="white"/>
      <path d="M26.6663 7.41659V6.08325H23.9997V4.74992H21.333V3.41659H18.6663V2.08325H13.333V3.41659H10.6663V4.74992H7.99967V6.08325H5.33301V7.41659H1.33301V10.0833H2.66634V11.4166H3.99967V12.7499H27.9997V11.4166H29.333V10.0833H30.6663V7.41659H26.6663ZM14.6663 10.0833V8.74992H13.333V6.08325H14.6663V4.74992H17.333V6.08325H18.6663V8.74992H17.333V10.0833H14.6663Z" fill="white"/>
    </svg>
  )
}

const OfficeHours = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="33" height="33" viewBox="0 0 33 33" fill="none">
      <path d="M16.75 10.0834V7.41675H20.75V8.75008H22.0833V10.0834H23.4167V11.4167H24.75V12.7501H26.0833V16.7501H23.4167V14.0834H22.0833V12.7501H20.75V11.4167H19.4167V10.0834H16.75Z" fill="white"/>
      <path d="M19.4167 14.0833H16.75V16.7499H19.4167V14.0833Z" fill="white"/>
      <path d="M31.4167 11.4166V16.7499H28.75V11.4166H27.4167V10.0833H26.0833V8.74992H24.75V7.41659H23.4167V6.08325H22.0833V4.74992H16.75V2.08325H22.0833V3.41659H24.75V4.74992H26.0833V6.08325H27.4167V7.41659H28.75V8.74992H30.0833V11.4166H31.4167Z" fill="white"/>
      <path d="M30.083 23.4166H31.4163V27.4166H30.083V30.0833H28.7497V31.4166H22.083V30.0833H16.7497V28.7499H14.083V27.4166H12.7497V26.0833H11.4163V24.7499H10.083V23.4166H8.74967V22.0833H7.41634V20.7499H6.08301V19.4166H4.74967V16.7499H3.41634V11.4166H2.08301V4.74992H3.41634V3.41659H6.08301V2.08325H10.083V3.41659H11.4163V4.74992H12.7497V7.41659H14.083V11.4166H12.7497V12.7499H11.4163V16.7499H12.7497V18.0833H14.083V19.4166H15.4163V20.7499H16.7497V22.0833H20.7497V20.7499H22.083V19.4166H26.083V20.7499H28.7497V22.0833H30.083V23.4166Z" fill="white"/>
    </svg>
  )
}

const HablaConFounders = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="33" height="33" viewBox="0 0 33 33" fill="none">
      <path d="M29.833 3.41659V2.08325H3.16634V3.41659H1.83301V24.7499H3.16634V26.0833H11.1663V31.4166H12.4997V30.0833H13.833V28.7499H15.1663V27.4166H17.833V26.0833H29.833V24.7499H31.1663V3.41659H29.833ZM12.4997 15.4166H11.1663V16.7499H8.49967V15.4166H7.16634V12.7499H8.49967V11.4166H11.1663V12.7499H12.4997V15.4166ZM19.1663 15.4166H17.833V16.7499H15.1663V15.4166H13.833V12.7499H15.1663V11.4166H17.833V12.7499H19.1663V15.4166ZM25.833 15.4166H24.4997V16.7499H21.833V15.4166H20.4997V12.7499H21.833V11.4166H24.4997V12.7499H25.833V15.4166Z" fill="white"/>
    </svg>
  )
}

const Dinner = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="33" height="33" viewBox="0 0 33 33" fill="none">
      <path d="M2.91634 18.0833V16.75H1.58301V14.0833H2.91634V12.75H9.58301V16.75H10.9163V18.0833H2.91634Z" fill="white"/>
      <path d="M6.91634 10.0833H5.58301V7.41659H6.91634V6.08325H9.58301V7.41659H10.9163V8.74992H9.58301V11.4166H6.91634V10.0833Z" fill="white"/>
      <path d="M10.917 10.0834H12.2503V8.75008H13.5837V7.41675H18.917V8.75008H20.2503V10.0834H21.5837V15.4167H20.2503V16.7501H18.917V18.0834H13.5837V16.7501H12.2503V15.4167H10.917V10.0834Z" fill="white"/>
      <path d="M25.583 24.75H26.9163V28.75H25.583V30.0833H6.91634V28.75H5.58301V24.75H6.91634V23.4167H8.24967V22.0833H10.9163V20.75H21.583V22.0833H24.2497V23.4167H25.583V24.75Z" fill="white"/>
      <path d="M30.9163 14.0833V16.75H29.583V18.0833H21.583V16.75H22.9163V12.75H29.583V14.0833H30.9163Z" fill="white"/>
      <path d="M22.9163 8.74992H21.583V7.41659H22.9163V6.08325H25.583V7.41659H26.9163V10.0833H25.583V11.4166H22.9163V8.74992Z" fill="white"/>
    </svg>
  )
}

const DemoDay = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="33" viewBox="0 0 32 33" fill="none">
      <path d="M8 18.0834V15.4167H9.33333V14.0834H10.6667V12.7501H12V11.4167H13.3333V12.7501H14.6667V14.0834H16V15.4167H17.3333V16.7501H18.6667V15.4167H20V14.0834H21.3333V12.7501H22.6667V10.0834H21.3333V8.75008H20V7.41675H29.3333V16.7501H28V15.4167H26.6667V14.0834H24V15.4167H22.6667V16.7501H21.3333V18.0834H20V19.4167H18.6667V20.7501H17.3333V19.4167H16V18.0834H14.6667V16.7501H13.3333V15.4167H12V16.7501H10.6667V18.0834H8Z" fill="white"/>
      <path d="M30.6663 23.4166V27.4166H2.66634V26.0833H1.33301V6.08325H5.33301V23.4166H30.6663Z" fill="white"/>
    </svg>
  )
}

const activities = [
  {
    icon: <Coliseums />,
    title: "Coliseos",
    description: "Sesiones quincenales guiadas por nuestros mentores.",
  },
  {
    icon: <OfficeHours />,
    title: "Office hours",
    description: "Reuniones 1:1 con founders de la red de Platanus.",
  },
  {
    icon: <HablaConFounders />,
    title: "Habla con founders",
    description: "Reuniones con cualquier founder de Platanus.",
  },
  {
    icon: <Dinner />,
    title: "Cena",
    description: "Una cena para compartir con otros founders.",
  },
  {
    icon: <DemoDay />,
    title: "Demo Day",
    description: "Al terminar el programa, presentarás ante cientos de inversionistas y VCs para levantar más capital.",
  },
]
