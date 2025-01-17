"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

interface ModelViewerProps {
  modelPath: string;
  gradient?: string[];
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
  gradient = ["#000000", "#3E2723", "#F57C00", "#FFD700"],
  samplingRate = 100,
  maxResolution = 96
}: ModelViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pixelColors, setPixelColors] = useState<PixelColor[]>([]);
  const rotationRef = useRef<number>(0);
  const lastSampleTime = useRef<number>(0);
  const frameRef = useRef<number>(0);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
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

  const mapLightnessToGradient = useCallback((lightness: number) => {
    if (lightness === 0) return gradient[0];
    if (lightness < 0.02) return gradient[1];
    if (lightness < 0.07) return gradient[2];
    return gradient[3];
  }, [gradient]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
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

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(1);

    // Optimized render target
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

    // Optimized lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const light = new THREE.DirectionalLight(0xffffff, 0.5);
    light.position.set(1, 1, 1).normalize();
    scene.add(light);

    camera.position.z = 5;

    // Optimized model loading
    const loader = new GLTFLoader();
    loader.load(
      modelPath,
      (gltf) => {
        // Optimize geometry
        gltf.scene.traverse((node) => {
          if (node instanceof THREE.Mesh) {
            node.geometry.computeBoundingSphere();
            node.geometry.computeBoundingBox();
          }
        });

        scene.add(gltf.scene);
        gltf.scene.position.set(0, 0, 1.5);
        animate(gltf.scene);
      },
      undefined,
      console.error
    );

    const readPixelColors = () => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !renderTargetRef.current) return;

      const pixelData = new Uint8Array(resolution * resolution * 4);
      rendererRef.current.setRenderTarget(renderTargetRef.current);
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      rendererRef.current.readRenderTargetPixels(renderTargetRef.current, 0, 0, resolution, resolution, pixelData);
      rendererRef.current.setRenderTarget(null);

      const colors = new Array(resolution * resolution);
      for (let i = 0; i < pixelData.length; i += 4) {
        const index = i >> 2; // Faster division by 4
        const r = pixelData[i];
        const g = pixelData[i + 1];
        const b = pixelData[i + 2];
        const a = pixelData[i + 3];

        colors[index] = a === 0
          ? { r: 0, g: 0, b: 0, a: 0, assignedColor: 'transparent' }
          : { r, g, b, a, assignedColor: mapLightnessToGradient(rgbToLightness(r, g, b)) };
      }

      setPixelColors(colors);
    };

    const animate = (model: THREE.Group) => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

      frameRef.current = requestAnimationFrame(() => animate(model));

      // Optimized rotation
      rotationRef.current = (rotationRef.current + 0.01) % (Math.PI * 2);
      model.rotation.y = rotationRef.current;

      const currentTime = performance.now();
      if (currentTime - lastSampleTime.current >= samplingRate) {
        readPixelColors();
        lastSampleTime.current = currentTime;
      }

      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };

    return () => {
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
  }, [modelPath, samplingRate, resolution, rgbToLightness, mapLightnessToGradient]);

  return (
    <div ref={containerRef} className="w-full h-screen overflow-hidden">
      <canvas ref={canvasRef} className="hidden absolute top-0 left-0 w-full h-full" />
      <div
        className="grid gap-3 rotate-180 transform absolute top-1/2 -translate-y-1/2 w-full"
        style={{
          gridTemplateColumns: `repeat(${resolution}, 1fr)`,
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
