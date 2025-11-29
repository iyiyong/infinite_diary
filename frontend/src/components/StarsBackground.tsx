import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';

const StarsBackground: React.FC = (props: any) => {
  // ! 연산자를 사용하여 ref가 null이 아님을 단언합니다. (TypeScript 오류 방지)
  const ref = useRef<any>(null!);
  
  // 🔑 maath 라이브러리 없이 순수 수학으로 별 위치 생성 (오류 원천 차단)
  const sphere = useMemo(() => {
    const count = 5000;
    const radius = 1.2;
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      // 구면 좌표계를 이용한 랜덤 분포 (Sphere Distribution)
      // Math.cbrt는 세제곱근을 구하여 구체 내부에 균등하게 분포되도록 합니다.
      const r = radius * Math.cbrt(Math.random());
      const theta = Math.random() * 2 * Math.PI;
      // acos 값의 범위를 벗어나지 않도록 안전하게 처리합니다.
      const val = 2 * Math.random() - 1;
      const phi = Math.acos(Math.max(-1, Math.min(1, val)));
      
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }
    return positions;
  }, []);

  useFrame((_, delta) => {
    // ref.current가 존재하는지 확인 후 회전 애니메이션 적용
    if (ref.current) {
      ref.current.rotation.x -= delta / 10;
      ref.current.rotation.y -= delta / 15;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
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