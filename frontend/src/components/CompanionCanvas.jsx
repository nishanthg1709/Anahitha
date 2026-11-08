import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Sphere, MeshDistortMaterial } from '@react-three/drei'

function CompanionOrb({ isThinking }) {
  const meshRef = useRef()

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * (isThinking ? 0.8 : 0.2)
      meshRef.current.rotation.y += delta * (isThinking ? 1.0 : 0.3)
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <Sphere ref={meshRef} args={[1, 64, 64]} scale={isThinking ? 1.15 : 1.0}>
        <MeshDistortMaterial
          color="#B9A5E8"
          attach="material"
          distort={isThinking ? 0.45 : 0.25}
          speed={isThinking ? 3 : 1.5}
          roughness={0.2}
          metalness={0.1}
          emissive="#3A2A5E"
          emissiveIntensity={0.2}
        />
      </Sphere>
    </Float>
  )
}

export default function CompanionCanvas({ isThinking = false }) {
  return (
    <div className="w-full h-32 sm:h-40 flex items-center justify-center relative overflow-hidden rounded-2xl bg-gradient-to-b from-lavender-light/40 to-blush/20 border border-lavender/40">
      <Canvas
        camera={{ position: [0, 0, 3], fov: 45 }}
        className="w-full h-full"
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[2, 5, 2]} intensity={1.2} color="#FFD9E6" />
        <pointLight position={[-3, -3, 2]} intensity={0.8} color="#E9E2F8" />
        <CompanionOrb isThinking={isThinking} />
      </Canvas>

      <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] text-plum/70 font-medium pointer-events-none">
        <span className="flex items-center space-x-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${isThinking ? 'bg-rose animate-ping' : 'bg-emerald-500'}`} />
          <span>{isThinking ? 'Dr. Anahitha is reflecting...' : 'Companion Presence Active'}</span>
        </span>
        <span className="bg-white/80 px-2 py-0.5 rounded-full border border-lavender/60">
          3D Canvas
        </span>
      </div>
    </div>
  )
}

