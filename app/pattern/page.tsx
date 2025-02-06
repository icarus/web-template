"use client";
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import React from 'react';

interface PixelPageProps {
  totalPixels?: number;
  hiddenSide?: 'left' | 'right' | 'top' | 'bottom';
}

const PixelPage: React.FC<PixelPageProps> = ({ hiddenSide = 'right' }) => {
  const [copied, setCopied] = React.useState(false);
  const [numRows, setNumRows] = React.useState(20);
  const [numCols, setNumCols] = React.useState(20);
  const [containerWidth, ] = React.useState(500);

  // Calculate container height based on the ratio of rows to columns
  const containerHeight = React.useMemo(() => {
    return containerWidth * (numRows / numCols);
  }, [containerWidth, numRows, numCols]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const colorProbabilities = {
    "#9C6323": 0.1, // 20% chance of brown
    "#F9A341": 0.3, // 20% chance of orange
    "#FFEC40": 0.6  // 20% chance of yellow
  };

  const pixelSize = 20;
  const gapSize = pixelSize * 4;

  const randomPixels = React.useMemo(() =>
    Array.from({ length: numRows * numCols }, (_, index) => {
      const row = Math.floor(index / numCols);
      const col = index % numCols;

      // Calculate progressive hiding probability based on position
      let hideChance = 0;
      if (hiddenSide === 'left') {
        hideChance = 1 - (col / (numCols / 2)); // 100% at left edge, 0% at middle
      } else if (hiddenSide === 'right') {
        hideChance = (col - numCols / 2) / (numCols / 2); // 0% at middle, 100% at right edge
      } else if (hiddenSide === 'top') {
        hideChance = 1 - (row / (numRows / 2)); // 100% at top edge, 0% at middle
      } else if (hiddenSide === 'bottom') {
        hideChance = (row - numRows / 2) / (numRows / 2); // 0% at middle, 100% at bottom edge
      }

      // Only apply hiding chance to the specified side
      const isInHiddenSide = (
        (hiddenSide === 'left' && col < numCols / 2) ||
        (hiddenSide === 'right' && col >= numCols / 2) ||
        (hiddenSide === 'top' && row < numRows / 2) ||
        (hiddenSide === 'bottom' && row >= numRows / 2)
      );

      if (isInHiddenSide && Math.random() < hideChance) {
        return null;
      }

      // Apply color probabilities for visible pixels
      const rand = Math.random();
      if (rand < colorProbabilities["#9C6323"]) return "#9C6323";
      if (rand < colorProbabilities["#9C6323"] + colorProbabilities["#F9A341"]) return "#F9A341";
      return "#FFEC40";
    }),
    [numRows, numCols, hiddenSide, colorProbabilities]
  );

  const svgWidth = numCols * (pixelSize + gapSize);
  const svgHeight = numRows * (pixelSize + gapSize);

  const handleCopySVG = () => {
    const svgElement = document.querySelector('svg');
    if (svgElement) {
      const svgString = new XMLSerializer().serializeToString(svgElement);
      navigator.clipboard.writeText(svgString)
        .then(() => {
          setCopied(true);
          // Reset the button text after 2 seconds
          setTimeout(() => {
            setCopied(false);
          }, 2000);
        })
        .catch(err => {
          console.error('Failed to copy SVG:', err);
        });
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="absolute top-4 right-12 p-16 flex flex-col items-center gap-8">
        <div className="flex flex-col gap-4 w-64">
          <div className="space-y-2">
            <p className="text-sm font-medium">Number of Rows: {numRows}</p>
            <Slider
              value={[numRows]}
              onValueChange={(value) => setNumRows(value[0])}
              min={5}
              max={40}
              step={1}
            />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Number of Columns: {numCols}</p>
            <Slider
              value={[numCols]}
              onValueChange={(value) => setNumCols(value[0])}
              min={5}
              max={40}
              step={1}
            />
          </div>
          <Button
            onClick={handleCopySVG}
            className="mt-6 font-mono uppercase border-neutral-800 hover:bg-white/10 transition-colors"
          >
            {copied ? 'Copied!' : 'Copy SVG'}
          </Button>
        </div>
      </div>
      <div
        style={{
          width: containerWidth,
          height: containerHeight
        }}
        className="flex flex-col items-center justify-center gap-4"
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          preserveAspectRatio="xMidYMid meet"
          fill="none"
        >
          {Array.from({ length: numRows }, (_, rowIndex) => (
            Array.from({ length: numCols }, (_, colIndex) => {
              const index = rowIndex * numCols + colIndex;
              const fillColor = randomPixels[index] || 'transparent';
              return (
                <rect
                  key={`${rowIndex}-${colIndex}`}
                  x={colIndex * (pixelSize + gapSize)}
                  y={rowIndex * (pixelSize + gapSize)}
                  width={pixelSize}
                  height={pixelSize}
                  fill={fillColor}
                />
              );
            })
          ))}
        </svg>
      </div>
    </div>
  );
};

export default PixelPage;
