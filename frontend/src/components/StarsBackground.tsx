import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
// 🔑 오류 수정: 'maath' 라이브러리의 import 경로를 단순화합니다.
import { inSphere } from 'maath/random';

const StarsBackground: React.FC = () => {
  const ref = useRef<any>(null!);
  
  // 🔑 오류 수정: 'random.inSphere' 대신 'inSphere'를 직접 사용합니다.
  const [sphere] = useState(() => inSphere(new Float32Array(5000), { radius: 1.2 }));

  // 🔑 오류 수정: 'state' 파라미터를 사용하지 않으므로 제거합니다.
  useFrame((_, delta) => {
    ref.current.rotation.x -= delta / 10;
    ref.current.rotation.y -= delta / 15;
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#f272c8" 
          size={0.002}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
};

export default StarsBackground;