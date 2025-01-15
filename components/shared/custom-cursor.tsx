"use client";

import React, { useEffect, useState } from "react";

const CustomCursor: React.FC = () => {
  const [cursorStyle, setCursorStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setCursorStyle({
        left: `${event.clientX}px`,
        top: `${event.clientY}px`,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div
      className="size-10 mix-blend-difference bg-white/0 rounded-full fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2"
      style={cursorStyle}
    />
  );
};

export default CustomCursor;
