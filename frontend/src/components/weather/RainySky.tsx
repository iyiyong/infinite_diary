import React, { Suspense, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import BackgroundPlane from './BackgroundPlane';
import * as THREE from 'three';

// 이미지 Import
import rainBg from '@/assets/weather/rain.png';

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
                // 🔑 Z축 수정: 카메라(0) 가까이 오지 않도록 뒤쪽(-10 ~ -5)에만 배치
                // 이렇게 하면 "갑자기 크게 떨어지는" 왕방울 비가 사라집니다.
                Math.random() * 5 - 10      
            ] as [number, number, number],
            speed: 0.15 + Math.random() * 0.1, 
        }));
    }, []);

    useFrame(() => {
        if (!meshRef.current) return;

        particles.forEach((data, i) => {
            // 1. 천천히 하강
            data.position[1] -= data.speed;
            
            // 2. 🔑 리셋 위치 상향 조정: 화면 하단(-3)에 닿기도 전에 리셋
            // -3 이하로는 비가 절대 내려가지 않습니다. (화면 하단 1/3 확보)
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
                color: { value: new THREE.Color("#aaccff") },
                opacity: { value: 0.3 } 
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
                    // 🔑 페이드 아웃 범위 수정: y = -3 에서 완전히 투명해짐
                    // 5.0 높이에서부터 서서히 사라지기 시작하여 -3.0에서 사라짐
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
            {/* 빗줄기 모양: 아주 가늘게 유지 */}
            <boxGeometry args={[0.005, 0.8, 0.005]} />
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