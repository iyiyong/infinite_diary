import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';

const ShootingStar: React.FC = () => {
    const ref = useRef<any>(null!);
    
    // 🔑 오류 수정: setPosition 함수를 선언하지 않습니다. (TS6133 해결)
    const [position] = useState<[number, number, number]>(() => [
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 5,
        -Math.random() * 20
    ]);

    useFrame(() => {
        if (!ref.current) return;
        
        let newZ = ref.current.position.z + 0.5;

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