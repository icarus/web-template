"use client";

import React, { useRef, useState } from "react";
import { FinalModel } from "./final-model";
import { Slider } from "../components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import GIF from 'gif.js';

interface GifRecorderProps {
  modelPath: string;
  colors?: string[];
  durationMs?: number;
}

export function GifRecorder({ modelPath, colors, durationMs = 4000 }: GifRecorderProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gifUrl, setGifUrl] = useState<string>("");
  const [recording, setRecording] = useState<boolean>(false);
  const [forcedRotationAngle, setForcedRotationAngle] = useState<number | undefined>(undefined);

  const [rotationSpeed, setRotationSpeed] = useState(0.0025);
  const [pixelSize, setPixelSize] = useState(1.5);
  const [gapRatio, setGapRatio] = useState(2.0);
  const [customResolution, setCustomResolution] = useState(512);
  const [colorsPreset, setColorsPreset] = useState<"default" | "grayscale">("default");

  const defaultColors = ["#9C6323", "#F9A341", "#FFEC40"];
  const grayscaleColors = ["#121212", "#777777", "#BBBBBB"];
  const computedColors = colors || (colorsPreset === "grayscale" ? grayscaleColors : defaultColors);

  const recordGif = () => {
    if (!canvasRef.current) return;
    setRecording(true);
    const startTime = Date.now();

    const rect = canvasRef.current.getBoundingClientRect();
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height);

    const gif = new GIF({
      workers: 2,
      quality: 30,
      workerScript: '/gif.worker.js',
      width,
      height
    });

    const captureFrame = () => {
      if (!canvasRef.current) return;
      const elapsed = Date.now() - startTime;
      console.log('Capture frame at elapsed (ms):', elapsed);
      const progress = Math.min(elapsed / durationMs, 1);
      setForcedRotationAngle(progress * 2 * Math.PI);

      // Add current canvas frame with a 100ms delay
      gif.addFrame(canvasRef.current, { copy: true, delay: 100 });

      if (elapsed < durationMs) {
        setTimeout(captureFrame, 100);
      } else {
        console.log('Finished capturing frames. Rendering GIF.');
        // Log total frames added (if available via the internal frames array)
        // (gif as any).frames may contain the frames, so we log that

        gif.on('progress', (p: number) => {
          console.log('GIF rendering progress:', p);
        });
        gif.on('finished', (blob: Blob) => {
          const url = URL.createObjectURL(blob);
          console.log('GIF rendering finished. Blob URL:', url);
          setGifUrl(url);
          setForcedRotationAngle(undefined);
          setRecording(false);
        });
        gif.on('error', (err: Error) => {
          console.error('GIF rendering error:', err);
        });
        console.log('Calling gif.render() now.');
        gif.render();
        // If rendering takes too long, log an error after 30 seconds
        setTimeout(() => {
          console.error('GIF rendering is taking too long.');
        }, 30000);
        console.warn('Note: gif.js may not work properly in Next.js development mode with Fast Refresh. Please try a production build.');
      }
    };

    captureFrame();
  };

  const handleReset = () => {
    setRotationSpeed(0.0025);
    setPixelSize(1.5);
    setGapRatio(2.0);
    setCustomResolution(512);
    setColorsPreset("default");
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <Button
        variant="link"
        className="absolute top-4 left-4 decoration-neutral-600 [&_svg]:text-neutral-500 hover:decoration-white underline uppercase font-mono px-0"
        asChild
      >
        <Link href="/">
          <ArrowLeft />
          Volver
        </Link>
      </Button>
      <div className="flex flex-col gap-8 absolute top-4 right-4 z-20 bg-white/5 backdrop-blur-sm p-4 rounded-lg">
        <Button
          onClick={recordGif}
          disabled={recording}
          variant="white"
          size="sm"
          className="disabled:opacity-100 md:group font-mono uppercase pl-2.5 pr-2 gap-1 transition-colors"
        >
          {recording && (
            <div className="relative mr-1 size-1 flex items-center justify-center">
              <span className="size-1.5 animate-ping bg-red-500 aspect-square" />
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-1 bg-red-500 aspect-square" />
            </div>
          )}
          {recording ? "Grabando..." : "Grabar GIF"}
        </Button>
        {gifUrl && (
          <Button variant="outline" size="sm" className="-mt-6 disabled:opacity-100 md:group font-mono uppercase border-neutral-800 pl-2.5 pr-2 gap-1 hover:bg-white/10 transition-colors" asChild>
            <Link href={gifUrl} download="rotation.gif" target="_blank" rel="noopener noreferrer">
              Descargar GIF
            </Link>
          </Button>
        )}
        <div className="flex flex-col gap-4">
          <label>Velocidad de rotación {rotationSpeed.toFixed(4)}</label>
          <Slider value={[rotationSpeed]} min={0} max={0.02} step={0.0005} onValueChange={(val) => setRotationSpeed(val[0])} />
        </div>
        <div className="flex flex-col gap-4">
          <label>Tamaño de pixel {pixelSize.toFixed(2)}</label>
          <Slider value={[pixelSize]} min={0.5} max={5} step={0.1} onValueChange={(val) => setPixelSize(val[0])} />
        </div>
        <div className="flex flex-col gap-4">
          <label>Ratio del espaciado {gapRatio.toFixed(2)}</label>
          <Slider value={[gapRatio]} min={1} max={5} step={0.1} onValueChange={(val) => setGapRatio(val[0])} />
        </div>
        <div className="flex flex-col gap-4">
          <label>Resolución {customResolution}</label>
          <Slider value={[customResolution]} min={256} max={1024} step={64} onValueChange={(val) => setCustomResolution(val[0])} />
        </div>
        <div className="flex flex-col gap-2">
          <label>Colores</label>
          <Tabs
            value={colorsPreset}
            onValueChange={(value) => setColorsPreset(value as "default" | "grayscale")}
            className="w-full bg-white/10 rounded-full flex items-center"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="default">Normal</TabsTrigger>
              <TabsTrigger value="grayscale">Escala de grises</TabsTrigger>
            </TabsList>
            <TabsContent value="default" />
            <TabsContent value="grayscale" />
          </Tabs>
        </div>
        <Button className="uppercase font-mono text-sm" onClick={handleReset}>
          Resettear
        </Button>
      </div>

      {/* Render the FinalModel and pass down the canvasRef and new parameters */}
      <FinalModel
        modelPath={modelPath}
        colors={computedColors}
        canvasRef={canvasRef}
        rotationSpeed={rotationSpeed}
        pixelSize={pixelSize}
        gapRatio={gapRatio}
        customResolution={customResolution}
        forcedRotationAngle={forcedRotationAngle}
      />
    </div>
  );
}
