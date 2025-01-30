"use client";

import { useEffect, useRef, useCallback, RefObject } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { cn } from "@/lib/utils";
import { useMousePositionRef } from "@/hooks/use-mouse-position-ref";

interface ModelProps {
  modelPath: string;
  colors?: string[];
}

interface PixelPosition {
  x: number;
  y: number;
  z: number;
  targetX: number;
  targetY: number;
  targetZ: number;
  color: string;
  trailFactor: number;
  lastUpdate: number;
}

export function BananaModel({
  modelPath,
  colors = ["#713F12", "#EF7C00", "#FFEC40"],
}: ModelProps) {
  const containerRef = useRef<HTMLDivElement>(null) as RefObject<HTMLDivElement>;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const pixelPositionsRef = useRef<PixelPosition[]>([]);
  const mouseRef = useMousePositionRef(containerRef);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const isMovingRef = useRef(false);
  const moveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const initializedRef = useRef(false);

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

  const getColorFromLightness = useCallback((lightness: number) => {
    if (lightness < 0.22) return colors[0];
    if (lightness < 0.3) return colors[1];
    return colors[2];
  }, [colors]);

  const updatePixelPositions = useCallback(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !renderTargetRef.current) return;

    if (initializedRef.current && pixelPositionsRef.current.length > 0) {
      return pixelPositionsRef.current;
    }

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
        const x = Math.round((i % resolution) * totalSize);
        const y = Math.round(Math.floor(i / resolution) * totalSize);
        const r = pixel & 0xff;
        const g = (pixel >> 8) & 0xff;
        const b = (pixel >> 16) & 0xff;
        const lightness = (Math.max(r, g, b) + Math.min(r, g, b)) / (2 * 255);

        newPixelPositions.push({
          x,
          y,
          z: 0,
          targetX: x,
          targetY: y,
          targetZ: 0,
          color: getColorFromLightness(lightness),
          trailFactor: 1,
          lastUpdate: Date.now()
        });
      }
    });

    pixelPositionsRef.current = newPixelPositions;
    initializedRef.current = true;
    return newPixelPositions;
  }, [resolution, pixelSize, getColorFromLightness]);

  const drawPixels = useCallback((positions: PixelPosition[]) => {
    const ctx = overlayCanvasRef.current?.getContext("2d");
    if (!ctx || !overlayCanvasRef.current) return;

    const gap = pixelSize * 1.75;
    const totalSize = pixelSize + gap;
    const canvasSize = resolution * totalSize;

    overlayCanvasRef.current.width = canvasSize;
    overlayCanvasRef.current.height = canvasSize;

    ctx.clearRect(0, 0, canvasSize, canvasSize);
    ctx.imageSmoothingEnabled = false;

    const magneticRadius = 150;
    const magneticStrength = 40;
    const easingFactor = 0.15;
    const trailDecay = 0.98;
    const resetSpeed = 0.5;
    const trailDuration = 1000;

    const rect = overlayCanvasRef.current.getBoundingClientRect();
    const scaleX = canvasSize / rect.width;
    const scaleY = canvasSize / rect.height;

    const currentMouseX = mouseRef.current.x;
    const currentMouseY = mouseRef.current.y;
    const currentTime = Date.now();
    const mouseMoved =
      Math.abs(currentMouseX - lastMousePosRef.current.x) > 1 ||
      Math.abs(currentMouseY - lastMousePosRef.current.y) > 1;

    if (mouseMoved) {
      isMovingRef.current = true;
      if (moveTimeoutRef.current) {
        clearTimeout(moveTimeoutRef.current);
      }
      moveTimeoutRef.current = setTimeout(() => {
        isMovingRef.current = false;
      }, 300);
    }

    lastMousePosRef.current = { x: currentMouseX, y: currentMouseY };

    const mouseX = canvasSize - (currentMouseX * scaleX * 1.5);
    const mouseY = canvasSize - (currentMouseY * scaleY);

    const sortedPositions = [...positions].sort((a, b) => b.z - a.z);

    sortedPositions.forEach((pixel) => {
      const width = Math.round(pixelSize / 1.25);
      const height = pixelSize;

      const dx = mouseX - pixel.targetX;
      const dy = mouseY - pixel.targetY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      let x = pixel.targetX;
      let y = pixel.targetY;

      if (distance < magneticRadius && isMovingRef.current) {
        const force = Math.pow(1 - distance / magneticRadius, 2) * magneticStrength;

        // Determine whether to move horizontally or vertically based on which is closer
        const absX = Math.abs(dx);
        const absY = Math.abs(dy);

        if (absX > absY) {
          // Move horizontally towards cursor
          x += dx * force * 0.3; // Changed from -= to += to attract
          y = pixel.targetY; // Keep vertical position unchanged
        } else {
          // Move vertically towards cursor
          x = pixel.targetX; // Keep horizontal position unchanged
          y += dy * force * 0.3; // Changed from -= to += to attract
        }

        pixel.trailFactor = 1;
        pixel.lastUpdate = currentTime;
      } else {
        const timeSinceUpdate = currentTime - pixel.lastUpdate;
        if (timeSinceUpdate < trailDuration) {
          const timeProgress = timeSinceUpdate / trailDuration;
          pixel.trailFactor = 1 - timeProgress;
        } else {
          pixel.trailFactor *= trailDecay;
        }

        // Return to original position maintaining the single-direction movement
        const returnStrength = Math.max(0.1, 1 - pixel.trailFactor);
        const dx = pixel.targetX - pixel.x;
        const dy = pixel.targetY - pixel.y;

        // Only move in the direction that's further from target
        if (Math.abs(dx) > Math.abs(dy)) {
          x = pixel.x + dx * returnStrength * resetSpeed;
          y = pixel.targetY;
        } else {
          x = pixel.targetX;
          y = pixel.y + dy * returnStrength * resetSpeed;
        }
      }

      pixel.x += (x - pixel.x) * easingFactor;
      pixel.y += (y - pixel.y) * easingFactor;

      ctx.fillStyle = pixel.color;
      ctx.globalAlpha = 1;
      ctx.fillRect(
        pixel.x + (totalSize - width) / 2,
        pixel.y + (totalSize - height) / 2,
        width,
        height
      );
    });
    ctx.globalAlpha = 1;
  }, [resolution, pixelSize]);

  const animate = useCallback(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

    frameRef.current = requestAnimationFrame(animate);

    rotationAngleRef.current += 0.01;
    if (modelRef.current) {
      modelRef.current.rotation.y = rotationAngleRef.current;
    }

    if (controlsRef.current) {
      controlsRef.current.update();
    }

    const newPositions = updatePixelPositions();
    if (newPositions) {
      drawPixels(newPositions);
    }

    rendererRef.current.render(sceneRef.current, cameraRef.current);
  }, [updatePixelPositions, drawPixels]);

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
    controls.enabled = false;
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
    <div ref={containerRef} className="relative w-screen h-screen mx-auto">
      <canvas
        ref={canvasRef}
        className="absolute w-full h-full opacity-0"
      />
      <canvas
        ref={overlayCanvasRef}
        className="absolute scale-x-[1.5] rotate-180 w-full h-full object-contain"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
}
