"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

interface ModelViewerProps {
  modelPath: string;
  colors?: string[];
  maxResolution?: number;
}

interface PixelColor {
  r: number;
  g: number;
  b: number;
  a: number;
  assignedColor: string;
}

export function ModelViewer({
  modelPath,
  colors = ["#000000", "#3E2723", "#F57C00", "#FFD700"],
  maxResolution = 96
}: ModelViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pixelColors, setPixelColors] = useState<PixelColor[]>([]);
  const prevColorsRef = useRef<PixelColor[]>([]);
  const rotationRef = useRef<number>(0);
  const lastSampleTime = useRef<number>(0);
  const frameRef = useRef<number>(0);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const renderTargetRef = useRef<THREE.WebGLRenderTarget | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Adjust resolution based on device performance
  const resolution = Math.min(48, Math.floor(window.innerWidth / 32));
  const samplingRate = 32; // Reduced sampling rate for better performance
  const rotationSpeed = 0.005;

  const rgbToLightness = useCallback((r: number, g: number, b: number) => {
    const max = Math.max(r, g, b) / 255;
    const min = Math.min(r, g, b) / 255;
    return (max + min) / 2;
  }, []);

  const readPixelColors = useCallback(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !renderTargetRef.current) return;

    const pixelData = new Uint8Array(resolution * resolution * 4);
    rendererRef.current.setRenderTarget(renderTargetRef.current);
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    rendererRef.current.readRenderTargetPixels(renderTargetRef.current, 0, 0, resolution, resolution, pixelData);
    rendererRef.current.setRenderTarget(null);

    const newColors: PixelColor[] = new Array(resolution * resolution);
    let blackPixelCount = 0;

    // First pass: collect all non-black lightness values
    const lightnessValues: number[] = [];
    for (let i = 0; i < pixelData.length; i += 4) {
      const r = pixelData[i];
      const g = pixelData[i + 1];
      const b = pixelData[i + 2];
      const lightness = rgbToLightness(r, g, b);

      if (lightness > 0) {
        lightnessValues.push(lightness);
      }
    }

    const minLightness = Math.min(...lightnessValues);
    const maxLightness = Math.max(...lightnessValues);
    const lightnessRange = maxLightness - minLightness;

    // Track color changes by region
    const colorChanges = {
      total: 0,
      byRegion: new Map<string, number>(),
      adjacentChanges: 0
    };

    for (let i = 0; i < pixelData.length; i += 4) {
      const index = i >> 2;
      const r = pixelData[i];
      const g = pixelData[i + 1];
      const b = pixelData[i + 2];
      const a = pixelData[i + 3];
      const lightness = rgbToLightness(r, g, b);

      let assignedColor: string;
      if (lightness === 0) {
        blackPixelCount++;
        assignedColor = colors[0];
      } else {
        const normalizedLightness = (lightness - minLightness) / lightnessRange;

        if (normalizedLightness < 0.33) {
          assignedColor = colors[1];
        } else if (normalizedLightness < 0.55) {
          assignedColor = colors[2];
        } else if (normalizedLightness > 0.55 && normalizedLightness < 0.62) {
          assignedColor = colors[1];
        } else {
          assignedColor = colors[3];
        }
      }

      // Check for color changes
      if (prevColorsRef.current[index]) {
        const prevColor = prevColorsRef.current[index].assignedColor;
        if (prevColor !== assignedColor) {
          colorChanges.total++;

          // Track changes by region
          const region = `${Math.floor(index / resolution / 8)}_${Math.floor((index % resolution) / 8)}`;
          colorChanges.byRegion.set(region, (colorChanges.byRegion.get(region) || 0) + 1);

          // Check adjacent pixels for changes
          const row = Math.floor(index / resolution);
          const col = index % resolution;
          const adjacentIndices = [
            index - 1, // left
            index + 1, // right
            index - resolution, // up
            index + resolution, // down
          ];

          for (const adjIndex of adjacentIndices) {
            if (adjIndex >= 0 && adjIndex < resolution * resolution) {
              const adjRow = Math.floor(adjIndex / resolution);
              const adjCol = adjIndex % resolution;
              // Only check if it's actually adjacent (avoid wrapping)
              if (Math.abs(adjRow - row) <= 1 && Math.abs(adjCol - col) <= 1) {
                if (prevColorsRef.current[adjIndex]?.assignedColor !== assignedColor) {
                  colorChanges.adjacentChanges++;
                }
              }
            }
          }
        }
      }

      newColors[index] = { r, g, b, a, assignedColor };
    }

    // Stability checks
    const maxRegionChanges = Math.max(...Array.from(colorChanges.byRegion.values()));
    const totalPixels = resolution * resolution;
    const shouldKeepPrevious = (
      (blackPixelCount > totalPixels * 0.9) || // Too many black pixels
      (colorChanges.total > totalPixels * 0.2) || // Too many total changes
      (maxRegionChanges > 32) || // Too many changes in one region
      (colorChanges.adjacentChanges > totalPixels * 0.1) // Too many adjacent changes
    ) && prevColorsRef.current.length > 0;

    if (shouldKeepPrevious) {
      return;
    }

    prevColorsRef.current = newColors;
    setPixelColors(newColors);
  }, [resolution, colors, rgbToLightness]);

  const animate = useCallback((model: THREE.Group) => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

    frameRef.current = requestAnimationFrame(() => animate(model));
    rotationRef.current = (rotationRef.current + rotationSpeed) % (Math.PI * 2);
    model.rotation.y = rotationRef.current;

    const currentTime = performance.now();
    const timeSinceLastSample = currentTime - lastSampleTime.current;

    if (timeSinceLastSample >= samplingRate) {
      readPixelColors();
      lastSampleTime.current = currentTime;
    }

    rendererRef.current.render(sceneRef.current, cameraRef.current);
  }, [samplingRate, readPixelColors]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 5;
    const camera = new THREE.OrthographicCamera(
      (frustumSize * aspect) / -2,
      (frustumSize * aspect) / 2,
      frustumSize / 2,
      frustumSize / -2,
      -1000,
      1000
    );

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      powerPreference: 'high-performance',
      antialias: false,
      alpha: true,
      precision: 'mediump',
      stencil: false,
      depth: false
    });

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap pixel ratio

    const renderTarget = new THREE.WebGLRenderTarget(resolution, resolution, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.UnsignedByteType,
      depthBuffer: false,
      stencilBuffer: false,
      generateMipmaps: false
    });
    renderTargetRef.current = renderTarget;

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const light = new THREE.DirectionalLight(0xffffff, 0.5);
    light.position.set(1, 1, 1).normalize();
    scene.add(light);

    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);

    // Load model with error handling and loading optimization
    const loader = new GLTFLoader();
    loader.load(
      modelPath,
      (gltf) => {
        // Optimize geometry
        gltf.scene.traverse((node) => {
          if (node instanceof THREE.Mesh) {
            node.geometry.computeBoundingSphere();
            node.geometry.computeBoundingBox();
            // Dispose of unused attributes
            const geometry = node.geometry;
            const attributes = geometry.attributes;
            for (const name in attributes) {
              if (!['position', 'normal', 'uv'].includes(name)) {
                geometry.deleteAttribute(name);
              }
            }
          }
        });

        scene.add(gltf.scene);
        gltf.scene.position.set(0, -0.5, 0);
        animate(gltf.scene);
      },
      undefined,
      (error) => {
        console.error('Error loading model:', error);
      }
    );

    // Debounced resize handler
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (!renderer || !camera) return;

        const newAspect = window.innerWidth / window.innerHeight;
        camera.left = (frustumSize * newAspect) / -2;
        camera.right = (frustumSize * newAspect) / 2;
        camera.top = frustumSize / 2;
        camera.bottom = frustumSize / -2;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
      }, 250); // Longer debounce for better performance
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      renderTarget.dispose();
      renderer.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (object.material instanceof THREE.Material) {
            object.material.dispose();
          }
        }
      });
    };
  }, [modelPath, resolution, animate]);

  return (
    <div ref={containerRef} className="relative w-full h-svh overflow-hidden flex items-center justify-center">
      <canvas ref={canvasRef} className="hidden absolute top-0 left-0 w-full h-full" />
      <div
        className="grid pointer-events-none scale-x-[-1] rotate-180"
        style={{
          gridTemplateColumns: `repeat(${resolution}, 8px)`,
          width: `${resolution * 8}px`,
          height: `${resolution * 8}px`,
          maxWidth: 'min(100vh, 100vw)',
          maxHeight: 'min(100vh, 100vw)',
        }}
      >
        {pixelColors.map((color, index) => (
          <div
            key={index}
            className="w-[8px] h-[8px] transform-gpu"
            style={{
              backgroundColor: color.assignedColor,
              opacity: color.a / 255,
              gridRow: Math.floor(index / resolution) + 1,
              gridColumn: (index % resolution) + 1,
            }}
          />
        ))}
      </div>
    </div>
  );
}
