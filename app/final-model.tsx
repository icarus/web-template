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
  uniform vec2 mousePos;
  uniform float mouseRadius;
  uniform vec2 lastMousePos;
  uniform float time;
  uniform float uPixelSize;
  uniform float uGapRatio;
  uniform float uRotationAngle;

  varying vec2 vUv;
  varying float vDepth;

  vec2 lerp(vec2 start, vec2 end, float t) {
    return start + (end - start) * clamp(t, 0.0, 1.0);
  }

  float hash(vec2 p) {
    float h = dot(p, vec2(127.1, 311.7));
    return fract(sin(h) * 43758.5453123);
  }

  float getColorIntensity(vec3 color) {
    // Calculate color intensity (magnitude of the color vector)
    return length(color);
  }

  // Super smooth transition function
  float smoothTransition(float edge0, float edge1, float x) {
    float t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
    // Higher-order polynomial for extra smoothness
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
  }

  // Create color bands with ultra-smooth transitions
  vec3 colorama(vec2 uv, vec3 color) {
    float intensity = getColorIntensity(color);

    vec2 centeredUV = uv * 2.0 - 1.0;
    float baseAmount = 0.2;
    float rotatedAmount = 0.18;  // Amount for side view

    // Create peaks at 90° and 270° rotations
    float angle = mod(uRotationAngle, 3.14159 * 2.0);
    float dist90 = abs(angle - 3.14159 / 2.0);  // Distance from 90°
    float dist270 = abs(angle - 3.14159 * 3.0 / 2.0);  // Distance from 270°
    float normalizedDist = min(dist90, dist270) / (3.14159 / 2.0);  // Normalize to [0,1] over wider range

    // Much smoother transition between curve amounts
    float curveAmount = mix(
        rotatedAmount,
        baseAmount,
        smoothstep(0.0, 0.8, normalizedDist)  // Wider smoothstep range for slower transition
    );

    float curvedY = uv.y + (sin(uv.x * 3.14159) * curveAmount);

    float depthFactor = 1.0 - smoothstep(0.2, 0.7, intensity);
    float factor = mix(curvedY, depthFactor, 0.1);

    vec3 yellow = vec3(0.95, 0.89, 0.15);     // #FFF140
    vec3 orange = vec3(0.82, 0.5, 0.05);      // Less orange, more brownish
    vec3 brown = vec3(0.35, 0.25, 0.0);       // Richer brown
    vec3 darkBrown = vec3(0.3, 0.25, 0.0);    // Darker brown

    // Create wider, smoother transitions between colors
    vec3 baseColor;
    if (factor < 0.53) {                      // Extended yellow base
        baseColor = yellow;
    } else if (factor < 0.56) {               // Yellow to orange transition
        float t = smoothstep(0.53, 0.56, factor);
        baseColor = mix(yellow, orange, t);
    } else if (factor < 0.57) {               // Small orange range
        baseColor = orange;
    } else if (factor < 0.65) {               // Longer orange to brown transition
        float t = smoothstep(0.57, 0.65, factor);
        baseColor = mix(orange, brown, t);
    } else if (factor < 0.78) {               // Extended brown range
        baseColor = brown;
    } else if (factor < 0.88) {               // Wider brown to dark brown transition
        float t = smoothstep(0.78, 0.88, factor);
        baseColor = mix(brown, darkBrown, t);
    } else {
        baseColor = darkBrown;
    }

    float darkening = mix(0.3, 1.0, pow(1.0 - depthFactor, 0.8));
    return baseColor * darkening;
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

    if(texel.a <= 0.0) {
      discard;
      return;
    }

    vec3 colorized = colorama(attractedUV, texel.rgb);
    gl_FragColor = vec4(colorized, 1.0);
  }
`;

export function FinalModel({
  modelPath,
  colors = [
    "#FFF140", // Brightest yellow
    "#D17308", // Less orange, more brownish
    "#8C5800", // Richer brown
    "#593F00"  // Darker brown
  ],
  canvasRef: externalCanvasRef,
  rotationSpeed,
  forcedRotationAngle,
  pixelSize,
  gapRatio,
  customResolution
}: ModelProps) {
  const effectiveRotationSpeed = rotationSpeed ?? 0.0025;
  const effectivePixelSize = pixelSize ?? 1;
  const effectiveGapRatio = gapRatio ?? 1.5;
  const effectiveResolution = customResolution ?? 320 ;

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
    return colors.slice(0, 3).map(color => {
      const c = new THREE.Color(color);
      c.convertSRGBToLinear();
      return c;
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
        mousePos: { value: new THREE.Vector2(centerX, centerY) },
        lastMousePos: { value: new THREE.Vector2(centerX, centerY) },
        mouseRadius: { value: MOUSE_RADIUS },
        time: { value: 0.0 },
        uPixelSize: { value: effectivePixelSize },
        uGapRatio: { value: effectiveGapRatio },
        uRotationAngle: { value: 0.0 }
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

        if (postMaterialRef.current) {
          postMaterialRef.current.uniforms.uRotationAngle = { value: rotationAngleRef.current };
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
