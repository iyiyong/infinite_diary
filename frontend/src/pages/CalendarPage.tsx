/// <reference types="vite/client" />
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // 기본 스타일 불러오기 (아래 style 태그에서 오버라이딩)
import axios from 'axios';
import moment from 'moment';

import StarsBackground from '../components/StarsBackground';
import { emotionOptions } from '../constants/emotions';

const RAW_API_URL = import.meta.env.VITE_API_URL || '';
const API_URL = RAW_API_URL.replace(/\/$/, '');

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface DiaryEntry {
    _id: string;
    date: string;
    emotion: string;
    weather: string;
    content: string;
    updatedAt: string;
}

const weatherIcons: { [key: string]: string } = {
    sunny: '☀️', cloudy: '☁️', rain: '🌧️', snow: '❄️'
};

const CalendarPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [calendarDate, setCalendarDate] = useState<Value>(new Date());
    const [viewDate, setViewDate] = useState(new Date());
    const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
    const [error, setError] = useState<string | null>(null);

    const abortControllerRef = useRef<AbortController | null>(null);

    const handleLogout = () => {
        localStorage.removeItem('diaryToken');
        localStorage.removeItem('username');
        navigate('/');
    };

    const fetchMonthlyDiary = useCallback(async (date: Date) => {
        const token = localStorage.getItem('diaryToken');
        
        if (!token || token === 'undefined' || token === 'null' || String(token).includes('undefined')) {
            console.warn(`⛔ 불량 토큰 감지됨 (값: ${token}). 자동 삭제 및 로그아웃 실행.`);
            localStorage.removeItem('diaryToken');
            navigate('/'); 
            return;
        }

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        const newController = new AbortController();
        abortControllerRef.current = newController;

        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.get(
                `${API_URL}/api/diary/month/${date.getFullYear()}/${date.getMonth() + 1}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    signal: newController.signal,
                    timeout: 60000, 
                    withCredentials: false 
                }
            );

            const fetched = response.data.map((e: any) => ({
                ...e,
                date: moment(e.date).format('YYYY-MM-DD')
            }));

            setDiaryEntries(fetched);
            setIsLoading(false);

            setCalendarDate(currentDate => {
                if (currentDate instanceof Date) {
                    const dateString = moment(currentDate).format('YYYY-MM-DD');
                    const entry = fetched.find((e: DiaryEntry) => e.date === dateString);
                    setSelectedEntry(entry || null);
                }
                return currentDate;
            });

        } catch (err: any) {
            if (!axios.isCancel(err)) {
                setIsLoading(false);
                console.error("Diary fetch error:", err);

                if (err.response) {
                    if (err.response.status === 401) {
                        setError('세션이 만료되었습니다. 다시 로그인해주세요.');
                        localStorage.removeItem('diaryToken');
                        setTimeout(() => navigate('/'), 2000);
                    } else {
                        setError(`서버 오류: ${err.response.data?.message || '데이터를 불러올 수 없습니다.'}`);
                    }
                } else if (err.code === 'ECONNABORTED') {
                    setError('서버 응답 시간이 초과되었습니다.');
                } else {
                    setError(`연결 오류: ${err.message}`);
                }
            }
        }
    }, [navigate]);

    useEffect(() => {
        const token = localStorage.getItem('diaryToken');
        if (!token || token === 'undefined' || token === 'null' || String(token).includes('undefined')) {
            localStorage.removeItem('diaryToken');
            navigate('/');
            return;
        }
        fetchMonthlyDiary(viewDate);

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [viewDate, location.key, fetchMonthlyDiary, navigate]);

    const handleDateClick = (value: Value) => {
        setCalendarDate(value);
        if (value instanceof Date) {
            const dateString = moment(value).format('YYYY-MM-DD');
            const entry = diaryEntries.find(e => e.date === dateString);
            setSelectedEntry(entry || null);
            
            // 모바일에서 날짜 클릭 시 상세 내용으로 부드럽게 스크롤
            if (window.innerWidth <= 768) {
                setTimeout(() => {
                    document.getElementById('detail-section')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 100);
            }
        } else {
            setSelectedEntry(null);
        }
    };

    const tileContent = ({ date, view }: { date: Date, view: string }) => {
        if (view !== 'month') return null;
        const dateString = moment(date).format('YYYY-MM-DD');
        const entry = diaryEntries.find(e => e.date === dateString);
        if (entry) {
            const emotion = emotionOptions.find(opt => opt.emotionKey === entry.emotion);
            return (
                <div className="tile-content">
                    {emotion && (
                        <div
                            className="emotion-dot"
                            style={{
                                backgroundColor: emotion.gemStyle.mainColor,
                                boxShadow: `0 0 8px ${emotion.gemStyle.shadowColor}`
                            }}
                        />
                    )}
                    <span className="weather-icon">{weatherIcons[entry.weather] || ''}</span>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="calendar-page-wrapper">
            {/* Background Canvas (Fixed) */}
            <div className="background-canvas">
                <Canvas camera={{ position: [0, 0, 1] }}>
                    <StarsBackground />
                    <ambientLight intensity={0.5} />
                </Canvas>
            </div>

            <div className="calendar-content-container">
                <div className="calendar-card glass-card">
                    <div className="header-row">
                        <h1 className="page-title">🗓️ 기록된 우주</h1>
                        <button onClick={() => navigate('/diary')} className="icon-btn" title="일기 쓰기">
                            <span role="img" aria-label="write">✏️</span>
                        </button>
                    </div>

                    <div className="status-bar">
                        {isLoading ? <span className="loading">별들을 불러오는 중... ✨</span> : (error && <span className="error">{error}</span>)}
                    </div>

                    <div className="calendar-wrapper">
                        <Calendar
                            onChange={handleDateClick as any}
                            value={calendarDate}
                            locale='ko'
                            calendarType='gregory'
                            onActiveStartDateChange={({ activeStartDate, view }) => {
                                if (view === 'month' && activeStartDate) {
                                    setViewDate(activeStartDate);
                                }
                            }}
                            tileContent={tileContent}
                            className="infinite-calendar"
                            formatDay={(_, date) => moment(date).format("D")}
                            next2Label={null}
                            prev2Label={null}
                        />
                    </div>

                    <div id="detail-section" className="detail-section">
                        <h3 className="detail-date">
                            {calendarDate instanceof Date
                                ? moment(calendarDate).format('YYYY년 M월 D일')
                                : '날짜를 선택하세요'}
                        </h3>

                        {selectedEntry ? (
                            <div className="entry-card fade-in glass-inner-card">
                                <div className="entry-header">
                                    <div className="meta-group">
                                        <span className="meta-badge weather glass-badge">{weatherIcons[selectedEntry.weather]}</span>
                                        <span className="meta-badge emotion glass-badge" style={{
                                            color: emotionOptions.find(e => e.emotionKey === selectedEntry.emotion)?.gemStyle.mainColor,
                                            textShadow: `0 0 5px ${emotionOptions.find(e => e.emotionKey === selectedEntry.emotion)?.gemStyle.shadowColor}`
                                        }}>
                                            {emotionOptions.find(e => e.emotionKey === selectedEntry.emotion)?.description}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-scroll-area">
                                    <p className="text">{selectedEntry.content}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="empty-state fade-in">
                                <p>이 날의 기록이 없습니다.</p>
                                <button onClick={() => navigate('/diary')} className="link-btn">오늘 기록 남기기 &rarr;</button>
                            </div>
                        )}

                        <div className="nav-buttons">
                            <button onClick={handleLogout} className="logout-btn glass-btn">로그아웃</button>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                /* --- Layout & Base --- */
                .calendar-page-wrapper {
                    position: relative;
                    width: 100%;
                    height: 100vh;
                    background: rgb(10, 10, 20);
                    overflow-y: auto; /* 전체 스크롤 */
                    -webkit-overflow-scrolling: touch;
                    font-family: 'Pretendard', sans-serif;
                }

                .background-canvas {
                    position: fixed !important;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 0;
                    pointer-events: none;
                }

                .calendar-content-container {
                    position: relative;
                    z-index: 10;
                    padding: 30px 20px;
                    display: flex;
                    justify-content: center;
                    min-height: 100%;
                    box-sizing: border-box;
                }

                /* --- Glassmorphism Card Style --- */
                .glass-card {
                    background: rgba(15, 20, 35, 0.55);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border-radius: 24px;
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
                    width: 100%;
                    max-width: 600px; /* PC에서는 너무 넓지 않게 */
                    padding: 30px;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    color: white;
                    animation: floatUp 0.8s ease-out;
                }

                .header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
                .page-title {
                    font-size: 1.8rem;
                    color: #fff;
                    margin: 0;
                    font-weight: 800;
                    text-shadow: 0 0 15px rgba(255,255,255,0.4);
                }

                /* --- Buttons --- */
                .icon-btn {
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 50%;
                    width: 48px;
                    height: 48px;
                    cursor: pointer;
                    font-size: 1.4rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    backdrop-filter: blur(4px);
                    transition: all 0.3s ease;
                }
                .icon-btn:hover { background: rgba(255, 255, 255, 0.2); transform: scale(1.1); }
                .icon-btn:active { transform: scale(0.95); }

                .status-bar { height: 24px; text-align: center; font-size: 0.95rem; font-weight: 500; }
                .error { color: #ff6b6b; font-weight: bold; text-shadow: 0 0 5px rgba(255, 107, 107, 0.3); }
                .loading { color: #00ffcc; animation: pulse 1.5s infinite; }

                /* --- Calendar Customization (React-Calendar Override) --- */
                .calendar-wrapper {
                    background: rgba(0, 0, 0, 0.2);
                    border-radius: 20px;
                    padding: 15px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }

                .infinite-calendar {
                    width: 100%;
                    background: transparent !important;
                    border: none !important;
                    color: #fff !important;
                    font-family: inherit;
                }

                /* Header (Month/Year) */
                .react-calendar__navigation { margin-bottom: 1rem; }
                .react-calendar__navigation button {
                    color: #00e0ff !important;
                    font-size: 1.2rem;
                    font-weight: 800;
                    background: none !important;
                    text-shadow: 0 0 10px rgba(0, 224, 255, 0.4);
                }
                .react-calendar__navigation button:disabled { opacity: 0.5; }
                .react-calendar__navigation button:enabled:hover,
                .react-calendar__navigation button:enabled:focus {
                    background-color: rgba(255, 255, 255, 0.1) !important;
                    border-radius: 10px;
                }

                /* Weekdays */
                .react-calendar__month-view__weekdays {
                    font-size: 0.9rem;
                    color: rgba(255, 255, 255, 0.6);
                    text-transform: uppercase;
                    margin-bottom: 10px;
                    font-weight: 600;
                    abbr { text-decoration: none; }
                }

                /* Days (Tiles) */
                .react-calendar__tile {
                    height: 75px; /* PC Default */
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: flex-start;
                    padding-top: 8px;
                    font-size: 1.1rem;
                    position: relative;
                    border-radius: 16px;
                    transition: all 0.2s;
                    color: #eee;
                    overflow: visible !important;
                }
                .react-calendar__tile:enabled:hover {
                    background: rgba(255,255,255,0.15) !important;
                    transform: translateY(-2px);
                }

                /* Today */
                .react-calendar__tile--now {
                    background: rgba(0, 191, 255, 0.15) !important;
                    border: 1px solid rgba(0, 191, 255, 0.5);
                    box-shadow: 0 0 10px rgba(0, 191, 255, 0.2);
                }

                /* Selected */
                .react-calendar__tile--active {
                    background: linear-gradient(135deg, #00ffcc 0%, #0099cc 100%) !important;
                    color: #000 !important;
                    font-weight: bold;
                    box-shadow: 0 0 15px rgba(0, 255, 204, 0.5);
                    transform: scale(1.02);
                }
                
                /* Emotion Dots inside Tile */
                .tile-content {
                    margin-top: 6px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                }
                .emotion-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    border: 1px solid rgba(0,0,0,0.3);
                }
                .weather-icon { font-size: 0.9rem; filter: drop-shadow(0 0 2px rgba(0,0,0,0.5)); }

                /* --- Detail Section --- */
                .detail-section {
                    margin-top: 20px;
                    padding-top: 25px;
                    border-top: 1px solid rgba(255, 255, 255, 0.15);
                    animation: slideUp 0.5s ease-out;
                }

                .detail-date {
                    color: #ffcc00;
                    margin-bottom: 20px;
                    font-size: 1.4rem;
                    text-align: center;
                    font-weight: 700;
                    text-shadow: 0 0 10px rgba(255, 204, 0, 0.4);
                }

                .glass-inner-card {
                    background: rgba(0, 0, 0, 0.25);
                    padding: 25px;
                    border-radius: 18px;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    margin-bottom: 25px;
                }

                .entry-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                    padding-bottom: 12px;
                }

                .meta-group { display: flex; gap: 12px; align-items: center; width: 100%; }

                .glass-badge {
                    padding: 6px 14px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 30px;
                    font-size: 0.95rem;
                    font-weight: bold;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(4px);
                }

                .text-scroll-area {
                    max-height: 250px;
                    overflow-y: auto;
                    padding-right: 8px;
                }
                .text {
                    color: #e0e0e0;
                    line-height: 1.7;
                    white-space: pre-wrap;
                    font-size: 1.05rem;
                    letter-spacing: 0.3px;
                }

                .empty-state {
                    text-align: center;
                    color: #aaa;
                    padding: 40px 0;
                    font-style: italic;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 15px;
                }
                .link-btn {
                    background: none;
                    border: none;
                    color: #00e0ff;
                    cursor: pointer;
                    font-size: 1rem;
                    text-decoration: underline;
                    font-weight: bold;
                    text-shadow: 0 0 8px rgba(0, 224, 255, 0.3);
                }

                /* --- Footer Buttons --- */
                .nav-buttons { display: flex; justify-content: center; margin-top: 10px; }
                .logout-btn {
                    background: transparent;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    color: rgba(255, 255, 255, 0.7);
                    padding: 10px 24px;
                    border-radius: 12px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    transition: all 0.3s;
                }
                .logout-btn:hover {
                    border-color: #ff6b6b;
                    color: #ff6b6b;
                    background: rgba(255, 107, 107, 0.1);
                }

                @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
                @keyframes floatUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

                /* 📱 Mobile Responsive Tweaks */
                @media (max-width: 600px) {
                    .calendar-content-container {
                        padding: 15px; /* 패딩 축소 */
                        padding-bottom: 50px; /* 하단 여유 공간 */
                    }
                    
                    .glass-card {
                        padding: 20px 15px;
                        border-radius: 20px;
                        background: rgba(15, 20, 35, 0.65); /* 모바일 가독성 위해 약간 진하게 */
                    }

                    .page-title { font-size: 1.5rem; }
                    .icon-btn { width: 40px; height: 40px; font-size: 1.2rem; }

                    /* 달력 타일 크기 조정 */
                    .react-calendar__tile {
                        height: 65px;
                        font-size: 1rem;
                        padding-top: 6px;
                    }
                    
                    .weather-icon { font-size: 0.8rem; }
                    .emotion-dot { width: 6px; height: 6px; }

                    /* 상세 영역 */
                    .detail-section { margin-top: 15px; padding-top: 20px; }
                    .detail-date { font-size: 1.2rem; margin-bottom: 15px; }
                    
                    .glass-inner-card { padding: 20px; }
                    .meta-group { gap: 8px; }
                    .glass-badge { padding: 5px 10px; font-size: 0.85rem; }
                    .text { font-size: 1rem; }
                }
            `}</style>
        </div>
    );
};

export default CalendarPage;