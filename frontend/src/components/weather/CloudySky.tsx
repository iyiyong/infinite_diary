import React, { Suspense } from 'react';
import { Cloud } from '@react-three/drei'; 
import BackgroundPlane from './BackgroundPlane'; 

// 이미지 Import
import cloudyBg from '@/assets/weather/cloudy.png';

const CloudySky: React.FC = () => {
    return (
        <Suspense fallback={null}>
            <BackgroundPlane texturePath={cloudyBg} />
            
            <ambientLight intensity={0.8} color="#99aadd" />
            
            {/* as any 캐스팅 유지 (타입 오류 방지) */}
            <Cloud 
                opacity={0.5} 
                speed={0.1} 
                width={20} 
                depth={1.5} 
                segments={20} 
                position={[0, 0, -5]} 
                color="#f0f0f0" 
                {...{} as any} 
            />
            <Cloud 
                opacity={0.7} 
                speed={0.15} 
                width={15} 
                depth={1} 
                segments={15} 
                position={[5, 3, -6]} 
                color="#cccccc" 
                {...{} as any} 
            />
        </Suspense>
    );
};

export default CloudySky;