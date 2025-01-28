'use client'

import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Image, Float } from '@react-three/drei'
import * as THREE from 'three'

interface ImagePosition {
  position: [number, number, number]
  rotation: [number, number, number]
  scale: number
}

// Component for individual floating image
function FloatingImage({ url, position, rotation, scale }: {
  url: string
  position: [number, number, number]
  rotation: [number, number, number]
  scale: number
}) {
  const imageRef = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    if (imageRef.current) {
      // Rotate around the center
      imageRef.current.position.x = position[0] * Math.cos(state.clock.elapsedTime * 0.1)
      imageRef.current.position.z = position[2] * Math.sin(state.clock.elapsedTime * 0.1)
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
      <Image
        ref={imageRef}
        url={url}
        alt="Image"
        transparent
        position={position}
        rotation={rotation}
        scale={[scale, scale, scale]}
      />
    </Float>
  )
}

// Main ImageCloud component
export function ImageCloud() {
  const [images] = useState<string[]>([
    'https://dfmas.df.cl/dfmas/site/artic/20241129/imag/foto_0000005420241129115939/Captura_de_pantalla_2024-12-02_a_las_9.png',
    'https://dfmas.df.cl/dfmas/site/artic/20241129/imag/foto_0000005420241129115939/Captura_de_pantalla_2024-12-02_a_las_9.png',
    'https://dfmas.df.cl/dfmas/site/artic/20241129/imag/foto_0000005420241129115939/Captura_de_pantalla_2024-12-02_a_las_9.png',
    'https://dfmas.df.cl/dfmas/site/artic/20241129/imag/foto_0000005420241129115939/Captura_de_pantalla_2024-12-02_a_las_9.png',
    'https://dfmas.df.cl/dfmas/site/artic/20241129/imag/foto_0000005420241129115939/Captura_de_pantalla_2024-12-02_a_las_9.png',
    'https://dfmas.df.cl/dfmas/site/artic/20241129/imag/foto_0000005420241129115939/Captura_de_pantalla_2024-12-02_a_las_9.png',
    'https://dfmas.df.cl/dfmas/site/artic/20241129/imag/foto_0000005420241129115939/Captura_de_pantalla_2024-12-02_a_las_9.png',
    'https://dfmas.df.cl/dfmas/site/artic/20241129/imag/foto_0000005420241129115939/Captura_de_pantalla_2024-12-02_a_las_9.png',
  ])

  const generateRandomPosition = (): ImagePosition => {
    const radius = 3
    const theta = Math.random() * Math.PI * 2
    const phi = Math.random() * Math.PI

    return {
      position: [
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
      ],
      rotation: [
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      ],
      scale: 0.5 + Math.random() * 0.5
    }
  }

  return (
    <div className="w-full h-screen">
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />

        {images.map((url, index) => {
          const { position, rotation, scale } = generateRandomPosition()
          return (
            <FloatingImage
              key={index}
              url={url}
              position={position}
              rotation={rotation}
              scale={scale}
            />
          )
        })}
      </Canvas>
    </div>
  )
}
