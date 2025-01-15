"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

interface ModelViewerProps {
  modelPath: string;
}

export function ModelViewer({ modelPath }: ModelViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pixelColors, setPixelColors] = useState<{ r: number; g: number; b: number; a: number; assignedColor: string }[]>([]);

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
      },
      undefined,
      (error) => {
        console.error("An error happened while loading the model:", error);
      }
    );

    camera.position.z = 5;

    // Pixelation: Setup Render Target
    const textureSize = 64; // Smaller size for the grid
    const renderTarget = new THREE.WebGLRenderTarget(textureSize, textureSize, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
    });

    const pixelData = new Uint8Array(textureSize * textureSize * 4); // RGBA for each pixel

    // Convert RGB to Lightness
    const rgbToLightness = (r: number, g: number, b: number) => {
      const max = Math.max(r, g, b) / 255;
      const min = Math.min(r, g, b) / 255;
      return (max + min) / 2; // Lightness formula from HSL
    };

    // Function to read pixel colors
    const readPixelColors = () => {
      renderer.readRenderTargetPixels(
        renderTarget,
        0,
        0,
        textureSize,
        textureSize,
        pixelData
      );

      const colors = [];
      for (let i = 0; i < pixelData.length; i += 4) {
        const r = pixelData[i];
        const g = pixelData[i + 1];
        const b = pixelData[i + 2];
        const a = pixelData[i + 3];

        const lightness = rgbToLightness(r, g, b);

        console.log(lightness);

        let assignedColor = "rgba(0, 0, 0, 1)";
        if (lightness === 0) {
          assignedColor = "rgba(0, 0, 0, 1)";
        } else if (lightness < 0.1) {
          assignedColor = "rgba(113, 63, 18, 1)";
        } else if (lightness < 0.2) {
          assignedColor = "rgba(249, 188, 18, 1)";
        } else {
          assignedColor = "rgba(255, 236, 64, 1)";
        }

        colors.push({ r, g, b, a, assignedColor });
      }
      setPixelColors(colors);
    };

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Render the scene to the render target
      renderer.setRenderTarget(renderTarget);
      renderer.render(scene, camera);
      renderer.setRenderTarget(null);

      // Read pixel colors once per second
      if (Math.floor(performance.now() / 1000) % 1 === 0) {
        readPixelColors();
      }

      // Render the main scene
      renderer.render(scene, camera);
    };
    animate();

    // Clean up
    return () => {
      renderer.dispose();
      renderTarget.dispose();
    };
  }, [modelPath]);

  return (
    <div className="relative w-full h-screen">
      {/* Canvas */}
      <canvas ref={canvasRef} className="hidden absolute top-0 left-0 w-full h-full" />
      {/* Pixelated Grid */}
      <div
        className="absolute top-0 left-0 grid w-full h-full rotate-180"
        style={{
          gridTemplateColumns: `repeat(64, 1fr)`,
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
