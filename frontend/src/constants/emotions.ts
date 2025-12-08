export interface GemStyleProps {
    mainColor: string;
    shadowColor: string;
    gradient: string;
    borderColor: string;
}

export interface EmotionOption {
    emotionKey: string;
    label: string;
    description: string;
    gemStyle: GemStyleProps;
}

// --- 카오모지 감정 옵션 (5개) ---
export const emotionOptions: EmotionOption[] = [
    {
        emotionKey: 'heart', // Ruby Logic
        label: '( ᴗ ̫ ᴗ ) ♡',
        description: '사랑',
        gemStyle: {
            mainColor: '#E0115F', // Middle stop color
            shadowColor: 'rgba(224, 17, 95, 0.6)',
            // 1. ❤️ 루비 (Ruby red)
            gradient: 'linear-gradient(135deg, #FF0000 0%, #E0115F 50%, #9B111E 100%)',
            borderColor: '#FF0000',
        }
    },
    {
        emotionKey: 'happy', // Citrine Logic
        label: '~(‾⌣‾~)',
        description: '덩실덩실',
        gemStyle: {
            mainColor: '#FFD700', // Middle stop color
            shadowColor: 'rgba(255, 215, 0, 0.6)',
            // 2. 😊 시트린 (Citrine yellow)
            gradient: 'linear-gradient(135deg, #FFFACD 0%, #FFD700 30%, #DAA520 100%)',
            borderColor: '#FFFACD',
        }
    },
    {
        emotionKey: 'low', // Sapphire Logic
        label: '（πーπ）',
        description: '슬퍼요',
        gemStyle: {
            mainColor: '#0F52BA', // Middle stop color
            shadowColor: 'rgba(15, 82, 186, 0.6)',
            // 3. 😢 사파이어 (Sapphire blue)
            gradient: 'linear-gradient(135deg, #4169E1 0%, #0F52BA 50%, #000080 100%)',
            borderColor: '#4169E1',
        }
    },
    {
        emotionKey: 'angry', // Garnet Logic
        label: '૮₍ꐦ -᷅ ⤙ -᷄ ₎ა',
        description: '화남',
        gemStyle: {
            mainColor: '#8B0000', // Middle stop color
            shadowColor: 'rgba(139, 0, 0, 0.6)',
            // 4. 😡 가넷 (Garnet red - 어두움)
            gradient: 'linear-gradient(135deg, #CD5C5C 0%, #8B0000 50%, #400000 100%)',
            borderColor: '#CD5C5C',
        }
    },
    {
        emotionKey: 'unknown', // Opal Logic
        label: 'ᐡ´•﹃•`ᐡ',
        description: '나도 몰라요',
        gemStyle: {
            mainColor: '#E0C3FC', // Middle stop color
            shadowColor: 'rgba(224, 195, 252, 0.6)',
            // 5. 🤯 오팔 (Opal - 무지개)
            gradient: 'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 25%, #E0C3FC 50%, #A1C4FD 75%, #C2E9FB 100%)',
            borderColor: '#C2E9FB',
        }
    },
];