"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

interface ModelViewerProps {
  modelPath: string;
  colors?: string[];
  samplingRate?: number;
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
  samplingRate = 100,
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
  const resizeTimeoutRef = useRef<number | null>(null);
  const [resolution, setResolution] = useState<number>(48);

  const calculateOptimalResolution = useCallback(() => {
    if (!containerRef.current) return 48;
    const { width, height } = containerRef.current.getBoundingClientRect();
    const size = Math.min(width, height);
    const devicePixelRatio = window.devicePixelRatio || 1;
    const performanceMultiplier = devicePixelRatio > 1 ? 0.75 : 1;
    const optimalRes = Math.min(
      Math.floor((size / 10) * performanceMultiplier),
      maxResolution
    );
    return Math.max(48, optimalRes);
  }, [maxResolution]);

  useEffect(() => {
    const handleResize = () => {
      if (resizeTimeoutRef.current !== null) {
        window.clearTimeout(resizeTimeoutRef.current);
      }
      resizeTimeoutRef.current = window.setTimeout(() => {
        const newResolution = calculateOptimalResolution();
        if (newResolution !== resolution) {
          setResolution(newResolution);
        }
        resizeTimeoutRef.current = null;
      }, 200);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeoutRef.current !== null) {
        window.clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [calculateOptimalResolution, resolution]);

  const rgbToLightness = useCallback((r: number, g: number, b: number) => {
    const max = Math.max(r, g, b) / 255;
    const min = Math.min(r, g, b) / 255;
    return (max + min) / 2;
  }, []);

  const mapLightnessToColor = useCallback((lightness: number) => {

    if (lightness === 0) return colors[0];
    if (lightness < 0.05) return colors[1];
    if (lightness < 0.12) return colors[2];
    return colors[3];
  }, [colors]);

  const readPixelColors = useCallback(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !renderTargetRef.current) return;

    const pixelData = new Uint8Array(resolution * resolution * 4);
    rendererRef.current.setRenderTarget(renderTargetRef.current);
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    rendererRef.current.readRenderTargetPixels(renderTargetRef.current, 0, 0, resolution, resolution, pixelData);
    rendererRef.current.setRenderTarget(null);

    const newColors: PixelColor[] = new Array(resolution * resolution);
    let blackPixelCount = 0;

    for (let i = 0; i < pixelData.length; i += 4) {
      const index = i >> 2;
      const r = pixelData[i];
      const g = pixelData[i + 1];
      const b = pixelData[i + 2];
      const a = pixelData[i + 3];

      const lightness = rgbToLightness(r, g, b);
      if (lightness < 0.05) blackPixelCount++;

      newColors[index] = {
        r, g, b, a,
        assignedColor: mapLightnessToColor(lightness)
      };
    }

    // If more than 90% of pixels are black, keep the previous colors
    if (blackPixelCount > (resolution * resolution * 0.9) && prevColorsRef.current.length > 0) {
      return;
    }

    prevColorsRef.current = newColors;
    setPixelColors(newColors);
  }, [resolution, mapLightnessToColor, rgbToLightness]);

  const animate = useCallback((model: THREE.Group) => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

    frameRef.current = requestAnimationFrame(() => animate(model));

    // Optimized rotation
    rotationRef.current = (rotationRef.current + 0.01) % (Math.PI * 2);
    model.rotation.y = rotationRef.current;

    const currentTime = performance.now();
    const timeSinceLastSample = currentTime - lastSampleTime.current;

    // Ensure we're not sampling too frequently
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
      precision: 'mediump'
    });

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    const handleWindowResize = () => {
      if (!renderer || !camera) return;

      const newAspect = window.innerWidth / window.innerHeight;
      camera.left = (frustumSize * newAspect) / -2;
      camera.right = (frustumSize * newAspect) / 2;
      camera.top = frustumSize / 2;
      camera.bottom = frustumSize / -2;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleWindowResize);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(1);

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

    // Add ambient light for even illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    camera.position.set(0, 0, 0);
    camera.lookAt(0, 0, 0);

    const loader = new GLTFLoader();
    loader.load(
      modelPath,
      (gltf) => {
        gltf.scene.scale.set(1, 1, 1);
        gltf.scene.traverse((node) => {
          if (node instanceof THREE.Mesh) {
            node.geometry.computeBoundingSphere();
            node.geometry.computeBoundingBox();
          }
        });

        scene.add(gltf.scene);
        gltf.scene.position.set(0, 0, 0);
        animate(gltf.scene);
      },
      undefined,
      console.error
    );

    return () => {
      window.removeEventListener('resize', handleWindowResize);
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
    <div ref={containerRef} className="relative w-full h-screen overflow-hidden">
      <canvas ref={canvasRef} className="hidden absolute top-0 left-0 w-full h-full" />
      <div
        className="absolute top-0 left-0 w-full h-full scale-x-[-1] rotate-180"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${resolution}, 1fr)`,
          gap: '2px',
          padding: '2px',
          pointerEvents: "none",
          willChange: 'transform',
          contain: 'layout paint style',
        }}
      >
        {pixelColors.map((color, index) => (
          <div
            key={index}
            className="aspect-square rounded-full transform-gpu"
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
