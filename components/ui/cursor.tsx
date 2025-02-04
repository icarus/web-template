"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function Cursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);
  const [isInactive, setIsInactive] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      * {
        cursor: none !important;
      }
    `;
    document.head.appendChild(style);

    let inactivityTimer: NodeJS.Timeout;

    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      setIsInactive(false);
      inactivityTimer = setTimeout(() => {
        setIsInactive(true);
      }, 5000);
    };

    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      resetInactivityTimer();

      let isPointerActive = false;
      if (e.target instanceof Element) {
        const computedCursor = window.getComputedStyle(e.target).cursor;
        isPointerActive =
          computedCursor === "pointer" ||
          e.target.tagName === "BUTTON" ||
          e.target.tagName === "A" ||
          e.target.closest("button") !== null ||
          e.target.closest("a") !== null;
      }
      setIsPointer(isPointerActive);
    };

    const handleMouseDown = () => setIsMouseDown(true);
    const handleMouseUp = () => setIsMouseDown(false);

    window.addEventListener("mousemove", updateMousePosition);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    // Start the initial inactivity timer
    resetInactivityTimer();

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.head.removeChild(style);
      clearTimeout(inactivityTimer);
    };
  }, []);

  return (
    <motion.div
      className="hidden md:block fixed top-0 left-0 pointer-events-none z-[999] mix-blend-difference"
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
          width: isPointer || isInactive || isMouseDown ? 20 : 32,
          height: isPointer || isInactive || isMouseDown ? 20 : 32,
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
