'use client';

import { useState, useRef, ChangeEvent } from 'react';

const AsciiPage = () => {
  const [asciiArt, setAsciiArt] = useState<string>('');
  const [svgContent, setSvgContent] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const convertToAscii = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create an image element to load the file
    const img = new Image();
    const reader = new FileReader();

    reader.onload = () => {
      img.src = reader.result as string;
      img.onload = () => {
        // Create a canvas to process the image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size - adjust these values to control detail level
        const width = 100;
        const height = (width * img.height) / img.width;
        canvas.width = width;
        canvas.height = height;

        // Draw and process the image
        ctx.drawImage(img, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);
        const ascii = processImageData(imageData);
        setAsciiArt(ascii);

        // Convert ASCII to SVG
        const svg = convertAsciiToSvg(ascii);
        setSvgContent(svg);
      };
    };

    reader.readAsDataURL(file);
  };

  const processImageData = (imageData: ImageData): string => {
    const ascii = ' .:-=+*#%@';
    let result = '';

    for (let y = 0; y < imageData.height; y++) {
      for (let x = 0; x < imageData.width; x++) {
        const idx = (y * imageData.width + x) * 4;
        const r = imageData.data[idx];
        const g = imageData.data[idx + 1];
        const b = imageData.data[idx + 2];

        // Convert to neutralscale
        const brightness = (r + g + b) / 3;

        // Map brightness to ASCII character
        const charIndex = Math.floor((brightness / 255) * (ascii.length - 1));
        result += ascii[charIndex];
      }
      result += '\n';
    }

    return result;
  };

  const convertAsciiToSvg = (ascii: string): string => {
    const lines = ascii.split('\n');
    const lineHeight = 15; // Adjust for text size
    const charWidth = 10; // Adjust for text spacing

    const width = lines[0]?.length * charWidth || 0;
    const height = lines.length * lineHeight;

    let svgText = '';
    lines.forEach((line, i) => {
      svgText += `<text x="0" y="${(i + 1) * lineHeight}"
        font-family="monospace" font-size="12px">${line}</text>`;
    });

    return `<svg width="${width}" height="${height}"
      xmlns="http://www.w3.org/2000/svg">
      <style>text { white-space: pre; }</style>
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

  return (
    <main className="text-white container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-2xl font-semibold">
          Image to ASCII Art Converter
        </h1>

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

        {asciiArt && (
          <div className="space-y-6">
            <div className="rounded-lg aspect-square border border-neutral-800 bg-neutral-900 p-6 shadow-sm">
              <pre className="font-mono text-xs leading-relaxed overflow-x-auto">
                {asciiArt}
              </pre>
            </div>

            <button
              onClick={downloadSvg}
              className="inline-flex items-center px-4 py-2
                border border-yellow-300 bg-yellow-300/15 hover:brightness-90 backdrop-blur-sm text-yellow-300 uppercase text-sm font-mono
                transition-colors"
            >
              Download SVG
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default AsciiPage;
