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
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); /* 쫀득한 애니메이션 */
  
  /* SVG 내부 색상 제어 */
  color: ${props => props.fillColor}; 

  /* 활성화 시 그림자 효과 강화 */
  filter: ${props => props.$isActive
      ? `drop-shadow(0 0 12px ${props.fillColor})`
      : `drop-shadow(0 0 4px rgba(0, 0, 0, 0.5))`};
  
  /* 활성화 시 크기 확대 */
  transform: ${props => props.$isActive ? 'scale(1.2) translateY(-5px)' : 'scale(1)'};

  /* 📱 모바일 최적화: 아이콘 크기 조정 */
  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
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

// 선택 시 은은하게 빛나는 애니메이션
const shimmer = keyframes`
  0% { box-shadow: 0 0 15px var(--shadow-color); border-color: var(--border-color); }
  50% { box-shadow: 0 0 25px var(--shadow-color), 0 0 10px rgba(255,255,255,0.2); border-color: white; }
  100% { box-shadow: 0 0 15px var(--shadow-color); border-color: var(--border-color); }
`;

const StyledEmotionButton = styled.button<{ $isSelected: boolean; $gemStyle: GemStyleProps }>`
  /* CSS 변수 설정 */
  --main-color: ${props => props.$gemStyle.mainColor};
  --shadow-color: ${props => props.$gemStyle.shadowColor};
  --gradient: ${props => props.$gemStyle.gradient};
  --border-color: ${props => props.$gemStyle.borderColor};

  padding: 15px;
  cursor: pointer;
  /* 선택 여부에 따른 배경 및 테두리 변경 */
  background: ${props => props.$isSelected ? 'linear-gradient(145deg, rgba(50,50,50,0.9), rgba(20,20,20,0.95))' : 'rgba(30, 30, 30, 0.6)'};
  color: ${props => props.$isSelected ? 'white' : '#ccc'};
  border: ${props => props.$isSelected ? '2px solid var(--border-color)' : '1px solid rgba(255, 255, 255, 0.1)'};
  border-radius: 20px;
  font-family: inherit;
  font-weight: bold;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  
  /* 데스크탑 기본 크기 */
  width: 160px;
  height: 170px;
  
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
  
  /* 글래스모피즘 효과 */
  backdrop-filter: blur(10px);
  box-shadow: ${props => props.$isSelected 
    ? '0 10px 25px var(--shadow-color), inset 0 0 10px rgba(255,255,255,0.1)' 
    : '0 4px 15px rgba(0, 0, 0, 0.3)'};
  
  position: relative;
  overflow: hidden;

  /* 선택 시 애니메이션 적용 */
  ${props => props.$isSelected && css`
    animation: ${shimmer} 2s infinite ease-in-out;
    transform: translateY(-5px);
  `}

  &:hover {
    transform: translateY(-5px);
    background: rgba(50, 50, 60, 0.8);
    border-color: var(--main-color);
    box-shadow: 0 8px 20px rgba(0,0,0,0.5);
  }

  /* 📱 모바일 최적화 (Mobile Responsive) */
  @media (max-width: 768px) {
    width: 100%; /* 그리드 내에서 꽉 차게 */
    height: auto;
    aspect-ratio: 1 / 1.1; /* 비율 유지 */
    padding: 10px;
    gap: 8px;
    border-radius: 16px;
  }
`;

const GemContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

const KaomojiStyle = styled.span`
  font-size: 1.4rem;
  line-height: 1.2;
  white-space: nowrap;
  color: inherit;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);

  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const DescriptionStyle = styled.span`
  font-size: 1rem;
  color: inherit; 
  white-space: nowrap;
  opacity: 0.9;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 20px;
  width: 100%;
  max-width: 900px;
  
  /* 📱 모바일: 2열 그리드로 변경하여 꽉 차게 표시 */
  @media (max-width: 768px) {
    display: grid;
    grid-template-columns: repeat(2, 1fr); /* 2칸씩 배치 */
    gap: 12px;
    padding: 0 10px;
  }
  
  /* 아주 작은 화면 대응 */
  @media (max-width: 360px) {
    grid-template-columns: 1fr; /* 1칸씩 배치 */
  }
`;

const RomanticQuote = styled.p`
    font-size: 1rem;
    margin-bottom: 2rem;
    max-width: 600px;
    text-align: center;
    font-family: serif;
    font-style: italic;
    color: #FFD700; /* 파스텔 옐로우 */
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
    line-height: 1.6;
    padding: 0 20px;
    word-break: keep-all; /* 단어 단위 줄바꿈 */

    @media (max-width: 768px) {
        font-size: 0.9rem;
        margin-bottom: 1.5rem;
        line-height: 1.4;
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
                18~19세기 유럽의 귀족들은 말 대신 보석으로 감정을 전하는 것을 유행으로 삼았고, 그 표현법은 마치 정교하게 규정된 하나의 공식 언어와도 같았습니다.
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