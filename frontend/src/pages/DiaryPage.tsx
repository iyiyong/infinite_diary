// infinite_diary/frontend/src/pages/DiaryPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import StarsBackground from '../components/StarsBackground'; 
import ShootingStar from '../components/ShootingStar';
import axios from 'axios';

// 🔑 수정: 환경 변수에서 API 주소를 가져옵니다.
const API_URL = import.meta.env.VITE_API_URL;

const DiaryPage: React.FC = () => {
    const navigate = useNavigate(); 
    const [diaryContent, setDiaryContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    
    const handleLogout = () => {
        localStorage.removeItem('diaryToken');
        localStorage.removeItem('token'); 
        localStorage.removeItem('username');
        navigate('/auth');
    };

    const handleGoToCalendar = () => {
        navigate('/calendar'); 
    };

    const handleSubmitDiary = async () => {
        if (!diaryContent.trim()) {
            setMessage('❌ 일기 내용을 입력해 주세요.');
            return;
        }
        setIsLoading(true);
        setMessage('일기를 우주에 기록하는 중...');
        const token = localStorage.getItem('diaryToken') || localStorage.getItem('token'); 

        try {
            const response = await axios.post(`${API_URL}/api/diary`, {
                content: diaryContent,
                emotionTag: ['기쁨', '평온'], 
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            setDiaryContent('');
            setMessage(`✨ ${response.data.message}`);

        } catch (error: any) {
            console.error('일기 저장 실패:', error);
            if (error.response?.status === 401) {
                setMessage('❌ 세션이 만료되었습니다. 다시 로그인해 주세요.');
                setTimeout(handleLogout, 2000); 
                return;
            }
            const errorMessage = error.response?.data?.message || '알 수 없는 이유로 일기 저장에 실패했습니다.';
            setMessage(`❌ 저장 오류: ${errorMessage}`);
        } finally {
            setIsLoading(false);
            setTimeout(() => setMessage(''), 3000); 
        }
    };

    return (
        <div style={{ 
            position: 'relative', 
            width: '100%', 
            height: '100vh', 
            overflow: 'hidden',
            backgroundImage: `url('/space_nebula_bg.jpg')`, 
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
        }}>
            
            <Canvas 
                camera={{ position: [0, 0, 1] }} 
                style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    zIndex: 1, 
                    width: '100%', 
                    height: '100%',
                    backgroundColor: 'transparent',
                }} 
            >
                <StarsBackground /> 
                <ambientLight intensity={0.5} />
                {Array(15).fill(0).map((_, i) => (
                    <ShootingStar key={i} />
                ))}
            </Canvas>

            <div 
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 10,
                    backgroundColor: 'rgba(10, 10, 10, 0.7)', 
                    padding: '40px',
                    borderRadius: '10px',
                    boxShadow: '0 0 50px rgba(0, 0, 0, 0.8)',
                    maxWidth: '600px',
                    width: '90%',
                    color: 'white',
                    textAlign: 'center'
                }}
            >
                <h1>🌌 Infinite Diary</h1>
                <p>오늘 하루를 우주에 기록해 보세요. (로그인: {localStorage.getItem('username') || '사용자'})</p>

                {message && (
                    <p style={{ marginTop: '15px', color: message.startsWith('❌') ? 'rgb(255, 77, 77)' : 'rgb(144, 238, 144)', fontWeight: 'bold' }}>
                        {message}
                    </p>
                )}

                <textarea
                    rows={10}
                    value={diaryContent}
                    onChange={(e) => setDiaryContent(e.target.value)}
                    placeholder="오늘의 감정, 생각, 사건을 자유롭게 기록하세요..."
                    style={{
                        width: '100%',
                        padding: '15px',
                        fontSize: '1rem',
                        marginTop: '20px',
                        marginBottom: '10px',
                        borderRadius: '5px',
                        border: '1px solid rgb(68, 68, 68)',
                        backgroundColor: 'rgb(51, 51, 51)',
                        color: 'white',
                        resize: 'vertical',
                        fontFamily: 'inherit',
                    }}
                    disabled={isLoading}
                />

                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <button 
                        onClick={handleSubmitDiary}
                        disabled={isLoading || !diaryContent.trim()} 
                        style={{ 
                            padding: '12px 25px', 
                            fontSize: '1.2rem', 
                            cursor: 'pointer',
                            backgroundColor: (isLoading || !diaryContent.trim()) ? 'rgb(102, 102, 102)' : 'rgb(37, 0, 204)', 
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            fontFamily: 'inherit',
                            fontWeight: 'bold',
                        }}
                    >
                        {isLoading ? '저장 중...' : '📝 일기 기록하기'}
                    </button>
                    
                    <button 
                        onClick={handleGoToCalendar}
                        disabled={isLoading}
                        style={{ 
                            padding: '12px 25px', 
                            fontSize: '1.2rem', 
                            cursor: 'pointer',
                            backgroundColor: 'rgb(0, 255, 204)', 
                            color: 'rgb(26, 26, 26)', 
                            border: 'none',
                            borderRadius: '5px',
                            fontFamily: 'inherit',
                            fontWeight: 'bold',
                        }}
                    >
                        🗓️ 기록된 우주 보기
                    </button>
                </div>

                <button 
                    onClick={handleLogout}
                    style={{ 
                        marginTop: '20px', 
                        padding: '10px 20px', 
                        fontSize: '1.2rem', 
                        cursor: 'pointer',
                        backgroundColor: 'rgb(255, 204, 0)', 
                        color: 'rgb(26, 26, 26)', 
                        border: 'none',
                        borderRadius: '5px',
                        fontFamily: 'inherit',
                        fontWeight: 'bold',
                        display: 'block', 
                        width: 'calc(100% - 40px)',
                        margin: '20px auto 0 auto'
                    }}
                >
                    로그아웃
                </button>
            </div>
        </div>
    );
};

export default DiaryPage;