import React, { Suspense, useEffect, useMemo } from 'react';
import { useLoader, useThree } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';

interface BackgroundPlaneProps {
    texturePath: string; 
}

const PlaneContent: React.FC<BackgroundPlaneProps> = ({ texturePath }) => {
    const texture = useLoader(TextureLoader, texturePath);
    const { viewport, camera } = useThree();

    // 1. 현재 카메라 거리(-10)에서의 화면 크기 계산
    const viewZ = -10;
    const { width: viewportWidth, height: viewportHeight } = viewport.getCurrentViewport(camera, [0, 0, viewZ]);

    // 2. 🔑 비율 유지 로직 (Aspect Ratio Cover)
    const scale = useMemo(() => {
        if (!texture.image) return [viewportWidth, viewportHeight, 1] as [number, number, number];

        const imageAspect = texture.image.width / texture.image.height;
        const screenAspect = viewportWidth / viewportHeight;

        // 화면이 이미지보다 납작하면 (가로형) -> 가로를 맞추고 세로를 자름
        // 화면이 이미지보다 길쭉하면 (세로형/모바일) -> 세로를 맞추고 가로를 자름
        if (screenAspect > imageAspect) {
            return [viewportWidth, viewportWidth / imageAspect, 1] as [number, number, number];
        } else {
            return [viewportHeight * imageAspect, viewportHeight, 1] as [number, number, number];
        }
    }, [texture, viewportWidth, viewportHeight]);

    useEffect(() => {
        // ✅ [수정 완료] 최신 Three.js에서는 encoding 대신 colorSpace를 사용합니다.
        texture.colorSpace = THREE.SRGBColorSpace; 
        
        // 화질 보정
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.needsUpdate = true;
    }, [texture, texturePath]);

    return (
        <mesh position={[0, 0, viewZ]} scale={scale}>
            <planeGeometry args={[1, 1]} /> 
            <meshBasicMaterial 
                map={texture} 
                toneMapped={false} 
                side={THREE.DoubleSide} 
                transparent={false} 
            />
        </mesh>
    );
};

const BackgroundPlane: React.FC<BackgroundPlaneProps> = (props) => {
    const { viewport, camera } = useThree();
    // 로딩 중일 때 보여줄 검은 배경
    const { width, height } = viewport.getCurrentViewport(camera, [0, 0, -10]);

    return (
        <Suspense fallback={
            <mesh position={[0, 0, -10]} scale={[width * 2, height * 2, 1]}> 
                <planeGeometry args={[1, 1]} /> 
                <meshBasicMaterial color="#0a0a14" /> 
            </mesh>
        }>
            <PlaneContent {...props} />
        </Suspense>
    );
};

export default BackgroundPlane;