"use client";

import { useEffect, useRef, RefObject, useMemo } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface ModelProps {
  modelPath: string;
  colors?: string[];
}

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
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

  varying vec2 vUv;

  vec2 lerp(vec2 start, vec2 end, float t) {
    return start + (end - start) * clamp(t, 0.0, 1.0);
  }

  void main() {
    // Base pixel size and relative gap
    float basePixelSize = 1.5;
    float gapRatio = 2.0;
    float pixelSize = basePixelSize;
    float gap = pixelSize * gapRatio;
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

    // Animation parameters
    float attractionStrength = 1.0;      // Base attraction strength
    float velocityInfluence = 0.8;       // Velocity influence
    float maxDisplacement = 60.0;        // Reduced maximum displacement to prevent breaking apart
    float springStrength = 2.5;          // Spring constant for decay
    float springDamping = 0.75;          // Damping for decay oscillation
    float springMass = 1.0;              // Mass for decay spring
    float cohesionStrength = 0.4;        // Strength of neighbor cohesion
    float maxVelocityLimit = 400.0;      // Limit maximum velocity influence

    // Calculate base attraction
    vec2 currentPos = screenPos;
    vec2 targetPos = screenPos;

    // Calculate spring-based decay
    float normalizedDist = distanceToMouse / mouseRadius;
    float targetDecay = 1.0 / (1.0 + normalizedDist * normalizedDist);

    // Limit velocity influence for fast movements
    float cappedVelocityMagnitude = min(velocityMagnitude, maxVelocityLimit);
    vec2 cappedVelocity = normalize(mouseVelocity) * cappedVelocityMagnitude;

    // Spring physics for decay with velocity limiting
    float decayVelocity = length(cappedVelocity) * 0.001;
    float springForce = springStrength * (targetDecay - decayVelocity);
    float dampingForce = springDamping * decayVelocity;
    float acceleration = (springForce - dampingForce) / springMass;

    // Final decay with spring physics
    float attractionFactor = mix(
        targetDecay,
        targetDecay + acceleration,
        smoothstep(0.0, 1.0, cappedVelocityMagnitude * 0.01)
    );
    attractionFactor = clamp(attractionFactor, 0.0, 1.0);

    // Calculate direction to mouse with cohesion
    vec2 direction = normalize(toMouse);

    // Add neighbor cohesion effect
    vec2 neighborOffset = vec2(totalSize, 0.0);
    vec2 neighborPos1 = screenPos + neighborOffset;
    vec2 neighborPos2 = screenPos - neighborOffset;
    vec2 neighborPos3 = screenPos + vec2(0.0, totalSize);
    vec2 neighborPos4 = screenPos - vec2(0.0, totalSize);

    // Calculate average neighbor position influence
    vec2 cohesionForce = vec2(0.0);
    cohesionForce += normalize(neighborPos1 - screenPos);
    cohesionForce += normalize(neighborPos2 - screenPos);
    cohesionForce += normalize(neighborPos3 - screenPos);
    cohesionForce += normalize(neighborPos4 - screenPos);
    cohesionForce = normalize(cohesionForce) * cohesionStrength;

    // Blend direction with cohesion
    direction = normalize(mix(direction, cohesionForce, velocityMagnitude * 0.001));

    // Calculate displacement with limited range
    float velocityFactor = 1.0 + (cappedVelocityMagnitude * velocityInfluence);
    float displacement = attractionStrength * mouseRadius * attractionFactor * velocityFactor;
    displacement = min(displacement, maxDisplacement);

    // Apply attraction with cohesion
    vec2 attractionOffset = direction * displacement;
    vec2 velocityOffset = cappedVelocity * velocityInfluence * attractionFactor;
    attractionOffset = mix(attractionOffset, attractionOffset + velocityOffset, 0.5);

    // Calculate final position with enhanced stability
    targetPos = screenPos - attractionOffset;

    // Add position constraint to prevent breaking apart
    vec2 toTarget = targetPos - screenPos;
    float distanceToTarget = length(toTarget);
    if (distanceToTarget > maxDisplacement) {
        targetPos = screenPos + (normalize(toTarget) * maxDisplacement);
    }

    float springSmoothing = mix(0.3, 0.6, attractionFactor);
    currentPos = lerp(screenPos, targetPos, springSmoothing);

    // Convert back to UV space
    vec2 attractedUV = currentPos / resolution;

    // Make pixels perfectly square with relative gaps
    vec2 pixelOffset = fract(vUv * resolution / totalSize);
    pixelOffset = pixelOffset - 0.5;
    float pixelRatio = pixelSize / totalSize;
    float halfPixel = pixelRatio / 2.0;

    // Strict square check
    if (abs(pixelOffset.x) > halfPixel || abs(pixelOffset.y) > halfPixel) {
      discard;
      return;
    }

    // Sample texture at the attracted position
    vec4 texel = texture2D(tDiffuse, attractedUV);
    if(texel.a < 0.1) {
      discard;
      return;
    }

    // Calculate brightness and pick color from palette
    float brightness = (texel.r + texel.g + texel.b) / 3.0;
    vec3 color;
    if(brightness < 0.22) {
      color = colors[0];
    } else if(brightness < 0.3) {
      color = colors[1];
    } else {
      color = colors[2];
    }

    gl_FragColor = vec4(color, 1.0);
  }
`;

export function BananaModel({
  modelPath,
  colors = ["#9C6323", "#F9A341", "#FFEC40"],
}: ModelProps) {
  const MOUSE_RADIUS = 50.0;

  const containerRef = useRef<HTMLDivElement>(null) as RefObject<HTMLDivElement>;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const rotationAngleRef = useRef(0);
  const mouseRef = useRef<{ x: number; y: number; vx: number; vy: number }>({ x: 0, y: 0, vx: 0, vy: 0 });
  const targetMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastFrameTime = useRef(Date.now());

  // Improved spring configuration for heavier animation
  const SPRING_STIFFNESS = 100;
  const SPRING_DAMPING = 12;
  const MASS = 4.0;

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const renderTargetRef = useRef<THREE.WebGLRenderTarget | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const postMaterialRef = useRef<THREE.ShaderMaterial | null>(null);

  // Make resolution square for circular proportions
  const resolution = 640;

  // Convert colors to THREE.Vector3 for shader
  const colorVectors = useMemo(() => {
    return colors.map(color => {
      const c = new THREE.Color(color);
      return new THREE.Vector3(c.r, c.g, c.b);
    });
  }, [colors]);

  // Setup Three.js scene
  useEffect(() => {
    if (!canvasRef.current) return;
    console.log('Setting up Three.js scene');

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

    // Create post-processing scene
    const postScene = new THREE.Scene();
    const postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const postMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: renderTargetRef.current.texture },
        resolution: { value: new THREE.Vector2(resolution, resolution) },
        colors: { value: colorVectors },
        mousePos: { value: new THREE.Vector2(0, 0) },
        lastMousePos: { value: new THREE.Vector2(0, 0) },
        mouseRadius: { value: MOUSE_RADIUS },
        time: { value: 0.0 }
      },
      vertexShader,
      fragmentShader,
      transparent: true
    });

    postMaterialRef.current = postMaterial;
    const postQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), postMaterial);
    postScene.add(postQuad);

    // Load the model
    const loader = new GLTFLoader();
    loader.load(modelPath, (gltf) => {
      const model = gltf.scene;
      scene.add(model);
      modelRef.current = model;
    });

    // Define render function with lerping
    const render = () => {
      if (!renderer || !scene || !camera || !renderTargetRef.current) return;

      // Calculate delta time for smooth animations
      const currentTime = Date.now();
      const deltaTime = Math.min((currentTime - lastFrameTime.current) / 1000, 0.016); // Cap at ~60fps
      lastFrameTime.current = currentTime;

      // Spring physics simulation
      const springForceX = SPRING_STIFFNESS * (targetMouseRef.current.x - mouseRef.current.x);
      const springForceY = SPRING_STIFFNESS * (targetMouseRef.current.y - mouseRef.current.y);

      const dampingForceX = SPRING_DAMPING * mouseRef.current.vx;
      const dampingForceY = SPRING_DAMPING * mouseRef.current.vy;

      const accelerationX = (springForceX - dampingForceX) / MASS;
      const accelerationY = (springForceY - dampingForceY) / MASS;

      // Update velocity
      mouseRef.current.vx += accelerationX * deltaTime;
      mouseRef.current.vy += accelerationY * deltaTime;

      // Update position
      mouseRef.current.x += mouseRef.current.vx * deltaTime;
      mouseRef.current.y += mouseRef.current.vy * deltaTime;

      // Update model rotation
      if (modelRef.current) {
        rotationAngleRef.current += 0.0025;
        modelRef.current.rotation.y = rotationAngleRef.current;
      }

      // Update shader uniforms with spring-animated mouse position
      if (postMaterialRef.current) {
        const { x, y } = mouseRef.current;
        postMaterialRef.current.uniforms.lastMousePos.value.copy(postMaterialRef.current.uniforms.mousePos.value);
        postMaterialRef.current.uniforms.mousePos.value.set(x, y);
        postMaterialRef.current.uniforms.mouseRadius.value = MOUSE_RADIUS;
        postMaterialRef.current.uniforms.time.value += deltaTime;
      }

      // Render original scene to texture
      renderer.setRenderTarget(renderTargetRef.current);
      renderer.clear();
      renderer.render(scene, camera);

      // Apply post-processing
      if (postScene && postCamera) {
        renderer.setRenderTarget(null);
        renderer.render(postScene, postCamera);
      }

      requestAnimationFrame(render);
    };

    // Start rendering
    render();
    console.log('Started render loop');

    const handleResize = () => {
      if (!camera || !renderer) return;

      const size = Math.min(window.innerWidth, window.innerHeight);
      const aspect = 1.0; // Force 1:1 aspect ratio
      camera.left = (frustumSize * aspect) / -2;
      camera.right = (frustumSize * aspect) / 2;
      camera.top = frustumSize / 2;
      camera.bottom = -frustumSize / 2;
      camera.updateProjectionMatrix();

      renderer.setSize(size, size);

      // Center the canvas
      if (canvasRef.current) {
        canvasRef.current.style.position = 'absolute';
        canvasRef.current.style.left = `${(window.innerWidth - size) / 2}px`;
        canvasRef.current.style.top = `${(window.innerHeight - size) / 2}px`;
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      // Convert mouse coordinates to normalized coordinates (0 to 1)
      const x = (event.clientX - rect.left) / rect.width * resolution;
      const y = (1.0 - (event.clientY - rect.top) / rect.height) * resolution;

      // Update target mouse position
      targetMouseRef.current = { x, y };
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    // Initialize mouse and target positions at center
    const centerX = resolution / 2;
    const centerY = resolution / 2;
    mouseRef.current = { x: centerX, y: centerY, vx: 0, vy: 0 };
    targetMouseRef.current = { x: centerX, y: centerY };
    if (postMaterialRef.current) {
      postMaterialRef.current.uniforms.mousePos.value.set(centerX, centerY);
      postMaterialRef.current.uniforms.lastMousePos.value.set(centerX, centerY);
      postMaterialRef.current.uniforms.mouseRadius.value = MOUSE_RADIUS;
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      renderer.dispose();
      controls.dispose();
      postMaterial.dispose();
      postQuad.geometry.dispose();
      renderTargetRef.current?.dispose();
    };
  }, [modelPath, resolution, colorVectors, MOUSE_RADIUS]);

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen mx-auto"
      style={{
        touchAction: 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        pointerEvents: 'all'
      }}
    >
      <canvas
        ref={canvasRef}
        className="absolute w-full h-full"
        style={{ pointerEvents: 'auto' }}
      />
    </div>
  );
}
