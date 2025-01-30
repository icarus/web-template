"use client";

import { useEffect, useRef, useCallback, RefObject } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useMousePositionRef } from "@/hooks/use-mouse-position-ref";

interface ModelProps {
  modelPath: string;
  colors?: string[];
}

export function BananaModel({
  modelPath,
  colors = ["#713F12", "#EF7C00", "#FFEC40"],
}: ModelProps) {
  const containerRef = useRef<HTMLDivElement>(null) as RefObject<HTMLDivElement>;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useMousePositionRef(containerRef);
  const isMovingRef = useRef(false);
  const rotationAngleRef = useRef(0);
  const originalVerticesRef = useRef<Float32Array | null>(null);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const moveTimeoutRef = useRef<ReturnType<typeof setTimeout>>(setTimeout(() => {}, 0));
  const pixelPositionsRef = useRef<Map<number, { x: number, y: number, targetX: number, targetY: number }>>(new Map());

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const renderTargetRef = useRef<THREE.WebGLRenderTarget | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameRef = useRef<number>(0);

  const resolution = 128;
  const pixelSize = 5;

  const getColorFromLightness = useCallback((lightness: number) => {
    if (lightness < 0.22) return colors[0];     // Darker brown
    if (lightness < 0.3) return colors[1];      // Orange
    return colors[2];                           // Yellow
  }, [colors]);

  const updateModelVertices = useCallback((mouseX: number, mouseY: number, isMoving: boolean) => {
    if (!modelRef.current || !originalVerticesRef.current) return;

    modelRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry) {
        const positions = child.geometry.attributes.position;

        if (!originalVerticesRef.current) {
          // Store original vertices on first run
          originalVerticesRef.current = new Float32Array(positions.array);
        }

        const magneticStrength = 0.2;
        const attractionRadius = 2;

        for (let i = 0; i < positions.count; i++) {
          const x = positions.getX(i);
          const y = positions.getY(i);

          // Convert mouse coordinates to model space
          const modelMouseX = (mouseX / window.innerWidth) * 4 - 2;
          const modelMouseY = -(mouseY / window.innerHeight) * 4 + 2;

          const dx = modelMouseX - x;
          const dy = modelMouseY - y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (isMoving && distance < attractionRadius) {
            const force = Math.pow(1 - distance / attractionRadius, 2) * magneticStrength;
            const originalX = originalVerticesRef.current[i * 3];
            const originalY = originalVerticesRef.current[i * 3 + 1];

            // Apply attraction force
            positions.setXY(
              i,
              originalX + (dx * force),
              originalY + (dy * force)
            );
          } else {
            // Reset to original position
            positions.setXY(
              i,
              originalVerticesRef.current[i * 3],
              originalVerticesRef.current[i * 3 + 1]
            );
          }
        }

        positions.needsUpdate = true;
        child.geometry.computeVertexNormals();
      }
    });
  }, []);

  const animate = useCallback(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !renderTargetRef.current) return;

    frameRef.current = requestAnimationFrame(animate);

    // Continuous rotation regardless of mouse movement
    if (modelRef.current) {
      rotationAngleRef.current += 0.01;
      modelRef.current.rotation.y = rotationAngleRef.current;

      // Update model vertices based on mouse position
      updateModelVertices(
        mouseRef.current.x,
        mouseRef.current.y,
        isMovingRef.current
      );
    }

    if (controlsRef.current) {
      controlsRef.current.update();
    }

    // Check mouse movement
    const currentMouseX = mouseRef.current.x;
    const currentMouseY = mouseRef.current.y;
    const deltaX = currentMouseX - lastMousePosRef.current.x;
    const deltaY = currentMouseY - lastMousePosRef.current.y;
    const mouseMoved = Math.abs(deltaX) > 1 || Math.abs(deltaY) > 1;

    if (mouseMoved) {
      isMovingRef.current = true;
      if (moveTimeoutRef.current) {
        clearTimeout(moveTimeoutRef.current);
      }
      moveTimeoutRef.current = setTimeout(() => {
        isMovingRef.current = false;
      }, 100);
    }

    lastMousePosRef.current = { x: currentMouseX, y: currentMouseY };

    // Clear render target and ensure proper state
    if (renderTargetRef.current) {
      rendererRef.current.setRenderTarget(renderTargetRef.current);
      rendererRef.current.clear();
      rendererRef.current.render(sceneRef.current, cameraRef.current);

      const pixelData = new Uint8Array(resolution * resolution * 4);
      rendererRef.current.readRenderTargetPixels(renderTargetRef.current, 0, 0, resolution, resolution, pixelData);
      rendererRef.current.setRenderTarget(null);

      const pixels = new Uint32Array(pixelData.buffer);
      const gap = pixelSize * 1.75;
      const totalSize = pixelSize + gap;

      const ctx = overlayCanvasRef.current?.getContext("2d");
      if (ctx && overlayCanvasRef.current) {
        const canvasSize = resolution * totalSize;
        overlayCanvasRef.current.width = canvasSize;
        overlayCanvasRef.current.height = canvasSize;

        ctx.clearRect(0, 0, canvasSize, canvasSize);
        ctx.imageSmoothingEnabled = false;

        // For scale-x-[-1.5]: we need to flip the x coordinate
        const mouseX = (currentMouseX * (canvasSize / window.innerWidth));
        const mouseY = canvasSize - (currentMouseY * (canvasSize / window.innerHeight));

        const attractionRadius = 750;
        const magneticStrength = 100;
        const easingFactor = 0.15;

        for (let i = 0; i < pixels.length; i++) {
          const pixel = pixels[i];
          const alpha = (pixel >> 24) & 0xff;

          if (alpha > 0) {
            const r = pixel & 0xff;
            const g = (pixel >> 8) & 0xff;
            const b = (pixel >> 16) & 0xff;

            const lightness = (Math.max(r, g, b) + Math.min(r, g, b)) / (2 * 255);
            const color = getColorFromLightness(lightness);

            const x = Math.round((i % resolution) * totalSize);
            const y = Math.round(Math.floor(i / resolution) * totalSize);

            // Get or initialize pixel position
            let pixelPos = pixelPositionsRef.current.get(i);
            if (!pixelPos) {
              pixelPos = { x, y, targetX: x, targetY: y };
              pixelPositionsRef.current.set(i, pixelPos);
            }

            // Update target position based on magnetic effect
            if (isMovingRef.current) {
              const dx = mouseX - x;
              const dy = mouseY - y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance < attractionRadius) {
                const force = Math.pow(1 - distance / attractionRadius, 2) * magneticStrength;
                const forceLimit = Math.min(force * 0.015, 0.8);

                pixelPos.targetX = x + (dx / distance) * force * forceLimit;
                pixelPos.targetY = y + (dy / distance) * force * forceLimit;
              } else {
                pixelPos.targetX = x;
                pixelPos.targetY = y;
              }
            } else {
              pixelPos.targetX = x;
              pixelPos.targetY = y;
            }

            // Smooth position update
            pixelPos.x += (pixelPos.targetX - pixelPos.x) * easingFactor;
            pixelPos.y += (pixelPos.targetY - pixelPos.y) * easingFactor;

            const size = pixelSize;
            const offset = (totalSize - size) / 2;
            ctx.fillStyle = color;
            ctx.fillRect(
              pixelPos.x + offset,
              pixelPos.y + offset,
              size,
              size
            );
          }
        }
      }
    }

    rendererRef.current.render(sceneRef.current, cameraRef.current);
  }, [resolution, pixelSize, getColorFromLightness, updateModelVertices]);

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

      // Store original vertices for all meshes
      gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.geometry) {
          const positions = child.geometry.attributes.position;
          originalVerticesRef.current = new Float32Array(positions.array);
        }
      });

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
        className="absolute scale-x-[-1.5] rotate-180 w-full h-full object-contain"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
}
