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
  cameraPosition?: CameraPositionType;
  isGrayscale?: boolean;
  isZoomed?: boolean;
  isAutoRotate?: boolean;
}

type CameraPositionType = 'front' | 'top' | 'isometric' | 'stem' | 'stem-bottom';

export function ModelViewer({
  modelPath,
  colors = ["#713F12", "#EF7C00", "#FFEC40"],
  cameraPosition: initialCameraPosition = 'front',
  isGrayscale: initialIsGrayscale = false,
  isZoomed: initialIsZoomed = false,
  isAutoRotate: initialIsAutoRotate = true,
}: ModelViewerProps) {
  const defaultValues = {
    resolution: 128,
    pixelSize: 5,
    rotationSpeedFactor: 1,
    isGrayscale: initialIsGrayscale,
    cameraPosition: initialCameraPosition,
    isZoomed: initialIsZoomed,
    autoRotate: initialIsAutoRotate
  };

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [, setIsReady] = useState(false);

  const [resolution, setResolution] = useState(defaultValues.resolution);
  const [pixelSize, setPixelSize] = useState(defaultValues.pixelSize);
  const [rotationSpeedFactor, setRotationSpeedFactor] = useState(defaultValues.rotationSpeedFactor);
  const [isGrayscale, setIsGrayscale] = useState(defaultValues.isGrayscale);
  const [cameraPosition, setCameraPosition] = useState<CameraPositionType>(defaultValues.cameraPosition);
  const [autoRotate, setAutoRotate] = useState(defaultValues.autoRotate);
  const [isZoomed, setIsZoomed] = useState(defaultValues.isZoomed);
  const targetZoomRef = useRef(1);
  const [colorPhase, setColorPhase] = useState(0);
  const [, setColorCount] = useState(12);
  const [, setSaturation] = useState(0.8);
  const [, setLightness] = useState(0.5);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cameraPositions = {
    front: new Vector3(0, 0, 5),
    top: new Vector3(0, 5, 0),
    isometric: new Vector3(-3, 3, 3),
    stem: new Vector3(0, 5, 15),
    "stem-bottom": new Vector3(0, 0, -5),
  };

  const rotationSpeed = 0.005 * rotationSpeedFactor;
  const frameRef = useRef<number>(0);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const renderTargetRef = useRef<THREE.WebGLRenderTarget | null>(null);

  const colorHistoryRef = useRef<Map<number, { color: string, frames: number }>>(new Map());

  const rgbToLightness = useCallback((r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    return (max + min) / 2;
  }, []);

  const lastFrameTime = useRef(0);
  const FPS = 20;
  const frameInterval = 1000 / FPS;

  const getColorFromLightness = useCallback((lightness: number) => {
    if (colorPhase === 0) {
      if (lightness < 0.22) return colors[0];
      if (lightness < 0.3) return colors[1];
      return colors[2];
    }

    const adjustedLightness = (lightness + colorPhase) % 1;
    const colorIndex = Math.floor(adjustedLightness * colors.length);
    const nextColorIndex = (colorIndex + 1) % colors.length;

    const color1 = colors[colorIndex];
    const color2 = colors[nextColorIndex];

    const factor = (adjustedLightness * colors.length) % 1;

    const rgb1 = {
      r: parseInt(color1.slice(1, 3), 16),
      g: parseInt(color1.slice(3, 5), 16),
      b: parseInt(color1.slice(5, 7), 16)
    };

    const rgb2 = {
      r: parseInt(color2.slice(1, 3), 16),
      g: parseInt(color2.slice(3, 5), 16),
      b: parseInt(color2.slice(5, 7), 16)
    };

    const ease = (t: number) => (1 - Math.cos(t * Math.PI)) / 2;
    const smoothFactor = ease(factor);

    // Interpolate between the colors
    const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * smoothFactor);
    const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * smoothFactor);
    const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * smoothFactor);

    return `rgb(${r},${g},${b})`;
  }, [colorPhase, colors]);

  const readPixelColors = useCallback(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !renderTargetRef.current) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - lastFrameTime.current;

    if (deltaTime < frameInterval) return;

    lastFrameTime.current = currentTime;

    const pixelData = new Uint8Array(resolution * resolution * 4);
    rendererRef.current.setRenderTarget(renderTargetRef.current);
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    rendererRef.current.readRenderTargetPixels(renderTargetRef.current, 0, 0, resolution, resolution, pixelData);
    rendererRef.current.setRenderTarget(null);

    const ctx = overlayCanvasRef.current?.getContext("2d", { willReadFrequently: true });
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
    const colorCache = new Map<number, string>();
    const newColorHistory = new Map<number, { color: string, frames: number }>();

    for (let i = 0; i < pixels.length; i++) {
      const pixel = pixels[i];
      const a = (pixel >> 24) & 0xff;

      if (a > 0) {
        const r = pixel & 0xff;
        const g = (pixel >> 8) & 0xff;
        const b = (pixel >> 16) & 0xff;

        const key = (r << 16) | (g << 8) | b;
        let color = colorCache.get(key);

        if (!color) {
          const lightness = rgbToLightness(r, g, b);

          // Use the new color mapping function
          let finalColor = getColorFromLightness(lightness);

          // Color smoothing logic
          const history = colorHistoryRef.current.get(i);
          if (history) {
            if (history.color !== finalColor) {
              if (history.frames < 3) {
                finalColor = history.color;
                newColorHistory.set(i, { color: history.color, frames: history.frames + 1 });
              } else {
                newColorHistory.set(i, { color: finalColor, frames: 0 });
              }
            } else {
              newColorHistory.set(i, { color: finalColor, frames: 0 });
            }
          } else {
            newColorHistory.set(i, { color: finalColor, frames: 0 });
          }

          color = finalColor;
          colorCache.set(key, color);
        }

        const x = Math.round((i % resolution) * totalSize);
        const y = Math.round(Math.floor(i / resolution) * totalSize);

        const size = pixelSize;
        const offset = (totalSize - size) / 2;
        ctx.fillStyle = color;
        ctx.globalAlpha = 100;
        ctx.fillRect(x + offset, y + offset, size, size);
      }
    }

    colorHistoryRef.current = newColorHistory;
  }, [resolution, rgbToLightness, pixelSize, getColorFromLightness, frameInterval]);

  const modelRef = useRef<THREE.Group | null>(null);

  const animate = useCallback(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !modelRef.current) return;

    frameRef.current = requestAnimationFrame(animate);

    if (autoRotate) {
      modelRef.current.rotation.y = (modelRef.current.rotation.y + rotationSpeed) % (Math.PI * 2);
    }

    if (cameraRef.current) {
      const targetPosition = cameraPositions[cameraPosition];
      cameraRef.current.position.lerp(targetPosition, 0.05);
      cameraRef.current.lookAt(0, 0, 0);

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

  const handleReset = () => {
    setResolution(defaultValues.resolution);
    setPixelSize(defaultValues.pixelSize);
    setRotationSpeedFactor(defaultValues.rotationSpeedFactor);
    setIsGrayscale(defaultValues.isGrayscale);
    setCameraPosition(defaultValues.cameraPosition);
    setIsZoomed(defaultValues.isZoomed);
    setAutoRotate(defaultValues.autoRotate);
    setColorPhase(0);
    setColorCount(12);
    setSaturation(0.8);
    setLightness(0.5);
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

    // Updated lighting setup
    const createDirectionalLight = (x: number, y: number, z: number, intensity: number) => {
      const light = new THREE.DirectionalLight(0xffffff, intensity);
      light.position.set(x, y, z);
      return light;
    };

    // Front light
    scene.add(createDirectionalLight(0, 0, 5, 1.5));
    // Back light
    scene.add(createDirectionalLight(0, 0, -5, 1.5));
    // Right light
    scene.add(createDirectionalLight(5, 0, 0, 1.5));
    // Left light
    scene.add(createDirectionalLight(-5, 0, 0, 1.5));
    // Top light
    scene.add(createDirectionalLight(0, 5, 0, 1.5));
    // Bottom light
    scene.add(createDirectionalLight(0, -5, 0, 1));

    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      powerPreference: "high-performance",
      antialias: true,
      alpha: false,
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
    <div className="flex flex-col gap-8 w-full max-w-screen-lg mx-auto">
      <div className="relative aspect-square w-full">
        <canvas
          ref={canvasRef}
          className="hidden absolute w-full h-full"
        />
        <canvas
          ref={overlayCanvasRef}
          className={`scale-x-[-1.5] rotate-180 absolute w-full h-full object-contain ${isGrayscale ? 'grayscale brightness-75' : ''}`}
          style={{
            imageRendering: 'pixelated',
          }}
        />
      </div>

      <div className="hidden grid gap-4 w-full absolute top-1/2 right-12 -translate-y-1/2 max-w-md mx-auto">
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

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Color Phase</span>
            <span>{(colorPhase * 360).toFixed(0)}°</span>
          </div>
          <Slider
            value={[colorPhase]}
            onValueChange={([value]) => setColorPhase(value)}
            min={0}
            max={1}
            step={0.001}
          />
        </div>
      </div>
    </div>
  );
}
