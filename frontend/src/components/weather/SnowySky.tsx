import React, { Suspense, useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import BackgroundPlane from './BackgroundPlane';
import * as THREE from 'three';

// 이미지 Import
import snowBg from '@/assets/weather/snow.png';

// 파티클 개수 (과하지 않게 조절)
const SIMPLE_SNOW_COUNT = 400; 
const EMOJI_SNOW_COUNT = 40;   
const EMOJI_MAN_COUNT = 5;    

// 1. 하얀 눈송이 (가루눈) 컴포넌트 - 부드럽고 자연스럽게 개선
const SimpleSnowParticles: React.FC = () => {
    const meshRef = useRef<THREE.InstancedMesh>(null!);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const { viewport } = useThree();

    const particles = useMemo(() => {
        return Array.from({ length: SIMPLE_SNOW_COUNT }).map(() => ({
            position: [
                (Math.random() - 0.5) * viewport.width * 1.5,
                (Math.random() - 0.5) * viewport.height * 1.5,
                (Math.random() - 0.5) * 10 - 5, // 깊이감 있게 배치
            ] as [number, number, number],
            // 🔑 속도: 아주 천천히 떨어짐
            speed: 0.005 + Math.random() * 0.01, 
            // 🔑 흔들림: 부드럽게 흩날림
            sway: 0.005 + Math.random() * 0.01, 
            phase: Math.random() * Math.PI * 2,
            // 🔑 크기: 아주 미세한 크기 (자연스러운 가루눈)
            size: 0.02 + Math.random() * 0.03 
        }));
    }, [viewport]);

    useFrame(({ clock }) => {
        if (!meshRef.current) return;
        const time = clock.getElapsedTime();

        particles.forEach((data, i) => {
            // 1. 천천히 하강
            data.position[1] -= data.speed; 
            
            // 2. 자연스러운 흩날림 (Sin 파동으로 부드러운 곡선 운동)
            data.position[0] += Math.sin(time * 0.5 + data.phase) * data.sway; 

            // 화면 리셋
            if (data.position[1] < -viewport.height / 2 - 2) {
                data.position[1] = viewport.height / 2 + 2;
                data.position[0] = (Math.random() - 0.5) * viewport.width * 1.5;
            }

            dummy.position.set(data.position[0], data.position[1], data.position[2]);
            dummy.scale.setScalar(data.size);
            dummy.updateMatrix();
            
            meshRef.current.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, SIMPLE_SNOW_COUNT]}>
            {/* 구체 대신 원형(Circle)을 사용하여 더 부드러운 느낌 */}
            <circleGeometry args={[0.5, 8]} /> 
            {/* 투명도를 높여 몽환적인 느낌 */}
            <meshBasicMaterial color="#ffffff" transparent opacity={0.5} depthWrite={false} />
        </instancedMesh>
    );
};

// 2. 이모티콘 텍스처 생성 함수
const createEmojiTexture = (emoji: string, fontSize: number = 64) => {
    const canvas = document.createElement('canvas');
    canvas.width = 128; 
    canvas.height = 128;
    const context = canvas.getContext('2d');
    if (context) {
        context.font = `${fontSize}px serif`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(emoji, 64, 64);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
};

// 3. 이모티콘 파티클 컴포넌트
const EmojiParticles: React.FC<{ emoji: string; count: number; sizeScale: number }> = ({ emoji, count, sizeScale }) => {
    const meshRef = useRef<THREE.InstancedMesh>(null!);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const { viewport } = useThree();
    
    const texture = useMemo(() => createEmojiTexture(emoji), [emoji]);

    const particles = useMemo(() => {
        return Array.from({ length: count }).map(() => ({
            position: [
                (Math.random() - 0.5) * viewport.width * 1.5, 
                (Math.random() - 0.5) * viewport.height * 1.5,
                (Math.random() - 0.5) * 8 - 4, 
            ] as [number, number, number],
            rotation: [0, 0, Math.random() * Math.PI * 2] as [number, number, number],
            speed: 0.005 + Math.random() * 0.01, 
            sway: 0.003 + Math.random() * 0.005,
            phase: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.01,
            // 이모티콘 크기도 작고 귀엽게
            size: (0.08 + Math.random() * 0.05) * sizeScale, 
        }));
    }, [count, viewport, sizeScale]);

    useFrame(({ clock }) => {
        if (!meshRef.current) return;
        const time = clock.getElapsedTime();

        particles.forEach((data, i) => {
            data.position[1] -= data.speed;
            data.position[0] += Math.sin(time * 0.5 + data.phase) * data.sway;
            data.rotation[2] += data.rotationSpeed;

            if (data.position[1] < -viewport.height / 2 - 2) {
                data.position[1] = viewport.height / 2 + 2;
                data.position[0] = (Math.random() - 0.5) * viewport.width * 1.5;
            }

            dummy.position.set(data.position[0], data.position[1], data.position[2]);
            dummy.rotation.set(data.rotation[0], data.rotation[1], data.rotation[2]);
            dummy.scale.setScalar(data.size);
            dummy.updateMatrix();
            
            meshRef.current.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial 
                map={texture} 
                transparent={true} 
                side={THREE.DoubleSide} 
                depthWrite={false}
                opacity={0.8} 
            />
        </instancedMesh>
    );
};

const SnowySky: React.FC = () => {
    return (
        <Suspense fallback={null}>
            <BackgroundPlane texturePath={snowBg} />
            <ambientLight intensity={0.8} color="#e0eafc" />
            
            {/* 1. 하얀 눈송이 (부드러운 가루눈) */}
            <SimpleSnowParticles />
            
            {/* 2. ❄️ 이모티콘 (포인트로 소량만) */}
            <EmojiParticles emoji="❄️" count={EMOJI_SNOW_COUNT} sizeScale={1.0} />
            
            {/* 3. ☃️ 눈사람 (아주 가끔 귀엽게) */}
            <EmojiParticles emoji="☃️" count={EMOJI_MAN_COUNT} sizeScale={1.5} />
        </Suspense>
    );
};

export default SnowySky;