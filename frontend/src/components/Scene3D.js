import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { CloudNode } from './CloudNode';
import { TrafficParticles } from './TrafficParticles';

export const Scene3D = ({ isAttack, nodes }) => {
  const [cameraShake, setCameraShake] = useState(0);
  
  useEffect(() => {
    if (isAttack) {
      setCameraShake(0.05);
    } else {
      setCameraShake(0);
    }
  }, [isAttack]);
  
  const nodePositions = [
    [-4, 0, -4],
    [4, 0, -4],
    [-4, 0, 4],
    [4, 0, 4],
    [0, 2, 0],
  ];
  
  return (
    <div className="w-full h-full" data-testid="3d-canvas">
      <Canvas
        camera={{ position: [0, 5, 10], fov: 60 }}
        style={{ background: '#020202' }}
      >
        <Suspense fallback={null}>
          <Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} />
          
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          
          {nodePositions.map((pos, idx) => {
            const node = nodes[idx];
            const isDefending = node?.blocked_threats > 0;
            return (
              <CloudNode
                key={idx}
                position={pos}
                isUnderAttack={isAttack}
                isDefending={isDefending}
              />
            );
          })}
          
          <TrafficParticles count={isAttack ? 400 : 200} isAttack={isAttack} />
          
          {isAttack && (
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[15, 32, 32]} />
              <meshBasicMaterial
                color="#ff003c"
                transparent
                opacity={0.05}
                side={2}
              />
            </mesh>
          )}
          
          <OrbitControls
            enableZoom
            enablePan={false}
            maxPolarAngle={Math.PI / 2}
            minDistance={8}
            maxDistance={20}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};