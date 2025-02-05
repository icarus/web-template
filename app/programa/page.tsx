import { BlurFade } from "@/components/ui/blur-fade";
import { Button } from "@/components/ui/button";
import Image from "next/image";

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

      <BlurFade delay={1} className="grid grid-cols-2 md:grid-cols-4 py-24 max-w-screen-lg mx-auto w-full">
        {requirements.map((item, index) => (
          <div key={index} className="flex flex-col gap-4 p-4 md:p-6">
            {item.icon}
            <p className="font-medium">{item.title}</p>
            <p className="-mt-4 text-neutral-500">{item.description}</p>
          </div>
        ))}
      </BlurFade>

      <BlurFade delay={0.15} inView className="grid grid-cols-2 md:grid-cols-4 py-24 max-w-screen-lg mx-auto w-full">
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
    </BlurFade>
  );
}

const Puzzle = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
      <g clipPath="url(#clip0_123_13314)">
        <path d="M9.37285 2.76922C10.1935 3.57073 10.6814 4.65238 10.7392 5.79802L14.9067 1.65334C15.0498 1.49288 15.2253 1.36448 15.4215 1.27656C15.6177 1.18864 15.8303 1.14319 16.0454 1.14319C16.2604 1.14319 16.473 1.18864 16.6692 1.27656C16.8654 1.36448 17.0409 1.49288 17.184 1.65334L20.5544 5.16038C20.0757 5.39251 19.6374 5.70008 19.2563 6.0713C18.4452 6.96333 18.0086 8.13338 18.0373 9.33871C18.0659 10.544 18.5574 11.6921 19.41 12.5446C20.2625 13.3972 21.4105 13.8887 22.6159 13.9173C23.8213 13.9459 24.9913 13.5094 25.8832 12.6982C26.2544 12.3172 26.5621 11.8789 26.7941 11.4002L30.3468 14.9072C30.5072 15.0504 30.6357 15.2258 30.7237 15.422C30.8115 15.6183 30.8569 15.8308 30.8569 16.0459C30.8569 16.2609 30.8115 16.4735 30.7237 16.6697C30.6357 16.866 30.5072 17.0414 30.3468 17.1845L26.2021 21.2609C27.0997 21.3152 27.9628 21.6276 28.6871 22.1606C29.4115 22.6936 29.9664 23.4246 30.2853 24.2652C30.6044 25.1062 30.6736 26.0214 30.4848 26.9007C30.296 27.78 29.8574 28.5859 29.2215 29.222C28.5854 29.8579 27.7795 30.2966 26.9001 30.4854C26.0208 30.6742 25.1056 30.6049 24.2647 30.2858C23.424 29.967 22.6931 29.412 22.16 28.6876C21.6271 27.9633 21.3147 27.1002 21.2604 26.2026L17.0929 30.3473C16.9498 30.5078 16.7743 30.6362 16.5781 30.7242C16.3819 30.812 16.1693 30.8575 15.9542 30.8575C15.7392 30.8575 15.5266 30.812 15.3304 30.7242C15.1342 30.6362 14.9587 30.5078 14.8156 30.3473L11.4452 26.8403C11.9239 26.6081 12.3622 26.3007 12.7432 25.9292C13.622 25.0444 14.1134 23.847 14.1091 22.5998C14.1048 21.3527 13.6053 20.1584 12.7205 19.2796C11.8357 18.4009 10.638 17.9096 9.39091 17.9138C8.14384 17.9181 6.94956 18.4176 6.07077 19.3024C5.69955 19.6835 5.39198 20.1218 5.15984 20.6005L1.65281 17.0934C1.49234 16.9503 1.36394 16.7749 1.27602 16.5786C1.1881 16.3824 1.14265 16.1698 1.14265 15.9548C1.14265 15.7398 1.1881 15.5272 1.27602 15.3309C1.36394 15.1347 1.49234 14.9593 1.65281 14.8161L5.79749 10.7398C4.65184 10.682 3.5702 10.194 2.76869 9.37338C1.89292 8.49761 1.40092 7.30982 1.40092 6.0713C1.40092 4.83279 1.89292 3.64499 2.76869 2.76922C3.64446 1.89345 4.83225 1.40145 6.07077 1.40145C7.30928 1.40145 8.49708 1.89345 9.37285 2.76922Z" fill="url(#paint0_linear_123_13314)"/>
        <path d="M9.37285 2.76922C10.1935 3.57073 10.6814 4.65238 10.7392 5.79802L14.9067 1.65334C15.0498 1.49288 15.2253 1.36448 15.4215 1.27656C15.6177 1.18864 15.8303 1.14319 16.0454 1.14319C16.2604 1.14319 16.473 1.18864 16.6692 1.27656C16.8654 1.36448 17.0409 1.49288 17.184 1.65334L20.5544 5.16038C20.0757 5.39251 19.6374 5.70008 19.2563 6.0713C18.4452 6.96333 18.0086 8.13338 18.0373 9.33871C18.0659 10.544 18.5574 11.6921 19.41 12.5446C20.2625 13.3972 21.4105 13.8887 22.6159 13.9173C23.8213 13.9459 24.9913 13.5094 25.8832 12.6982C26.2544 12.3172 26.5621 11.8789 26.7941 11.4002L30.3468 14.9072C30.5072 15.0504 30.6357 15.2258 30.7237 15.422C30.8115 15.6183 30.8569 15.8308 30.8569 16.0459C30.8569 16.2609 30.8115 16.4735 30.7237 16.6697C30.6357 16.866 30.5072 17.0414 30.3468 17.1845L26.2021 21.2609C27.0997 21.3152 27.9628 21.6276 28.6871 22.1606C29.4115 22.6936 29.9664 23.4246 30.2853 24.2652C30.6044 25.1062 30.6736 26.0214 30.4848 26.9007C30.296 27.78 29.8574 28.5859 29.2215 29.222C28.5854 29.8579 27.7795 30.2966 26.9001 30.4854C26.0208 30.6742 25.1056 30.6049 24.2647 30.2858C23.424 29.967 22.6931 29.412 22.16 28.6876C21.6271 27.9633 21.3147 27.1002 21.2604 26.2026L17.0929 30.3473C16.9498 30.5078 16.7743 30.6362 16.5781 30.7242C16.3819 30.812 16.1693 30.8575 15.9542 30.8575C15.7392 30.8575 15.5266 30.812 15.3304 30.7242C15.1342 30.6362 14.9587 30.5078 14.8156 30.3473L11.4452 26.8403C11.9239 26.6081 12.3622 26.3007 12.7432 25.9292C13.622 25.0444 14.1134 23.847 14.1091 22.5998C14.1048 21.3527 13.6053 20.1584 12.7205 19.2796C11.8357 18.4009 10.638 17.9096 9.39091 17.9138C8.14384 17.9181 6.94956 18.4176 6.07077 19.3024C5.69955 19.6835 5.39198 20.1218 5.15984 20.6005L1.65281 17.0934C1.49234 16.9503 1.36394 16.7749 1.27602 16.5786C1.1881 16.3824 1.14265 16.1698 1.14265 15.9548C1.14265 15.7398 1.1881 15.5272 1.27602 15.3309C1.36394 15.1347 1.49234 14.9593 1.65281 14.8161L5.79749 10.7398C4.65184 10.682 3.5702 10.194 2.76869 9.37338C1.89292 8.49761 1.40092 7.30982 1.40092 6.0713C1.40092 4.83279 1.89292 3.64499 2.76869 2.76922C3.64446 1.89345 4.83225 1.40145 6.07077 1.40145C7.30928 1.40145 8.49708 1.89345 9.37285 2.76922Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </g>
      <defs>
        <linearGradient id="paint0_linear_123_13314" x1="15.9998" y1="1.14319" x2="15.9998" y2="30.8575" gradientUnits="userSpaceOnUse">
          <stop/>
          <stop offset="1" stopColor="#737373"/>
        </linearGradient>
        <clipPath id="clip0_123_13314">
          <rect width="32" height="32" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  )
}

const TechFounder = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="33" height="32" viewBox="0 0 33 32" fill="none">
      <g clipPath="url(#clip0_123_13323)">
        <path d="M12.2693 28.8797L14.5093 23.2797H18.9893L21.2293 28.8797H12.2693Z" fill="black"/>
        <path d="M30.1897 3.12012H3.30973C2.69121 3.12012 2.18973 3.6216 2.18973 4.24012V22.1601C2.18973 22.7786 2.69121 23.2801 3.30973 23.2801H30.1897C30.8082 23.2801 31.3097 22.7786 31.3097 22.1601V4.24012C31.3097 3.6216 30.8082 3.12012 30.1897 3.12012Z" fill="url(#paint0_linear_123_13323)"/>
        <path d="M30.1897 3.12012H3.30973C2.69121 3.12012 2.18973 3.6216 2.18973 4.24012V22.1601C2.18973 22.7786 2.69121 23.2801 3.30973 23.2801H30.1897C30.8082 23.2801 31.3097 22.7786 31.3097 22.1601V4.24012C31.3097 3.6216 30.8082 3.12012 30.1897 3.12012Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14.5093 23.2797L12.2693 28.8797" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18.9897 23.2797L21.2297 28.8797" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10.0294 28.8801H23.4694" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M11.1497 10.4003L7.22971 13.7603L10.5897 16.5603" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M22.9097 10.9606L26.2697 13.7606L22.3497 17.1206" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M15.0695 18.2403L18.4296 8.16028" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </g>
      <defs>
        <linearGradient id="paint0_linear_123_13323" x1="16.7497" y1="3.12012" x2="16.7497" y2="23.2801" gradientUnits="userSpaceOnUse">
          <stop/>
          <stop offset="1" stopColor="#737373"/>
        </linearGradient>
        <clipPath id="clip0_123_13323">
          <rect width="32" height="32" fill="white" transform="translate(0.75)"/>
        </clipPath>
      </defs>
    </svg>
  )
}

const Brain = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="33" height="32" viewBox="0 0 33 32" fill="none">
      <path d="M28.3823 22.483L28.1563 22.7258L28.1839 23.0564C28.1966 23.2082 28.203 23.3618 28.203 23.5172C28.203 26.5416 25.7512 28.9935 22.7266 28.9935C19.7021 28.9935 17.2502 26.5416 17.2502 23.5172L17.2501 8.72767C17.2501 6.13729 19.35 4.03735 21.9404 4.03735C24.5308 4.03735 26.6307 6.13728 26.6307 8.72767C26.6307 8.89997 26.6214 9.06999 26.6034 9.23734L26.5498 9.73665L26.9911 9.97641C28.8617 10.9929 30.2947 13.7022 30.2947 16.6068C30.2947 17.6595 30.1041 18.8309 29.7599 19.9007C29.4131 20.9789 28.929 21.8957 28.3823 22.483Z" fill="url(#paint0_linear_123_13339)" stroke="white" strokeWidth="1.5"/>
      <path d="M4.81552 23.0562L4.84301 22.7257L4.61708 22.483C4.07036 21.8957 3.5863 20.9789 3.23939 19.9007C2.89519 18.8308 2.70465 17.6595 2.70465 16.6068C2.70465 13.7022 4.13776 10.9929 6.00842 9.97641L6.44989 9.73653L6.39602 9.23699C6.378 9.06993 6.36873 8.90002 6.36873 8.72767C6.36873 6.13729 8.46867 4.03735 11.0591 4.03735C13.6494 4.03735 15.7494 6.13729 15.7494 8.72767L15.7492 23.5172C15.7492 26.5416 13.2974 28.9935 10.2728 28.9935C7.24827 28.9935 4.79641 26.5416 4.79641 23.5172C4.79641 23.3618 4.80288 23.2082 4.81552 23.0562Z" fill="url(#paint1_linear_123_13339)" stroke="white" strokeWidth="1.5"/>
      <path d="M11.0591 3.28735C14.0636 3.28735 16.4994 5.72308 16.4994 8.72767L16.4992 23.5172C16.4992 26.9559 13.7116 29.7435 10.2728 29.7435C6.83407 29.7435 4.04641 26.9559 4.04641 23.5172C4.04641 23.341 4.05375 23.1666 4.0681 22.994C2.77226 21.6019 1.95465 18.8789 1.95465 16.6068C1.95465 13.5108 3.47272 10.5007 5.65034 9.31741C5.62945 9.1237 5.61873 8.92694 5.61873 8.72767C5.61873 5.72308 8.05446 3.28735 11.0591 3.28735Z" fill="url(#paint2_linear_123_13339)" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8.52521 13.015C7.7264 12.8329 5.91625 11.6458 5.64313 9.33142L8.52521 13.015Z" fill="url(#paint3_linear_123_13339)"/>
      <path d="M8.52521 13.015C7.7264 12.8329 5.91625 11.6458 5.64313 9.33142" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11.86 19.1195C15.1229 18.7553 16.4159 15.3119 16.5 13.9113L11.86 19.1195Z" fill="url(#paint4_linear_123_13339)"/>
      <path d="M11.86 19.1195C15.1229 18.7553 16.4159 15.3119 16.5 13.9113" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5.73313 19.7302C4.92042 20.3719 4.27244 21.8262 4.0625 22.9911L5.73313 19.7302Z" fill="url(#paint5_linear_123_13339)"/>
      <path d="M5.73313 19.7302C4.92042 20.3719 4.27244 21.8262 4.0625 22.9911" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21.9404 3.28735C18.9358 3.28735 16.5001 5.72308 16.5001 8.72767L16.5002 23.5172C16.5002 26.9559 19.2879 29.7435 22.7266 29.7435C26.1654 29.7435 28.953 26.9559 28.953 23.5172C28.953 23.341 28.9457 23.1666 28.9313 22.994C30.2271 21.6019 31.0447 18.8789 31.0447 16.6068C31.0447 13.5108 29.5267 10.5007 27.3491 9.31741C27.3699 9.1237 27.3807 8.92694 27.3807 8.72767C27.3807 5.72308 24.945 3.28735 21.9404 3.28735Z" fill="url(#paint6_linear_123_13339)" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M24.4742 13.015C25.273 12.8329 27.0831 11.6458 27.3562 9.33142L24.4742 13.015Z" fill="url(#paint7_linear_123_13339)"/>
      <path d="M24.4742 13.015C25.273 12.8329 27.0831 11.6458 27.3562 9.33142" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21.1393 19.1195C17.8765 18.7553 16.5835 15.3119 16.4994 13.9113L21.1393 19.1195Z" fill="url(#paint8_linear_123_13339)"/>
      <path d="M21.1393 19.1195C17.8765 18.7553 16.5835 15.3119 16.4994 13.9113" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M27.2664 19.7302C28.079 20.3719 28.727 21.8262 28.937 22.9911L27.2664 19.7302Z" fill="url(#paint9_linear_123_13339)"/>
      <path d="M27.2664 19.7302C28.079 20.3719 28.727 21.8262 28.937 22.9911" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <defs>
        <linearGradient id="paint0_linear_123_13339" x1="23.7724" y1="3.28735" x2="23.7724" y2="29.7435" gradientUnits="userSpaceOnUse">
          <stop/>
          <stop offset="1" stopColor="#737373"/>
        </linearGradient>
        <linearGradient id="paint1_linear_123_13339" x1="9.22701" y1="3.28735" x2="9.22701" y2="29.7435" gradientUnits="userSpaceOnUse">
          <stop/>
          <stop offset="1" stopColor="#737373"/>
        </linearGradient>
        <linearGradient id="paint2_linear_123_13339" x1="9.22701" y1="3.28735" x2="9.22701" y2="29.7435" gradientUnits="userSpaceOnUse">
          <stop/>
          <stop offset="1" stopColor="#737373"/>
        </linearGradient>
        <linearGradient id="paint3_linear_123_13339" x1="7.08417" y1="9.33142" x2="7.08417" y2="13.015" gradientUnits="userSpaceOnUse">
          <stop/>
          <stop offset="1" stopColor="#737373"/>
        </linearGradient>
        <linearGradient id="paint4_linear_123_13339" x1="14.18" y1="13.9113" x2="14.18" y2="19.1195" gradientUnits="userSpaceOnUse">
          <stop/>
          <stop offset="1" stopColor="#737373"/>
        </linearGradient>
        <linearGradient id="paint5_linear_123_13339" x1="4.89781" y1="19.7302" x2="4.89781" y2="22.9911" gradientUnits="userSpaceOnUse">
          <stop/>
          <stop offset="1" stopColor="#737373"/>
        </linearGradient>
        <linearGradient id="paint6_linear_123_13339" x1="23.7724" y1="3.28735" x2="23.7724" y2="29.7435" gradientUnits="userSpaceOnUse">
          <stop/>
          <stop offset="1" stopColor="#737373"/>
        </linearGradient>
        <linearGradient id="paint7_linear_123_13339" x1="25.9152" y1="9.33142" x2="25.9152" y2="13.015" gradientUnits="userSpaceOnUse">
          <stop/>
          <stop offset="1" stopColor="#737373"/>
        </linearGradient>
        <linearGradient id="paint8_linear_123_13339" x1="18.8194" y1="13.9113" x2="18.8194" y2="19.1195" gradientUnits="userSpaceOnUse">
          <stop/>
          <stop offset="1" stopColor="#737373"/>
        </linearGradient>
        <linearGradient id="paint9_linear_123_13339" x1="28.1017" y1="19.7302" x2="28.1017" y2="22.9911" gradientUnits="userSpaceOnUse">
          <stop/>
          <stop offset="1" stopColor="#737373"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

const World = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="33" height="32" viewBox="0 0 33 32" fill="none">
      <g clipPath="url(#clip0_123_13356)">
        <path fillRule="evenodd" clipRule="evenodd" d="M25.3933 27.7123C22.8722 29.6833 19.6985 30.8579 16.2504 30.8579C10.0699 30.8579 4.77084 27.084 2.53186 21.7149H6.53612C7.59698 21.7149 8.6144 21.2935 9.36453 20.5433C10.1147 19.7932 10.5361 18.7758 10.5361 17.7149V14.2863C10.5361 13.2255 10.9575 12.2081 11.7077 11.4579C12.4578 10.7078 13.4752 10.2863 14.5361 10.2863C15.597 10.2863 16.6144 9.86493 17.3645 9.11478C18.1147 8.36463 18.5361 7.34721 18.5361 6.28634V1.31836C25.583 2.40646 30.9949 8.44623 31.1057 15.7713C29.9619 15.1781 28.6934 14.865 27.4047 14.8579H22.5361C21.4752 14.8579 20.4578 15.2793 19.7077 16.0295C18.9575 16.7796 18.5361 17.797 18.5361 18.8579C18.5361 19.9188 18.9575 20.9362 19.7077 21.6863C20.4578 22.4365 21.4752 22.8579 22.5361 22.8579C23.2938 22.8579 24.0207 23.1589 24.5565 23.6947C25.0922 24.2305 25.3933 24.9573 25.3933 25.7151V27.7123Z" fill="url(#paint0_linear_123_13356)"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M1.39319 16.0003C1.39319 7.79496 8.04496 1.14319 16.2503 1.14319C17.0276 1.14319 17.791 1.20288 18.536 1.31793V6.28593C18.536 7.3468 18.1146 8.36419 17.3645 9.11434C16.6143 9.86449 15.5969 10.2859 14.536 10.2859C13.4752 10.2859 12.4578 10.7073 11.7076 11.4575C10.9575 12.2076 10.536 13.2251 10.536 14.2859V17.7145C10.536 18.7754 10.1146 19.7928 9.36448 20.5429C8.61433 21.2931 7.59691 21.7145 6.53605 21.7145H2.5318C1.79826 19.9555 1.39319 18.0252 1.39319 16.0003ZM31.1075 15.7718C29.963 15.178 28.694 14.8646 27.4046 14.8575H22.536C21.4752 14.8575 20.4578 15.2789 19.7076 16.029C18.9575 16.7792 18.536 17.7966 18.536 18.8575C18.536 19.9183 18.9575 20.9358 19.7076 21.6859C20.4578 22.4361 21.4752 22.8575 22.536 22.8575C23.2938 22.8575 24.0206 23.1585 24.5564 23.6943C25.0922 24.23 25.3932 24.9569 25.3932 25.7146V27.7119C28.8716 24.9928 31.1075 20.7576 31.1075 16.0003V15.7718Z" fill="black"/>
        <path d="M16.2503 30.8575C24.4558 30.8575 31.1075 24.2058 31.1075 16.0003C31.1075 7.79496 24.4558 1.14319 16.2503 1.14319C8.04496 1.14319 1.39319 7.79496 1.39319 16.0003C1.39319 24.2058 8.04496 30.8575 16.2503 30.8575Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2.53607 21.7142H6.53607C7.59694 21.7142 8.61436 21.2927 9.36451 20.5426C10.1147 19.7925 10.5361 18.775 10.5361 17.7142V14.2856C10.5361 13.2247 10.9575 12.2073 11.7076 11.4572C12.4578 10.707 13.4752 10.2856 14.5361 10.2856C15.5969 10.2856 16.6144 9.86416 17.3645 9.11401C18.1147 8.36388 18.5361 7.34647 18.5361 6.2856V1.30273" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M31.1075 15.7717C29.963 15.1779 28.694 14.8645 27.4046 14.8574H22.5361C21.4752 14.8574 20.4578 15.2788 19.7076 16.029C18.9575 16.7791 18.5361 17.7966 18.5361 18.8574C18.5361 19.9183 18.9575 20.9357 19.7076 21.6859C20.4578 22.4361 21.4752 22.8575 22.5361 22.8575C23.2938 22.8575 24.0206 23.1585 24.5564 23.6942C25.0922 24.23 25.3932 24.9568 25.3932 25.7146V27.7031" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </g>
      <defs>
        <linearGradient id="paint0_linear_123_13356" x1="16.8188" y1="1.31836" x2="16.8188" y2="30.8579" gradientUnits="userSpaceOnUse">
          <stop/>
          <stop offset="1" stopColor="#737373"/>
        </linearGradient>
        <clipPath id="clip0_123_13356">
          <rect width="32" height="32" fill="white" transform="translate(0.25)"/>
        </clipPath>
      </defs>
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
