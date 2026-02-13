import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const CloudNode = ({ position, isUnderAttack, isDefending }) => {
  const meshRef = useRef();
  const glowRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      
      if (isUnderAttack) {
        meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 5) * 0.1);
      } else {
        meshRef.current.scale.setScalar(1);
      }
    }
    
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.2);
    }
  });
  
  const color = isUnderAttack ? '#ff003c' : isDefending ? '#fbbf24' : '#00f3ff';
  
  return (
    <group position={position}>
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.2}
          side={THREE.BackSide}
        />
      </mesh>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isUnderAttack ? 2 : 1}
          wireframe
        />
      </mesh>
      <pointLight color={color} intensity={isUnderAttack ? 3 : 1} distance={5} />
    </group>
  );
};