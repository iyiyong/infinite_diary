import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Props 인터페이스
interface AnimatedLeavesProps {
    emoji?: string;    // 이모티콘 (기본: 🍃)
    count?: number;    // 개수
    sizeScale?: number;// 크기 배율
    speedFactor?: number; // 속도 배율
}

const AnimatedLeaves: React.FC<AnimatedLeavesProps> = ({ 
    emoji = '🍃', 
    count = 40, 
    sizeScale = 1.0,
    speedFactor = 1.0 
}) => {
    const meshRef = useRef<THREE.InstancedMesh>(null!);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const { viewport } = useThree(); 

    // 1. 이모티콘 텍스처 생성
    const texture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 128; 
        canvas.height = 128;
        const context = canvas.getContext('2d');
        if (context) {
            context.font = '80px serif'; // 해상도는 높게 유지
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(emoji, 64, 64);
        }
        const tex = new THREE.CanvasTexture(canvas);
        tex.needsUpdate = true;
        return tex;
    }, [emoji]);

    // 2. 초기 상태 설정
    const particles = useMemo(() => {
        return Array.from({ length: count }).map(() => ({
            position: [
                (Math.random() - 0.5) * viewport.width * 1.5, 
                (Math.random() - 0.5) * viewport.height * 1.5,
                (Math.random() - 0.5) * 5 - 2, 
            ] as [number, number, number],
            rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI] as [number, number, number],
            rotationSpeed: [
                (Math.random() - 0.5) * 0.01, 
                (Math.random() - 0.5) * 0.01, 
                (Math.random() - 0.5) * 0.01
            ] as [number, number, number], 
            // 속도 및 위상
            speed: (0.002 + Math.random() * 0.003) * speedFactor, 
            phase: Math.random() * Math.PI * 2,
            // 🔑 크기: 아주 작게 설정 (기존 0.3 -> 0.1 ~ 0.2 범위)
            size: (0.1 + Math.random() * 0.1) * sizeScale, 
        }));
    }, [count, viewport, sizeScale, speedFactor]);

    // 3. 애니메이션 업데이트
    useFrame(({ clock }) => {
        if (!meshRef.current) return;
        const time = clock.getElapsedTime() * 0.2;

        particles.forEach((p, i) => {
            // 하강
            p.position[1] -= p.speed; 
            
            // 살랑살랑 흔들림
            p.position[0] += Math.sin(time + p.phase) * 0.002; 
            
            // 회전
            p.rotation[0] += p.rotationSpeed[0];
            p.rotation[1] += p.rotationSpeed[1];
            p.rotation[2] += p.rotationSpeed[2];
            
            // 화면 리셋
            if (p.position[1] < -viewport.height / 2 - 2) {
                p.position[1] = viewport.height / 2 + 2; 
                p.position[0] = (Math.random() - 0.5) * viewport.width * 1.5; 
            }

            dummy.position.set(p.position[0], p.position[1], p.position[2]);
            dummy.rotation.set(p.rotation[0], p.rotation[1], p.rotation[2]);
            dummy.scale.setScalar(p.size);
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    // 🍃 나뭇잎은 빛나게(Additive), 🌿 잎사귀 선명하게(Normal) 설정
    const isLeaf = emoji === '🍃';

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial 
                map={texture} 
                transparent={true} 
                side={THREE.DoubleSide} 
                depthWrite={false}
                color={isLeaf ? "#a3ee8cff" : "#FFFFFF"} 
                blending={isLeaf ? THREE.AdditiveBlending : THREE.NormalBlending} 
                opacity={isLeaf ? 0.8 : 1.0}
            />
        </instancedMesh>
    );
};

export default AnimatedLeaves;