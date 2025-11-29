// src/constants/emotions.ts

// 🔑 [핵심 수정] export 키워드를 붙여서 다른 파일에서 쓸 수 있게 만듭니다.
export interface GemStyleProps {
    mainColor: string;
    shadowColor: string;
    gradient: string;
    borderColor: string;
}

// 🔑 [핵심 수정] export 추가
export interface EmotionOption {
    emotionKey: string;
    label: string;
    description: string;
    gemStyle: GemStyleProps;
}

// --- 카오모지 감정 옵션 (5개) ---
export const emotionOptions: EmotionOption[] = [
    {
        emotionKey: 'heart',
        label: '( ᴗ ̫ ᴗ ) ♡',
        description: '사랑',
        gemStyle: {
            mainColor: '#ff0055', // Ruby Red
            shadowColor: 'rgba(255, 0, 85, 0.6)',
            gradient: 'radial-gradient(circle at 30% 30%, #ff88aa, #ff0055, #cc0044)',
            borderColor: '#ff6699',
        }
    },
    {
        emotionKey: 'happy',
        label: '~(‾⌣‾~)',
        description: '덩실덩실',
        gemStyle: {
            mainColor: '#ff8800', // Topaz Orange
            shadowColor: 'rgba(255, 136, 0, 0.6)',
            gradient: 'radial-gradient(circle at 30% 30%, #ffcc88, #ff8800, #dd7700)',
            borderColor: '#ffaa66',
        }
    },
    {
        emotionKey: 'low',
        label: '（πーπ）',
        description: '슬퍼요',
        gemStyle: {
            mainColor: '#cccccc', // Pearl Silver
            shadowColor: 'rgba(204, 204, 204, 0.6)',
            gradient: 'radial-gradient(circle at 30% 30%, #ffffff, #cccccc, #aaaaaa)',
            borderColor: '#dddddd',
        }
    },
    {
        emotionKey: 'angry',
        label: '૮₍ꐦ -᷅ ⤙ -᷄ ₎ა',
        description: '화남',
        gemStyle: {
            mainColor: '#880000', // Garnet Deep Red
            shadowColor: 'rgba(136, 0, 0, 0.6)',
            gradient: 'radial-gradient(circle at 30% 30%, #cc3333, #880000, #550000)',
            borderColor: '#bb0000',
        }
    },
    {
        emotionKey: 'unknown',
        label: 'ᐡ´•﹃•`ᐡ',
        description: '나도 몰라요',
        gemStyle: {
            mainColor: '#ffee00', // Citrine Yellow
            shadowColor: 'rgba(255, 238, 0, 0.6)',
            gradient: 'radial-gradient(circle at 30% 30%, #ffff88, #ffee00, #ddcc00)',
            borderColor: '#ffdd66',
        }
    },
];