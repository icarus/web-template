"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

interface ModelViewerProps {
  modelPath: string;
}

export function ModelViewer({ modelPath }: ModelViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current! });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    // Load model
    const loader = new GLTFLoader();
    loader.load(
      modelPath,
      (gltf) => {
        scene.add(gltf.scene);
        gltf.scene.position.set(0, 0, 1.5);
      },
      undefined,
      (error) => {
        console.error("An error happened while loading the model:", error);
      }
    );

    camera.position.z = 5;

    // Pixelation: Setup Render Target
    const renderTarget = new THREE.WebGLRenderTarget(128, 128, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
    });

    renderTarget.texture.minFilter = THREE.NearestFilter;
    renderTarget.texture.magFilter = THREE.NearestFilter;

    // Full-Screen Quad for pixelated output
    const quadMaterial = new THREE.MeshBasicMaterial({ map: renderTarget.texture });
    const quadGeometry = new THREE.PlaneGeometry(2, 2);
    const quad = new THREE.Mesh(quadGeometry, quadMaterial);

    const quadScene = new THREE.Scene();
    const quadCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    quadScene.add(quad);

    const pixelData = new Uint8Array(128 * 128 * 4); // RGBA for each pixel

    // Function to read pixel colors
    const readPixelColors = () => {
      renderer.readRenderTargetPixels(
        renderTarget,
        0,
        0,
        128,
        128,
        pixelData
      );

      const colors = [];
      for (let i = 0; i < pixelData.length; i += 4) {
        colors.push({
          r: pixelData[i],
          g: pixelData[i + 1],
          b: pixelData[i + 2],
          a: pixelData[i + 3],
        });
      }
      console.log("Pixel Colors:", colors);
    };

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Render the scene to the render target
      renderer.setRenderTarget(renderTarget);
      renderer.render(scene, camera);
      renderer.setRenderTarget(null);

      // Render the quad with the pixelated texture
      renderer.render(quadScene, quadCamera);

      // Read pixel colors periodically (e.g., every 60 frames)
      if (Math.floor(performance.now() / 1000) % 1 === 0) {
        readPixelColors();
      }
    };
    animate();

    // Clean up
    return () => {
      renderer.dispose();
      renderTarget.dispose();
    };
  }, [modelPath]);

  return <canvas ref={canvasRef} className="w-full h-svh fixed" />;
}
