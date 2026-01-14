import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import * as Tone from 'tone'; 

// 페이지 컴포넌트 임포트
import AuthPage from './pages/AuthPage'; 
import DiaryPage from './pages/DiaryPage'; 
import CalendarPage from './pages/CalendarPage'; 

const AppContent: React.FC = () => {
    const [audioContextReady, setAudioContextReady] = useState(false);
    const navigate = useNavigate();

    const startAudioContext = async () => {
        try {
            if (Tone.context.state !== 'running') {
                await Tone.start(); 
                console.log('Audio Context Started');
            }
        } catch (error) {
            console.error('Audio Context Start Failed:', error);
        }
        
        setAudioContextReady(true); 

        const token = localStorage.getItem('diaryToken');
        setTimeout(() => {
            if (token) {
                 navigate('/diary'); 
            } else {
                 navigate('/auth');
            }
        }, 800); 
    };

    return (
        <>
            {/* 1. 시작 화면 */}
            {!audioContextReady && (
                <div className="initial-screen">
                    
                    {/* 🕳️ CSS 블랙홀 효과 (3D Tilted Ring) */}
                    <div className="black-hole-container">
                        <div className="accretion-disk"></div>
                        <div className="event-horizon"></div>
                    </div>
                    
                    <div className="content-wrapper">
                        {/* 메인 타이틀 */}
                        <h1 className="initial-title">
                            Infinite Diary
                        </h1>
                        
                        {/* 설명 텍스트 */}
                        <div className="text-group fade-in-delay">
                            <p className="description">
                                하루를 기록하면, 작은 성장이 조용히 쌓여간다
                            </p>
                            <p className="sub-description">
                                날씨에 따라 변화하는 공간
                            </p>
                        </div>

                        {/* 시작 버튼 */}
                        <button onClick={startAudioContext} className="start-button">
                            Diary Start
                        </button>
                    </div>
                </div>
            )}
            
            {/* 2. 라우터 화면 */}
            {audioContextReady && (
                  <Routes>
                    <Route path="/" element={<AuthPage />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/diary" element={<DiaryPage />} />
                    <Route path="/calendar" element={<CalendarPage />} />
                  </Routes>
            )}
        </>
    );
};

const App: React.FC = () => (
    <Router>
        <AppContent />
        <style>{`
            /* 폰트: Outfit (Luxury & Cute) */
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@200;400;700&display=swap');
            @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

            body, html {
                margin: 0;
                padding: 0;
                font-family: 'Outfit', 'Pretendard', sans-serif;
                background-color: #000000;
                overflow: hidden;
                height: 100%;
            }

            .initial-screen {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: #000000;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                color: white;
                perspective: 1200px; /* 3D 효과 강화 */
            }

            /* --- 🕳️ Black Hole Styles (Modified Shape) --- */
            .black-hole-container {
                position: absolute;
                top: 45%; /* 텍스트와 겹치지 않게 위치 미세 조정 */
                left: 50%;
                transform: translate(-50%, -50%);
                width: 600px;
                height: 600px;
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 0;
                pointer-events: none;
                /* 3D 공간 설정 */
                transform-style: preserve-3d;
            }

            /* 빛의 고리 (Accretion Disk) - 기울어진 형태 */
            .accretion-disk {
                position: absolute;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                
                /* 기존 색상 유지 (White/Silver Gradients) */
                background: conic-gradient(
                    from 0deg, 
                    transparent 0%, 
                    rgba(255, 255, 255, 0.1) 20%, 
                    rgba(255, 255, 255, 0.9) 50%, 
                    rgba(255, 255, 255, 0.1) 80%, 
                    transparent 100%
                );
                
                /* 🌟 핵심 변경: 디스크를 눕혀서 입체감 부여 */
                transform: rotateX(75deg); 
                
                box-shadow: 0 0 60px rgba(255, 255, 255, 0.15); /* 은은한 발광 */
                
                /* 가운데 구멍 뚫기 (도넛 모양 유지하되 눕힘) */
                -webkit-mask-image: radial-gradient(transparent 55%, black 60%);
                mask-image: radial-gradient(transparent 55%, black 60%);

                animation: spinDisk 10s linear infinite;
                opacity: 0.9;
            }

            /* 사건의 지평선 (Event Horizon) - 중앙의 검은 구체 */
            .event-horizon {
                position: absolute;
                width: 180px; /* 크기 조정 */
                height: 180px;
                background-color: #000000;
                border-radius: 50%;
                z-index: 10;
                
                /* 구체 주변의 미세한 빛 번짐 */
                box-shadow: 
                    0 0 30px rgba(255, 255, 255, 0.3),
                    inset 0 0 40px rgba(0, 0, 0, 1);
            }

            /* 회전 애니메이션: 눕혀진 상태에서 회전 */
            @keyframes spinDisk {
                from { transform: rotateX(75deg) rotate(0deg); }
                to { transform: rotateX(75deg) rotate(360deg); }
            }

            /* --- Content Styles --- */
            .content-wrapper {
                text-align: center;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 40px;
                z-index: 10;
                text-shadow: 0 4px 20px rgba(0,0,0,0.8); 
                margin-top: 50px; /* 블랙홀 아래로 컨텐츠 내리기 */
            }

            .initial-title {
                font-size: 4.5rem;
                font-weight: 700;
                margin: 0;
                letter-spacing: -2px;
                color: #ffffff;
                filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.5));
                animation: floatTitle 4s ease-in-out infinite alternate;
            }

            @keyframes floatTitle {
                from { transform: translateY(0); }
                to { transform: translateY(-10px); }
            }

            .text-group {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .description {
                font-size: 1.15rem;
                color: rgba(255, 255, 255, 0.95);
                font-weight: 200;
                margin: 0;
                letter-spacing: 0.5px;
            }
            
            .sub-description {
                font-size: 0.9rem;
                color: rgba(255, 255, 255, 0.6);
                font-weight: 200;
                margin: 0;
            }

            .fade-in-delay {
                opacity: 0;
                animation: fadeIn 1.5s ease-out forwards;
                animation-delay: 0.5s;
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }

            /* --- Button Styles --- */
            .start-button {
                margin-top: 30px;
                padding: 18px 60px;
                font-size: 1.1rem;
                font-family: 'Outfit', sans-serif;
                font-weight: 600;
                letter-spacing: 1px;
                color: white;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 100px;
                border: 1px solid rgba(255, 255, 255, 0.3);
                backdrop-filter: blur(5px);
                cursor: pointer;
                transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
                box-shadow: 0 0 30px rgba(255, 255, 255, 0.05);
            }

            .start-button:hover {
                background: rgba(255, 255, 255, 0.2);
                border-color: rgba(255, 255, 255, 0.8);
                transform: scale(1.05);
                box-shadow: 
                    0 0 40px rgba(255, 255, 255, 0.4),
                    inset 0 0 20px rgba(255, 255, 255, 0.1);
            }

            @media (max-width: 768px) {
                .black-hole-container { width: 90vw; height: 90vw; }
                .initial-title { font-size: 3rem; }
                .description { font-size: 1rem; padding: 0 20px; word-break: keep-all; }
                .start-button { width: 80%; padding: 18px 0; }
            }
        `}</style>
    </Router>
);

export default App;