"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

interface TiltingModelProps {
  modelPath: string;
  colors?: string[];
  onLoadingComplete?: () => void;
}

export function AnimatedModel({
  modelPath,
  colors = ["#713F12", "#EF7C00", "#FFEC40"],
  onLoadingComplete
}: TiltingModelProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const resolution = 128;
  const pixelSize = 5;

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const renderTargetRef = useRef<THREE.WebGLRenderTarget | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const frameRef = useRef<number>(0);

  // Add state to track revealed pixels
  const [revealedPixels, setRevealedPixels] = useState<Set<number>>(new Set());
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  // Add rotation angle ref to persist between frames
  const rotationAngleRef = useRef(0);

  const getColorFromLightness = useCallback((lightness: number) => {
    if (lightness < 0.22) return colors[0];
    if (lightness < 0.3) return colors[1];
    return colors[2];
  }, [colors]);

  const readPixelColors = useCallback(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !renderTargetRef.current) return;

    const pixelData = new Uint8Array(resolution * resolution * 4);
    rendererRef.current.setRenderTarget(renderTargetRef.current);
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    rendererRef.current.readRenderTargetPixels(renderTargetRef.current, 0, 0, resolution, resolution, pixelData);
    rendererRef.current.setRenderTarget(null);

    const ctx = overlayCanvasRef.current?.getContext("2d");
    if (!ctx) return;

    const gap = pixelSize * 1.75;
    const totalSize = pixelSize + gap;
    const canvasSize = resolution * totalSize;

    if (overlayCanvasRef.current) {
      overlayCanvasRef.current.width = canvasSize;
      overlayCanvasRef.current.height = canvasSize;
    }

    ctx.clearRect(0, 0, canvasSize, canvasSize);
    ctx.imageSmoothingEnabled = false;

    const pixels = new Uint32Array(pixelData.buffer);
    const activePixels: number[] = [];

    // Collect all active pixels
    pixels.forEach((pixel, i) => {
      const a = (pixel >> 24) & 0xff;
      if (a > 0) {
        activePixels.push(i);
      }
    });

    // Draw all pixels (black if not revealed, colored if revealed)
    pixels.forEach((pixel, i) => {
      const a = (pixel >> 24) & 0xff;
      if (a > 0) {
        const x = Math.round((i % resolution) * totalSize);
        const y = Math.round(Math.floor(i / resolution) * totalSize);
        // Compensate for the scale-x-[-1.5] by making the width 1.5 times smaller
        const width = Math.round(pixelSize / 1.25);
        const height = pixelSize;
        const offsetX = (totalSize - width) / 2;
        const offsetY = (totalSize - height) / 2;

        if (revealedPixels.has(i)) {
          const r = pixel & 0xff;
          const g = (pixel >> 8) & 0xff;
          const b = (pixel >> 16) & 0xff;
          const lightness = (Math.max(r, g, b) + Math.min(r, g, b)) / (2 * 255);
          ctx.fillStyle = getColorFromLightness(lightness);
        } else {
          ctx.fillStyle = '#000000';
        }

        ctx.fillRect(x + offsetX, y + offsetY, width, height);
      }
    });

    // Reveal new pixels if model is loaded
    if (isModelLoaded && activePixels.length > 0) {
      const numPixelsToReveal = Math.max(1, Math.floor(activePixels.length * 0.25));
      const newRevealedPixels = new Set(revealedPixels);

      for (let i = 0; i < numPixelsToReveal; i++) {
        const remainingPixels = activePixels.filter(p => !newRevealedPixels.has(p));
        if (remainingPixels.length === 0) {
          // All pixels revealed, notify parent
          onLoadingComplete?.();
          break;
        }

        const randomIndex = Math.floor(Math.random() * remainingPixels.length);
        newRevealedPixels.add(remainingPixels[randomIndex]);
      }

      if (newRevealedPixels.size !== revealedPixels.size) {
        setRevealedPixels(newRevealedPixels);
      }
    }
  }, [resolution, pixelSize, getColorFromLightness, revealedPixels, isModelLoaded, onLoadingComplete]);

  const animate = useCallback(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

    frameRef.current = requestAnimationFrame(animate);

    if (modelRef.current) {
      // Update the rotation angle and apply it
      rotationAngleRef.current += 0.01;
      modelRef.current.rotation.y = rotationAngleRef.current;
    }

    readPixelColors();
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  }, [readPixelColors]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    scene.background = null;

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
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);

    const createDirectionalLight = (x: number, y: number, z: number, intensity: number) => {
      const light = new THREE.DirectionalLight(0xffffff, intensity);
      light.position.set(x, y, z);
      return light;
    };

    scene.add(createDirectionalLight(0, 0, 5, 1.5));
    scene.add(createDirectionalLight(0, 0, -5, 1.5));
    scene.add(createDirectionalLight(5, 0, 0, 1.5));
    scene.add(createDirectionalLight(-5, 0, 0, 1.5));
    scene.add(createDirectionalLight(0, 5, 0, 1.5));
    scene.add(createDirectionalLight(0, -5, 0, 1));

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    renderTargetRef.current = new THREE.WebGLRenderTarget(resolution, resolution);

    const loader = new GLTFLoader();
    loader.load(modelPath, (gltf) => {
      scene.add(gltf.scene);
      modelRef.current = gltf.scene;
      setIsModelLoaded(true); // Set model as loaded
      animate();
    });

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const aspect = width / height;

      camera.left = (frustumSize * aspect) / -2;
      camera.right = (frustumSize * aspect) / 2;
      camera.top = frustumSize / 2;
      camera.bottom = frustumSize / -2;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      renderTargetRef.current?.dispose();
      renderer.dispose();
    };
  }, [modelPath, animate]);

  return (
    <div className="relative w-screen h-screen mx-auto">
      <canvas
        ref={canvasRef}
        className="hidden absolute w-full h-full"
      />
      <canvas
        ref={overlayCanvasRef}
        className="scale-x-[-1.5] rotate-180 absolute w-full h-full object-contain pointer-events-none"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
}
