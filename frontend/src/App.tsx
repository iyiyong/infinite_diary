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
            {/* 1. 시작 화면 (Black Hole & Luxury Concept) */}
            {!audioContextReady && (
                <div className="initial-screen">
                    
                    {/* 🕳️ CSS 블랙홀 효과 */}
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
                                원하시는 음악을 틀면 감상도가 올라갑니다
                            </p>
                            <p className="sub-description">
                                날씨 선택에 따라 공간이 변화함
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
                perspective: 1000px; /* 3D 효과를 위한 원근감 */
            }

            /* --- 🕳️ Black Hole Styles --- */
            .black-hole-container {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 600px;
                height: 600px;
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 0; /* 텍스트 뒤로 배치 */
                pointer-events: none;
            }

            /* 빛의 고리 (Accretion Disk) - 회전하는 빛 */
            .accretion-disk {
                position: absolute;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                /* 은은한 화이트/실버 그라데이션으로 고급스럽게 */
                background: conic-gradient(
                    from 0deg, 
                    transparent 0%, 
                    rgba(255, 255, 255, 0.1) 20%, 
                    rgba(255, 255, 255, 0.8) 50%, 
                    rgba(255, 255, 255, 0.1) 80%, 
                    transparent 100%
                );
                filter: blur(15px); /* 빛 번짐 효과 */
                animation: spinDisk 8s linear infinite;
                opacity: 0.8;
                box-shadow: 0 0 100px rgba(255, 255, 255, 0.1);
            }

            /* 사건의 지평선 (Event Horizon) - 중앙의 완전한 어둠 */
            .event-horizon {
                position: absolute;
                width: 58%; /* 고리보다 작게 */
                height: 58%;
                background-color: #000000;
                border-radius: 50%;
                z-index: 1;
                /* 블랙홀 주변의 빛나는 테두리 */
                box-shadow: 
                    inset 0 0 40px rgba(255, 255, 255, 0.5), /* 내부 빛 */
                    0 0 20px rgba(0, 0, 0, 1); /* 외부 그림자 */
            }

            @keyframes spinDisk {
                from { transform: rotate(0deg) scale(1); }
                50% { transform: rotate(180deg) scale(1.05); } /* 숨쉬듯이 살짝 커짐 */
                to { transform: rotate(360deg) scale(1); }
            }

            /* --- Content Styles --- */
            .content-wrapper {
                text-align: center;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 40px;
                z-index: 10; /* 블랙홀 위에 배치 */
                /* 텍스트 가독성을 위해 살짝 띄우기 */
                text-shadow: 0 4px 20px rgba(0,0,0,0.8); 
            }

            .initial-title {
                font-size: 4.5rem;
                font-weight: 700;
                margin: 0;
                letter-spacing: -2px;
                color: #ffffff;
                /* 타이틀에 은은한 빛 효과 */
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
                
                /* 귀여운 알약 모양 */
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
                /* 버튼 호버 시 빛이 강해짐 */
                box-shadow: 
                    0 0 40px rgba(255, 255, 255, 0.4),
                    inset 0 0 20px rgba(255, 255, 255, 0.1);
            }

            @media (max-width: 768px) {
                /* 모바일에서는 블랙홀 크기를 화면에 맞춤 */
                .black-hole-container { width: 90vw; height: 90vw; }
                .initial-title { font-size: 3rem; }
                .description { font-size: 1rem; padding: 0 20px; word-break: keep-all; }
                .start-button { width: 80%; padding: 18px 0; }
            }
        `}</style>
    </Router>
);

export default App;