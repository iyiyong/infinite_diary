import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';

const ShootingStar: React.FC = () => {
    const ref = useRef<any>(null!);
    
    // 🔑 오류 수정: position의 타입을 [number, number, number] 튜플로 명확하게 지정합니다.
    const [position, setPosition] = useState<[number, number, number]>(() => [
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 5,
        -Math.random() * 20
    ]);

    // 🔑 오류 수정: 'state'와 'delta' 파라미터를 사용하지 않으므로 제거합니다.
    useFrame(() => {
        if (!ref.current) return;
        
        let newZ = ref.current.position.z + 0.5; // 속도 조절

        // 혜성이 시야를 벗어나면 다시 뒤로 돌려 루프시킵니다.
        if (newZ > 1) {
            newZ = -20;
            // setPosition을 사용하지 않고 ref를 직접 조작합니다.
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
