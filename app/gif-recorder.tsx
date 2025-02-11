"use client";

import React, { useRef, useState } from "react";
import { FinalModel } from "./final-model";
import { Slider } from "../components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import GIFEncoder from 'gif-encoder-2';

interface GifRecorderProps {
  modelPath: string;
  colors?: string[];
}

export function GifRecorder({ modelPath, colors }: GifRecorderProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [recording, setRecording] = useState(false);
  const [gifUrl, setGifUrl] = useState<string>("");
  const [forcedRotationAngle, setForcedRotationAngle] = useState<number | undefined>(undefined);

  // Controls state
  const [rotationSpeed, setRotationSpeed] = useState(0.0025);
  const [pixelSize, setPixelSize] = useState(2.0);
  const [gapRatio, setGapRatio] = useState(1.5);
  const [customResolution, setCustomResolution] = useState(448);
  const [colorsPreset, setColorsPreset] = useState<"default" | "grayscale">("default");

  const defaultColors = ["#A16207", "#F9A341", "#FFEC40"];
  const grayscaleColors = ["#121212", "#777777", "#BBBBBB"];
  const computedColors = colors || (colorsPreset === "grayscale" ? grayscaleColors : defaultColors);

  const recordGif = async () => {
    if (!canvasRef.current) return;
    setRecording(true);

    const canvas = canvasRef.current;
    const frames: ImageData[] = [];
    const frameCount = 24;

    // Create temporary canvas for correct color handling
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d')!;

    // Capture frames
    for (let i = 0; i < frameCount; i++) {
      const angle = (i / frameCount) * Math.PI * 2;
      setForcedRotationAngle(angle);

      // Wait for state update and render to complete
      await new Promise(resolve => {
        requestAnimationFrame(() => {
          setTimeout(() => {
            // Draw WebGL canvas to temp canvas to ensure correct color handling
            tempCtx.clearRect(0, 0, canvas.width, canvas.height);
            tempCtx.drawImage(canvas, 0, 0);
            frames.push(tempCtx.getImageData(0, 0, canvas.width, canvas.height));
            resolve(null);
          }, 100); // Increased delay to ensure render completes
        });
      });
    }

    // Create GIF with proper settings
    const encoder = new GIFEncoder(canvas.width, canvas.height);
    encoder.setDelay(50); // 50ms between frames = 20fps
    encoder.setQuality(1); // Best quality
    encoder.setRepeat(0); // Loop forever
    encoder.start();

    // Add frames to GIF
    frames.forEach(frame => {
      encoder.addFrame(frame.data);
    });

    encoder.finish();

    // Create download URL
    const buffer = encoder.out.getData();
    const blob = new Blob([buffer], { type: 'image/gif' });
    const url = URL.createObjectURL(blob);

    setGifUrl(url);
    setForcedRotationAngle(undefined);
    setRecording(false);
  };

  const handleReset = () => {
    setRotationSpeed(0.0025);
    setPixelSize(2.0);
    setGapRatio(1.5);
    setCustomResolution(448);
    setColorsPreset("default");
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
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
            <a href={gifUrl} download="rotation.gif">
              Descargar GIF
            </a>
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
