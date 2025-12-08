import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import { emotionOptions } from '../constants/emotions';
import type { EmotionOption, GemStyleProps } from '../constants/emotions';

// --- SVG 다이아몬드 아이콘 정의 ---
interface GemIconProps {
  index: number; // 💡 수정: 텍스트 키 대신 숫자 인덱스로 색상 강제 지정
  mainColor: string;
  $isActive: boolean;
}

// ✨ 반짝이 하이라이트 (날카로운 십자 모양)
const StarHighlight = ({ x, y, scale = 1, opacity = 1 }: { x: number, y: number, scale?: number, opacity?: number }) => (
    <g transform={`translate(${x}, ${y}) scale(${scale})`} opacity={opacity}>
        <polygon
            fill="white"
            points="0,-6 1.5,-1.5 6,0 1.5,1.5 0,6 -1.5,1.5 -6,0 -1.5,-1.5"
        />
    </g>
);

const GemIconSVG = styled.svg<{ $fillColor: string; $isActive: boolean }>`
  width: 65px;
  height: 65px;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  
  /* 활성화 시: 네온 글로우 + 광택 강조 */
  filter: ${props => props.$isActive
      ? `drop-shadow(0 0 12px ${props.$fillColor}) drop-shadow(0 0 20px ${props.$fillColor}) brightness(1.2)`
      : `drop-shadow(0 4px 6px rgba(0,0,0,0.4))`};
  
  transform-origin: center center;
  transform: ${props => props.$isActive ? 'scale(1.15) translateY(-5px)' : 'scale(1)'};
  opacity: ${props => props.$isActive ? 1 : 0.9};

  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
  }
`;

// 🎨 보석별 영롱한 그라데이션 (순서대로 적용됨)
// 0: 사랑, 1: 즐거움, 2: 슬픔, 3: 화남, 4: 혼란
const GRADIENTS = [
    // 0. ❤️ 루비 (Ruby) - 깊은 레드 ~ 핑크
    (
        <>
            <stop offset="0%" stopColor="#5D0016" />
            <stop offset="50%" stopColor="#D00030" />
            <stop offset="100%" stopColor="#FF4D6D" />
        </>
    ),
    // 1. 💛 시트린 (Citrine) - 앰버 ~ 골드 옐로우
    (
        <>
            <stop offset="0%" stopColor="#B37400" />
            <stop offset="50%" stopColor="#FFC300" />
            <stop offset="100%" stopColor="#FFFF8F" />
        </>
    ),
    // 2. 💙 사파이어 (Sapphire) - 딥 네이비 ~ 오션 블루
    (
        <>
            <stop offset="0%" stopColor="#001233" />
            <stop offset="50%" stopColor="#0466C8" />
            <stop offset="100%" stopColor="#48CAE4" />
        </>
    ),
    // 3. 🔥 가넷 (Garnet) - 블랙 레드 ~ 타오르는 오렌지
    (
        <>
            <stop offset="0%" stopColor="#370617" />
            <stop offset="40%" stopColor="#9D0208" />
            <stop offset="100%" stopColor="#E85D04" />
        </>
    ),
    // 4. 🦄 오팔 (Opal) - 몽환적인 파스텔
    (
        <>
            <stop offset="10%" stopColor="#A1C4FD" />
            <stop offset="50%" stopColor="#C2E9FB" />
            <stop offset="90%" stopColor="#FBC2EB" />
        </>
    )
];

const GemIcon: React.FC<GemIconProps> = ({ index, mainColor, $isActive }) => {
    // ID 충돌 방지
    const gradientId = `gem-gradient-${index}`;
    
    // 💡 핵심 수정: 인덱스로 그라데이션 선택 (범위를 벗어나면 첫번째 색상 사용)
    const gradientStops = GRADIENTS[index] || GRADIENTS[0];

    return (
        <GemIconSVG $fillColor={mainColor} $isActive={$isActive} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id={gradientId} x1="20%" y1="0%" x2="80%" y2="100%">
                    {gradientStops}
                </linearGradient>
            </defs>

            {/* 💎 각지고 반듯한 보석 쉐입 */}
            <g>
                {/* 1. 바디 (Main Body) */}
                <polygon 
                    points="20,30 80,30 100,45 50,100 0,45" 
                    fill={`url(#${gradientId})`} 
                    stroke={mainColor} 
                    strokeWidth="0.5" 
                />
                
                {/* 2. 파셋 오버레이 (Facet Overlay) - 입체감 형성 */}
                
                {/* 상단 테이블 (Table) - 가장 밝게 빛남 */}
                <polygon points="30,30 70,30 75,40 25,40" fill="white" opacity="0.45" style={{ mixBlendMode: 'overlay' }} />
                
                {/* 상단 측면 (Crown) - 은은한 반사 */}
                <polygon points="20,30 30,30 25,40 0,45" fill="white" opacity="0.3" />
                <polygon points="70,30 80,30 100,45 75,40" fill="white" opacity="0.3" />
                
                {/* 하단 측면 (Pavilion) - 깊은 그림자 */}
                <polygon points="0,45 25,40 50,100" fill="black" opacity="0.25" style={{ mixBlendMode: 'multiply' }}/>
                <polygon points="100,45 75,40 50,100" fill="black" opacity="0.25" style={{ mixBlendMode: 'multiply' }}/>
                
                {/* 중앙 엣지 하이라이트 */}
                <polygon points="25,40 75,40 50,100" fill="white" opacity="0.15" style={{ mixBlendMode: 'screen' }} />
            </g>

            {/* ✨ 반짝이 효과 (각진 느낌에 맞춰 배치) */}
            <g opacity={$isActive ? 1 : 0.6}>
                <StarHighlight x={20} y={30} scale={1.2} />
                <StarHighlight x={80} y={30} scale={0.9} />
                <StarHighlight x={50} y={95} scale={0.6} opacity={0.8} />
                {$isActive && <StarHighlight x={35} y={35} scale={0.7} />}
            </g>
        </GemIconSVG>
    );
};

// --- Styled Components (기존 유지) ---

const shimmer = keyframes`
  0% { box-shadow: 0 0 10px var(--shadow-color), inset 0 0 5px var(--shadow-color); border-color: var(--border-color); }
  50% { box-shadow: 0 0 25px var(--shadow-color), inset 0 0 12px var(--shadow-color); border-color: white; }
  100% { box-shadow: 0 0 10px var(--shadow-color), inset 0 0 5px var(--shadow-color); border-color: var(--border-color); }
`;

const StyledEmotionButton = styled.button<{ $isSelected: boolean; $gemStyle: GemStyleProps }>`
  /* CSS 변수 설정 */
  --main-color: ${props => props.$gemStyle.mainColor};
  --shadow-color: ${props => props.$gemStyle.shadowColor};
  --border-color: ${props => props.$gemStyle.borderColor};

  position: relative;
  overflow: hidden;
  cursor: pointer;
  
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
  
  width: 160px;
  height: 170px;
  padding: 15px;
  border-radius: 24px;
  
  background: ${props => props.$isSelected 
    ? 'rgba(255, 255, 255, 0.12)' 
    : 'rgba(255, 255, 255, 0.03)'}; 
  
  backdrop-filter: blur(6px); 
  -webkit-backdrop-filter: blur(6px);

  border: 1px solid ${props => props.$isSelected 
    ? 'var(--main-color)' 
    : 'rgba(255, 255, 255, 0.1)'};
  
  color: ${props => props.$isSelected ? 'white' : 'rgba(255, 255, 255, 0.8)'};
  
  box-shadow: ${props => props.$isSelected 
    ? '0 8px 32px 0 rgba(0, 0, 0, 0.3)' 
    : 'none'};

  font-family: inherit;
  transition: all 0.3s ease;

  ${props => props.$isSelected && css`
    animation: ${shimmer} 2.5s infinite ease-in-out;
    transform: translateY(-5px);
  `}

  &:hover {
    transform: translateY(-3px);
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
  }

  @media (max-width: 768px) {
    width: 100%; 
    height: 140px; 
    padding: 10px;
    gap: 8px;
    border-radius: 18px;
    
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }
`;

const GemContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  filter: drop-shadow(0 8px 10px rgba(0,0,0,0.4));
`;

const KaomojiStyle = styled.span`
  font-size: 1.3rem;
  line-height: 1.2;
  white-space: nowrap;
  color: inherit;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0,0,0,0.6);

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const DescriptionStyle = styled.span`
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);

  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 20px;
  width: 100%;
  max-width: 900px;
  
  @media (max-width: 768px) {
    display: grid;
    grid-template-columns: repeat(2, 1fr); 
    gap: 12px;
    padding: 0 5px; 
  }
  
  @media (max-width: 360px) {
    gap: 8px; 
  }
`;

const RomanticQuote = styled.p`
    font-size: 1rem;
    margin-bottom: 2rem;
    max-width: 650px;
    text-align: center;
    font-family: serif; 
    font-style: italic;
    color: #FFD700; 
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.4);
    line-height: 1.6;
    padding: 0 20px;
    word-break: keep-all;

    @media (max-width: 768px) {
        font-size: 0.9rem;
        margin-bottom: 1.5rem;
        line-height: 1.5;
        padding: 0 10px;
        opacity: 0.9;
    }
`;

interface EmotionSelectorProps {
    onSelect: (emotion: EmotionOption) => void;
    currentEmotionKey: string; 
}

const EmotionSelector: React.FC<EmotionSelectorProps> = ({ onSelect, currentEmotionKey }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            
            <RomanticQuote>
                "18세기 귀족들은 말 대신 보석으로 마음을 전했습니다.<br/>
                오늘 당신의 마음은 어떤 보석을 닮았나요?"
            </RomanticQuote>
            
            <ButtonGroup>
                {emotionOptions.map((opt, index) => (
                    <StyledEmotionButton
                        key={opt.emotionKey}
                        $isSelected={currentEmotionKey === opt.emotionKey}
                        $gemStyle={opt.gemStyle}
                        onClick={() => onSelect(opt)}
                    >
                        <GemContainer>
                            {/* 🚨 수정: 인덱스를 넘겨주어 순서대로 색상이 지정되도록 강제함 */}
                            <GemIcon 
                                index={index}
                                mainColor={opt.gemStyle.mainColor} 
                                $isActive={currentEmotionKey === opt.emotionKey} 
                            />
                        </GemContainer>

                        <KaomojiStyle>{opt.label}</KaomojiStyle>
                        <DescriptionStyle>{opt.description}</DescriptionStyle>
                    </StyledEmotionButton>
                ))}
            </ButtonGroup>
        </div>
    );
};

export default EmotionSelector;