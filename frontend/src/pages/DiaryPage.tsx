import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import axios from 'axios';
import moment from 'moment'; 

// 🔑 절대 경로 임포트 (환경에 맞게 유지)
import EmotionSelector from '@/components/EmotionSelector';
import { EmotionOption } from '@/constants/emotions.ts'; 

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
        setMessage(`✨ 오늘의 감정: ${emotionOpt.description}`);
        
        setTimeout(() => {
            setMessage('');
            setStep(3); 
        }, 1000);
    };

    const handleSubmitDiary = async () => {
        if (!diaryContent.trim() || !weather || !selectedEmotion) {
            setMessage('❌ 내용, 감정, 날씨를 모두 입력해야 합니다.');
            return;
        }

        setIsLoading(true);
        setMessage('일기를 우주에 기록하는 중...');
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

            setMessage(`✨ 일기가 우주에 성공적으로 기록되었습니다.`);
            setTimeout(() => {
                navigate('/calendar');
            }, 1500);

        } catch (error: any) {
            setIsLoading(false);
            console.error("Diary Save Error:", error);

            if (error.response?.status === 401) {
                setMessage('❌ 세션이 만료되었습니다. 다시 로그인해 주세요.');
                setTimeout(handleLogout, 2000);
                return;
            }
            setMessage(`❌ 저장 오류: ${error.response?.data?.message || '알 수 없는 오류'}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    // --- UI 렌더링 ---
    
    const renderWeatherSelection = () => (
        <div className="fade-in">
            <h2 className="step-title">오늘의 날씨는 어땠나요?</h2>
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
        <div className="fade-in">
            <h2 className="step-title">오늘 감정의 보석은?💎</h2>
            
            <EmotionSelector 
                onSelect={selectEmotion}
                currentEmotionKey={selectedEmotion?.emotionKey || ''} 
            />

            <div className="control-row">
                <button onClick={() => { setStep(1); setSelectedEmotion(null); setMessage(''); }} className="action-btn secondary glass-btn">
                    뒤로 (날씨 다시 선택)
                </button>
            </div>
        </div>
    );

    const renderDiaryWriting = () => (
        <div className="fade-in diary-write-container">
            <div className="status-tags">
                <span className="tag weather-tag">날씨: {weatherOptions.find(o => o.key === weather)?.description}</span>
                <span 
                    className="tag emotion-tag"
                    style={{
                        backgroundColor: selectedEmotion?.gemStyle.mainColor, 
                        color: '#1a1a1a', 
                        fontWeight: 'bold',
                        boxShadow: `0 0 10px ${selectedEmotion?.gemStyle.shadowColor}`
                    }}
                >
                    감정: {selectedEmotion?.description}
                </span>
            </div>
            
            <textarea
                className="diary-textarea glass-input"
                rows={10}
                value={diaryContent}
                onChange={(e) => setDiaryContent(e.target.value)}
                placeholder="오늘의 감정, 생각, 사건을 자유롭게 기록하세요..."
                disabled={isLoading}
            />

            <div className="control-row">
                <button onClick={() => { setStep(2); setMessage(''); }} disabled={isLoading} className="action-btn secondary glass-btn">
                    뒤로
                </button>
                <button onClick={handleSubmitDiary} disabled={isLoading || !diaryContent.trim()} className="action-btn primary">
                    {isLoading ? '저장 중...' : '📝 일기 기록하기'}
                </button>
            </div>
        </div>
    );

    return (
        <div className="diary-page-wrapper">
            
            {/* Background Canvas: Fixed at z-index 0 */}
            <div className="canvas-container">
                <BackgroundCanvas weather={weather} step={step} />
            </div>

            {/* Scrollable Overlay: z-index 10 */}
            <div className="diary-overlay">
                <div className="diary-card glass-card">
                    <h1 className="main-title">🌌 Infinite Diary</h1>
                    
                    <div className="step-content">
                        {step === 1 && renderWeatherSelection()}
                        {step === 2 && renderEmotionSelection()}
                        {step === 3 && renderDiaryWriting()}
                    </div>

                    {message && (
                        <p className={`message-box ${message.startsWith('❌') ? 'error' : 'success'}`}>
                            {message}
                        </p>
                    )}

                    <div className="footer-nav">
                        <button onClick={handleGoToCalendar} disabled={isLoading} className="nav-btn glass-btn">
                            🗓️ 기록된 우주 보기
                        </button>
                        <button onClick={handleLogout} disabled={isLoading} className="nav-btn logout glass-btn">
                            로그아웃
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                /* --- 레이아웃 & 기본 설정 --- */
                .diary-page-wrapper {
                    position: relative;
                    width: 100%;
                    height: 100vh;
                    overflow: hidden; /* 전체 페이지 스크롤 방지 */
                    font-family: 'Pretendard', sans-serif;
                    background-color: rgb(10, 10, 20);
                }

                /* 캔버스를 뒤에 고정 */
                .canvas-container {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 0;
                }

                .background-canvas {
                    width: 100% !important;
                    height: 100% !important;
                }

                /* 스크롤 가능한 오버레이 영역 */
                .diary-overlay {
                    position: relative;
                    z-index: 10;
                    width: 100%;
                    height: 100%;
                    overflow-y: auto; /* 내부 스크롤 허용 */
                    display: flex;
                    justify-content: center;
                    align-items: center; /* PC에서는 중앙 정렬 */
                    padding: 20px;
                    box-sizing: border-box;
                    -webkit-overflow-scrolling: touch; /* 모바일 부드러운 스크롤 */
                }

                /* --- Glassmorphism Card (핵심 디자인: PC 기본) --- */
                .glass-card {
                    background: rgba(15, 20, 35, 0.45); /* PC는 적당한 투명도 */
                    backdrop-filter: blur(12px); 
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.15); 
                    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
                    border-radius: 24px;
                    padding: 40px;
                    width: 100%;
                    max-width: 850px;
                    color: white;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    animation: floatUp 0.8s ease-out;
                }

                .main-title {
                    font-size: 3rem;
                    text-shadow: 0 0 15px rgba(255, 204, 0, 0.6), 0 0 30px rgba(0, 0, 0, 0.5);
                    margin-bottom: 10px;
                    color: #ffcc00;
                    letter-spacing: 2px;
                }

                .step-title {
                    margin-bottom: 30px;
                    font-size: 2rem;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.5);
                    font-weight: 600;
                }

                /* --- Buttons & Inputs (Glass Style) --- */
                .glass-btn {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(4px);
                    color: white;
                    transition: all 0.3s ease;
                }
                .glass-btn:hover:not(:disabled) {
                    background: rgba(255, 255, 255, 0.15);
                    border-color: rgba(255, 255, 255, 0.4);
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                }

                .selection-grid {
                    display: flex;
                    justify-content: center;
                    gap: 15px;
                    flex-wrap: wrap;
                }

                .selection-btn {
                    padding: 20px;
                    cursor: pointer;
                    border-radius: 20px;
                    width: 140px;
                    height: 140px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    gap: 10px;
                }

                .selection-btn.active {
                    background: rgba(0, 255, 204, 0.15);
                    border-color: #00ffcc;
                    box-shadow: 0 0 20px rgba(0, 255, 204, 0.4);
                }

                .btn-icon { font-size: 3.5rem; filter: drop-shadow(0 0 5px rgba(0,0,0,0.5)); }
                .btn-desc { font-size: 1.1rem; color: #ddd; font-weight: 500; }

                /* --- Tags & Textarea --- */
                .status-tags {
                    display: flex;
                    justify-content: center;
                    gap: 12px;
                    flex-wrap: wrap;
                    margin-bottom: 20px;
                }

                .tag {
                    padding: 8px 18px;
                    border-radius: 50px;
                    font-size: 1.1rem;
                    backdrop-filter: blur(5px);
                    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                }
                .weather-tag { background-color: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255,255,255,0.1); }

                .glass-input {
                    width: 100%;
                    padding: 25px;
                    font-size: 1.1rem;
                    border-radius: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    background: rgba(0, 0, 0, 0.2); 
                    color: white;
                    resize: vertical;
                    font-family: inherit;
                    min-height: 240px;
                    line-height: 1.6;
                    transition: border-color 0.3s;
                }
                .glass-input:focus {
                    outline: none;
                    border-color: #00BFFF;
                    background: rgba(0, 0, 0, 0.3);
                    box-shadow: 0 0 15px rgba(0, 191, 255, 0.2);
                }
                .glass-input::placeholder { color: rgba(255, 255, 255, 0.4); }

                /* --- Control Buttons --- */
                .control-row {
                    display: flex;
                    justify-content: center;
                    gap: 15px;
                    margin-top: 25px;
                }

                .action-btn {
                    padding: 14px 30px;
                    font-size: 1.1rem;
                    border: none;
                    border-radius: 12px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                }
                .action-btn.primary {
                    background: linear-gradient(135deg, #00BFFF 0%, #0066FF 100%);
                    color: white;
                }
                .action-btn.primary:hover {
                    box-shadow: 0 0 20px rgba(0, 191, 255, 0.6);
                    transform: scale(1.03);
                }

                /* --- Message & Footer --- */
                .message-box {
                    margin-top: 20px;
                    font-weight: bold;
                    padding: 15px;
                    border-radius: 12px;
                    backdrop-filter: blur(5px);
                }
                .message-box.success { color: #00ffcc; background: rgba(0, 255, 204, 0.1); border: 1px solid rgba(0,255,204,0.2); }
                .message-box.error { color: #ff6b6b; background: rgba(255, 107, 107, 0.1); border: 1px solid rgba(255,107,107,0.2); }

                .footer-nav {
                    margin-top: 40px;
                    display: flex;
                    justify-content: center;
                    gap: 15px;
                    padding-top: 20px;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                }
                .nav-btn {
                    padding: 10px 20px;
                    font-size: 1rem;
                    border-radius: 10px;
                    cursor: pointer;
                    font-weight: 600;
                }
                .nav-btn.logout { color: #ffcc00; border-color: rgba(255, 204, 0, 0.3); }
                .nav-btn.logout:hover { background: rgba(255, 204, 0, 0.15); }

                .fade-in { animation: fadeIn 0.6s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes floatUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

                /* 📱 Mobile Responsive (제목 잘림 해결 + 배경 투명도 최적화) */
                @media (max-width: 768px) {
                    .diary-page-wrapper {
                        height: 100vh; /* 모바일 브라우저 높이 이슈 대응 */
                        height: 100dvh; /* 최신 브라우저 대응 */
                    }

                    .diary-overlay {
                        /* 🚨 핵심 수정: 중앙 정렬(center)을 풉니다. */
                        align-items: flex-start; 
                        
                        /* 위쪽에 충분한 여백을 줘서 제목이 절대 안 잘리게 함 */
                        padding-top: 80px; 
                        padding-bottom: 50px;
                        padding-left: 15px;
                        padding-right: 15px;
                    }

                    .glass-card {
                        /* 배경 투명하게 유지 */
                        background: rgba(10, 15, 30, 0.35); 
                        backdrop-filter: blur(5px);
                        -webkit-backdrop-filter: blur(5px);
                        border: 1px solid rgba(255, 255, 255, 0.25);
                        
                        /* 마진 초기화 (위쪽 여백은 overlay padding으로 조절) */
                        margin-top: 0;
                        margin-bottom: 20px;
                        
                        width: 100%; 
                        border-radius: 24px;
                        padding: 25px 20px;
                    }

                    .main-title { 
                        font-size: 2rem; 
                        /* 제목 위쪽 여백을 조금 줄여서 공간 확보 */
                        margin-bottom: 15px; 
                        margin-top: -10px;
                        text-shadow: 0 0 10px rgba(0,0,0, 0.8);
                    }
                    
                    .step-title { 
                        font-size: 1.3rem; 
                        margin-bottom: 20px; 
                        text-shadow: 0 2px 5px rgba(0,0,0, 0.8);
                    }

                    /* 버튼들 */
                    .selection-btn {
                        width: 44%; 
                        height: 110px;
                        padding: 10px;
                        gap: 5px;
                        background: rgba(255, 255, 255, 0.08);
                    }
                    .btn-icon { font-size: 2.2rem; }
                    .btn-desc { font-size: 0.9rem; }

                    /* 입력창 */
                    .glass-input {
                        min-height: 180px; 
                        font-size: 1rem;
                        padding: 15px;
                        background: rgba(0, 0, 0, 0.2); 
                    }

                    .control-row {
                        flex-direction: column;
                        width: 100%;
                        gap: 12px;
                    }
                    .action-btn { width: 100%; padding: 15px; font-size: 1.1rem; }

                    .footer-nav {
                        flex-direction: column;
                        gap: 10px;
                        margin-top: 20px;
                    }
                    .nav-btn { width: 100%; padding: 12px; }
                }
            `}</style>
        </div>
    );
};

export default DiaryPage;