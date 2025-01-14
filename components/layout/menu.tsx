"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Menu() {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <Button
      className="group hover:bg-transparent [&_svg]:size-8"
      variant="ghost"
      size="icon"
      onClick={() => setOpen((prevState) => !prevState)}
      aria-expanded={open}
      aria-label={open ? "Close menu" : "Open menu"}
    >
      <svg
        className="pointer-events-none"
        width={48}
        height={16}
        viewBox="0 0 32 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4 6H20"
          className="origin-center transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:rotate-45"
        />
        <path
          d="M4 10H20"
          className="translate-y-0 origin-center transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:-translate-y-[8.5px] group-aria-expanded:-rotate-45"
        />
      </svg>
    </Button>
  );
}
