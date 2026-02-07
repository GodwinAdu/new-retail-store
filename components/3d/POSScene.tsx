"use client"

import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Text, Environment, RoundedBox, OrbitControls } from '@react-three/drei'
import { Mesh } from 'three'
import * as THREE from 'three'

function POSMachine() {
  const screenRef = useRef<Mesh>(null!)
  
  useFrame((state) => {
    if (screenRef.current) {
      screenRef.current.material.emissiveIntensity = 0.4 + Math.sin(state.clock.elapsedTime * 2) * 0.1
    }
  })

  return (
    <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
      <group>
        {/* Base */}
        <RoundedBox args={[5, 0.3, 4]} radius={0.1} position={[0, -2.5, 0]}>
          <meshPhysicalMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
        </RoundedBox>
        
        {/* Main Body */}
        <RoundedBox args={[4.5, 3.5, 0.4]} radius={0.15} position={[0, 0, 0]} castShadow>
          <meshPhysicalMaterial color="#0f172a" metalness={0.9} roughness={0.1} />
        </RoundedBox>
        
        {/* Screen */}
        <RoundedBox args={[4, 3, 0.1]} radius={0.1} position={[0, 0, 0.25]} ref={screenRef}>
          <meshStandardMaterial 
            color="#000000" 
            emissive="#1e40af" 
            emissiveIntensity={0.4}
          />
        </RoundedBox>
        
        {/* UI Elements */}
        <mesh position={[-1.5, 0.8, 0.3]}>
          <planeGeometry args={[1.2, 0.2]} />
          <meshStandardMaterial color="#60a5fa" emissive="#60a5fa" emissiveIntensity={0.6} />
        </mesh>
        
        <mesh position={[1.2, 0.5, 0.3]}>
          <planeGeometry args={[1, 0.15]} />
          <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.5} />
        </mesh>
        
        <mesh position={[-0.8, 0, 0.3]}>
          <planeGeometry args={[1.5, 0.18]} />
          <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.4} />
        </mesh>
        
        <mesh position={[0.5, -0.5, 0.3]}>
          <planeGeometry args={[2, 0.12]} />
          <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.3} />
        </mesh>
        
        {/* Buttons */}
        {[-1.5, -0.5, 0.5, 1.5].map((x, i) => (
          <RoundedBox key={i} args={[0.3, 0.3, 0.1]} radius={0.05} position={[x, -1.2, 0.3]}>
            <meshStandardMaterial color="#374151" />
          </RoundedBox>
        ))}
        
        {/* Card Reader */}
        <RoundedBox args={[0.8, 0.1, 0.3]} radius={0.02} position={[2.8, -0.5, 0]}>
          <meshStandardMaterial color="#111827" />
        </RoundedBox>
        
        {/* Receipt Printer */}
        <RoundedBox args={[1.2, 0.4, 0.3]} radius={0.05} position={[-2.8, 0.5, 0]}>
          <meshStandardMaterial color="#374151" />
        </RoundedBox>
        
        <Text
          fontSize={0.3}
          position={[0, -2, 0.3]}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          RetailPOS Terminal
        </Text>
      </group>
    </Float>
  )
}

function Scene() {
  return (
    <>
      <Environment preset="studio" />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <pointLight position={[-5, 5, 5]} intensity={0.8} color="#60a5fa" />
      
      <POSMachine />
      
      <OrbitControls 
        enableZoom={false} 
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.8}
      />
    </>
  )
}

export default function POSScene() {
  return (
    <div className="w-full h-full">
      <Suspense fallback={
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        </div>
      }>
        <Canvas 
          camera={{ position: [8, 4, 8], fov: 45 }}
          shadows
          gl={{ antialias: true, alpha: true }}
        >
          <Scene />
        </Canvas>
      </Suspense>
    </div>
  )
}