import React, { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

const anim = {
  initial: {
    opacity: 1,
  },
  open: (i: number) => ({
    opacity: 0,
    transition: { duration: 0, delay: 0.03 * i },
  }),
  closed: (i: number) => ({
    opacity: 1,
    transition: { duration: 0, delay: 0.03 * i },
  }),
};

const shuffle = (a: number[]) => {
  let j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
};

const PixelTransition: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const controls = useAnimation();

  const getBlocks = () => {
    const { innerWidth, innerHeight } = window;
    const blockSize = innerWidth * 0.05;
    const nbOfBlocks = Math.ceil(innerHeight / blockSize);
    const shuffledIndexes = shuffle([...Array(nbOfBlocks)].map((_, i) => i));
    return shuffledIndexes.map((randomIndex, index) => (
      <motion.div
        key={index}
        className="w-full h-[10vw] bg-yellow-300"
        variants={anim}
        initial="initial"
        animate="open"
        custom={randomIndex}
      />
    ));
  };

  useEffect(() => {
    const handleAnimationComplete = async () => {
      await controls.start("closed");
      setIsVisible(false);
    };

    controls.start("open").then(() => {
      const totalDuration = 0.03 * 15;
      setTimeout(handleAnimationComplete, totalDuration * 1000);
    });
  }, [controls]);

  if (!isVisible) return null;

  return (
    <motion.div
      className="flex h-screen overflow-hidden absolute z-[999] pointer-events-none bg-transparent"
      animate={controls}
      initial="initial"
    >
      {[...Array(10)].map((_, index) => (
        <div key={index} className="w-[10vw] h-full flex flex-col">
          {getBlocks()}
        </div>
      ))}
    </motion.div>
  );
};

export default PixelTransition;
