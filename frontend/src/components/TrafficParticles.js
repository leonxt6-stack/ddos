import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const TrafficParticles = ({ count = 200, isAttack = false }) => {
  const meshRef = useRef();
  const particlesRef = useRef([]);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        position: new THREE.Vector3(
          Math.random() * 20 - 10,
          Math.random() * 10 - 5,
          Math.random() * 20 - 10
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.05,
          (Math.random() - 0.5) * 0.1
        ),
        scale: Math.random() * 0.5 + 0.5,
      });
    }
    return temp;
  }, [count]);
  
  particlesRef.current = particles;
  
  useFrame(() => {
    if (meshRef.current) {
      const positions = meshRef.current.geometry.attributes.position.array;
      const scales = meshRef.current.geometry.attributes.scale.array;
      
      particlesRef.current.forEach((particle, i) => {
        particle.position.add(particle.velocity);
        
        if (particle.position.length() > 15) {
          particle.position.set(
            Math.random() * 20 - 10,
            Math.random() * 10 - 5,
            Math.random() * 20 - 10
          );
        }
        
        positions[i * 3] = particle.position.x;
        positions[i * 3 + 1] = particle.position.y;
        positions[i * 3 + 2] = particle.position.z;
        scales[i] = particle.scale;
      });
      
      meshRef.current.geometry.attributes.position.needsUpdate = true;
      meshRef.current.geometry.attributes.scale.needsUpdate = true;
    }
  });
  
  const positions = new Float32Array(count * 3);
  const scaleArray = new Float32Array(count);
  
  particles.forEach((particle, i) => {
    positions[i * 3] = particle.position.x;
    positions[i * 3 + 1] = particle.position.y;
    positions[i * 3 + 2] = particle.position.z;
    scaleArray[i] = particle.scale;
  });
  
  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-scale"
          count={count}
          array={scaleArray}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color={isAttack ? '#ff003c' : '#00f3ff'}
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
};