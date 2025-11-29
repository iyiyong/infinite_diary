import React, { Suspense, useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import BackgroundPlane from './BackgroundPlane'; 
import AnimatedLeaves from './AnimatedLeaves'; // 🍃 수정된 컴포넌트
import * as THREE from 'three';
import * as Tone from 'tone';

// 이미지 Import
import sunnyBg from '@/assets/weather/sunny.png'; 

const PARTICLE_COUNT = 200; 

// ☀️ 햇살 먼지 (Sun Motes) - 유지
const SunMotes = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    return new Array(PARTICLE_COUNT).fill(0).map(() => ({
      position: [
        (Math.random() - 0.5) * 40, 
        (Math.random() - 0.5) * 30, 
        (Math.random() - 0.5) * 20  
      ] as [number, number, number],
      blinkSpeed: Math.random() * 2 + 0.5, 
      blinkPhase: Math.random() * Math.PI * 2, 
      moveFactor: Math.random() * 10 + 5,
      direction: Math.random() > 0.5 ? 1 : -1,
      size: Math.random() * 0.5 + 0.5
    }));
  }, []);

  useFrame((state) => {
    if(!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    
    particles.forEach((data, i) => {
      const movementX = Math.cos(time / data.moveFactor) * 0.01;
      const movementY = Math.sin(time / data.moveFactor) * 0.01 * data.direction;

      data.position[0] += movementX;
      data.position[1] += movementY;

      if (Math.abs(data.position[0]) > 20) data.position[0] *= -0.9;
      if (Math.abs(data.position[1]) > 15) data.position[1] *= -0.9;

      const twinkle = Math.sin(time * data.blinkSpeed + data.blinkPhase);
      const currentScale = (twinkle + 1.5) * 0.1 * data.size; 

      dummy.position.set(data.position[0], data.position[1], data.position[2]);
      dummy.scale.setScalar(currentScale); 
      
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
      <sphereGeometry args={[0.15, 8, 8]} />
      <meshBasicMaterial 
        color="#FFFFAA" 
        transparent 
        opacity={0.6} 
        blending={THREE.AdditiveBlending} 
        depthWrite={false} 
      />
    </instancedMesh>
  );
};

const SunnySky: React.FC = () => {
    const sunColor = new THREE.Color(0xFFCCAA); 
    const synthRef = useRef<Tone.PolySynth | null>(null);

    // 배경 음악 (기존 유지)
    useEffect(() => {
        if (Tone.context.state !== 'running') return; 

        const synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "triangle" },
            envelope: { attack: 1, decay: 0.5, sustain: 0.7, release: 2 }
        }).toDestination();
        
        synth.volume.value = -22;
        synthRef.current = synth;

        const loop = new Tone.Loop(time => {
            synth.triggerAttackRelease(["C4", "E4", "G4"], "2n", time);
        }, "4n"); 

        loop.start(0);

        return () => {
            loop.stop();
            loop.dispose();
            if (synthRef.current) {
                synthRef.current.dispose();
                synthRef.current = null;
            }
        };
    }, []);
    
    return (
        <Suspense fallback={null}>
            <BackgroundPlane texturePath={sunnyBg} />
            
            <directionalLight 
                position={[5, 10, 5]} 
                intensity={2.0} 
                color={sunColor} 
            />
            <ambientLight intensity={0.6} color={sunColor} />
            
            {/* ✨ 1. 반짝이는 햇살 먼지 */}
            <SunMotes />

            {/* 🍃 2. 아주 작은 나뭇잎 (빛남) */}
            <AnimatedLeaves emoji="🍃" count={60} sizeScale={0.8} />
            
            {/* 🌿 3. 잎사귀 (선명함) */}
            <AnimatedLeaves emoji="🌿" count={20} sizeScale={0.9} speedFactor={1.2} />
        </Suspense>
    );
};

export default SunnySky;