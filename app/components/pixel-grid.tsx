import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import React from 'react';

interface PixelGridProps {
  totalPixels?: number;
  hiddenSide?: 'left' | 'right' | 'top' | 'bottom';
}

const PixelGrid: React.FC<PixelGridProps> = ({ hiddenSide: initialHiddenSide = 'right' }) => {
  const [copied, setCopied] = React.useState(false);
  const [numRows, setNumRows] = React.useState(20);
  const [numCols, setNumCols] = React.useState(20);
  const [containerWidth] = React.useState(500);
  const [containerHeight] = React.useState(500);
  const [hiddenSide, setHiddenSide] = React.useState<'left' | 'right' | 'top' | 'bottom'>(initialHiddenSide);
  const [randomSeed, setRandomSeed] = React.useState<number>();

  React.useEffect(() => {
    setRandomSeed(Math.random());
  }, []);

  const { pixelSize, gapSize } = React.useMemo(() => {
    const unitsPerCell = 5;
    const totalUnitsPerRow = (numCols * unitsPerCell) - 4;
    const totalUnitsPerCol = (numRows * unitsPerCell) - 4;

    const unitFromWidth = containerWidth / totalUnitsPerRow;
    const unitFromHeight = containerHeight / totalUnitsPerCol;
    const unit = Math.min(unitFromWidth, unitFromHeight);

    const finalPixelSize = Math.floor(unit);

    return {
      pixelSize: finalPixelSize,
      gapSize: finalPixelSize * 4
    };
  }, [containerWidth, containerHeight, numRows, numCols]);

  const gridWidth = (numCols * pixelSize) + ((numCols - 1) * gapSize) + (pixelSize * 2);
  const gridHeight = (numRows * pixelSize) + ((numRows - 1) * gapSize) + (pixelSize * 2);

  const offsetX = (containerWidth - gridWidth) / 2;
  const offsetY = (containerHeight - gridHeight) / 2;

  const randomPixels = React.useMemo(() => {
    if (typeof randomSeed === 'undefined') return [];

    const seededRandom = (seed: number) => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    return Array.from({ length: numRows * numCols }, (_, index) => {
      const row = Math.floor(index / numCols);
      const col = index % numCols;
      const random = seededRandom(index + randomSeed);

      let hideChance = 0;
      if (hiddenSide === 'left') {
        hideChance = 1 - (col / (numCols / 2));
      } else if (hiddenSide === 'right') {
        hideChance = (col - numCols / 2) / (numCols / 2);
      } else if (hiddenSide === 'top') {
        hideChance = 1 - (row / (numRows / 2));
      } else if (hiddenSide === 'bottom') {
        hideChance = (row - numRows / 2) / (numRows / 2);
      }

      const isInHiddenSide = (
        (hiddenSide === 'left' && col < numCols / 2) ||
        (hiddenSide === 'right' && col >= numCols / 2) ||
        (hiddenSide === 'top' && row < numRows / 2) ||
        (hiddenSide === 'bottom' && row >= numRows / 2)
      );

      if (isInHiddenSide && seededRandom(random * 1000) < hideChance) {
        return null;
      }

      const colorRand = seededRandom(random * 2000);
      if (colorRand < 0.1) return "#9C6323";
      if (colorRand < 0.4) return "#F9A341";
      return "#FFEC40";
    });
  }, [numRows, numCols, hiddenSide, randomSeed]);

  const handleCopySVG = () => {
    const svgElement = document.querySelector('svg');
    if (svgElement) {
      const svgString = new XMLSerializer().serializeToString(svgElement);
      navigator.clipboard.writeText(svgString)
        .then(() => {
          setCopied(true);
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
          <Tabs defaultValue={hiddenSide} onValueChange={(value) => setHiddenSide(value as typeof hiddenSide)}>
            <TabsList>
              <TabsTrigger value="left">Left</TabsTrigger>
              <TabsTrigger value="right">Right</TabsTrigger>
              <TabsTrigger value="top">Top</TabsTrigger>
              <TabsTrigger value="bottom">Bottom</TabsTrigger>
            </TabsList>
          </Tabs>

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
        className="flex rounded-lg border border-white/20"
        style={{
          width: containerWidth,
          height: containerHeight,
        }}
      >
        <svg
          className="w-full h-full"
          viewBox={`0 0 ${containerWidth} ${containerHeight}`}
          preserveAspectRatio="none"
        >
          {randomPixels.map((fillColor, index) => {
            const rowIndex = Math.floor(index / numCols);
            const colIndex = index % numCols;

            if (!fillColor) return null;

            return (
              <rect
                key={`${rowIndex}-${colIndex}`}
                x={offsetX + pixelSize + (colIndex * (pixelSize + gapSize))}
                y={offsetY + pixelSize + (rowIndex * (pixelSize + gapSize))}
                width={pixelSize}
                height={pixelSize}
                fill={fillColor}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default PixelGrid;
