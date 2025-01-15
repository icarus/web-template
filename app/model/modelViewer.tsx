// app/model/ModelViewer.tsx
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

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    const loader = new GLTFLoader();
    loader.load(modelPath, (gltf) => {
      scene.add(gltf.scene);
    }, undefined, (error) => {
      console.error('An error happened while loading the model:', error);
    });

    camera.position.z = 5;

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      // Clean up on unmount
      renderer.dispose();
    };
  }, [modelPath]);

  return (
    <canvas ref={canvasRef} className="w-full h-svh fixed bg-red-500" />
  );
}
