import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import * as Tone from 'tone'; // 🔑 Tone.js 임포트

// 페이지 컴포넌트 임포트
import AuthPage from './pages/AuthPage'; 
import DiaryPage from './pages/DiaryPage'; 
import CalendarPage from './pages/CalendarPage'; 

// 🚨 내부 컴포넌트: 라우팅 및 오디오 초기화 로직 담당
const AppContent: React.FC = () => {
    const [audioContextReady, setAudioContextReady] = useState(false);
    const navigate = useNavigate();

    // 🔑 사용자 상호작용(클릭)을 통해 오디오 컨텍스트를 활성화하는 함수
    const startAudioContext = async () => {
        try {
            if (Tone.context.state !== 'running') {
                // Tone.start()는 반드시 사용자의 클릭 이벤트 내에서 실행되어야 합니다.
                await Tone.start(); 
                console.log('Audio Context Started');
            }
        } catch (error) {
            console.error('Audio Context Start Failed:', error);
        }
        
        setAudioContextReady(true); // 오디오 준비 완료 상태로 변경

        // 🔑 초기 경로 설정: 로그인 여부에 따라 분기
        const token = localStorage.getItem('diaryToken');
        if (token) {
             navigate('/diary'); 
        } else {
             navigate('/auth');
        }
    };

    return (
        <>
            {/* 1. 오디오 컨텍스트가 활성화되지 않았을 때: 시작 화면 표시 */}
            {!audioContextReady && (
                <div style={initialScreenStyle}>
                    <h1 style={initialTitleStyle}>🌌 Infinite Diary</h1>
                    <p style={initialMessageStyle}>
                        원하는 음악을 틀면 감상도가 올라갑니다.<br/>
                        (날씨를 선택하면 배경이 바뀝니다)
                    </p>
                    <button onClick={startAudioContext} style={startButton}>
                        시작하기
                    </button>
                </div>
            )}
            
            {/* 2. 오디오 컨텍스트가 준비되면: 실제 앱 화면(라우터) 렌더링 */}
            {/* 주의: audioContextReady가 true일 때만 Routes가 보이지만, 
               React Router는 이미 마운트되어 있어야 하므로 
               style로 숨김 처리하는 대신 조건부 렌더링을 사용합니다.
            */}
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

// 🚨 최상위 컴포넌트: Router Provider 제공
const App: React.FC = () => (
    <Router>
        <AppContent />
    </Router>
);

// --- 스타일 정의 (CSS-in-JS) ---
const initialScreenStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgb(10, 10, 30)', // 깊은 우주색 배경
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    fontFamily: 'sans-serif',
    textAlign: 'center',
    padding: '20px',
};

const initialTitleStyle: React.CSSProperties = {
    fontSize: '3rem',
    color: '#ffcc00',
    textShadow: '0 0 15px rgba(255, 204, 0, 0.5)',
    marginBottom: '20px',
};

const initialMessageStyle: React.CSSProperties = {
    fontSize: '1.2rem',
    color: '#ccc',
    marginBottom: '40px',
    lineHeight: '1.6',
};

const startButton: React.CSSProperties = {
    padding: '15px 40px',
    fontSize: '1.3rem',
    backgroundColor: '#00ffcc',
    color: '#1a1a1a',
    border: 'none',
    borderRadius: '30px',
    cursor: 'pointer',
    fontWeight: 'bold',
    boxShadow: '0 0 20px rgba(0, 255, 204, 0.4)',
    transition: 'transform 0.2s, box-shadow 0.2s',
};

export default App;