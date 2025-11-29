import React, { Suspense, useEffect } from 'react';
import { useLoader, useThree } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';

interface BackgroundPlaneProps {
    texturePath: string; 
}

const PlaneContent: React.FC<BackgroundPlaneProps> = ({ texturePath }) => {
    const texture = useLoader(TextureLoader, texturePath);
    const { viewport, camera } = useThree();

    // 🔑 핵심 수정: 카메라 거리(z=-10)에 맞춰 화면을 꽉 채우는 너비/높이 계산
    // 이렇게 해야 멀리 있어도 화면 전체를 덮습니다.
    const { width, height } = viewport.getCurrentViewport(camera, [0, 0, -10]);

    useEffect(() => {
        console.log(`✅ 배경 이미지 렌더링: ${texturePath}`);
    }, [texturePath]);

    return (
        // 계산된 width, height를 적용
        <mesh position={[0, 0, -10]} scale={[width, height, 1]}>
            <planeGeometry args={[1, 1]} /> 
            <meshBasicMaterial map={texture} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
    );
};

const BackgroundPlane: React.FC<BackgroundPlaneProps> = (props) => {
    const { viewport, camera } = useThree();
    // 로딩 중일 때 보여줄 검은 배경도 크기를 맞춰줍니다.
    const { width, height } = viewport.getCurrentViewport(camera, [0, 0, -10]);

    return (
        <Suspense fallback={
            <mesh position={[0, 0, -10]} scale={[width, height, 1]}>
                <planeGeometry args={[1, 1]} /> 
                <meshBasicMaterial color="#1a1a1a" /> 
            </mesh>
        }>
            <PlaneContent {...props} />
        </Suspense>
    );
};

export default BackgroundPlane;