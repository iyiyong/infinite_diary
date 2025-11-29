import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';

const ShootingStar: React.FC = () => {
    const ref = useRef<any>(null!);
    
    // 🔑 'setPosition'을 사용하지 않는 깨끗한 버전입니다.
    const [position] = useState<[number, number, number]>(() => [
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 5,
        -Math.random() * 20
    ]);

    useFrame(() => {
        if (!ref.current) return;
        
        let newZ = ref.current.position.z + 0.5;

        // 혜성이 시야를 벗어나면 다시 뒤로 돌려 루프시킵니다.
        if (newZ > 1) {
            newZ = -20;
            ref.current.position.x = (Math.random() - 0.5) * 5;
            ref.current.position.y = (Math.random() - 0.5) * 5;
        }
        ref.current.position.z = newZ;
    });

    return (
        <Sphere ref={ref} position={position} args={[0.01, 10, 10]}>
            <meshBasicMaterial color="white" toneMapped={false} />
        </Sphere>
    );
};

export default ShootingStar;