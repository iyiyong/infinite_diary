import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as random from 'maath/random/dist/maath-random.esm';

const StarsBackground: React.FC = () => {
  const ref = useRef<any>(null!);
  const [sphere] = useState(() => random.inSphere(new Float32Array(5000), { radius: 1.2 })); // 5000개의 별 생성

  // 🔑 useFrame: 매 프레임마다 실행되어 애니메이션을 만듭니다.
  useFrame((state, delta) => {
    // 별 입자들을 느리게 회전시켜 우주가 움직이는 느낌을 줍니다.
    ref.current.rotation.x -= delta / 10;
    ref.current.rotation.y -= delta / 15;
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      {/* 🔑 Points: 입자(별)들의 그룹 */}
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
        {/* 🔑 PointMaterial: 입자의 재질 및 모양 설정 (작은 원) */}
        <PointMaterial
          transparent
          color="#f272c8" // 별의 색상
          size={0.002}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
};

export default StarsBackground;