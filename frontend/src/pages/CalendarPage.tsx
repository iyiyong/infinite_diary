/// <reference types="vite/client" />
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';
import moment from 'moment';

import StarsBackground from '../components/StarsBackground';
import { emotionOptions } from '../constants/emotions';

// 🔑 API URL 안전하게 가져오기
const RAW_API_URL = import.meta.env.VITE_API_URL || '';
const API_URL = RAW_API_URL.replace(/\/$/, '');

// react-calendar v4+ 호환을 위한 타입 정의
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
    const location = useLocation(); // 페이지 이동 감지용

    const [calendarDate, setCalendarDate] = useState<Value>(new Date());
    const [viewDate, setViewDate] = useState(new Date());
    const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
    const [error, setError] = useState<string | null>(null);

    // 🔑 오류 해결: 초기값을 null로 명시하여 타입 일치
    const abortControllerRef = useRef<AbortController | null>(null);

    const handleLogout = () => {
        localStorage.removeItem('diaryToken');
        localStorage.removeItem('username');
        navigate('/');
    };

    // 🔑 데이터 조회 함수 (안정성 강화)
    const fetchMonthlyDiary = useCallback(async (date: Date) => {
        const token = localStorage.getItem('diaryToken');
        
        // 🔍 디버깅: 토큰이 제대로 있는지 콘솔에 출력
        // console.log("Current Token in LocalStorage:", token);

        if (!token) {
            console.warn("No token found, redirecting to login.");
            return;
        }

        // 이전 요청 취소 (빠른 월 이동 시 중복 요청 방지)
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
                    headers: { Authorization: `Bearer ${token}` }, // 🔑 헤더 인증 (이게 핵심!)
                    signal: newController.signal,
                    timeout: 60000, 
                    withCredentials: false // 🚨 [수정됨] false로 변경하여 좀비 쿠키 전송 차단!
                }
            );

            // 🔑 날짜 포맷 통일 (YYYY-MM-DD)
            const fetched = response.data.map((e: any) => ({
                ...e,
                date: moment(e.date).format('YYYY-MM-DD')
            }));

            setDiaryEntries(fetched);
            setIsLoading(false);

            // 🔑 데이터 로드 후, 현재 선택된 날짜의 일기가 있다면 바로 보여주기
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
                        // 401 발생 시 토큰 삭제 후 로그인 페이지로 이동
                        localStorage.removeItem('diaryToken');
                        setTimeout(() => navigate('/'), 2000);
                    } else {
                        setError(`서버 오류: ${err.response.data?.message || '데이터를 불러올 수 없습니다.'}`);
                    }
                } else if (err.code === 'ECONNABORTED') {
                    setError('서버 응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.');
                } else if (err.request) {
                    setError('서버와 연결할 수 없습니다. (서버가 잠들어 있을 수 있습니다 💤)');
                } else {
                    setError(`요청 오류: ${err.message}`);
                }
            }
        }
    }, [navigate]);

    // 🔑 데이터 갱신 트리거 (페이지 진입 시 무조건 실행)
    useEffect(() => {
        const token = localStorage.getItem('diaryToken');
        if (!token) {
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

    // 🔑 달력 날짜 클릭 핸들러
    const handleDateClick = (value: Value) => {
        setCalendarDate(value);

        if (value instanceof Date) {
            const dateString = moment(value).format('YYYY-MM-DD');
            const entry = diaryEntries.find(e => e.date === dateString);
            setSelectedEntry(entry || null);
            
            // 모바일에서 날짜 클릭 시 상세 내용으로 스크롤 이동
            if (window.innerWidth <= 768) {
                setTimeout(() => {
                    document.getElementById('detail-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        } else {
            setSelectedEntry(null);
        }
    };

    // 🔑 타일 내용 렌더링 (점 찍기 및 날씨 아이콘)
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
                                boxShadow: `0 0 6px ${emotion.gemStyle.shadowColor}`
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
            {/* 3D 배경 */}
            <div className="background-canvas">
                <Canvas camera={{ position: [0, 0, 1] }}>
                    <StarsBackground />
                    <ambientLight intensity={0.5} />
                </Canvas>
            </div>

            <div className="calendar-content-container">
                <div className="calendar-card">
                    <div className="header-row">
                        <h1 className="page-title">🗓️ 기록된 우주</h1>
                        <button onClick={() => navigate('/diary')} className="icon-btn" title="일기 쓰기">✏️</button>
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
                            next2Label={null} // 년도 이동 버튼 숨김 (심플하게)
                            prev2Label={null}
                        />
                    </div>

                    {/* 💡 상세 내용 섹션 (모달 대신 캘린더 아래에 배치) */}
                    <div id="detail-section" className="detail-section">
                        <h3 className="detail-date">
                            {calendarDate instanceof Date
                                ? moment(calendarDate).format('YYYY년 M월 D일')
                                : '날짜를 선택하세요'}
                        </h3>

                        {selectedEntry ? (
                            <div className="entry-card fade-in">
                                <div className="entry-header">
                                    <div className="meta-group">
                                        <span className="meta-badge weather">{weatherIcons[selectedEntry.weather]}</span>
                                        <span className="meta-badge emotion" style={{
                                            color: emotionOptions.find(e => e.emotionKey === selectedEntry.emotion)?.gemStyle.mainColor
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
                            <button onClick={handleLogout} className="logout-btn">로그아웃</button>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .calendar-page-wrapper { position: relative; width: 100%; min-height: 100vh; background: #0a0a14; overflow-y: auto; }
                .background-canvas { position: fixed !important; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; }
                
                .calendar-content-container { 
                    position: relative; z-index: 10; padding: 20px; 
                    display: flex; justify-content: center; 
                    min-height: 100vh; /* 화면 꽉 채우기 */
                    box-sizing: border-box;
                }
                
                .calendar-card { 
                    width: 100%; max-width: 550px; 
                    background: rgba(20, 20, 35, 0.85); 
                    backdrop-filter: blur(20px); 
                    border-radius: 24px; 
                    padding: 25px; 
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 20px 50px rgba(0,0,0,0.6);
                    display: flex; flex-direction: column; gap: 15px;
                    margin-top: 20px; margin-bottom: 40px; /* 위아래 여백 확보 */
                }
                
                .header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
                .page-title { font-size: 1.6rem; color: white; margin: 0; font-weight: 800; text-shadow: 0 0 10px rgba(255,255,255,0.3); }
                .icon-btn { 
                    background: linear-gradient(135deg, #3700cc, #6a00ff); 
                    border: none; border-radius: 50%; width: 45px; height: 45px; 
                    cursor: pointer; font-size: 1.3rem; display: flex; align-items: center; justify-content: center; 
                    box-shadow: 0 4px 15px rgba(106, 0, 255, 0.4);
                    transition: transform 0.2s; 
                }
                .icon-btn:active { transform: scale(0.95); }

                .status-bar { height: 20px; text-align: center; font-size: 0.9rem; }
                .error { color: #ff6b6b; font-weight: bold; }
                .loading { color: #00ffcc; animation: pulse 1.5s infinite; }
                @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }

                /* 캘린더 스타일 */
                .calendar-wrapper { 
                    background: rgba(0, 0, 0, 0.2); 
                    border-radius: 20px; 
                    padding: 15px; 
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }
                .infinite-calendar { width: 100%; background: transparent !important; border: none !important; color: #fff !important; font-family: inherit; }
                
                .react-calendar__navigation button { color: #00e0ff !important; font-size: 1.1rem; font-weight: 800; background: none !important; }
                .react-calendar__navigation button:disabled { opacity: 0.5; }
                
                .react-calendar__month-view__weekdays { font-size: 0.9rem; color: #888; text-transform: uppercase; margin-bottom: 10px; abbr { text-decoration: none; } }
                
                .react-calendar__tile { 
                    height: 70px; /* 타일 높이 확보 */
                    display: flex; flex-direction: column; align-items: center; justify-content: flex-start; 
                    padding-top: 8px; font-size: 1rem; position: relative;
                    border-radius: 12px; transition: background 0.2s; color: #eee;
                }
                .react-calendar__tile:enabled:hover, .react-calendar__tile:enabled:focus { background: rgba(255,255,255,0.1) !important; }
                .react-calendar__tile--now { background: rgba(0,191,255,0.1) !important; border: 1px solid rgba(0,191,255,0.3); }
                .react-calendar__tile--active { background: #00ffcc !important; color: #000 !important; font-weight: bold; box-shadow: 0 0 15px rgba(0, 255, 204, 0.4); }

                .tile-content { margin-top: 4px; display: flex; flex-direction: column; align-items: center; gap: 3px; }
                .emotion-dot { width: 6px; height: 6px; border-radius: 50%; }
                .weather-icon { font-size: 0.85rem; }

                /* 상세 내용 섹션 */
                .detail-section {
                    margin-top: 20px;
                    padding-top: 20px;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    animation: slideUp 0.4s ease-out;
                }
                
                .detail-date {
                    color: #ffcc00;
                    margin-bottom: 15px;
                    font-size: 1.3rem;
                    text-align: center;
                    font-weight: 700;
                    text-shadow: 0 0 10px rgba(255, 204, 0, 0.3);
                }

                .entry-card {
                    background: rgba(255, 255, 255, 0.05);
                    padding: 20px;
                    border-radius: 15px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    margin-bottom: 20px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                }
                
                .entry-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; }
                .meta-group { display: flex; gap: 10px; align-items: center; width: 100%; justify-content: space-between; }
                
                .meta-badge {
                    padding: 6px 12px;
                    background: rgba(0, 0, 0, 0.4);
                    border-radius: 12px;
                    font-size: 0.9rem;
                    font-weight: bold;
                }

                .text-scroll-area {
                    max-height: 200px; /* 내용이 길면 스크롤 */
                    overflow-y: auto;
                    padding-right: 5px;
                }
                /* 커스텀 스크롤바 */
                .text-scroll-area::-webkit-scrollbar { width: 4px; }
                .text-scroll-area::-webkit-scrollbar-thumb { background: #555; border-radius: 2px; }
                
                .text { color: #ddd; line-height: 1.6; white-space: pre-wrap; font-size: 1rem; letter-spacing: 0.5px; }
                
                .empty-state {
                    text-align: center;
                    color: #666;
                    padding: 30px 0;
                    font-style: italic;
                    display: flex; flex-direction: column; align-items: center; gap: 10px;
                }
                .link-btn { background: none; border: none; color: #00e0ff; cursor: pointer; font-size: 1rem; text-decoration: underline; }

                .nav-buttons { display: flex; justify-content: center; margin-top: 10px; }
                .logout-btn { 
                    background: none; border: 1px solid #444; color: #888; 
                    padding: 8px 20px; border-radius: 20px; cursor: pointer; font-size: 0.85rem; 
                    transition: all 0.2s; 
                }
                .logout-btn:hover { border-color: #666; color: #fff; }

                @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

                /* 📱 모바일 최적화 */
                @media (max-width: 768px) {
                    .calendar-content-container { padding: 10px; align-items: flex-start; } /* 상단 정렬로 변경하여 스크롤 자연스럽게 */
                    .calendar-card { padding: 20px 15px; margin-top: 10px; }
                    .page-title { font-size: 1.5rem; }
                    .react-calendar__tile { height: 60px; font-size: 0.9rem; }
                    .weather-icon { font-size: 0.7rem; }
                    .emotion-dot { width: 5px; height: 5px; }
                    .entry-card { padding: 15px; }
                    .text { font-size: 0.95rem; }
                }
            `}</style>
        </div>
    );
};

export default CalendarPage;