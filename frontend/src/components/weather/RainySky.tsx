import React, { Suspense, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import BackgroundPlane from './BackgroundPlane';
import * as THREE from 'three';

// 이미지 Import
import rainBg from '@/assets/weather/rain.png';

// 🌧️ 빗방울 개수 (4000 유지)
const RAINDROP_COUNT = 4000;

// 빗방울 애니메이션
const RainEffect: React.FC = () => {
    const meshRef = useRef<THREE.InstancedMesh>(null!);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    // 빗방울 초기 데이터 설정
    const particles = useMemo(() => {
        return Array.from({ length: RAINDROP_COUNT }).map(() => ({
            position: [
                (Math.random() - 0.5) * 40, // X: 넓게 분포
                Math.random() * 40,         // Y: 화면 상단 위주로 시작
                // 🔑 Z축: 카메라 뒤쪽 배치
                Math.random() * 5 - 10      
            ] as [number, number, number],
            // 🌧️ 속도 조절: 더 천천히 내리도록 변경 (0.15~0.25 -> 0.08~0.13)
            speed: 0.08 + Math.random() * 0.05, 
        }));
    }, []);

    useFrame(() => {
        if (!meshRef.current) return;

        particles.forEach((data, i) => {
            // 1. 천천히 하강
            data.position[1] -= data.speed;
            
            // 2. 리셋 위치
            if (data.position[1] < -3) {
                data.position[1] = 25; // 하늘 높이로 리셋
                data.position[0] = (Math.random() - 0.5) * 40; 
            }

            dummy.position.set(data.position[0], data.position[1], data.position[2]);
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    // 커스텀 셰이더 재질 생성
    const rainMaterial = useMemo(() => {
        return new THREE.ShaderMaterial({
            uniforms: {
                // 🌧️ 비 색상: 옅은 은색 유지
                color: { value: new THREE.Color("#e0e0e0") },
                // 🌧️ 투명도 조정: 조금 더 은은하게 (0.5 -> 0.4)
                opacity: { value: 0.4 } 
            },
            vertexShader: `
                varying float vY;
                void main() {
                    vec4 worldPosition = instanceMatrix * vec4(position, 1.0);
                    vY = worldPosition.y; 
                    gl_Position = projectionMatrix * modelViewMatrix * worldPosition;
                }
            `,
            fragmentShader: `
                uniform vec3 color;
                uniform float opacity;
                varying float vY;
                void main() {
                    // 페이드 아웃 효과
                    float fade = smoothstep(-3.0, 5.0, vY); 
                    gl_FragColor = vec4(color, opacity * fade);
                }
            `,
            transparent: true,
            depthWrite: false,
        });
    }, []);

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, RAINDROP_COUNT]}>
            {/* 🌧️ 빗줄기 모양 조정: 더 가늘고 길게 만들어 우아하게 표현 (0.008x0.9 -> 0.006x1.5) */}
            <boxGeometry args={[0.006, 1.5, 0.006]} />
            <primitive object={rainMaterial} attach="material" />
        </instancedMesh>
    );
};

const RainySky: React.FC = () => {
    return (
        <Suspense fallback={null}>
            <BackgroundPlane texturePath={rainBg} />
            
            <ambientLight intensity={0.4} color="#3a6073" />
            <directionalLight position={[0, 10, 5]} intensity={0.5} color="#6dd5fa" />
            
            <RainEffect />
        </Suspense>
    );
};

export default RainySky;