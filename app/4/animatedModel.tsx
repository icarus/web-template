"use client";

import { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface ModelProps {
  modelPath: string;
  colors?: string[];
  onAnimationComplete?: () => void;
}

interface PixelPosition {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  z: number;
  color: string;
}

export function AnimatedModel({
  modelPath,
  colors = ["#713F12", "#EF7C00", "#FFEC40"],
  onAnimationComplete,
}: ModelProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const resolution = 128;
  const pixelSize = 5;

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const renderTargetRef = useRef<THREE.WebGLRenderTarget | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameRef = useRef<number>(0);
  const rotationAngleRef = useRef(0);
  const pixelPositionsRef = useRef<PixelPosition[]>([]);
  const isAnimatingRef = useRef(true);
  const animationStartTimeRef = useRef(0);

  const getColorFromLightness = useCallback((lightness: number) => {
    if (lightness < 0.22) return colors[0];
    if (lightness < 0.3) return colors[1];
    return colors[2];
  }, [colors]);

  const updatePixelPositions = useCallback(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !renderTargetRef.current) return;

    const pixelData = new Uint8Array(resolution * resolution * 4);
    rendererRef.current.setRenderTarget(renderTargetRef.current);
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    rendererRef.current.readRenderTargetPixels(renderTargetRef.current, 0, 0, resolution, resolution, pixelData);
    rendererRef.current.setRenderTarget(null);

    const pixels = new Uint32Array(pixelData.buffer);
    const newPixelPositions: PixelPosition[] = [];

    pixels.forEach((pixel, i) => {
      const a = (pixel >> 24) & 0xff;
      if (a > 0) {
        const gap = pixelSize * 1.75;
        const totalSize = pixelSize + gap;
        const targetX = Math.round((i % resolution) * totalSize);
        const targetY = Math.round(Math.floor(i / resolution) * totalSize);
        const r = pixel & 0xff;
        const g = (pixel >> 8) & 0xff;
        const b = (pixel >> 16) & 0xff;
        const lightness = (Math.max(r, g, b) + Math.min(r, g, b)) / (2 * 255);

        newPixelPositions.push({
          x: targetX,
          y: targetY,
          targetX,
          targetY,
          z: 0,
          color: getColorFromLightness(lightness)
        });
      }
    });

    return newPixelPositions;
  }, [resolution, pixelSize, getColorFromLightness]);

  const drawPixels = useCallback((positions: PixelPosition[]) => {
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

    positions.forEach((pixel) => {
      const width = Math.round(pixelSize / 1.25);
      const height = pixelSize;
      ctx.fillStyle = pixel.color;
      ctx.fillRect(
        pixel.x + (totalSize - width) / 2,
        pixel.y + (totalSize - height) / 2,
        width,
        height
      );
    });
  }, [resolution, pixelSize]);

  const initializePixelPositions = useCallback(() => {
    const newPositions = updatePixelPositions();
    if (!newPositions) return;

    const canvasSize = resolution * (pixelSize * 2.75); // Total canvas size

    // Initialize with random starting positions
    pixelPositionsRef.current = newPositions.map(pixel => ({
      ...pixel,
      x: pixel.targetX + (Math.random() - 0.5) * canvasSize * 2, // Random starting X
      y: pixel.targetY + (Math.random() - 0.5) * canvasSize * 2, // Random starting Y
      z: 1000, // Start far behind
    }));

    animationStartTimeRef.current = performance.now();
    isAnimatingRef.current = true;
  }, [resolution, pixelSize, updatePixelPositions]);

  const readPixelColors = useCallback(() => {
    if (!isAnimatingRef.current) {
      // Update pixel positions directly from the render
      const newPositions = updatePixelPositions();
      if (newPositions) {
        pixelPositionsRef.current = newPositions;
        drawPixels(newPositions);
      }
      return;
    }

    // Handle initial animation
    if (pixelPositionsRef.current.length === 0) {
      initializePixelPositions();
      return;
    }

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

    // Original animation code
    const currentTime = performance.now();
    const animationDuration = 1000;
    const progress = Math.min(
      (currentTime - animationStartTimeRef.current) / animationDuration,
      1
    );

    if (progress >= 0.5 && onAnimationComplete) {
      onAnimationComplete();
    }

    // Ease out cubic function
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
    const easedProgress = easeOutCubic(progress);

    pixelPositionsRef.current.forEach((pixel) => {
      if (progress < 1) {
        // Animate position
        const x = pixel.x + (pixel.targetX - pixel.x) * easedProgress;
        const y = pixel.y + (pixel.targetY - pixel.y) * easedProgress;
        const z = pixel.z * (1 - easedProgress);

        // Apply perspective effect based on Z
        const scale = 1 + (z / 1000);
        const width = Math.round(pixelSize / 1.25) * scale;
        const height = pixelSize * scale;

        ctx.fillStyle = pixel.color;
        ctx.fillRect(
          x + (totalSize - width) / 2,
          y + (totalSize - height) / 2,
          width,
          height
        );
      } else {
        // Animation finished - draw at final position
        const width = Math.round(pixelSize / 1.25);
        const height = pixelSize;
        ctx.fillStyle = pixel.color;
        ctx.fillRect(
          pixel.targetX + (totalSize - width) / 2,
          pixel.targetY + (totalSize - height) / 2,
          width,
          height
        );
      }
    });

    if (progress >= 1) {
      isAnimatingRef.current = false;
    }
  }, [updatePixelPositions, drawPixels, initializePixelPositions, onAnimationComplete]);

  const animate = useCallback(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

    frameRef.current = requestAnimationFrame(animate);

    // Only rotate when animation is complete
    if (!isAnimatingRef.current) {
      rotationAngleRef.current += 0.01;
      // Add model rotation
      if (modelRef.current) {
        modelRef.current.rotation.y = rotationAngleRef.current;
      }
    }

    if (controlsRef.current) {
      controlsRef.current.update();
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
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enabled = false; // Always disabled since we removed fullscreen
    controlsRef.current = controls;

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    renderTargetRef.current = new THREE.WebGLRenderTarget(resolution, resolution);

    const loader = new GLTFLoader();
    loader.load(modelPath, (gltf) => {
      scene.add(gltf.scene);
      modelRef.current = gltf.scene;
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
      controls.dispose();
    };
  }, [modelPath, animate]);

  return (
    <div className="relative w-screen h-screen mx-auto">
      <canvas
        ref={canvasRef}
        className="absolute w-full h-full opacity-0"
      />
      <canvas
        ref={overlayCanvasRef}
        className="scale-x-[-1.5] rotate-180 absolute w-full h-full object-contain pointer-events-none"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
}
