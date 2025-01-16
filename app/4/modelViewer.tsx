"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

interface ModelViewerProps {
  modelPath: string;
  gradient?: string[];
}

export function ModelViewer({ modelPath, gradient = ["#000000", "#FFEC40", "#F9BC12", "#FFE040"] }: ModelViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pixelColors, setPixelColors] = useState<{ r: number; g: number; b: number; a: number; assignedColor: string }[]>([]);
  const rotationRef = useRef<number>(0);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current! });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    // Load model
    const loader = new GLTFLoader();
    loader.load(
      modelPath,
      (gltf) => {
        scene.add(gltf.scene);
        gltf.scene.position.set(0, 0, 1.5);
        animate(gltf.scene);
      },
      undefined,
      (error) => {
        console.error("An error happened while loading the model:", error);
      }
    );

    camera.position.z = 5;

    const textureSize = 128;
    const renderTarget = new THREE.WebGLRenderTarget(textureSize, textureSize, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
    });

    const pixelData = new Uint8Array(textureSize * textureSize * 4);

    const rgbToLightness = (r: number, g: number, b: number) => {
      const max = Math.max(r, g, b) / 255;
      const min = Math.min(r, g, b) / 255;
      return (max + min) / 2;
    };

    // Map a lightness value (0 to 1) to a gradient color
    const mapLightnessToGradient = (lightness: number) => {
      const scaledIndex = lightness * (gradient.length - 1);
      const lowerIndex = Math.floor(scaledIndex);
      const upperIndex = Math.ceil(scaledIndex);

      if (lowerIndex === upperIndex) return gradient[lowerIndex];

      const lowerColor = new THREE.Color(gradient[lowerIndex]);
      const upperColor = new THREE.Color(gradient[upperIndex]);

      const t = scaledIndex - lowerIndex;
      const mixedColor = lowerColor.lerp(upperColor, t);
      return `rgb(${mixedColor.r * 255}, ${mixedColor.g * 255}, ${mixedColor.b * 255})`;
    };

    const readPixelColors = () => {
      renderer.readRenderTargetPixels(renderTarget, 0, 0, textureSize, textureSize, pixelData);

      const colors = [];
      for (let i = 0; i < pixelData.length; i += 4) {
        const r = pixelData[i];
        const g = pixelData[i + 1];
        const b = pixelData[i + 2];
        const a = pixelData[i + 3];

        const lightness = rgbToLightness(r, g, b);
        const assignedColor = mapLightnessToGradient(lightness);

        colors.push({ r, g, b, a, assignedColor });
      }
      setPixelColors(colors);
    };

    const animate = (model: THREE.Group) => {
      requestAnimationFrame(() => animate(model));
      rotationRef.current += 0.05;
      model.rotation.y = rotationRef.current;

      renderer.setRenderTarget(renderTarget);
      renderer.render(scene, camera);
      renderer.setRenderTarget(null);

      if (Math.floor(performance.now() / 1000) % 1 === 0) {
        readPixelColors();
      }

      renderer.render(scene, camera);
    };

    return () => {
      renderer.dispose();
      renderTarget.dispose();
    };
  }, [modelPath, gradient]);

  return (
    <div className="relative w-full h-screen">
      <canvas ref={canvasRef} className="hidden absolute top-0 left-0 w-full h-full" />
      <div
        className="absolute top-0 left-0 grid w-full h-full scale-x-[-1] rotate-180"
        style={{
          gridTemplateColumns: `repeat(128, 1fr)`,
          pointerEvents: "none",
        }}
      >
        {pixelColors.map((color, index) => (
          <div
            key={index}
            className="w-1/3 aspect-square saturate-150"
            style={{
              backgroundColor: color.assignedColor,
            }}
          />
        ))}
      </div>
    </div>
  );
}
