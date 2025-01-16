import { X } from "lucide-react";

export default function FrameOverlay() {
  return (
    <div className="mx-1.5 md:mx-auto max-w-screen-xl md:py-2 absolute flex flex-col justify-between inset-0 z-20">
      <hr className="absolute inset-y-0 w-px h-full bg-neutral-700 border-0" />
      <hr className="absolute inset-y-0 right-0 w-px h-full bg-neutral-700 border-0" />
      <div className="relative flex w-full justify-between">
        <X className="-translate-x-1/2 size-4 rotate-45 stroke-1 z-10"></X>
        <hr className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-screen h-px bg-neutral-700 border-0" />
        <X className="translate-x-1/2 size-4 rotate-45 stroke-1 z-10" />
      </div>
      <div className="relative flex w-full justify-between">
        <X className="-translate-x-1/2 size-4 rotate-45 stroke-1 z-10" />
        <hr className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-screen h-px bg-neutral-700 border-0" />
        <X className="translate-x-1/2 size-4 rotate-45 stroke-1 z-10" />
      </div>
    </div>
  );
}
