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

    // Calculate current and previous mouse vectors
    vec2 toMouse = mousePos - screenPos;
    float distanceToMouse = length(toMouse);

    // Calculate attraction strength
    float attraction = smoothstep(mouseRadius, 0.0, distanceToMouse) * 0.8;

    // Calculate displacement
    vec2 displacement = vec2(0.0);
    if (distanceToMouse < mouseRadius) {
        // When mouse is near, create immediate attraction
        // Invert the direction so pixels are pulled from the model towards the cursor
        displacement = normalize(-toMouse) * attraction * mouseRadius * 2.0;
    }

    // Calculate decay for return animation
    float decayDuration = 2.0; // Duration in seconds
    float decayStart = 0.2; // When to start decay

    // Normalized time for decay (0 to 1)
    float decayTime = fract(time / decayDuration);

    // Smooth decay curve
    float decay = 1.0 - (pow(decayTime, 2.0) * (3.0 - 2.0 * decayTime));

    // Apply spring oscillation to decay
    float springFreq = 2.0;
    float springDamp = 3.0;
    float spring = exp(-springDamp * decayTime) * sin(springFreq * decayTime * 6.28318);

    // Combine decay and spring
    float returnStrength = decay + spring * 0.2;

    // Apply decay to displacement
    displacement *= max(attraction, returnStrength);

    // Apply displacement to screen position
    vec2 attractedScreenPos = screenPos + displacement;

    // Convert back to UV space
    vec2 attractedUV = attractedScreenPos / resolution;

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
  colors = ["#90521D", "#F98912", "#FFEC40"],
}: ModelProps) {
  const containerRef = useRef<HTMLDivElement>(null) as RefObject<HTMLDivElement>;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const rotationAngleRef = useRef(0);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const renderTargetRef = useRef<THREE.WebGLRenderTarget | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const postMaterialRef = useRef<THREE.ShaderMaterial | null>(null);

  const resolution = 512+128;

  const timeRef = useRef(0);
  const lastTimeRef = useRef(Date.now());

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
        mouseRadius: { value: 100.0 },
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

    // Define render function
    const render = () => {
      if (!renderer || !scene || !camera || !renderTargetRef.current) return;

      // Update time
      const currentTime = Date.now();
      const deltaTime = (currentTime - lastTimeRef.current) / 1000.0;
      timeRef.current += deltaTime;
      lastTimeRef.current = currentTime;

      // Update model rotation
      if (modelRef.current) {
        rotationAngleRef.current += 0.0025;
        modelRef.current.rotation.y = rotationAngleRef.current;
      }

      // Update uniforms
      if (postMaterialRef.current) {
        const { x, y } = mouseRef.current;
        postMaterialRef.current.uniforms.mousePos.value.set(x, y);
        postMaterialRef.current.uniforms.mouseRadius.value = resolution * 0.15;
        postMaterialRef.current.uniforms.time.value = timeRef.current;
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

      const aspect = window.innerWidth / window.innerHeight;
      camera.left = (frustumSize * aspect) / -2;
      camera.right = (frustumSize * aspect) / 2;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      // Convert mouse coordinates to normalized coordinates (0 to 1)
      const x = (event.clientX - rect.left) / rect.width * resolution;
      const y = (1.0 - (event.clientY - rect.top) / rect.height) * resolution;

      // Store the current position for next frame's velocity calculation
      if (postMaterialRef.current) {
        const currentPos = postMaterialRef.current.uniforms.mousePos.value;
        postMaterialRef.current.uniforms.lastMousePos.value.set(currentPos.x, currentPos.y);
        postMaterialRef.current.uniforms.mousePos.value.set(x, y);
      }

      // Update mouse position
      mouseRef.current = { x, y };
      console.log('Mouse position:', { x, y }); // Debug log
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    // Initialize mouse position at center
    const centerX = resolution / 2;
    const centerY = resolution / 2;
    mouseRef.current = { x: centerX, y: centerY };
    if (postMaterialRef.current) {
      postMaterialRef.current.uniforms.mousePos.value.set(centerX, centerY);
      postMaterialRef.current.uniforms.lastMousePos.value.set(centerX, centerY);
      postMaterialRef.current.uniforms.mouseRadius.value = resolution * 0.2; // 20% of the resolution
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
  }, [modelPath, resolution, colorVectors]);

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
