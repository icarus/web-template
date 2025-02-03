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

  varying vec2 vUv;

  void main() {
    // Base pixel size and relative gap
    float basePixelSize = 1.5;
    float gapRatio = 2.0;
    float pixelSize = basePixelSize;
    float gap = pixelSize * gapRatio;
    float totalSize = pixelSize + gap;

    // Calculate grid position first
    vec2 gridPos = floor(vUv * resolution / totalSize);
    vec2 pixelCenter = (gridPos + 0.5) * totalSize / resolution;

    // Sample texture at original position first to check if it's a visible pixel
    vec4 originalTexel = texture2D(tDiffuse, pixelCenter);

    // Removed attraction effect - always use original pixel center

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
    vec4 texel = texture2D(tDiffuse, pixelCenter);
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

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const renderTargetRef = useRef<THREE.WebGLRenderTarget | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const postMaterialRef = useRef<THREE.ShaderMaterial | null>(null);

  const resolution = 512+128;

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
        deltaTime: { value: 0.0 }
      },
      vertexShader,
      fragmentShader,
      transparent: true
    });
    console.log('Created post-processing material');
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

      // Update model rotation
      if (modelRef.current) {
        rotationAngleRef.current += 0.0025;
        modelRef.current.rotation.y = rotationAngleRef.current;
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
      if (postMaterialRef.current) {
        // Store last mouse position for velocity calculation
        const currentPos = postMaterialRef.current.uniforms.mousePos.value;
        postMaterialRef.current.uniforms.lastMousePos.value.copy(currentPos);

        // Calculate normalized mouse position
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = ((event.clientX - rect.left) / rect.width) * resolution;
        const y = ((rect.height - (event.clientY - rect.top)) / rect.height) * resolution;

        // Smooth mouse movement
        const smoothFactor = 0.2; // Increased for more responsive movement
        currentPos.x += (x - currentPos.x) * smoothFactor;
        currentPos.y += (y - currentPos.y) * smoothFactor;
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

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
        className="absolute w-full h-full pointer-events-none"
      />
    </div>
  );
}
