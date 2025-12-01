import React from 'react';
import styled, { keyframes, css } from 'styled-components';
// 💡 오류 해결: 값(emotionOptions)과 타입(Interface)을 명확히 분리하여 임포트
import { emotionOptions } from '../constants/emotions';
import type { EmotionOption, GemStyleProps } from '../constants/emotions';

// --- SVG 다이아몬드 아이콘 정의 ---
interface GemIconProps {
  fillColor: string;
  $isActive: boolean;
}

// 반짝이는 별 하이라이트
const StarHighlight = ({ x, y, color }: { x: number, y: number, color: string }) => (
    <polygon
      fill={color}
      points={`${x},${y - 3} ${x + 1.5},${y - 1.5} ${x + 3},${y - 3} ${x + 1.5},${y} ${x + 3},${y + 3} ${x + 1.5},${y + 1.5} ${x},${y + 3} ${x - 1.5},${y + 1.5} ${x - 3},${y + 3} ${x - 1.5},${y} ${x - 3},${y - 3} ${x - 1.5},${y - 1.5}`}
    />
);

const GemIconSVG = styled.svg<GemIconProps>`
  width: 60px;
  height: 60px;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); /* 텐션감 있는 애니메이션 */
  
  /* SVG 내부 색상 제어 */
  color: ${props => props.fillColor}; 

  /* 활성화 시 그림자 효과 강화 (네온 느낌) */
  filter: ${props => props.$isActive
      ? `drop-shadow(0 0 15px ${props.fillColor}) drop-shadow(0 0 5px white)`
      : `drop-shadow(0 0 2px rgba(255, 255, 255, 0.3))`};
  
  /* 활성화 시 크기 확대 */
  transform: ${props => props.$isActive ? 'scale(1.15) translateY(-5px)' : 'scale(1)'};
  opacity: ${props => props.$isActive ? 1 : 0.85};

  /* 📱 모바일 최적화: 아이콘 크기 조정 */
  @media (max-width: 768px) {
    width: 48px;
    height: 48px;
  }
`;

const GemIcon: React.FC<GemIconProps> = (props) => {
    return (
        <GemIconSVG fillColor={props.fillColor} $isActive={props.$isActive} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <symbol id="final-gem-icon" viewBox="0 0 100 100">
                    {/* 보석의 각 면 (Facet) - 투명도를 조절하여 입체감 표현 */}
                    <polygon className="gem-facet" opacity="0.65" points="50 10, 100 35, 50 100, 0 35" />
                    <polygon className="gem-facet" opacity="0.75" points="50 100, 75 40, 50 50, 25 40" /> 
                    <polygon className="gem-facet" opacity="0.85" points="50 100, 75 40, 100 35, 50 50" />
                    <polygon className="gem-facet" opacity="0.85" points="50 100, 25 40, 0 35, 50 50" />
                    <polygon className="gem-facet" opacity="0.95" points="50 10, 75 40, 100 35, 50 50" /> 
                    <polygon className="gem-facet" opacity="0.95" points="50 10, 25 40, 0 35, 50 50" />
                    <polygon className="gem-facet" opacity="0.98" points="50 10, 50 35, 75 40" />
                    <polygon className="gem-facet" opacity="0.98" points="50 10, 50 35, 25 40" />
                </symbol>
            </defs>

            {/* SVG 내부에서 상위 color 값을 상속받도록 설정 */}
            <style>
              {`
                .gem-facet { fill: currentColor; }
              `}
            </style>
            
            <use href="#final-gem-icon" />

            <g opacity={props.$isActive ? 1 : 0.7}>
                <StarHighlight x={40} y={25} color='white'/>
                <StarHighlight x={60} y={25} color='white'/>
            </g>
        </GemIconSVG>
    );
};

// --- Styled Components (디자인 및 반응형) ---

// 선택 시 은은하게 빛나는 애니메이션 (테두리 위주)
const shimmer = keyframes`
  0% { box-shadow: 0 0 10px var(--shadow-color), inset 0 0 5px var(--shadow-color); border-color: var(--border-color); }
  50% { box-shadow: 0 0 20px var(--shadow-color), inset 0 0 10px var(--shadow-color); border-color: white; }
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
  
  /* Layout */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
  
  /* Size (Desktop) */
  width: 160px;
  height: 170px;
  padding: 15px;
  border-radius: 24px;
  
  /* 💎 Glassmorphism Style (핵심 수정) */
  /* 배경을 매우 투명하게 설정하여 뒤의 별이 보이도록 함 */
  background: ${props => props.$isSelected 
    ? 'rgba(255, 255, 255, 0.12)' 
    : 'rgba(255, 255, 255, 0.03)'}; 
  
  /* 블러 효과로 텍스트 가독성 확보하되, 너무 뿌옇게 하지 않음 */
  backdrop-filter: blur(6px); 
  -webkit-backdrop-filter: blur(6px);

  /* 테두리: 얇고 세련되게 */
  border: 1px solid ${props => props.$isSelected 
    ? 'var(--main-color)' 
    : 'rgba(255, 255, 255, 0.1)'};
  
  color: ${props => props.$isSelected ? 'white' : 'rgba(255, 255, 255, 0.8)'};
  
  /* 그림자: 선택 안됐을 땐 거의 없게 */
  box-shadow: ${props => props.$isSelected 
    ? '0 8px 32px 0 rgba(0, 0, 0, 0.3)' 
    : 'none'};

  font-family: inherit;
  transition: all 0.3s ease;

  /* 선택 시 애니메이션 적용 */
  ${props => props.$isSelected && css`
    animation: ${shimmer} 2.5s infinite ease-in-out;
    transform: translateY(-5px);
  `}

  &:hover {
    transform: translateY(-3px);
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
  }

  /* 📱 모바일 최적화 (Mobile Responsive) */
  @media (max-width: 768px) {
    width: 100%; 
    height: 140px; /* 높이를 약간 줄여서 화면 효율성 증대 */
    padding: 10px;
    gap: 8px;
    border-radius: 18px;
    
    /* 모바일에서는 블러를 조금 더 주어 텍스트 가독성 확보 */
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
  filter: drop-shadow(0 5px 5px rgba(0,0,0,0.2));
`;

const KaomojiStyle = styled.span`
  font-size: 1.3rem;
  line-height: 1.2;
  white-space: nowrap;
  color: inherit;
  font-weight: 700;
  /* 텍스트 그림자로 배경이 밝아도 잘 보이게 */
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
  
  /* 📱 모바일: 2열 그리드로 꽉 차게 */
  @media (max-width: 768px) {
    display: grid;
    grid-template-columns: repeat(2, 1fr); /* 2칸씩 배치 */
    gap: 12px;
    padding: 0 5px; /* 양옆 여백 최소화 */
  }
  
  @media (max-width: 360px) {
    gap: 8px; /* 아주 작은 화면에선 간격 더 좁게 */
  }
`;

const RomanticQuote = styled.p`
    font-size: 1rem;
    margin-bottom: 2rem;
    max-width: 650px;
    text-align: center;
    font-family: serif; /* 명조체 계열 */
    font-style: italic;
    color: #FFD700; /* 골드 */
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

// 3. 메인 감정 선택 컴포넌트
const EmotionSelector: React.FC<EmotionSelectorProps> = ({ onSelect, currentEmotionKey }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            
            <RomanticQuote>
                "18세기 귀족들은 말 대신 보석으로 마음을 전했습니다.<br/>
                오늘 당신의 마음은 어떤 보석을 닮았나요?"
            </RomanticQuote>
            
            <ButtonGroup>
                {emotionOptions.map(opt => (
                    <StyledEmotionButton
                        key={opt.emotionKey}
                        $isSelected={currentEmotionKey === opt.emotionKey}
                        $gemStyle={opt.gemStyle}
                        onClick={() => onSelect(opt)}
                    >
                        {/* 보석 아이콘 */}
                        <GemContainer>
                            <GemIcon fillColor={opt.gemStyle.mainColor} $isActive={currentEmotionKey === opt.emotionKey} />
                        </GemContainer>

                        {/* 텍스트 정보 */}
                        <KaomojiStyle>{opt.label}</KaomojiStyle>
                        <DescriptionStyle>{opt.description}</DescriptionStyle>
                    </StyledEmotionButton>
                ))}
            </ButtonGroup>
        </div>
    );
};

export default EmotionSelector;