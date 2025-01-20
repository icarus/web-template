"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { Vector3 } from "three";

interface ModelViewerProps {
  modelPath: string;
  colors?: string[];
}

export function ModelViewer({
  modelPath,
  colors = ["#000000", "#764A0A", "#F57C00", "#FFD700"],
}: ModelViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [, setIsReady] = useState(false);

  const [resolution, setResolution] = useState(128);
  const [pixelSize, setPixelSize] = useState(1);
  const [rotationSpeedFactor, setRotationSpeedFactor] = useState(1);
  const [isGrayscale, setIsGrayscale] = useState(false);
  const [cameraPosition, setCameraPosition] = useState<'front' | 'top' | 'isometric'>('front');
  const [autoRotate, setAutoRotate] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);
  const targetZoomRef = useRef(1);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cameraPositions = {
    front: new Vector3(0, 0, 5),
    top: new Vector3(0, 5, 0),
    isometric: new Vector3(-3, 3, 3),
  };

  const rotationSpeed = 0.005 * rotationSpeedFactor;
  const frameRef = useRef<number>(0);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const renderTargetRef = useRef<THREE.WebGLRenderTarget | null>(null);

  const rgbToLightness = useCallback((r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    return (max + min) / 2;
  }, []);

  const readPixelColors = useCallback(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !renderTargetRef.current) return;

    const pixelData = new Uint8Array(resolution * resolution * 4);
    rendererRef.current.setRenderTarget(renderTargetRef.current);
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    rendererRef.current.readRenderTargetPixels(renderTargetRef.current, 0, 0, resolution, resolution, pixelData);
    rendererRef.current.setRenderTarget(null);

    const ctx = overlayCanvasRef.current?.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const gap = pixelSize;
    const totalSize = pixelSize + gap;
    const canvasSize = resolution * totalSize;

    if (overlayCanvasRef.current) {
      overlayCanvasRef.current.width = canvasSize;
      overlayCanvasRef.current.height = canvasSize;
    }

    ctx.clearRect(0, 0, canvasSize, canvasSize);
    ctx.imageSmoothingEnabled = false;
    ctx.translate(0.5, 0.5);

    for (let i = 0; i < pixelData.length; i += 4) {
      const r = pixelData[i];
      const g = pixelData[i + 1];
      const b = pixelData[i + 2];
      const a = pixelData[i + 3];

      if (a > 0) {
        const lightness = rgbToLightness(r, g, b);
        let color;

        if (lightness < 0.08) {
          color = colors[3];
        } else if (lightness < 0.12) {
          color = colors[2];
        } else if (lightness < 0.16) {
          color = colors[1];
        } else if (lightness < 1) {
          color = colors[3];
        } else {
          color = colors[0];
        }

        const pixelIndex = i / 4;
        const x = Math.round((pixelIndex % resolution) * totalSize + pixelSize / 2);
        const y = Math.round(Math.floor(pixelIndex / resolution) * totalSize + pixelSize / 2);

        ctx.beginPath();
        ctx.arc(x, y, pixelSize / 1.5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = a / 255;
        ctx.fill();
      }
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }, [resolution, rgbToLightness, pixelSize, colors]);

  const modelRef = useRef<THREE.Group | null>(null);

  const animate = useCallback(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !modelRef.current) return;

    frameRef.current = requestAnimationFrame(animate);

    if (autoRotate) {
      modelRef.current.rotation.y = (modelRef.current.rotation.y + rotationSpeed) % (Math.PI * 2);
    }

    // Update camera position with smooth transition
    if (cameraRef.current) {
      const targetPosition = cameraPositions[cameraPosition];
      cameraRef.current.position.lerp(targetPosition, 0.05);
      cameraRef.current.lookAt(0, 0, 0);

      // Smooth zoom transition
      const currentZoom = cameraRef.current.zoom;
      const targetZoom = isZoomed ? 2 : 1;
      targetZoomRef.current = targetZoom;

      if (Math.abs(currentZoom - targetZoom) > 0.01) {
        cameraRef.current.zoom = THREE.MathUtils.lerp(currentZoom, targetZoom, 0.05);
        cameraRef.current.updateProjectionMatrix();
      }
    }

    readPixelColors();
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  }, [autoRotate, readPixelColors, rotationSpeed, cameraPositions, cameraPosition, isZoomed]);

  const defaultValues = {
    resolution: 128,
    pixelSize: 1,
    rotationSpeed: 1,
    grayscale: false,
    camera: 'front' as const,
    zoomed: false,
  };

  const handleReset = () => {
    setResolution(defaultValues.resolution);
    setPixelSize(defaultValues.pixelSize);
    setRotationSpeedFactor(defaultValues.rotationSpeed);
    setIsGrayscale(defaultValues.grayscale);
    setCameraPosition(defaultValues.camera);
    setIsZoomed(defaultValues.zoomed);
  };

  useEffect(() => {
    if (!canvasRef.current || !overlayCanvasRef.current) return;

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

    // Add two directional lights for consistent illumination
    const frontLight = new THREE.DirectionalLight(0xffffff, 2);
    frontLight.position.set(0, 0, 5);
    scene.add(frontLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 2);
    backLight.position.set(0, 0, -5);
    scene.add(backLight);

    // Add ambient light to ensure minimum brightness
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      powerPreference: "high-performance",
      antialias: true,
      alpha: true,
    });

    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    renderer.setPixelRatio(1);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    const renderTarget = new THREE.WebGLRenderTarget(resolution, resolution);
    renderTargetRef.current = renderTarget;

    const loader = new GLTFLoader();
    loader.load(
      modelPath,
      (gltf) => {
        scene.add(gltf.scene);
        modelRef.current = gltf.scene;
        animate();
        setIsReady(true);
      },
      undefined,
      console.error
    );

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      renderTarget.dispose();
      renderer.dispose();
    };
  }, [modelPath, animate, resolution]);

  useEffect(() => {
    if (!rendererRef.current) return;

    if (renderTargetRef.current) {
      renderTargetRef.current.dispose();
    }
    renderTargetRef.current = new THREE.WebGLRenderTarget(resolution, resolution);
  }, [resolution]);

  return (
    <div className="flex flex-col gap-8 w-full max-w-screen-lg mx-auto p-4">
      <div className="relative aspect-square w-full">
        <canvas
          ref={canvasRef}
          className="hidden absolute w-full h-full"
        />
        <canvas
          ref={overlayCanvasRef}
          className={`scale-x-[-1.5] rotate-180 absolute w-full h-full object-contain ${isGrayscale ? 'grayscale' : ''}`}
          style={{
            imageRendering: 'pixelated',
          }}
        />
      </div>

      <div className="grid gap-4 w-full absolute top-1/2 right-12 -translate-y-1/2 max-w-md mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="text-sm" htmlFor="grayscale-mode">
              Modo escala de grises
            </label>
            <Switch
              id="grayscale-mode"
              checked={isGrayscale}
              onCheckedChange={setIsGrayscale}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reiniciar</span>
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Resolución</span>
            <span>{resolution}px</span>
          </div>
          <Slider
            value={[resolution]}
            onValueChange={([value]) => setResolution(value)}
            min={32}
            max={512}
            step={32}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Tamaño pixel</span>
            <span>{pixelSize}px</span>
          </div>
          <Slider
            value={[pixelSize]}
            onValueChange={([value]) => setPixelSize(value)}
            min={1}
            max={Math.max(1, Math.round(16 * (128 / resolution)))}
            step={1}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Velocidad rotación</span>
            <span>{rotationSpeedFactor.toFixed(2)}x</span>
          </div>
          <Slider
            value={[rotationSpeedFactor]}
            onValueChange={([value]) => setRotationSpeedFactor(value)}
            min={0.1}
            max={15}
            step={0.5}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Vista cámara</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant={cameraPosition === 'front' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCameraPosition('front')}
            >
              Frontal
            </Button>
            <Button
              variant={cameraPosition === 'top' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCameraPosition('top')}
            >
              Superior
            </Button>
            <Button
              variant={cameraPosition === 'isometric' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCameraPosition('isometric')}
            >
              Isométrica
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm">Zoom</label>
          <Switch
            checked={isZoomed}
            onCheckedChange={setIsZoomed}
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm">Auto-rotación</label>
          <Switch
            checked={autoRotate}
            onCheckedChange={setAutoRotate}
          />
        </div>
      </div>
    </div>
  );
}
