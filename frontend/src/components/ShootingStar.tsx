// infinite_diary/frontend/src/components/ShootingStar.tsx

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';

const ShootingStar: React.FC = () => {
    const ref = useRef<any>(null!);
    // 혜성이 나타날 초기 위치를 무작위로 설정합니다.
    const [position] = useState(() => [
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 5,
        -Math.random() * 20
    ]);

    // useFrame을 사용하여 매 프레임마다 혜성을 움직이고 루프시킵니다.
    useFrame((state, delta) => {
        if (!ref.current) return;
        
        // 혜성을 Z축(깊이)으로 빠르게 이동시킵니다.
        ref.current.position.z += 0.5; // 속도 조절

        // 혜성이 시야를 벗어나면 다시 뒤로 돌려 루프시킵니다.
        if (ref.current.position.z > 0) {
            ref.current.position.z = -20;
            ref.current.position.x = (Math.random() - 0.5) * 5;
            ref.current.position.y = (Math.random() - 0.5) * 5;
        }
    });

    return (
        <Sphere ref={ref} position={position} args={[0.01, 10, 10]}>
            <meshBasicMaterial color="white" toneMapped={false} />
        </Sphere>
    );
};

export default ShootingStar;