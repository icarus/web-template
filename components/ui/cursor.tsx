"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function Cursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      * {
        cursor: none !important;
      }
    `;
    document.head.appendChild(style);

    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });

      const target = e.target as HTMLElement;
      setIsPointer(
        window.getComputedStyle(target).cursor === "pointer" ||
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.closest("button") !== null ||
        target.closest("a") !== null
      );
    };

    window.addEventListener("mousemove", updateMousePosition);
    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      document.head.removeChild(style);
    };
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[999] mix-blend-difference"
      animate={{
        x: mousePosition.x,
        y: mousePosition.y,
      }}
      transition={{
        duration: 0,
        ease: "linear"
      }}
    >
      <motion.div
        className="absolute -translate-x-1/2 -translate-y-1/2"
        animate={{
          width: isPointer ? 20 : 32,
          height: isPointer ? 20 : 32,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
        }}
      >
        <div className="absolute inset-0 aspect-square border border-white opacity-25" />
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 aspect-square bg-white size-1.5"
        />
      </motion.div>
    </motion.div>
  );
}
