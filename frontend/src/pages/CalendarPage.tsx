/// <reference types="vite/client" />
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import axios from 'axios';

// ... (감정 상수 및 EmotionOption 부분은 기존과 동일하므로 유지) ...
// ... (StarsBackground 컴포넌트도 기존 유지) ...

interface GemStyleProps {
    mainColor: string;
    shadowColor: string;
    gradient: string; 
    borderColor: string; 
    textColor: string;
    textShadow: string;
}

interface EmotionOption {
    emotionKey: string;
    label: string;
    description: string;
    gemStyle: GemStyleProps;
}

const emotionOptions: EmotionOption[] = [
    {
        emotionKey: 'heart', 
        label: '( ᴗ ̫ ᴗ ) ♡',
        description: '사랑',
        gemStyle: {
            mainColor: '#E0115F',
            shadowColor: 'rgba(224, 17, 95, 0.6)',
            gradient: 'radial-gradient(circle at 30% 30%, #FFC1CC 0%, #FF0055 80%)',
            borderColor: '', 
            textColor: '#FF4081', 
            textShadow: '0 0 10px rgba(255, 64, 129, 0.8), 0 0 20px rgba(255, 64, 129, 0.4)' 
        }
    },
    {
        emotionKey: 'happy', 
        label: '~(‾⌣‾~)',
        description: '덩실덩실',
        gemStyle: {
            mainColor: '#FFD700',
            shadowColor: 'rgba(255, 215, 0, 0.6)',
            gradient: 'radial-gradient(circle at 30% 30%, #FFFFE0 0%, #FFD700 80%)',
            borderColor: '',
            textColor: '#FFD740', 
            textShadow: '0 0 10px rgba(255, 215, 64, 0.8), 0 0 20px rgba(255, 215, 64, 0.4)' 
        }
    },
    {
        emotionKey: 'low', 
        label: '（πーπ）',
        description: '슬퍼요',
        gemStyle: {
            mainColor: '#0F52BA',
            shadowColor: 'rgba(15, 82, 186, 0.6)',
            gradient: 'radial-gradient(circle at 30% 30%, #E0F7FA 0%, #00BFFF 80%)',
            borderColor: '',
            textColor: '#40C4FF', 
            textShadow: '0 0 10px rgba(64, 196, 255, 0.8), 0 0 20px rgba(64, 196, 255, 0.4)' 
        }
    },
    {
        emotionKey: 'angry', 
        label: '૮₍ꐦ -᷅ ⤙ -᷄ ₎ა',
        description: '화남',
        gemStyle: {
            mainColor: '#8B0000',
            shadowColor: 'rgba(139, 0, 0, 0.6)',
            gradient: 'radial-gradient(circle at 30% 30%, #FFCCBC 0%, #FF3D00 80%)',
            borderColor: '',
            textColor: '#FF5252', 
            textShadow: '0 0 10px rgba(255, 82, 82, 0.8), 0 0 20px rgba(255, 82, 82, 0.4)' 
        }
    },
    {
        emotionKey: 'unknown', 
        label: 'ᐡ´•﹃•`ᐡ',
        description: '나도 내 기분을 몰라요',
        gemStyle: {
            mainColor: '#E0C3FC',
            shadowColor: 'rgba(224, 195, 252, 0.6)',
            gradient: 'radial-gradient(circle at 30% 30%, #FFFFFF 0%, #BDBDBD 90%)',
            borderColor: '',
            textColor: '#E0E0E0', 
            textShadow: '0 0 10px rgba(224, 224, 224, 0.8), 0 0 20px rgba(255, 255, 255, 0.4)' 
        }
    },
];

// ... (유틸리티 및 API 설정 기존 유지) ...

const API_URL = 'http://localhost:5000';

const weatherIcons: { [key: string]: string } = {
  sunny: '☀️', cloudy: '☁️', rain: '🌧️', snow: '❄️'
};

const formatDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getNormalizedEmotionKey = (emotion: string | number | undefined): string => {
  if (emotion === undefined || emotion === null) return 'unknown';
  
  const str = String(emotion).toLowerCase().trim();
  
  if (emotionOptions.some(e => e.emotionKey === str)) return str;

  if (['0', 'love', 'ruby', 'heart', '사랑', '설렘', '좋아', 'like'].some(k => str.includes(k))) return 'heart';
  if (['1', 'happy', 'citrine', 'joy', 'smile', 'fun', '령실', '덩실', '기쁨', '즐거', '신나'].some(k => str.includes(k))) return 'happy';
  if (['2', 'sad', 'sapphire', 'blue', 'cry', 'tear', 'low', '슬퍼', '우울', '눈물', '지침'].some(k => str.includes(k))) return 'low';
  if (['3', 'angry', 'garnet', 'fire', 'mad', 'rage', '화남', '분노', '짜증', '열받'].some(k => str.includes(k))) return 'angry';
  if (['4', 'unknown', 'opal', 'calm', 'soso', '몰라', '평온', '무감', '그냥'].some(k => str.includes(k))) return 'unknown';

  return 'unknown';
};

interface DiaryEntry {
  _id: string;
  date: string;
  emotion: string;
  weather: string;
  content: string;
  updatedAt: string;
}

// ... (StarsBackground 컴포넌트 기존 유지) ...
const StarsBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = window.devicePixelRatio || 1;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      ctx.scale(dpr, dpr);
    };
    window.addEventListener('resize', resize);
    resize();

    const count = 900;
    const radius = 800;
    const stars: { x: number, y: number, z: number, baseSize: number, twinkleSpeed: number, twinkleOffset: number, color: string }[] = [];
    
    const colors = ['#ffffff', '#e0f7fa', '#b2ebf2', '#c5cae9', '#e1bee7', '#fff9c4'];

    for (let i = 0; i < count; i++) {
      const r = radius * Math.cbrt(Math.random());
      const theta = Math.random() * 2 * Math.PI;
      const val = 2 * Math.random() - 1;
      const phi = Math.acos(Math.max(-1, Math.min(1, val)));

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      let baseSize = Math.random() * 1.0 + 0.2; 
      if (Math.random() < 0.08) baseSize += 1.8; 

      const twinkleSpeed = Math.random() * 0.03 + 0.01;
      const twinkleOffset = Math.random() * Math.PI * 2;
      const color = colors[Math.floor(Math.random() * colors.length)]; 

      stars.push({ x, y, z, baseSize, twinkleSpeed, twinkleOffset, color });
    }

    let rotationX = 0;
    let rotationY = 0;
    let time = 0; 

    const animate = () => {
      ctx.fillStyle = '#000000'; 
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      rotationX -= 0.0002; 
      rotationY -= 0.0003;
      time += 1;

      const cosX = Math.cos(rotationX);
      const sinX = Math.sin(rotationX);
      const cosY = Math.cos(rotationY);
      const sinY = Math.sin(rotationY);

      stars.forEach(star => {
        let { x, y, z, baseSize, twinkleSpeed, twinkleOffset, color } = star;

        const x1 = x * cosY - z * sinY;
        const z1 = z * cosY + x * sinY;
        x = x1;
        z = z1;

        const y2 = y * cosX - z * sinX;
        const z2 = z * cosX + y * sinX;
        y = y2;
        z = z2;

        const fov = 1000;
        const scale = fov / (fov + z);

        const px = x * scale + cx;
        const py = y * scale + cy;

        const size = baseSize * scale;

        const twinkle = Math.sin(time * twinkleSpeed + twinkleOffset);
        let alpha = (twinkle + 1) / 2 * 0.7 + 0.3; 
        alpha *= Math.min(1, Math.max(0.1, scale)); 

        if (z > -fov && px > 0 && px < width && py > 0 && py < height) {
          ctx.globalAlpha = alpha;
          ctx.fillStyle = color;
          
          if (size > 1.8) {
            ctx.shadowBlur = size * 3; 
            ctx.shadowColor = color;
            ctx.beginPath();
            const spikeLen = size * 2.0; 
            const coreSize = size * 0.5; 
            
            ctx.moveTo(px - spikeLen, py);
            ctx.quadraticCurveTo(px, py, px, py - spikeLen);
            ctx.quadraticCurveTo(px, py, px + spikeLen, py);
            ctx.quadraticCurveTo(px, py, px, py + spikeLen);
            ctx.quadraticCurveTo(px, py, px - spikeLen, py);
            ctx.closePath();
            ctx.fill();

            ctx.globalAlpha = alpha * 0.9;
            ctx.beginPath();
            ctx.arc(px, py, coreSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0; 
          } else {
            ctx.beginPath();
            ctx.arc(px, py, size, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });

      requestRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} className="background-canvas" />;
};

// ... (CustomCalendar 컴포넌트 기존 유지) ...
const CustomCalendar = ({ 
  currentDate, 
  selectedDate, 
  onDateClick, 
  onSetDate, 
  diaryEntries 
}: any) => {
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(currentDate.getFullYear());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); 
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const days = [];
  if (!isMonthPickerOpen) {
    for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="calendar-day empty" />);
    }
    
    for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month, d);
        const strDate = formatDate(date);
        const entry = diaryEntries.find((e: any) => e.date === strDate);
        const isSelected = formatDate(selectedDate) === strDate;
        const isToday = formatDate(new Date()) === strDate;

        let gemStyle = null;
        if (entry) {
            const key = getNormalizedEmotionKey(entry.emotion);
            const option = emotionOptions.find(opt => opt.emotionKey === key);
            if (option) {
                gemStyle = option.gemStyle;
            }
        }

        days.push(
        <button
            key={d}
            onClick={() => onDateClick(date)}
            className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
        >
            <span className="day-number">{d}</span>
            <div className="day-content">
            {entry && gemStyle && (
                <>
                <div 
                    className="emotion-dot"
                    style={{
                    background: gemStyle.gradient, 
                    boxShadow: `0 0 8px 2px ${gemStyle.shadowColor}`, 
                    }}
                />
                <span className="weather-icon-small">{weatherIcons[entry.weather]}</span>
                </>
            )}
            </div>
        </button>
        );
    }
  }

  const handleMonthSelect = (newMonth: number) => {
      const newDate = new Date(pickerYear, newMonth, 1);
      onSetDate(newDate); 
      setIsMonthPickerOpen(false); 
  };

  const handlePickerYearChange = (offset: number) => {
      setPickerYear((prev: number) => prev + offset);
  };

  const handleHeaderNav = (offset: number) => {
      if (isMonthPickerOpen) {
          handlePickerYearChange(offset);
      } else {
          const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
          onSetDate(newDate);
      }
  };

  return (
    <div className="custom-calendar-container">
      <div className="calendar-header">
        <button onClick={() => handleHeaderNav(-1)} className="nav-arrow" title="Prev">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        
        <button 
            className="current-month-label interactive" 
            onClick={() => {
                setPickerYear(year); 
                setIsMonthPickerOpen(!isMonthPickerOpen);
            }}
        >
            {isMonthPickerOpen ? `${pickerYear}년` : `${year}년 ${month + 1}월`}
            <span className="toggle-icon">{isMonthPickerOpen ? '▲' : '▼'}</span>
        </button>

        <button onClick={() => handleHeaderNav(1)} className="nav-arrow" title="Next">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>

      {isMonthPickerOpen ? (
          <div className="month-picker-grid">
              {Array.from({ length: 12 }, (_, i) => (
                  <button 
                    key={i} 
                    className={`month-picker-item ${i === month && pickerYear === year ? 'current' : ''}`}
                    onClick={() => handleMonthSelect(i)}
                  >
                      {i + 1}월
                  </button>
              ))}
          </div>
      ) : (
          <>
            <div className="calendar-grid-header">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className={`weekday-label ${day === 'Sun' ? 'sunday' : ''} ${day === 'Sat' ? 'saturday' : ''}`}>{day}</div>
                ))}
            </div>
            <div className="calendar-grid">
                {days}
            </div>
          </>
      )}
    </div>
  );
};


// ----------------------------------------------------------------------
// 5. 메인 페이지 컴포넌트
// ----------------------------------------------------------------------
const CalendarPage: React.FC = () => {
  const handleNavigate = (path: string) => {
    window.location.href = path; 
  };

  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [selectedDate, setSelectedDate] = useState(new Date()); 
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const handleLogout = () => {
    localStorage.removeItem('diaryToken');
    handleNavigate('/');
  };

  const fetchMonthlyDiary = useCallback(async (date: Date) => {
    const token = localStorage.getItem('diaryToken');
    
    if (abortControllerRef.current) abortControllerRef.current.abort();
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
          timeout: 5000 
        }
      );

      const fetched = response.data.map((e: any) => ({
        ...e,
        date: formatDate(new Date(e.date))
      }));
      setDiaryEntries(fetched);
      
      const strDate = formatDate(selectedDate);
      const entry = fetched.find((e: DiaryEntry) => e.date === strDate);
      setSelectedEntry(entry || null);

    } catch (err: any) {
      if (!axios.isCancel(err)) {
        console.warn("백엔드 연결 실패, 데모 데이터를 사용합니다.");
        const dummyData: DiaryEntry[] = [
          { _id: '1', date: formatDate(new Date(date.getFullYear(), date.getMonth(), 5)), emotion: '0', weather: 'sunny', content: '0번 코드(Ruby/Heart) 테스트', updatedAt: new Date().toISOString() },
          { _id: '2', date: formatDate(new Date(date.getFullYear(), date.getMonth(), 12)), emotion: '슬퍼요', weather: 'rain', content: '한글 "슬퍼요" -> Low/Sapphire 매핑 테스트', updatedAt: new Date().toISOString() },
          { _id: '3', date: formatDate(new Date(date.getFullYear(), date.getMonth(), 20)), emotion: 'happy', weather: 'cloudy', content: '영문 "happy" -> Happy/Citrine 매핑 테스트', updatedAt: new Date().toISOString() },
          { _id: '4', date: formatDate(new Date(date.getFullYear(), date.getMonth(), 25)), emotion: 'angry', weather: 'snow', content: '영문 "angry" -> Angry/Garnet 매핑 테스트', updatedAt: new Date().toISOString() },
          { _id: '5', date: formatDate(new Date(date.getFullYear(), date.getMonth(), 28)), emotion: '평온', weather: 'cloudy', content: '"평온" -> Unknown/Opal 매핑 테스트', updatedAt: new Date().toISOString() },
        ];
        setDiaryEntries(dummyData);
        
        const strDate = formatDate(selectedDate);
        const entry = dummyData.find(e => e.date === strDate);
        setSelectedEntry(entry || null);
      }
    } finally {
        setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchMonthlyDiary(currentDate);
    return () => abortControllerRef.current?.abort();
  }, [currentDate, fetchMonthlyDiary]);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const strDate = formatDate(date);
    const entry = diaryEntries.find(e => e.date === strDate);
    setSelectedEntry(entry || null);
    
    if (window.innerWidth <= 768) {
        setTimeout(() => {
            document.getElementById('detail-section')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }
  };

  const handleSetDate = (date: Date) => {
      setCurrentDate(date);
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
    setCurrentDate(newDate);
  };

  return (
    <div className="calendar-page-wrapper">
      <StarsBackground />

      <div className="calendar-content-container">
        <div className="calendar-card glass-card">
          
          <div className="header-row">
            <h1 className="page-title">🗓️ 기록된 우주</h1>
            <button onClick={() => handleNavigate('/diary')} className="icon-btn" title="일기 쓰기">
              <span>✏️</span>
            </button>
          </div>

          <div className="status-bar">
            {isLoading ? <span className="loading">별들을 불러오는 중... ✨</span> : (error && <span className="error">{error}</span>)}
          </div>

          <div className="calendar-wrapper">
            <CustomCalendar 
                currentDate={currentDate}
                selectedDate={selectedDate}
                onDateClick={handleDateClick}
                onSetDate={handleSetDate}
                onChangeMonth={changeMonth}
                diaryEntries={diaryEntries}
            />
          </div>

          <div id="detail-section" className="detail-section">
            <h3 className="detail-date">
              {selectedDate.getFullYear()}년 {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일
            </h3>

            {selectedEntry ? (
              <div className="entry-card fade-in glass-inner-card">
                <div className="entry-header">
                  <div className="meta-group">
                    <span className="meta-badge weather glass-badge">{weatherIcons[selectedEntry.weather] || '☁️'}</span>
                    
                    {(() => {
                        const key = getNormalizedEmotionKey(selectedEntry.emotion);
                        const option = emotionOptions.find(e => e.emotionKey === key);
                        
                        let textColor = 'white';
                        let textShadow = 'none';
                        let label = selectedEntry.emotion; 

                        if (option) {
                            textColor = option.gemStyle.textColor;
                            textShadow = option.gemStyle.textShadow;
                            
                            const original = String(selectedEntry.emotion);
                            const codeKeys = [
                                'heart', 'happy', 'low', 'angry', 'unknown', 
                                '0', '1', '2', '3', '4', 
                                'ruby', 'citrine', 'sapphire', 'garnet', 'opal'
                            ];
                            
                            if (codeKeys.includes(original)) {
                                label = option.description;
                            } else {
                                label = original || '나도 내 기분을 몰라요';
                            }
                        }

                        return (
                            <span className="meta-badge emotion glass-badge" style={{
                                color: textColor,
                                background: 'rgba(255, 255, 255, 0.1)', 
                                textShadow: textShadow, 
                                border: '1px solid rgba(255, 255, 255, 0.1)', 
                                boxShadow: 'none' 
                            }}>
                                {label}
                            </span>
                        );
                    })()}
                  </div>
                </div>
                <div className="text-scroll-area">
                  <p className="text">{selectedEntry.content}</p>
                </div>
              </div>
            ) : (
              <div className="empty-state fade-in">
                <div className="empty-icon-wrapper">
                    <span className="empty-icon">🌙</span>
                </div>
                <p className="empty-text">이 날의 기록이 없습니다.</p>
                <button onClick={() => handleNavigate('/diary')} className="create-diary-btn">
                   ✨ 오늘 기록 남기기
                </button>
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
        html, body { 
          margin: 0; padding: 0; 
          width: 100%; height: 100%; 
          background-color: #000000; /* 완전 검정 */
          overflow: hidden; 
        }
        
        .calendar-page-wrapper {
          position: relative;
          width: 100%;
          height: 100vh;
          background: #000000; /* 완전 검정 */
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          font-family: 'Pretendard', sans-serif;
          color: white;
        }

        .background-canvas {
            position: fixed;
            top: 0; left: 0;
            width: 100vw; height: 100vh;
            z-index: 0; 
            pointer-events: none;
        }

        .calendar-content-container {
          position: relative;
          z-index: 10;
          padding: 30px 20px;
          display: flex;
          justify-content: center;
          padding-bottom: 80px; 
          box-sizing: border-box;
          min-height: 100%;
        }

        /* --- Deep Space Glass Card --- */
        .glass-card {
          background: rgba(10, 10, 15, 0.6); 
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 28px;
          border: 1px solid rgba(255, 255, 255, 0.08); 
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.7);
          width: 100%;
          max-width: 500px; 
          padding: 25px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          animation: floatUp 0.8s ease-out;
          margin-bottom: 20px;
        }

        .header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
        .page-title {
          font-size: 1.6rem;
          color: #fff;
          margin: 0;
          font-weight: 800;
          text-shadow: 0 0 15px rgba(200, 200, 255, 0.3);
          letter-spacing: -0.5px;
        }

        .icon-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 50%;
          width: 40px; height: 40px;
          cursor: pointer;
          font-size: 1.1rem;
          display: flex; align-items: center; justify-content: center;
          backdrop-filter: blur(4px);
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .icon-btn:hover { background: rgba(255, 255, 255, 0.15); transform: scale(1.1); box-shadow: 0 0 10px rgba(255,255,255,0.2); }

        .status-bar { height: 20px; text-align: center; font-size: 0.85rem; font-weight: 500; color: rgba(255,255,255,0.7); }
        .error { color: #ff5252; font-weight: bold; }
        .loading { color: #40c4ff; animation: pulse 1.5s infinite; }

        /* --- Deep Space Calendar Grid --- */
        .calendar-wrapper {
          background: transparent; 
          padding: 10px 0; 
        }

        .calendar-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 20px;
          padding: 0 5px;
        }

        .nav-arrow {
          background: rgba(255, 255, 255, 0.05);
          border: none; color: #fff;
          width: 36px; height: 36px;
          border-radius: 50%;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
        }
        .nav-arrow:hover { background: rgba(255, 255, 255, 0.15); transform: scale(1.1); }

        .current-month-label {
          font-size: 1.3rem; font-weight: 700; color: #fff;
          letter-spacing: 1px;
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
          background: none; border: none; cursor: pointer;
          display: flex; align-items: center; gap: 8px;
          transition: all 0.2s;
        }
        .current-month-label:hover {
            color: #E0C3FC;
            text-shadow: 0 0 15px rgba(224, 195, 252, 0.5);
        }
        .current-month-label.interactive {
            padding: 5px 10px;
            border-radius: 12px;
        }
        .current-month-label.interactive:hover {
            background: rgba(255,255,255,0.05);
        }
        .toggle-icon { font-size: 0.8rem; opacity: 0.7; }

        /* Month Picker Grid */
        .month-picker-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            padding: 20px 0;
            animation: fadeIn 0.3s ease-out;
        }
        .month-picker-item {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #eee;
            padding: 15px 0;
            border-radius: 16px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }
        .month-picker-item:hover {
            background: rgba(255, 255, 255, 0.15);
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        }
        .month-picker-item.current {
            background: rgba(64, 196, 255, 0.2);
            border-color: rgba(64, 196, 255, 0.5);
            color: #fff;
            box-shadow: 0 0 15px rgba(64, 196, 255, 0.3);
        }

        .calendar-grid-header {
          display: grid; grid-template-columns: repeat(7, 1fr);
          text-align: center; margin-bottom: 12px;
        }

        .weekday-label {
          font-size: 0.8rem; color: rgba(255, 255, 255, 0.4);
          font-weight: 600; 
          letter-spacing: 1px;
        }
        .weekday-label.sunday { color: #ff5252; opacity: 0.8; }
        .weekday-label.saturday { color: #40c4ff; opacity: 0.8; }

        .calendar-grid {
          display: grid; grid-template-columns: repeat(7, 1fr);
          gap: 6px; 
        }

        .calendar-day {
          aspect-ratio: 1 / 1;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 14px;
          color: #eee;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          font-size: 1rem; cursor: pointer;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          position: relative;
        }

        .calendar-day:not(.empty):hover { 
            background: rgba(255, 255, 255, 0.05); 
            box-shadow: 0 0 15px rgba(255, 255, 255, 0.1); 
        }

        .calendar-day.selected {
          background: rgba(64, 196, 255, 0.1);
          border: 1px solid rgba(64, 196, 255, 0.6);
          box-shadow: 0 0 15px rgba(64, 196, 255, 0.3), inset 0 0 10px rgba(64, 196, 255, 0.1);
          color: #fff;
          font-weight: 700;
          transform: scale(1.05);
          z-index: 1;
        }

        .calendar-day.today {
          color: #E0C3FC;
          font-weight: 700;
          text-shadow: 0 0 8px rgba(224, 195, 252, 0.6);
        }
        
        .day-content {
          position: absolute;
          bottom: 6px;
          display: flex; flex-direction: column;
          align-items: center; gap: 2px;
        }

        .emotion-dot { width: 6px; height: 6px; border-radius: 50%; }
        .weather-icon-small { display: none; } 

        /* --- Detail Section (가독성 개선) --- */
        .detail-section {
          margin-top: 15px; padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          animation: slideUp 0.5s ease-out;
        }

        .detail-date {
          color: #E0C3FC; /* 날짜 색상 강조 */
          margin-bottom: 20px;
          font-size: 1.3rem; /* 날짜 크기 확대 */
          text-align: center; font-weight: 700;
          opacity: 1;
          letter-spacing: 1px;
          text-shadow: 0 0 15px rgba(224, 195, 252, 0.4);
        }

        .glass-inner-card {
          /* 배경을 더 어둡게 하여 글씨 가독성 향상 */
          background: rgba(0, 0, 0, 0.6); 
          padding: 25px; border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.15); /* 테두리 조금 더 밝게 */
          margin-bottom: 20px;
          box-shadow: inset 0 0 20px rgba(0,0,0,0.5); /* 안쪽 그림자로 깊이감 */
        }

        .entry-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.15);
          padding-bottom: 12px;
        }

        .meta-group { display: flex; gap: 10px; align-items: center; }

        .glass-badge {
          padding: 6px 14px;
          background: rgba(255, 255, 255, 0.08); /* 뱃지 배경 살짝 밝게 */
          border-radius: 20px;
          font-size: 0.9rem; font-weight: 600;
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(4px);
        }

        .text-scroll-area {
          max-height: 250px; /* 스크롤 영역 조금 더 확보 */
          overflow-y: auto; padding-right: 5px;
        }
        .text-scroll-area::-webkit-scrollbar { width: 4px; }
        .text-scroll-area::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.3); border-radius: 2px; }

        .text {
          color: #ffffff; /* 순백색 글씨 */
          line-height: 1.8; /* 줄 간격 넓힘 */
          white-space: pre-wrap; 
          font-size: 1.05rem; /* 글씨 크기 키움 */
          font-weight: 400; /* 글씨 두께 두껍게 (300 -> 400) */
          letter-spacing: 0.3px;
        }

        /* --- Empty State --- */
        .empty-state {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 40px 20px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 20px;
          border: 1px dashed rgba(255, 255, 255, 0.2);
          gap: 15px;
          animation: fadeIn 0.5s ease-out;
        }
        
        .empty-icon-wrapper {
          font-size: 2.5rem; margin-bottom: 5px;
          filter: drop-shadow(0 0 15px rgba(255, 255, 200, 0.2));
          animation: float 3s ease-in-out infinite;
        }
        
        .empty-text { color: rgba(255,255,255,0.7); font-size: 0.95rem; margin: 0; }

        .create-diary-btn {
          margin-top: 10px;
          background: linear-gradient(135deg, #7C4DFF 0%, #448AFF 100%);
          border: none; color: #fff;
          padding: 12px 24px; border-radius: 30px;
          font-size: 1rem; font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(124, 77, 255, 0.3);
          transition: transform 0.2s;
        }
        .create-diary-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(124, 77, 255, 0.5);
        }

        .logout-btn {
          margin-top: 10px; background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: rgba(255, 255, 255, 0.6);
          padding: 8px 20px; border-radius: 20px;
          cursor: pointer; font-size: 0.8rem;
          transition: all 0.2s;
        }
        .logout-btn:hover { border-color: #ff5252; color: #ff5252; background: rgba(255,82,82,0.05); }

        @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
        @keyframes floatUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-8px); } 100% { transform: translateY(0px); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        /* 📱 Mobile Responsive Tweaks */
        @media (max-width: 600px) {
          .calendar-content-container { 
            padding: 15px; 
            padding-bottom: 90px; /* Space for bottom nav if exists */
          }
          .glass-card { 
            padding: 25px 15px; 
            border-radius: 24px;
          }
          .page-title { font-size: 1.4rem; }
          .calendar-grid { gap: 4px; } /* Tighter grid on mobile */
          .calendar-day { 
            font-size: 0.95rem; 
            border-radius: 10px; 
          }
          .emotion-dot { width: 5px; height: 5px; bottom: 6px; }
          .day-content { bottom: 6px; }
          .detail-section { margin-top: 10px; }
        }
      `}</style>
    </div>
  );
};

export default CalendarPage;