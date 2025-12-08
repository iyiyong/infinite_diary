import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import axios from 'axios';
import moment from 'moment'; 

// 🔑 절대 경로 임포트 (환경에 맞게 유지)
import EmotionSelector from '@/components/EmotionSelector';
import { EmotionOption } from '@/constants/emotions'; 

// 3D 컴포넌트 임포트
import StarsBackground from '@/components/StarsBackground';
import SunnySky from '@/components/weather/SunnySky';
import CloudySky from '@/components/weather/CloudySky';
import RainySky from '@/components/weather/RainySky';
import SnowySky from '@/components/weather/SnowySky';

// --- 날씨 옵션 ---
const weatherOptions = [
    { key: 'sunny', label: '☀️', description: '맑음' },
    { key: 'cloudy', label: '☁️', description: '흐림' },
    { key: 'rain', label: '🌧️', description: '비' },
    { key: 'snow', label: '❄️', description: '눈' },
];

// 🔑 Canvas 최적화 (메모이제이션)
const BackgroundCanvas = React.memo(({ weather, step }: { weather: string, step: number }) => {
    const renderContent = () => {
        if (step !== 3) {
            return <StarsBackground />; 
        }
        switch (weather) {
            case 'sunny': return <SunnySky />;
            case 'cloudy': return <CloudySky />;
            case 'rain': return <RainySky />;
            case 'snow': return <SnowySky />;
            default: return <StarsBackground />;
        }
    };

    return (
        <Canvas camera={{ position: [0, 0, 1] }} className="background-canvas">
            {renderContent()}
            <ambientLight intensity={0.5} />
        </Canvas>
    );
}, (prevProps, nextProps) => {
    return prevProps.weather === nextProps.weather && prevProps.step === nextProps.step;
});

const DiaryPage: React.FC = () => {
    const navigate = useNavigate();
    
    // --- 상태 관리 ---
    const [step, setStep] = useState(1); 
    const [weather, setWeather] = useState('');
    const [selectedEmotion, setSelectedEmotion] = useState<EmotionOption | null>(null); 
    const [diaryContent, setDiaryContent] = useState('');
    
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    
    // 로그인 확인
    useEffect(() => {
        const token = localStorage.getItem('diaryToken');
        if (!token) {
            navigate('/auth'); 
        }
    }, [navigate]);

    // --- 핸들러 함수 ---
    const handleLogout = () => {
        localStorage.removeItem('diaryToken');
        localStorage.removeItem('username');
        navigate('/auth');
    };

    const handleGoToCalendar = () => {
        navigate('/calendar');
    };

    const selectWeather = (weatherKey: string) => {
        setWeather(weatherKey);
        setStep(2); 
    };
    
    const selectEmotion = (emotionOpt: EmotionOption) => {
        setSelectedEmotion(emotionOpt);
        setMessage(`선택된 감정: ${emotionOpt.description}`);
        
        setTimeout(() => {
            setMessage('');
            setStep(3); 
        }, 800);
    };

    const handleSubmitDiary = async () => {
        if (!diaryContent.trim() || !weather || !selectedEmotion) {
            setMessage('내용, 감정, 날씨를 모두 입력해주세요.');
            return;
        }

        setIsLoading(true);
        setMessage('우주에 기록을 전송하는 중...');
        const token = localStorage.getItem('diaryToken');

        try {
            const todayDate = moment().format('YYYY-MM-DD');

            await axios.post(`/api/diary`, {
                content: diaryContent,
                emotion: selectedEmotion.emotionKey, 
                weather, 
                date: todayDate 
            }, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });

            setMessage(`기록이 완료되었습니다.`);
            setTimeout(() => {
                navigate('/calendar');
            }, 1500);

        } catch (error: any) {
            setIsLoading(false);
            console.error("Diary Save Error:", error);

            if (error.response?.status === 401) {
                setMessage('세션이 만료되었습니다. 다시 로그인해 주세요.');
                setTimeout(handleLogout, 2000);
                return;
            }
            setMessage(`저장 실패: ${error.response?.data?.message || '알 수 없는 오류'}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    // --- UI 렌더링 ---
    
    const renderWeatherSelection = () => (
        <div className="fade-in">
            <h2 className="step-title">오늘의 날씨</h2>
            <div className="selection-grid">
                {weatherOptions.map(opt => (
                    <button 
                        key={opt.key} 
                        onClick={() => selectWeather(opt.key)} 
                        className={`selection-btn glass-btn ${weather === opt.key ? 'active' : ''}`}
                    >
                        <span className="btn-icon">{opt.label}</span>
                        <span className="btn-desc">{opt.description}</span>
                    </button>
                ))}
            </div>
        </div>
    );

    const renderEmotionSelection = () => (
        <div className="fade-in emotion-step-container">
            <h2 className="step-title">오늘의 감정 보석</h2>
            
            <div className="emotion-scroll-wrapper">
                <EmotionSelector 
                    onSelect={selectEmotion}
                    currentEmotionKey={selectedEmotion?.emotionKey || ''} 
                />
            </div>

            <div className="control-row">
                <button onClick={() => { setStep(1); setSelectedEmotion(null); setMessage(''); }} className="action-btn secondary glass-btn">
                    이전으로
                </button>
            </div>
        </div>
    );

    const renderDiaryWriting = () => (
        <div className="fade-in diary-write-container">
            <div className="status-tags">
                <span className="tag weather-tag">{weatherOptions.find(o => o.key === weather)?.description}</span>
                <span 
                    className="tag emotion-tag"
                    style={{
                        backgroundColor: selectedEmotion?.gemStyle.mainColor, 
                        color: '#fff', 
                        fontWeight: '700',
                        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                        boxShadow: `0 4px 15px ${selectedEmotion?.gemStyle.mainColor}55`,
                        border: `1px solid ${selectedEmotion?.gemStyle.borderColor}`
                    }}
                >
                    {selectedEmotion?.description}
                </span>
            </div>
            
            <textarea
                className="diary-textarea glass-input"
                rows={10}
                value={diaryContent}
                onChange={(e) => setDiaryContent(e.target.value)}
                placeholder="오늘 하루는 어땠나요? 당신의 우주에 이야기를 남겨보세요."
                disabled={isLoading}
            />

            <div className="control-row">
                <button onClick={() => { setStep(2); setMessage(''); }} disabled={isLoading} className="action-btn secondary glass-btn">
                    이전
                </button>
                <button onClick={handleSubmitDiary} disabled={isLoading || !diaryContent.trim()} className="action-btn primary">
                    {isLoading ? '저장 중...' : '기록하기'}
                </button>
            </div>
        </div>
    );

    return (
        <div className="diary-page-wrapper">
            
            {/* Background Canvas */}
            <div className="canvas-container">
                <BackgroundCanvas weather={weather} step={step} />
            </div>

            {/* Scrollable Overlay */}
            <div className="diary-overlay">
                <div className="diary-card glass-card">
                    {/* ✅ 타이틀이 위쪽 여백 덕분에 잘리지 않고 보입니다 */}
                    <h1 className="main-title">Infinite Diary</h1>
                    
                    <div className="step-content">
                        {step === 1 && renderWeatherSelection()}
                        {step === 2 && renderEmotionSelection()}
                        {step === 3 && renderDiaryWriting()}
                    </div>

                    {message && (
                        <p className={`message-box ${message.includes('실패') || message.includes('입력') ? 'error' : 'success'}`}>
                            {message}
                        </p>
                    )}

                    <div className="footer-nav">
                        {/* ✅ 버튼 이름 변경: 기록된 별들 */}
                        <button onClick={handleGoToCalendar} disabled={isLoading} className="nav-btn glass-btn">
                            기록된 별들
                        </button>
                        <button onClick={handleLogout} disabled={isLoading} className="nav-btn logout glass-btn">
                            로그아웃
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                /* --- 전역 설정 및 폰트 --- */
                @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

                .diary-page-wrapper {
                    position: relative;
                    width: 100%;
                    height: 100vh;
                    height: 100dvh;
                    overflow: hidden;
                    font-family: 'Pretendard', sans-serif;
                    background-color: #000000;
                }

                /* 캔버스 배경 */
                .canvas-container {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 0;
                    pointer-events: none;
                }

                .background-canvas {
                    width: 100% !important;
                    height: 100% !important;
                }

                /* 메인 오버레이 (수정됨) */
                .diary-overlay {
                    position: relative;
                    z-index: 10;
                    width: 100%;
                    height: 100%;
                    overflow-y: auto;
                    display: flex;
                    justify-content: center;
                    
                    /* 🔥 핵심 수정: center 대신 flex-start를 써서 위쪽이 잘리지 않게 함 */
                    align-items: flex-start;
                    
                    /* 🔥 핵심 수정: 위쪽 여백을 줘서 타이틀이 천장에 붙지 않게 함 */
                    padding-top: 80px; 
                    padding-bottom: 50px;
                    padding-left: 20px;
                    padding-right: 20px;
                    
                    box-sizing: border-box;
                    -webkit-overflow-scrolling: touch;
                }

                /* --- Glass Card 디자인 --- */
                .glass-card {
                    background: rgba(15, 15, 25, 0.7);
                    backdrop-filter: blur(25px);
                    -webkit-backdrop-filter: blur(25px);
                    border: 1px solid rgba(255, 255, 255, 0.18);
                    
                    box-shadow: 
                        0 15px 40px rgba(0, 0, 0, 0.6),
                        inset 0 0 20px rgba(255, 255, 255, 0.05);
                        
                    border-radius: 45px;
                    padding: 45px;
                    width: 100%;
                    max-width: 620px;
                    color: #ffffff;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    gap: 25px;
                    /* margin-top은 padding-top이 있으므로 제거해도 됨 */
                }

                .main-title {
                    font-size: 2rem;
                    font-weight: 800;
                    color: #ffffff;
                    letter-spacing: 1.5px;
                    margin-bottom: 10px;
                    text-shadow: 0 2px 10px rgba(0,0,0,0.5);
                }

                .step-title {
                    margin-bottom: 30px;
                    font-size: 1.45rem;
                    color: rgba(255, 255, 255, 0.95);
                    font-weight: 700;
                }
                
                .step-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }

                /* --- Buttons & Interactions --- */
                .glass-btn {
                    background: rgba(255, 255, 255, 0.08);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    backdrop-filter: blur(15px);
                    color: #ffffff;
                    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); 
                    border-radius: 30px;
                    font-weight: 600;
                }

                .glass-btn:hover:not(:disabled) {
                    background: rgba(255, 255, 255, 0.2);
                    border-color: rgba(255, 255, 255, 0.4);
                    transform: translateY(-3px) scale(1.02);
                    box-shadow: 0 10px 25px rgba(255, 255, 255, 0.15);
                }

                .glass-btn:active:not(:disabled) {
                    transform: scale(0.97);
                    background: rgba(255, 255, 255, 0.12);
                }

                .selection-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 15px;
                    margin-bottom: 15px;
                }

                .selection-btn {
                    padding: 25px;
                    height: 130px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    gap: 12px;
                    cursor: pointer;
                }

                .selection-btn.active {
                    background: rgba(255, 215, 0, 0.15);
                    border-color: rgba(255, 215, 0, 0.6);
                    box-shadow: 0 0 35px rgba(255, 215, 0, 0.25);
                    color: #FFD700;
                }

                .btn-icon { font-size: 3rem; }
                .btn-desc { font-size: 1.1rem; font-weight: 600; }

                .emotion-step-container {
                    display: flex;
                    flex-direction: column;
                    width: 100%;
                }
                
                .emotion-scroll-wrapper {
                    width: 100%;
                    padding: 5px;
                }

                .status-tags {
                    display: flex;
                    justify-content: center;
                    gap: 12px;
                    margin-bottom: 25px;
                }

                .tag {
                    padding: 10px 22px;
                    border-radius: 50px;
                    font-size: 0.95rem;
                    backdrop-filter: blur(10px);
                }
                .weather-tag { 
                    background-color: rgba(255, 255, 255, 0.1); 
                    border: 1px solid rgba(255, 255, 255, 0.25);
                }

                .glass-input {
                    width: 100%;
                    padding: 25px;
                    font-size: 1.1rem;
                    border-radius: 35px;
                    border: 1px solid rgba(255, 255, 255, 0.18);
                    background: rgba(0, 0, 0, 0.45); 
                    color: white;
                    resize: none;
                    font-family: inherit;
                    min-height: 220px;
                    line-height: 1.7;
                    transition: all 0.3s;
                }
                .glass-input:focus {
                    outline: none;
                    border-color: rgba(255, 215, 0, 0.5);
                    background: rgba(0, 0, 0, 0.6);
                    box-shadow: 0 0 25px rgba(255, 215, 0, 0.1);
                }
                .glass-input::placeholder { color: rgba(255, 255, 255, 0.35); }

                .control-row {
                    display: flex;
                    gap: 15px;
                    margin-top: 35px;
                }

                .action-btn {
                    flex: 1;
                    padding: 18px;
                    font-size: 1.1rem;
                    border: none;
                    border-radius: 30px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                .action-btn.primary {
                    background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%);
                    color: #000000;
                    box-shadow: 0 10px 30px rgba(255, 255, 255, 0.2);
                    border: 1px solid #ffffff;
                }
                .action-btn.primary:hover:not(:disabled) {
                    transform: translateY(-4px) scale(1.03);
                    box-shadow: 0 15px 40px rgba(255, 255, 255, 0.3);
                }
                .action-btn.secondary {
                    /* glass-btn 스타일 상속 */
                }

                .message-box {
                    margin-top: 20px;
                    font-size: 0.95rem;
                    padding: 15px;
                    border-radius: 20px;
                    background: rgba(0,0,0,0.4);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255,255,255,0.1);
                }
                .message-box.success { color: #4ade80; }
                .message-box.error { color: #f87171; }

                .footer-nav {
                    margin-top: 40px;
                    display: flex;
                    justify-content: center;
                    gap: 12px;
                    padding-top: 25px;
                    border-top: 1px solid rgba(255, 255, 255, 0.15);
                }
                .nav-btn {
                    padding: 12px 25px;
                    font-size: 0.95rem;
                    border-radius: 25px;
                    cursor: pointer;
                    background: transparent;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    color: white; /* 텍스트 색상 명시 */
                }
                .nav-btn:hover {
                     background: rgba(255, 255, 255, 0.1);
                }
                .nav-btn.logout { 
                    color: #ff8a8a; 
                    border-color: rgba(255, 100, 100, 0.3);
                }
                .nav-btn.logout:hover {
                    background: rgba(255, 100, 100, 0.1);
                }

                .fade-in { animation: fadeIn 0.5s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

                /* 📱 Mobile Optimization */
                @media (max-width: 768px) {
                    .diary-overlay {
                        align-items: flex-start;
                        padding-top: 80px; 
                        padding-bottom: 50px;
                        padding-left: 20px;
                        padding-right: 20px;
                    }

                    .glass-card {
                        padding: 35px 25px;
                        border-radius: 40px;
                        background: rgba(15, 15, 25, 0.8);
                        height: auto; 
                    }

                    .main-title { font-size: 1.7rem; }
                    .step-title { font-size: 1.3rem; }
                    
                    .emotion-step-container {
                        max-height: none;
                    }

                    .selection-grid { gap: 12px; }
                    .selection-btn { height: 115px; padding: 15px; }
                    .btn-icon { font-size: 2.5rem; }

                    .glass-input {
                        min-height: 200px;
                        font-size: 1rem;
                        padding: 20px;
                    }

                    .control-row { flex-direction: column; gap: 12px; }
                    .action-btn { width: 100%; padding: 20px; }
                    
                    .footer-nav { flex-direction: row; }
                    .nav-btn { flex: 1; padding: 15px; }
                }
            `}</style>
        </div>
    );
};

export default DiaryPage;