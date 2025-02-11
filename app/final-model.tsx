"use client";

import { useEffect, useRef, RefObject, useMemo, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useIsMobile } from "@/hooks/useIsMobile";

interface ModelProps {
  modelPath: string;
  colors?: string[];
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
  rotationSpeed?: number;
  forcedRotationAngle?: number;
  pixelSize?: number;
  gapRatio?: number;
  customResolution?: number;
}

const vertexShader = `
  varying vec2 vUv;
  varying float vDepth;

  void main() {
    vUv = uv;
    vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
    vDepth = -modelViewPosition.z;
    gl_Position = projectionMatrix * modelViewPosition;
  }
`;

const fragmentShader = `
  uniform sampler2D tDiffuse;
  uniform vec2 resolution;
  uniform vec3 colors[3];
  uniform vec2 mousePos;
  uniform float mouseRadius;
  uniform vec2 lastMousePos;
  uniform float time;
  uniform float uPixelSize;
  uniform float uGapRatio;

  varying vec2 vUv;
  varying float vDepth;

  vec2 lerp(vec2 start, vec2 end, float t) {
    return start + (end - start) * clamp(t, 0.0, 1.0);
  }

  // Hash function for pseudo-random values
  float hash(vec2 p) {
    float h = dot(p, vec2(127.1, 311.7));
    return fract(sin(h) * 43758.5453123);
  }

  void main() {
    float pixelSize = uPixelSize;
    float gap = pixelSize * uGapRatio;
    float totalSize = pixelSize + gap;

    // Calculate grid position for pixelation
    vec2 gridPos = floor(vUv * resolution / totalSize);
    vec2 pixelCenter = (gridPos + 0.5) * totalSize / resolution;

    // Convert pixel center to screen space
    vec2 screenPos = pixelCenter * resolution;

    // Calculate vectors to current and previous mouse positions
    vec2 toMouse = mousePos - screenPos;
    float distanceToMouse = length(toMouse);

    // Calculate mouse movement vector and velocity
    vec2 mouseVelocity = mousePos - lastMousePos;
    float velocityMagnitude = length(mouseVelocity);

    // Generate unique offset for this pixel based on its position
    float uniqueOffset = hash(gridPos) * 2.0 - 1.0;
    float timeOffset = time * (0.5 + hash(gridPos) * 0.5);

    // Calculate base attraction with per-pixel variation
    vec2 currentPos = screenPos;
    vec2 targetPos = screenPos;

    // Soften the attraction decay
    float normalizedDist = distanceToMouse / (mouseRadius * (1.0 + uniqueOffset * 0.1));
    float targetDecay = 1.0 / (1.0 + normalizedDist * normalizedDist * 2.0);
    targetDecay *= 0.8 + sin(timeOffset) * 0.1;

    // Reduce default movement amplitude
    float defaultMovement = sin(timeOffset + gridPos.x * 0.1) * cos(timeOffset + gridPos.y * 0.1) * 1.0;

    // Calculate direction with default movement
    vec2 direction = normalize(toMouse + vec2(cos(timeOffset), sin(timeOffset)) * 0.5);
    float displacement = max(defaultMovement, targetDecay * mouseRadius * 0.7);

    // Apply attraction with default movement
    vec2 attractionOffset = direction * displacement;
    vec2 finalPos = screenPos - attractionOffset;

    // Convert back to UV space
    vec2 attractedUV = finalPos / resolution;

    // Calculate pixel boundaries with precise thresholds
    vec2 pixelOffset = fract(vUv * resolution / totalSize);
    float pixelRatio = pixelSize / totalSize;

    // Sharp square check - no interpolation
    if (pixelOffset.x < (0.5 - pixelRatio/2.0) ||
        pixelOffset.x > (0.5 + pixelRatio/2.0) ||
        pixelOffset.y < (0.5 - pixelRatio/2.0) ||
        pixelOffset.y > (0.5 + pixelRatio/2.0)) {
      discard;
      return;
    }

    // Sample texture at the attracted position
    vec4 texel = texture2D(tDiffuse, attractedUV);

    // Only discard if completely transparent
    if(texel.a <= 0.0) {
      discard;
      return;
    }

    // Calculate brightness and pick color from palette without any additional processing
    float brightness = (texel.r + texel.g + texel.b) / 3.0;
    vec3 color;
    if(brightness < 0.22) {
      color = colors[0];
    } else if(brightness < 0.3) {
      color = colors[1];
    } else {
      color = colors[2];
    }

    // Output the color directly without any additional processing
    gl_FragColor = vec4(color, 1.0);
  }
`;

export function FinalModel({
  modelPath,
  colors = ["#A16207", "#F9A341", "#FFEC40"],
  canvasRef: externalCanvasRef,
  rotationSpeed,
  forcedRotationAngle,
  pixelSize,
  gapRatio,
  customResolution
}: ModelProps) {
  const effectiveRotationSpeed = rotationSpeed ?? 0.0025;
  const effectivePixelSize = pixelSize ?? 2;
  const effectiveGapRatio = gapRatio ?? 1.5;
  const effectiveResolution = customResolution ?? 448;

  const MOUSE_RADIUS = 50.0;
  const isMobile = useIsMobile();
  // const pathname = usePathname();
  // const disableMouseInteractions = pathname !== "/";
  const disableMouseInteractions = true;
  const [isLoaded, setIsLoaded] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null) as RefObject<HTMLDivElement>;
  const defaultCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasRef = externalCanvasRef || defaultCanvasRef;
  const modelRef = useRef<THREE.Group | null>(null);
  const rotationAngleRef = useRef(0);
  const mouseRef = useRef<{ x: number; y: number; vx: number; vy: number }>({ x: 0, y: 0, vx: 0, vy: 0 });
  const targetMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastFrameTime = useRef(Date.now());

  const SPRING_STIFFNESS = 56;
  const SPRING_DAMPING = 12;
  const MASS = 2.0;

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const renderTargetRef = useRef<THREE.WebGLRenderTarget | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const postMaterialRef = useRef<THREE.ShaderMaterial | null>(null);

  const resolution = effectiveResolution;

  const colorVectors = useMemo(() => {
    return colors.map(color => {
      // Use the hex color values directly without conversion
      const c = new THREE.Color(color);
      return new THREE.Vector3(c.r, c.g, c.b);
    });
  }, [colors]);

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
    camera.position.set(0, 0, 0);
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
      antialias: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.setClearAlpha(0);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enabled = false;
    controlsRef.current = controls;

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    renderTargetRef.current = new THREE.WebGLRenderTarget(resolution, resolution);

    const postScene = new THREE.Scene();
    const postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    renderer.setRenderTarget(renderTargetRef.current);
    renderer.clear();
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    renderer.clear();
    renderer.render(postScene, postCamera);

    const centerX = -200;
    const centerY = 0;

    const postMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: renderTargetRef.current.texture },
        resolution: { value: new THREE.Vector2(resolution, resolution) },
        colors: { value: colorVectors },
        mousePos: { value: new THREE.Vector2(centerX, centerY) },
        lastMousePos: { value: new THREE.Vector2(centerX, centerY) },
        mouseRadius: { value: MOUSE_RADIUS },
        time: { value: 0.0 },
        uPixelSize: { value: effectivePixelSize },
        uGapRatio: { value: effectiveGapRatio }
      },
      vertexShader,
      fragmentShader,
      transparent: true
    });

    postMaterialRef.current = postMaterial;
    const postQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), postMaterial);
    postScene.add(postQuad);

    mouseRef.current = { x: centerX, y: centerY, vx: 0, vy: 0 };
    targetMouseRef.current = { x: centerX, y: centerY };

    let animationFrameId: number;
    const animate = () => {
      if (!renderer || !scene || !camera || !renderTargetRef.current || !postScene || !postCamera) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      const currentTime = Date.now();
      const deltaTime = Math.min((currentTime - lastFrameTime.current) / 1000, 0.016);
      lastFrameTime.current = currentTime;

      const centerX = resolution / 2;
      const centerY = resolution / 2;

      if (modelRef.current) {
        if (forcedRotationAngle !== undefined) {
          modelRef.current.rotation.y = forcedRotationAngle;
          rotationAngleRef.current = forcedRotationAngle;
        } else {
          rotationAngleRef.current += effectiveRotationSpeed;
          modelRef.current.rotation.y = rotationAngleRef.current;
        }
      }

      if (!isMobile) {
        if (!mouseRef.current) {
          mouseRef.current = { x: centerX, y: centerY, vx: 0, vy: 0 };
        }
        if (!targetMouseRef.current) {
          targetMouseRef.current = { x: centerX, y: centerY };
        }

        const springForceX = SPRING_STIFFNESS * (targetMouseRef.current.x - mouseRef.current.x);
        const springForceY = SPRING_STIFFNESS * (targetMouseRef.current.y - mouseRef.current.y);

        const dampingForceX = SPRING_DAMPING * mouseRef.current.vx;
        const dampingForceY = SPRING_DAMPING * mouseRef.current.vy;

        const accelerationX = (springForceX - dampingForceX) / MASS;
        const accelerationY = (springForceY - dampingForceY) / MASS;

        mouseRef.current.vx += accelerationX * deltaTime;
        mouseRef.current.vy += accelerationY * deltaTime;

        mouseRef.current.x += mouseRef.current.vx * deltaTime;
        mouseRef.current.y += mouseRef.current.vy * deltaTime;
      } else {
        mouseRef.current = { x: centerX, y: centerY, vx: 0, vy: 0 };
        targetMouseRef.current = { x: centerX, y: centerY };
      }

      if (postMaterialRef.current) {
        const mouseX = mouseRef.current?.x ?? centerX;
        const mouseY = mouseRef.current?.y ?? centerY;

        postMaterialRef.current.uniforms.lastMousePos.value.copy(postMaterialRef.current.uniforms.mousePos.value);
        postMaterialRef.current.uniforms.mousePos.value.set(mouseX, mouseY);
        postMaterialRef.current.uniforms.mouseRadius.value = MOUSE_RADIUS;
        postMaterialRef.current.uniforms.time.value += deltaTime;
      }

      renderer.setRenderTarget(renderTargetRef.current);
      renderer.clear();
      renderer.render(scene, camera);

      renderer.setRenderTarget(null);
      renderer.clear();
      renderer.render(postScene, postCamera);

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const loader = new GLTFLoader();
    loader.load(modelPath,
      (gltf) => {
        const model = gltf.scene;
        const scale = isMobile ? 1.3 : 1.0;
        model.scale.set(scale, scale, scale);
        model.position.set(0, 0, 0);
        model.rotation.set(0, 0, 0);
        scene.add(model);
        modelRef.current = model;

        if (renderer && scene && camera && renderTargetRef.current && postScene && postCamera) {
          for (let i = 0; i < 3; i++) {
            renderer.setRenderTarget(renderTargetRef.current);
            renderer.clear();
            renderer.render(scene, camera);

            renderer.setRenderTarget(null);
            renderer.clear();
            renderer.render(postScene, postCamera);
          }
        }
        setIsLoaded(true);
      },
    );

    const handleResize = () => {
      if (!camera || !renderer) return;

      const size = Math.min(window.innerWidth, window.innerHeight);
      const aspect = 1.0;
      camera.left = (frustumSize * aspect) / -2;
      camera.right = (frustumSize * aspect) / 2;
      camera.top = frustumSize / 2;
      camera.bottom = -frustumSize / 2;
      camera.updateProjectionMatrix();

      renderer.setSize(size, size);

      if (canvasRef.current) {
        canvasRef.current.style.position = 'absolute';
        canvasRef.current.style.left = `${(window.innerWidth - size) / 2}px`;
        canvasRef.current.style.top = `${(window.innerHeight - size) / 2}px`;
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (isMobile) return;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = (event.clientX - rect.left) / rect.width * resolution;
      const y = (1.0 - (event.clientY - rect.top) / rect.height) * resolution;
      targetMouseRef.current = { x, y };
    };

    const handleMouseLeave = () => {
      const centerX = 0;
      const centerY = 0;
      targetMouseRef.current = { x: centerX, y: centerY };
    };

    if (!isMobile && !disableMouseInteractions) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseleave', handleMouseLeave);
      document.addEventListener('visibilitychange', handleMouseLeave);
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (!isMobile && !disableMouseInteractions) {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseleave', handleMouseLeave);
        document.removeEventListener('visibilitychange', handleMouseLeave);
      }
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      controls.dispose();
      postMaterial.dispose();
      postQuad.geometry.dispose();
      renderTargetRef.current?.dispose();

      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
      renderTargetRef.current = null;
      modelRef.current = null;
      controlsRef.current = null;
      postMaterialRef.current = null;
    };
  }, [modelPath, resolution, colorVectors, MOUSE_RADIUS, isMobile, disableMouseInteractions, effectivePixelSize, effectiveGapRatio, effectiveRotationSpeed, forcedRotationAngle, canvasRef]);

  return (
    <div
      ref={containerRef}
      className="w-screen h-screen mx-auto fixed touch-none"
      style={{
        pointerEvents: isMobile || disableMouseInteractions ? 'none' : 'all',
        visibility: isLoaded ? 'visible' : 'hidden',
      }}
    >
      <canvas
        ref={canvasRef}
        className="absolute w-full h-full"
        style={{
          pointerEvents: isMobile || disableMouseInteractions ? 'none' : 'auto',
          touchAction: isMobile || disableMouseInteractions ? 'none' : 'auto',
        }}
      />
    </div>
  );
}
