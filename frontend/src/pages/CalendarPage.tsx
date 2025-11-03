// infinite_diary/frontend/src/pages/CalendarPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar'; 
import 'react-calendar/dist/Calendar.css'; 
import axios from 'axios';
import { Canvas } from '@react-three/fiber';
import StarsBackground from '../components/StarsBackground'; 

// 🔑 수정: 환경 변수에서 API 주소를 가져옵니다.
const API_URL = import.meta.env.VITE_API_URL;

interface DiaryEntry {
    _id: string;
    content: string;
    date: string;
    emotionTag: string[];
}

type CalendarValue = any; 

const CalendarPage: React.FC = () => {
    const navigate = useNavigate();
    const [entries, setEntries] = useState<DiaryEntry[]>([]); 
    const [selectedDate, setSelectedDate] = useState<CalendarValue>(new Date()); 
    const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState<string | null>(null);

    const getConfig = () => ({
        headers: {
            Authorization: `Bearer ${localStorage.getItem('diaryToken') || localStorage.getItem('token')}`,
        }
    });

    const fetchDiaryEntries = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_URL}/api/diary`, getConfig());
            setEntries(response.data);
            setMessage(`총 ${response.data.length}개의 기록을 불러왔습니다.`);
        } catch (err: any) {
            console.error('기록 조회 실패:', err);
            if (err.response?.status === 401) {
                setError('세션이 만료되었습니다. 다시 로그인해 주세요.');
                setTimeout(() => navigate('/auth'), 2000);
                return;
            }
            setError('일기 기록을 불러오는 데 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDiaryEntries();
    }, []);

    const handleDateChange = (dateValue: CalendarValue) => {
        if (dateValue instanceof Date) {
            const date = dateValue;
            setSelectedDate(date);
            
            const dayEntries = entries.find(entry => 
                new Date(entry.date).toDateString() === date.toDateString()
            );

            setSelectedEntry(dayEntries || null);
            if (!dayEntries) {
                setMessage('해당 날짜에 작성된 일기가 없습니다.');
            } else {
                setMessage('');
            }
        }
    };

    const tileContent = ({ date, view }: { date: Date, view: string }) => {
        if (view === 'month') {
            const entryExists = entries.some(entry => 
                new Date(entry.date).toDateString() === date.toDateString()
            );

            return entryExists ? (
                <div style={{ fontSize: '1.2rem', lineHeight: '1.2', color: '#ffcc00', marginTop: '5px' }}>
                    ✨
                </div>
            ) : null;
        }
        return null;
    };
    
    const renderLoadingAndError = () => {
        if (isLoading) {
            return <p style={{ color: 'white', margin: '15px 0' }}>기록 로딩 중...</p>;
        }
        if (error) {
            return <p style={{ color: 'red', margin: '15px 0' }}>{error}</p>;
        }
        if (message && !isLoading && !error) {
             return <p style={{ color: 'lightgreen', margin: '15px 0' }}>{message}</p>;
        }
        return null;
    };

    return (
        <div style={{ 
            position: 'relative', 
            width: '100%', 
            minHeight: '100vh', 
            overflow: 'hidden', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            fontFamily: 'inherit',
            backgroundImage: `url('/space_nebula_bg.jpg')`, 
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            padding: '40px 0'
        }}>
            
            <Canvas 
                camera={{ position: [0, 0, 1] }} 
                style={{ position: 'absolute', top: 0, left: 0, zIndex: 1, width: '100%', height: '100%', backgroundColor: 'transparent' }} 
            >
                <StarsBackground /> 
                <ambientLight intensity={0.5} />
            </Canvas>

            <div style={{ zIndex: 10, width: '100%', maxWidth: '1200px', display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#f0f0f0' }}>

                <h1 style={{ marginBottom: '30px', color: '#ffcc00', textShadow: '0 0 5px rgba(255, 255, 255, 0.4)' }}>
                    🗓️ 기록된 우주 (Calendar View)
                </h1>
                
                <button onClick={() => navigate('/')} style={{ margin: '10px', padding: '10px 20px', backgroundColor: '#555', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontFamily: 'inherit' }}>
                    🌌 일기 작성 화면으로
                </button>

                {renderLoadingAndError()}
                
                <div style={{ 
                    backgroundColor: 'rgba(10, 10, 10, 0.7)', 
                    padding: '20px',
                    borderRadius: '10px',
                    boxShadow: '0 0 30px rgba(0, 0, 0, 0.7)',
                    maxWidth: '1000px', 
                    width: '90%', 
                    marginTop: '20px', 
                    border: '2px solid rgba(51, 51, 51, 0.7)', 
                    overflow: 'hidden' 
                }}>
                    <Calendar 
                        onChange={handleDateChange}
                        value={selectedDate}
                        tileContent={tileContent}
                        calendarType="iso8601" 
                        className="infinite-calendar"
                    />
                </div>
                
                {selectedEntry && (
                    <div style={{ marginTop: '30px', padding: '25px', border: '1px solid #00ffcc', borderRadius: '10px', width: '90%', maxWidth: '1000px', backgroundColor: 'rgba(20, 20, 20, 0.8)', textAlign: 'left' }}>
                        <h2 style={{ color: '#00ffcc', borderBottom: '1px solid #00ffcc', paddingBottom: '10px', marginBottom: '15px' }}>
                            {new Date(selectedEntry.date).toLocaleDateString()}의 기록
                        </h2>
                        <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>{selectedEntry.content}</p>
                        <p style={{ marginTop: '15px', fontStyle: 'italic', color: '#ffcc00' }}>
                            감정 태그: {selectedEntry.emotionTag?.join(', ') || '없음'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CalendarPage;