'use client';

import { useState, useRef, ChangeEvent } from 'react';

const ASCII_SETS = {
  standard: ' .:-=+*#%@',
  simple: ' .*#',
  blocks: ' ▖▚▜█',
  detailed: ' .`^",:;Il!i~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$'
};

type AsciiSet = keyof typeof ASCII_SETS;

interface Settings {
  width: number;
  contrast: number;
  brightness: number;
  asciiSet: AsciiSet;
}

const DEFAULT_SETTINGS: Settings = {
  width: 130,
  contrast: 1,
  brightness: 1,
  asciiSet: 'standard'
};

const AsciiPage = () => {
  const [asciiArt, setAsciiArt] = useState<string>('');
  const [svgContent, setSvgContent] = useState<string>('');
  const [currentImage, setCurrentImage] = useState<HTMLImageElement | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
    let result = '';

    for (let y = 0; y < imageData.height; y++) {
      for (let x = 0; x < imageData.width; x++) {
        const idx = (y * imageData.width + x) * 4;
        const r = imageData.data[idx];
        const g = imageData.data[idx + 1];
        const b = imageData.data[idx + 2];

        const brightness = (r + g + b) / 3;
        const charIndex = Math.floor((brightness / 255) * (ascii.length - 1));
        result += ascii[charIndex];
      }
      result += '\n';
    }

    return result;
  };

  const convertAsciiToSvg = (ascii: string): string => {
    const lines = ascii.split('\n');
    const lineHeight = 15;
    const charWidth = 9;

    const width = lines[0]?.length * charWidth || 0;
    const height = lines.length * lineHeight;

    let svgText = '';
    lines.forEach((line, i) => {
      Array.from(line).forEach((char, j) => { // Using Array.from instead of spread to fix TS error
        if (char !== ' ') { // Skip spaces to reduce file size
          svgText += `<text x="${j * charWidth}" y="${(i + 1) * lineHeight}"
            fill="white" font-family="monospace" font-size="12px">${char}</text>`;
        }
      });
    });

    return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"
        xmlns="http://www.w3.org/2000/svg">
        <g>
          ${svgText}
        </g>
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
    } catch (err) {
      console.error('Failed to copy SVG:', err);
    }
  };

  const handleSettingChange = (key: keyof Settings, value: number | AsciiSet) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    updateImage();
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    updateImage();
  };

  return (
    <main className="text-white container mx-auto px-4 pt-8 pb-32">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-6 shadow-sm">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={convertToAscii}
            className="block w-full text-sm text-neutral-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-medium
              file:bg-neutral-800 file:text-neutral-200
              hover:file:bg-neutral-700
              transition-colors"
          />
        </div>

        {currentImage && (
          <>
            <div className="space-y-6">
              <div
                ref={containerRef}
                className="rounded-lg border border-neutral-800 p-6 shadow-sm overflow-hidden h-[60vh]"
              >
                <pre
                  className="font-mono leading-[1.1] whitespace-pre text-center w-full h-full overflow-hidden"
                  style={{
                    fontSize: `calc(${8 * (130 / settings.width)}px)`,
                    transform: 'scale(0.9)',
                    transformOrigin: 'center',
                    maxWidth: '100%',
                    margin: '0 auto',
                    display: 'block',
                  }}
                >
                  {asciiArt}
                </pre>
              </div>
            </div>

            <div className="rounded-lg bg-neutral-900/80 p-6 shadow-sm space-y-4">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm text-neutral-400">Resolution</label>
                  <div className="flex gap-2">
                    <input
                      type="range"
                      min="50"
                      max="200"
                      value={settings.width}
                      onChange={(e) => handleSettingChange('width', Number(e.target.value))}
                      className="flex-1 accent-yellow-300"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-neutral-400">Contrast</label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={settings.contrast}
                    onChange={(e) => handleSettingChange('contrast', Number(e.target.value))}
                    className="w-full accent-yellow-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-neutral-400">Brightness</label>
                  <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.1"
                    value={settings.brightness}
                    onChange={(e) => handleSettingChange('brightness', Number(e.target.value))}
                    className="w-full accent-yellow-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-neutral-400">Character Set</label>
                  <select
                    value={settings.asciiSet}
                    onChange={(e) => handleSettingChange('asciiSet', e.target.value as AsciiSet)}
                    className="w-full bg-neutral-800 border-neutral-700 rounded-md text-sm"
                  >
                    <option value="standard">Standard</option>
                    <option value="simple">Simple</option>
                    <option value="blocks">Blocks</option>
                    <option value="detailed">Detailed</option>
                  </select>
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

      <div className="max-w-4xl mx-auto mt-12 fixed bottom-0 left-0 right-0 bg-black p-4 flex gap-4">
        <hr className="w-screen h-px bg-neutral-800 absolute top-0 left-1/2 -translate-x-1/2 border-0" />
        <button
          onClick={downloadSvg}
          disabled={!svgContent}
          className="inline-flex items-center px-4 py-2
            border border-yellow-300 bg-yellow-300/15 hover:brightness-90 backdrop-blur-sm text-yellow-300 uppercase text-sm font-mono
            transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
        >
          Download SVG
        </button>

        <button
          onClick={copyToClipboard}
          disabled={!svgContent}
          className="grayscale inline-flex items-center px-4 py-2
            border border-yellow-300 bg-yellow-300/15 hover:brightness-90 backdrop-blur-sm text-yellow-300 uppercase text-sm font-mono
            transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
        >
          Copy SVG
        </button>
      </div>
    </main>
  );
};

export default AsciiPage;
