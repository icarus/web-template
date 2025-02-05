"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import gsap from "gsap";
import { ArrowUpRight } from "lucide-react";

interface ImageCloudProps {
  images: { url: string; title?: string; description?: string }[];
}

export function ImageCloud({ images }: ImageCloudProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);
  const hoveredSpriteRef = useRef<THREE.Sprite | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const autoRotateRef = useRef(true);
  const [selectedSprite, setSelectedSprite] = useState<THREE.Sprite | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const isAnimatingRef = useRef(false);
  const [, setShowOverlay] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Setup scene
    const scene = new THREE.Scene();
    const radius = Math.min(window.innerWidth, window.innerHeight) * 0.06;

    // Setup camera
    const camera = new THREE.PerspectiveCamera(
      35,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const initialZoom = radius * 4;
    camera.position.z = initialZoom;

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);

    // Setup OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = radius * 2;
    controls.maxDistance = initialZoom;
    controls.enablePan = false;
    controlsRef.current = controls;

    // Add control event listeners for auto-rotation
    const handleControlStart = () => {
      if (!selectedSprite) {
        autoRotateRef.current = false;
      }
    };

    const handleControlEnd = () => {
      if (!selectedSprite) {
        autoRotateRef.current = true;
      }
    };

    controls.addEventListener('start', handleControlStart);
    controls.addEventListener('end', handleControlEnd);

    const sprites: THREE.Sprite[] = [];

    // Create sprites for each image
    const textureLoader = new THREE.TextureLoader();
    images.forEach((image, index) => {
      textureLoader.load(image.url, (texture) => {
        const imageAspect = texture.image.width / texture.image.height;
        const spriteMaterial = new THREE.SpriteMaterial({
          map: texture,
          sizeAttenuation: true,
          depthTest: false,
          depthWrite: false
        });
        const sprite = new THREE.Sprite(spriteMaterial);

        // Position in a sphere using golden ratio for even distribution
        const goldenRatio = (1 + Math.sqrt(5)) / 2;
        const angle = 2 * Math.PI * index / goldenRatio;
        const y = 1 - (index / (images.length - 1)) * 2;
        const radiusAtY = Math.sqrt(1 - y * y) * radius * 0.8;

        sprite.position.set(
          Math.cos(angle) * radiusAtY,
          y * radius * 0.4,
          Math.sin(angle) * radiusAtY
        );

        // Scale sprite maintaining aspect ratio
        const baseScale = radius * 0.2;
        sprite.scale.set(baseScale * imageAspect, baseScale, 1);

        // Store original scale and index for hover effect
        sprite.userData.originalScale = sprite.scale.clone();
        sprite.userData.index = index;

        scene.add(sprite);
        sprites.push(sprite);
      });
    });

    // Create a semi-transparent overlay plane
    const overlayGeometry = new THREE.PlaneGeometry(1000, 1000);
    const overlayMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthTest: false,
    });
    const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
    overlay.renderOrder = -1; // Render behind everything
    scene.add(overlay);

    // Setup raycaster for hover detection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const resetView = (fullReset: boolean = false) => {
      if (isAnimatingRef.current) return;

      isAnimatingRef.current = true;

      // Re-enable controls for normal viewing
      controls.enabled = true;
      controls.enableZoom = true;
      controls.enableRotate = true;
      controls.enableDamping = true;
      autoRotateRef.current = true;

      // Fade out overlay
      gsap.to(overlayMaterial, {
        opacity: 0,
        duration: 1,
        ease: "power2.inOut",
      });

      // Reset camera position to initial zoom
      gsap.to(camera.position, {
        x: 0,
        y: 0,
        z: initialZoom,
        duration: 1,
        ease: "power2.inOut",
        onUpdate: () => {
          controls.target.lerp(new THREE.Vector3(0, 0, 0), 0.1);
          camera.lookAt(controls.target);
          controls.update();
        },
        onComplete: () => {
          controls.target.set(0, 0, 0);
          camera.lookAt(0, 0, 0);
          isAnimatingRef.current = false;
          setSelectedSprite(null);
          setShowOverlay(false);
          controls.update();
        }
      });

      // Only reset sprite scales on full reset (escape key)
      if (fullReset) {
        sprites.forEach(sprite => {
          gsap.to(sprite.scale, {
            x: sprite.userData.originalScale.x,
            y: sprite.userData.originalScale.y,
            duration: 1,
            ease: "power2.inOut"
          });
        });
      }
    };

    const handleClick = (event: MouseEvent) => {
      if (isAnimatingRef.current) return;

      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(sprites);

      // If we have a selected sprite, any click should reset the view (but keep sprite scaled)
      if (selectedSprite) {
        console.log('Resetting view with selected sprite:', selectedSprite.uuid);
        resetView(false); // Partial reset, keeping sprite scales
        return;
      }

      // If no sprite is selected and we click on a sprite, select it
      if (intersects.length > 0) {
        const clickedSprite = intersects[0].object as THREE.Sprite;
        console.log('Selecting sprite:', clickedSprite.uuid);

        setSelectedSprite(clickedSprite);
        setSelectedImageIndex(clickedSprite.userData.index);
        setShowOverlay(true);
        isAnimatingRef.current = true;

        // Disable all controls
        controls.enabled = false;
        controls.enableZoom = false;
        controls.enableRotate = false;
        controls.enablePan = false;
        controls.enableDamping = false;
        autoRotateRef.current = false;

        // Store current rotation
        const currentRotation = scene.rotation.y;

        // Fade in overlay
        gsap.to(overlayMaterial, {
          opacity: 0.5,
          duration: 1,
          ease: "power2.inOut",
        });

        // Scale up the selected sprite significantly
        console.log('Scaling up sprite:', {
          originalX: clickedSprite.userData.originalScale.x,
          originalY: clickedSprite.userData.originalScale.y,
          newX: clickedSprite.userData.originalScale.x * 4,
          newY: clickedSprite.userData.originalScale.y * 4
        });

        gsap.to(clickedSprite.scale, {
          x: clickedSprite.userData.originalScale.x * 4,
          y: clickedSprite.userData.originalScale.y * 4,
          duration: 1,
          ease: "power2.inOut",
          onComplete: () => {
            console.log('Scale animation completed for sprite:', clickedSprite.uuid);
          }
        });

        // Get sprite position in world space, accounting for scene rotation
        const targetPosition = clickedSprite.position.clone();
        targetPosition.applyAxisAngle(new THREE.Vector3(0, 1, 0), currentRotation);

        // Calculate camera position to look directly at the sprite
        const zoomDistance = radius * 0.3;
        const direction = targetPosition.clone().normalize();
        const cameraPosition = direction.multiplyScalar(zoomDistance).add(targetPosition);

        // Animate camera position
        gsap.to(camera.position, {
          x: cameraPosition.x,
          y: cameraPosition.y,
          z: cameraPosition.z,
          duration: 1,
          ease: "power2.inOut",
          onUpdate: () => {
            controls.target.lerp(targetPosition, 0.1);
            camera.lookAt(controls.target);
          },
          onComplete: () => {
            controls.target.copy(targetPosition);
            camera.lookAt(targetPosition);
            isAnimatingRef.current = false;
          }
        });
      }
    };

    // Handle hover effects
    const handleMouseMove = (event: MouseEvent) => {
      // If there's a selected sprite, disable all hover effects
      if (selectedSprite) {
        renderer.domElement.style.cursor = 'default';
        return;
      }

      // If we're animating, disable hover effects
      if (isAnimatingRef.current) {
        renderer.domElement.style.cursor = 'default';
        return;
      }

      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(sprites);

      if (intersects.length > 0) {
        const hoveredSprite = intersects[0].object as THREE.Sprite;

        // Skip hover effects if this is the selected sprite
        if (hoveredSprite === selectedSprite) {
          renderer.domElement.style.cursor = 'default';
          return;
        }

        renderer.domElement.style.cursor = 'pointer';

        if (hoveredSpriteRef.current !== hoveredSprite) {
          // Reset previous hovered sprite
          if (hoveredSpriteRef.current && hoveredSpriteRef.current !== selectedSprite) {
            gsap.to(hoveredSpriteRef.current.scale, {
              x: hoveredSpriteRef.current.userData.originalScale.x,
              y: hoveredSpriteRef.current.userData.originalScale.y,
              duration: 0.3,
              ease: "power2.out"
            });
          }

          gsap.to(hoveredSprite.scale, {
            x: hoveredSprite.userData.originalScale.x * 1.3,
            y: hoveredSprite.userData.originalScale.y * 1.3,
            duration: 0.3,
            ease: "power2.out"
          });

          hoveredSpriteRef.current = hoveredSprite;
        }
      } else {
        // Only handle non-selected sprites when moving off them
        renderer.domElement.style.cursor = selectedSprite ? 'default' : 'grab';
        if (hoveredSpriteRef.current && hoveredSpriteRef.current !== selectedSprite && !selectedSprite) {
          gsap.to(hoveredSpriteRef.current.scale, {
            x: hoveredSpriteRef.current.userData.originalScale.x,
            y: hoveredSpriteRef.current.userData.originalScale.y,
            duration: 0.3,
            ease: "power2.out"
          });
          hoveredSpriteRef.current = null;
        }
      }
    };

    // Handle mouse leave
    const handleMouseLeave = () => {
      // Skip entirely if there's a selected sprite
      if (selectedSprite) return;

      renderer.domElement.style.cursor = 'grab';

      if (hoveredSpriteRef.current) {
        gsap.to(hoveredSpriteRef.current.scale, {
          x: hoveredSpriteRef.current.userData.originalScale.x,
          y: hoveredSpriteRef.current.userData.originalScale.y,
          duration: 0.3,
          ease: "power2.out"
        });
        hoveredSpriteRef.current = null;
      }
    };

    // Handle mouse down/up for cursor style
    const handleMouseDown = () => {
      renderer.domElement.style.cursor = 'grabbing';
    };

    const handleMouseUp = () => {
      renderer.domElement.style.cursor = hoveredSpriteRef.current ? 'pointer' : 'grab';
    };

    renderer.domElement.addEventListener('click', handleClick);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseleave', handleMouseLeave);
    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);

    // Handle escape key
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        resetView(true); // Full reset including sprite scales
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Animation loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);

      if (autoRotateRef.current && !selectedSprite) {
        scene.rotation.y += 0.001;
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handleClick);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('mouseleave', handleMouseLeave);
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      renderer.domElement.removeEventListener('mouseup', handleMouseUp);
      controls.removeEventListener('start', handleControlStart);
      controls.removeEventListener('end', handleControlEnd);
      controls.dispose();
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [images]);

  return (
    <div ref={containerRef} className="w-screen h-screen">
      {selectedSprite && selectedImageIndex !== null && (
        <div
          className="absolute bottom-0 left-0 right-0 p-8 text-center bg-gradient-to-t from-black/80 to-transparent"
        >
          <h2 className="cursor-pointer hover:underline flex items-center justify-center gap-1 [&_svg]:size-4 text-white mb-2 font-mono uppercase">
            {images[selectedImageIndex]?.title}
            <ArrowUpRight className="opacity-50" />
          </h2>
          <p className="text-white/80">
            {images[selectedImageIndex]?.description}
          </p>
        </div>
      )}
    </div>
  );
}
