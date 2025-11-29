import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import axios from 'axios';
import moment from 'moment'; // 🔑 moment 임포트

// 🔑 절대 경로 임포트
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
            // 🔑 날짜 수정: 'YYYY-MM-DD' 형식으로 전송하여 덮어쓰기 보장
            const todayDate = moment().format('YYYY-MM-DD');

            // 🚨 [핵심 수정] 헤더(Token)와 쿠키(Credentials) 동시 전송
            await axios.post(`/api/diary`, {
                content: diaryContent,
                emotion: selectedEmotion.emotionKey, 
                weather, 
                date: todayDate 
            }, {
                headers: { 
                    Authorization: `Bearer ${token}`, // 1. 헤더 인증 (Render 이슈 해결의 핵심)
                    'Content-Type': 'application/json'
                },
                withCredentials: true // 2. 쿠키 인증 (보조 수단)
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
                // 토큰 문제일 수 있으니 로그아웃 처리
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
                        className={`selection-btn ${weather === opt.key ? 'active' : ''}`}
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
                <button onClick={() => { setStep(1); setSelectedEmotion(null); setMessage(''); }} className="action-btn secondary">
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
                className="diary-textarea"
                rows={10}
                value={diaryContent}
                onChange={(e) => setDiaryContent(e.target.value)}
                placeholder="오늘의 감정, 생각, 사건을 자유롭게 기록하세요..."
                disabled={isLoading}
            />

            <div className="control-row">
                <button onClick={() => { setStep(2); setMessage(''); }} disabled={isLoading} className="action-btn secondary">
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
            
            <BackgroundCanvas weather={weather} step={step} />

            <div className="diary-overlay">
                <div className="diary-card">
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
                        <button onClick={handleGoToCalendar} disabled={isLoading} className="nav-btn">
                            🗓️ 기록된 우주 보기
                        </button>
                        <button onClick={handleLogout} disabled={isLoading} className="nav-btn logout">
                            로그아웃
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                /* --- 기본 PC 스타일 --- */
                .diary-page-wrapper {
                    position: relative;
                    width: 100%;
                    height: 100vh;
                    overflow: hidden;
                    font-family: sans-serif;
                    background-color: rgb(26, 26, 26);
                }

                .background-canvas {
                    position: absolute !important;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 1;
                }

                .diary-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    z-index: 10;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 20px;
                    overflow-y: auto;
                }

                .diary-card {
                    background-color: rgba(10, 10, 10, 0.85);
                    backdrop-filter: blur(8px);
                    padding: 40px;
                    border-radius: 20px;
                    box-shadow: 0 0 25px rgba(0, 255, 204, 0.15), 0 0 50px rgba(0, 0, 0, 0.7);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    width: 100%;
                    max-width: 850px;
                    color: white;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    max-height: 95vh;
                    overflow-y: auto;
                }

                .main-title {
                    font-size: 3rem;
                    text-shadow: 0 0 10px rgba(255, 204, 0, 0.7);
                    margin-bottom: 10px;
                    color: #ffcc00;
                }

                .step-title {
                    margin-bottom: 30px;
                    font-size: 2rem;
                    text-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
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
                    background-color: rgba(30, 30, 30, 0.9);
                    color: white;
                    border: 2px solid rgb(68, 68, 68);
                    border-radius: 15px;
                    width: 150px;
                    height: 140px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    gap: 10px;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
                }

                .selection-btn:hover, .selection-btn.active {
                    transform: scale(1.05);
                    border-color: rgb(0, 255, 204);
                    box-shadow: 0 0 15px rgba(0, 255, 204, 0.3);
                }

                .btn-icon { font-size: 3rem; }
                .btn-desc { font-size: 1.1rem; color: #bbb; }

                .status-tags {
                    display: flex;
                    justify-content: center;
                    gap: 10px;
                    flex-wrap: wrap;
                    margin-bottom: 15px;
                }

                .tag {
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-size: 1.2rem;
                }
                .weather-tag { background-color: rgba(51, 51, 51, 0.8); }

                .diary-textarea {
                    width: 100%;
                    padding: 20px;
                    font-size: 1.1rem;
                    margin-top: 10px;
                    margin-bottom: 20px;
                    border-radius: 10px;
                    border: 1px solid rgb(68, 68, 68);
                    background-color: rgba(51, 51, 51, 0.6);
                    color: white;
                    resize: vertical;
                    font-family: inherit;
                    min-height: 200px;
                }
                .diary-textarea:focus {
                    outline: none;
                    border-color: #00ffcc;
                    background-color: rgba(51, 51, 51, 0.9);
                }

                .control-row {
                    display: flex;
                    justify-content: center;
                    gap: 15px;
                    margin-top: 10px;
                }

                .action-btn {
                    padding: 12px 25px;
                    font-size: 1.1rem;
                    border: none;
                    border-radius: 8px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .action-btn:hover { transform: scale(1.05); }
                .action-btn.primary { background: linear-gradient(45deg, #3700cc, #5b2add); color: white; }
                .action-btn.secondary { background-color: rgb(85, 85, 85); color: white; }

                .message-box {
                    margin-top: 15px;
                    font-weight: bold;
                    padding: 10px;
                    border-radius: 5px;
                }
                .message-box.success { color: rgb(144, 238, 144); background: rgba(0, 255, 0, 0.1); }
                .message-box.error { color: rgb(255, 77, 77); background: rgba(255, 0, 0, 0.1); }

                .footer-nav {
                    margin-top: 30px;
                    display: flex;
                    justify-content: center;
                    gap: 15px;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    padding-top: 20px;
                }

                .nav-btn {
                    padding: 10px 20px;
                    font-size: 1rem;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: bold;
                    background-color: #00ffcc;
                    color: #1a1a1a;
                }
                .nav-btn.logout { background-color: #ffcc00; }

                .fade-in { animation: fadeIn 0.5s ease-in; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

                /* 📱 모바일 반응형 스타일 */
                @media (max-width: 768px) {
                    .diary-overlay {
                        align-items: flex-start; /* 위쪽 정렬 (키보드 가림 방지) */
                        padding: 10px;
                    }

                    .diary-card {
                        padding: 20px;
                        margin-top: 20px;
                        max-height: none; /* 스크롤 전체 허용 */
                        height: auto;
                        overflow: visible;
                    }

                    .main-title { font-size: 2rem; }
                    .step-title { font-size: 1.5rem; margin-bottom: 20px; }

                    /* 날씨 선택 버튼 그리드 */
                    .selection-grid {
                        gap: 10px;
                    }
                    .selection-btn {
                        width: 45%; /* 2열 배치 */
                        height: 120px;
                        padding: 15px;
                    }
                    .btn-icon { font-size: 2.5rem; }
                    .btn-desc { font-size: 1rem; }

                    /* 버튼 그룹 세로 배치 */
                    .control-row {
                        flex-direction: column;
                        width: 100%;
                    }
                    .action-btn { width: 100%; }

                    /* 하단 네비게이션 */
                    .footer-nav {
                        flex-direction: column;
                    }
                    .nav-btn { width: 100%; }
                }
            `}</style>
        </div>
    );
};

export default DiaryPage;