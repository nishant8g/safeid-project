import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

function AnimatedOrb() {
  const orbRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (orbRef.current) {
      orbRef.current.rotation.x = Math.cos(t / 4) / 8;
      orbRef.current.rotation.y = Math.sin(t / 4) / 8;
      orbRef.current.rotation.z = Math.sin(t / 4) / 8;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Sphere ref={orbRef} args={[1, 64, 64]} scale={2.5}>
        <MeshDistortMaterial
          color="#06b6d4"
          envMapIntensity={0.5}
          clearcoat={0.8}
          clearcoatRoughness={0}
          metalness={0.1}
          distort={0.4}
          speed={3}
          roughness={0}
        />
      </Sphere>
      
      {/* Aurora Outer Glow */}
      <Sphere args={[1.05, 64, 64]} scale={2.6}>
        <meshBasicMaterial 
          color="#d946ef" 
          transparent 
          opacity={0.05} 
          side={THREE.BackSide} 
        />
      </Sphere>
    </Float>
  );
}

export default function MidnightAuroraOrb() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0, opacity: 0.7 }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <color attach="background" args={['#020617']} />
        <ambientLight intensity={0.2} />
        
        {/* Neon Aurora Lights */}
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#06b6d4" />
        <pointLight position={[-10, -10, -10]} intensity={1.5} color="#d946ef" />
        <spotLight position={[0, 5, 0]} intensity={2} angle={0.3} penumbra={1} color="#8b5cf6" />
        
        <AnimatedOrb />
        
        <ContactShadows 
          position={[0, -3.5, 0]} 
          opacity={0.4} 
          scale={20} 
          blur={2.5} 
          far={4} 
          color="#06b6d4" 
        />
        
        <Environment preset="night" />
      </Canvas>
    </div>
  );
}
