'use client';

import { useState, useRef, ChangeEvent, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"

const ASCII_SETS = {
  standard: ' .:-=+*#%@',
  simple: ' .*#',
  blocks: ' ▖▚▜█',
  detailed: ' .`^",:;Il!i~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$'
};

type AsciiSet = keyof typeof ASCII_SETS;

const YELLOW_COLORS = ['rgb(253, 224, 71)', 'rgb(234, 179, 8)', 'rgb(133, 77, 14)']; // yellow-300, yellow-500, yellow-800

interface Settings {
  width: number;
  contrast: number;
  brightness: number;
  asciiSet: AsciiSet;
  colorScheme: 'white' | 'yellow';
  inverted: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  width: 96,
  contrast: 1,
  brightness: 1,
  asciiSet: 'standard',
  colorScheme: 'white',
  inverted: false
};

const calculateScale = (containerWidth: number, containerHeight: number, contentWidth: number, contentHeight: number) => {
  const scaleX = containerWidth / contentWidth;
  const scaleY = containerHeight / contentHeight;
  return Math.min(scaleX, scaleY) * 0.9;
};

const AsciiPage = () => {
  const [asciiArt, setAsciiArt] = useState<string>('');
  const [svgContent, setSvgContent] = useState<string>('');
  const [currentImage, setCurrentImage] = useState<HTMLImageElement | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [scale, setScale] = useState(0.9);
  const [copied, setCopied] = useState(false);
  const [colorSeed, setColorSeed] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !asciiArt) return;

    const updateScale = () => {
      const container = containerRef.current;
      if (!container) return;

      const lines = asciiArt.split('\n');
      const charWidth = 8 * (130 / settings.width); // Match fontSize calculation
      const lineHeight = charWidth * 1.15; // Match lineHeight

      const contentWidth = lines[0]?.length * charWidth || 0;
      const contentHeight = lines.length * lineHeight;

      const newScale = calculateScale(
        container.clientWidth - 48, // Subtract padding (p-6 = 24px * 2)
        container.clientHeight - 48,
        contentWidth,
        contentHeight
      );

      setScale(newScale);
    };

    const resizeObserver = new ResizeObserver(updateScale);
    resizeObserver.observe(containerRef.current);
    updateScale();

    return () => resizeObserver.disconnect();
  }, [asciiArt, settings.width]);

  const updateImage = () => {
    if (!currentImage) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const height = Math.floor((settings.width * currentImage.height) / (currentImage.width * 2));
    canvas.width = settings.width;
    canvas.height = height;

    ctx.drawImage(currentImage, 0, 0, settings.width, height);

    // Apply contrast and brightness
    const imageData = ctx.getImageData(0, 0, settings.width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      for (let j = 0; j < 3; j++) {
        let color = data[i + j];
        color = color * settings.brightness;
        color = ((color / 255 - 0.5) * settings.contrast + 0.5) * 255;
        data[i + j] = Math.max(0, Math.min(255, color));
      }
    }

    ctx.putImageData(imageData, 0, 0);
    const ascii = processImageData(imageData);
    setAsciiArt(ascii);

    const svg = convertAsciiToSvg(ascii);
    setSvgContent(svg);
  };

  const convertToAscii = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    const reader = new FileReader();

    reader.onload = () => {
      img.src = reader.result as string;
      img.onload = () => {
        setCurrentImage(img);
        // Call updateImage directly with the current settings
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const height = Math.floor((settings.width * img.height) / (img.width * 2));
        canvas.width = settings.width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, settings.width, height);

        const imageData = ctx.getImageData(0, 0, settings.width, height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          for (let j = 0; j < 3; j++) {
            let color = data[i + j];
            color = color * settings.brightness;
            color = ((color / 255 - 0.5) * settings.contrast + 0.5) * 255;
            data[i + j] = Math.max(0, Math.min(255, color));
          }
        }

        ctx.putImageData(imageData, 0, 0);
        const ascii = processImageData(imageData);
        setAsciiArt(ascii);

        const svg = convertAsciiToSvg(ascii);
        setSvgContent(svg);
      };
    };

    reader.readAsDataURL(file);
  };

  const processImageData = (imageData: ImageData): string => {
    const ascii = ASCII_SETS[settings.asciiSet];
    const asciiChars = settings.inverted ? ascii.split('').reverse().join('') : ascii;

    let result = '';
    const positions: number[] = [];

    // First pass: count non-space chars and store their positions
    for (let y = 0; y < imageData.height; y++) {
      for (let x = 0; x < imageData.width; x++) {
        const idx = (y * imageData.width + x) * 4;
        const r = imageData.data[idx];
        const g = imageData.data[idx + 1];
        const b = imageData.data[idx + 2];
        const a = imageData.data[idx + 3];

        // Skip transparent pixels
        if (a < 255) {
          continue;
        }

        const brightness = (r + g + b) / 3;
        const charIndex = Math.floor((brightness / 255) * (asciiChars.length - 1));
        if (asciiChars[charIndex] !== ' ') {
          positions.push(y * imageData.width + x);
        }
      }
    }

    // Generate new color seed with position mapping
    const newColorSeed = new Array(imageData.width * imageData.height).fill('white');
    positions.forEach(pos => {
      newColorSeed[pos] = YELLOW_COLORS[Math.floor(Math.random() * YELLOW_COLORS.length)];
    });
    setColorSeed(newColorSeed);

    // Generate ASCII art
    for (let y = 0; y < imageData.height; y++) {
      for (let x = 0; x < imageData.width; x++) {
        const idx = (y * imageData.width + x) * 4;
        const r = imageData.data[idx];
        const g = imageData.data[idx + 1];
        const b = imageData.data[idx + 2];
        const a = imageData.data[idx + 3];

        // Use space for transparent pixels
        if (a < 255) {
          result += ' ';
          continue;
        }

        const brightness = (r + g + b) / 3;
        const charIndex = Math.floor((brightness / 255) * (asciiChars.length - 1));
        result += asciiChars[charIndex];
      }
      result += '\n';
    }

    return result;
  };

  const convertAsciiToSvg = (ascii: string): string => {
    const lines = ascii.split('\n');
    const fontSize = 8 * (130 / settings.width);
    const lineHeight = fontSize * 1.15;
    const charWidth = fontSize * 0.575;

    const contentWidth = lines[0]?.length * charWidth;
    const contentHeight = lines.length * lineHeight;

    let svgText = '';

    lines.forEach((line, i) => {
      Array.from(line).forEach((char, j) => {
        if (char !== ' ') {
          const pos = i * settings.width + j;
          const color = settings.colorScheme === 'yellow' && char !== ' '
            ? colorSeed[pos]
            : 'white';

          svgText += `<text
            x="${j * charWidth}"
            y="${(i + 1) * lineHeight}"
            font-family="monospace"
            font-size="${fontSize}px"
            fill="${color}"
            style="white-space: pre; letter-spacing: 0"
          >${char}</text>`;
        }
      });
    });

    return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
      <svg width="${contentWidth}" height="${contentHeight}" viewBox="0 0 ${contentWidth} ${contentHeight}"
        xmlns="http://www.w3.org/2000/svg">
        <style>
          text {
            font-family: monospace;
            letter-spacing: 0;
          }
          @font-face {
            font-family: monospace;
            src: local("Courier New");
          }
        </style>
        ${svgText}
      </svg>`;
  };

  const downloadSvg = () => {
    if (!svgContent) return;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ascii-art.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    if (!svgContent) return;
    try {
      await navigator.clipboard.writeText(svgContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy SVG:', err);
    }
  };

  const handleSettingChange = (key: keyof Settings, value: number | AsciiSet | 'white' | 'yellow' | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));

    // If changing color scheme or inversion, regenerate SVG immediately
    if (key === 'colorScheme' || key === 'inverted') {
      // Need to wait for state update before regenerating SVG
      setTimeout(() => {
        const newSvg = convertAsciiToSvg(asciiArt);
        setSvgContent(newSvg);
      }, 0);
    }

    updateImage();
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    updateImage();
  };

  return (
    <main className="text-white container mx-auto px-4 pt-8 pb-32">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className={cn("rounded-lg border border-neutral-800 bg-neutral-900 p-6 shadow-sm")}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={convertToAscii}
            className={cn(
              "block w-full text-sm text-neutral-400",
              "file:mr-4 file:py-2 file:px-4",
              "file:rounded-md file:border-0",
              "file:text-sm file:font-medium",
              "file:bg-neutral-800 file:text-neutral-200",
              "hover:file:bg-neutral-700",
              "transition-colors"
            )}
          />
        </div>

        {currentImage && (
          <>
            <div className="space-y-6">
              <div
                ref={containerRef}
                className="rounded-lg border border-neutral-800 p-6 shadow-sm overflow-hidden h-[60vh] flex items-center justify-center"
              >
                <pre
                  className="font-mono whitespace-pre w-fit"
                  style={{
                    fontSize: `calc(${8 * (130 / settings.width)}px)`,
                    lineHeight: '1.15',
                    transform: `scale(${scale})`,
                    transformOrigin: 'center',
                    color: settings.colorScheme === 'yellow' ? 'rgb(253, 224, 71)' : 'white',
                  }}
                >
                  {asciiArt.split('\n').map((line, i) => (
                    <div key={i}>
                      {Array.from(line).map((char, j) => {
                        const pos = i * settings.width + j;
                        return (
                          <span
                            key={`${i}-${j}`}
                            style={{
                              color: settings.colorScheme === 'yellow' && char !== ' '
                                ? colorSeed[pos]
                                : 'white',
                              fontSize: `calc(${8 * (130 / settings.width)}px)`,
                              lineHeight: '1.15',
                            }}
                          >
                            {char}
                          </span>
                        );
                      })}
                    </div>
                  ))}
                </pre>
              </div>
            </div>

            <div className={cn("rounded-lg bg-neutral-900/80 p-6 shadow-sm space-y-4")}>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm text-neutral-400">Resolution</label>
                  <Slider
                    min={50}
                    max={200}
                    step={1}
                    value={[settings.width]}
                    onValueChange={([value]) => handleSettingChange('width', value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-neutral-400">Contrast</label>
                  <Slider
                    min={0.5}
                    max={2}
                    step={0.1}
                    value={[settings.contrast]}
                    onValueChange={([value]) => handleSettingChange('contrast', value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-neutral-400">Brightness</label>
                  <Slider
                    min={0.5}
                    max={1.5}
                    step={0.1}
                    value={[settings.brightness]}
                    onValueChange={([value]) => handleSettingChange('brightness', value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-neutral-400">Character Set</label>
                  <Select
                    value={settings.asciiSet}
                    onValueChange={(value: AsciiSet) => handleSettingChange('asciiSet', value)}
                  >
                    <SelectTrigger className="w-full bg-neutral-800 border-neutral-700">
                      <SelectValue placeholder="Select character set" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="simple">Simple</SelectItem>
                      <SelectItem value="blocks">Blocks</SelectItem>
                      <SelectItem value="detailed">Detailed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-neutral-400">Color Scheme</label>
                  <Select
                    value={settings.colorScheme}
                    onValueChange={(value: 'white' | 'yellow') => handleSettingChange('colorScheme', value)}
                  >
                    <SelectTrigger className="w-full bg-neutral-800 border-neutral-700">
                      <SelectValue placeholder="Select color scheme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="white">White</SelectItem>
                      <SelectItem value="yellow">Yellow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-neutral-400">Invert Colors</label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={settings.inverted}
                      onCheckedChange={(checked) => handleSettingChange('inverted', checked)}
                    />
                    <span className="text-sm text-neutral-400">
                      {settings.inverted ? 'Inverted' : 'Normal'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={resetSettings}
                  className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
                >
                  Reset to Default
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <div className={cn(
        "max-w-4xl mx-auto mt-12 fixed bottom-0 left-0 right-0 bg-black p-4 flex gap-4"
      )}>
        <hr className={cn("w-screen h-px bg-neutral-800 absolute top-0 left-1/2 -translate-x-1/2 border-0")} />
        <button
          onClick={downloadSvg}
          disabled={!svgContent}
          className={cn(
            "inline-flex items-center px-4 py-2",
            "border border-yellow-300 bg-yellow-300/15",
            "hover:brightness-90 backdrop-blur-sm",
            "text-yellow-300 uppercase text-sm font-mono",
            "transition-colors",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
          )}
        >
          Download SVG
        </button>

        <button
          onClick={copyToClipboard}
          disabled={!svgContent}
          className={cn(
            "grayscale inline-flex items-center px-4 py-2",
            "border border-yellow-300 bg-yellow-300/15",
            "hover:brightness-90 backdrop-blur-sm",
            "text-yellow-300 uppercase text-sm font-mono",
            "transition-colors",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
            copied && "!border-green-400 !bg-green-400/15 !text-green-400 !grayscale-0"
          )}
        >
          {copied ? 'Copied!' : 'Copy SVG'}
        </button>
      </div>
    </main>
  );
};

export default AsciiPage;
