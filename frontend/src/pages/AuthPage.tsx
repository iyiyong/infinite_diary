import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import StarsBackground from '../components/StarsBackground';
import BackgroundPlane from '../components/weather/BackgroundPlane'; 

const LOGIN_BG_PATH = '/images/login_bg.png';

// 🚨 [추가됨] 백엔드 주소 자동 설정 (캘린더 페이지와 동일한 로직)
const isLocal = window.location.hostname === 'localhost';
const API_URL = isLocal 
    ? 'http://localhost:5000' 
    : 'https://infinite-diary.onrender.com';

const usageText = {
    title: "Infinite Diary",
    subtitle: "[ 규칙 ]",
    instructions: [
        "오늘 하루를 천천히 명상하라.",
        "회원가입 문자는 자유롭게 사용가능.",
        "선택한 날씨에 따라 일기 배경이 바뀐다.",
        "거짓 없이 솔직하게 기록하라.",
        "기록하고 하루가 지나면 영구적으로 저장된다.",
    ],
};

const AuthPage: React.FC = () => {
    const navigate = useNavigate(); 
    const [isLogin, setIsLogin] = useState(true);
    const [userId, setUserId] = useState(''); 
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [message, setMessage] = useState(''); 
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(''); 
        setIsLoading(true); 

        try {
            const axiosConfig = {
                withCredentials: true, 
                headers: { 'Content-Type': 'application/json' }
            };

            if (!isLogin) {
                // 🚨 [수정됨] 주소 앞에 API_URL 추가
                await axios.post(`${API_URL}/api/auth/register`, {
                    userId,
                    password,
                    displayName: displayName || 'Diary Keeper', 
                }, axiosConfig);

                setMessage('가입 완료! 이제 로그인 해주세요.');
                setIsLogin(true); 
                setUserId('');
                setPassword('');
                setDisplayName('');

            } else {
                // 🚨 [수정됨] 주소 앞에 API_URL 추가
                const response = await axios.post(`${API_URL}/api/auth/login`, { 
                    userId, 
                    password 
                }, axiosConfig);

                const token = response.data.token;
                
                if (!token || token === 'undefined' || token === 'null') {
                    throw new Error('서버에서 유효한 토큰을 받지 못했습니다.');
                }

                let finalDisplayName = response.data.displayName || response.data.userId;
                if (!finalDisplayName || finalDisplayName === 'Diary Keeper') {
                    finalDisplayName = userId;
                }

                localStorage.setItem('diaryToken', token); 
                localStorage.setItem('username', finalDisplayName); 

                setMessage(`Welcome back, ${finalDisplayName}!`);
                
                setTimeout(() => {
                    navigate('/diary'); 
                }, 1000);
            }

        } catch (error: any) {
            console.error("Auth Error:", error); 
            if (error.response) {
                setMessage(`Error: ${error.response.data.message}`);
            } else {
                setMessage(error.message || '서버 연결에 실패했습니다.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page-wrapper">
            {/* Canvas Container */}
            <div className="canvas-container">
                <Canvas 
                    camera={{ position: [0, 0, 1] }} 
                    style={{ width: '100%', height: '100%' }}
                >
                    <BackgroundPlane texturePath={LOGIN_BG_PATH} />
                    <StarsBackground /> 
                    <ambientLight intensity={0.5} />
                </Canvas>
            </div>

            <div className="auth-content-container">
                <div className="auth-card glass-panel">
                    {/* 왼쪽: 가이드 섹션 */}
                    <div className="guide-section">
                        <h1 className="luxury-title">{usageText.title}</h1>
                        <h2 className="luxury-subtitle">{usageText.subtitle}</h2>
                        <ul className="guide-list">
                            {usageText.instructions.map((line, index) => (
                                <li key={index}>{line}</li>
                            ))}
                        </ul>
                        
                        {/* ✨ 태그 섹션 (수정됨) */}
                        <div className="shining-tags-container">
                            <span className="shining-tag">#기억</span>
                            <span className="shining-tag">#본질</span>
                            <span className="shining-tag">#감정</span>
                            <span className="shining-tag">#성장</span>
                        </div>
                    </div>

                    {/* 오른쪽: 폼 섹션 */}
                    <div className="form-section">
                        <h3 className="form-title">{isLogin ? 'Login' : 'Sign Up'}</h3>

                        {message && <p className={`message ${message.includes('Error') || message.includes('실패') ? 'error' : 'success'}`}>{message}</p>} 

                        <form onSubmit={handleSubmit}>
                            {!isLogin && (
                                <input
                                    className="glass-input"
                                    type="text"
                                    placeholder="Nickname (Optional)"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                />
                            )}
                            <input
                                className="glass-input"
                                type="text" 
                                placeholder="ID" 
                                value={userId} 
                                onChange={(e) => setUserId(e.target.value)} 
                                required
                            />
                            <input
                                className="glass-input"
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button type="submit" className="submit-btn" disabled={isLoading}>
                                {isLoading ? 'Processing...' : (isLogin ? 'Enter Diary' : 'Join Universe')}
                            </button>
                        </form>
                        
                        <button 
                            className="toggle-btn" 
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setMessage(''); 
                                setUserId(''); 
                                setPassword('');
                            }}
                            disabled={isLoading}
                        >
                            {isLogin ? "처음 오셨나요? Create Account" : "이미 계정이 있나요? Login"}
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                /* 폰트 로드 */
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@200;400;600;800&display=swap');
                @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

                .auth-page-wrapper {
                    position: relative;
                    width: 100%;
                    height: 100vh;
                    overflow-y: auto;
                    overflow-x: hidden;
                    -webkit-overflow-scrolling: touch;
                    background-color: #000000;
                    color: white;
                    font-family: 'Outfit', 'Pretendard', sans-serif;
                }

                .canvas-container {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 0;
                    pointer-events: none;
                }

                .auth-content-container {
                    position: relative;
                    z-index: 10;
                    width: 100%;
                    min-height: 100%;
                    padding: 40px 20px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    box-sizing: border-box;
                }

                /* --- Glass Panel (Luxury & Cute) --- */
                .auth-card {
                    display: flex;
                    flex-direction: row;
                    /* 🔥 배경 투명도 증가 (0.65 -> 0.35) */
                    background: rgba(10, 10, 15, 0.35);
                    /* 블러 효과 약간 감소하여 배경 더 선명하게 */
                    backdrop-filter: blur(15px);
                    -webkit-backdrop-filter: blur(15px);
                    border-radius: 50px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3); /* 그림자도 약간 연하게 */
                    overflow: hidden;
                    max-width: 1000px;
                    width: 100%;
                    animation: floatUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
                }

                @keyframes floatUp {
                    from { opacity: 0; transform: translateY(30px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }

                /* --- Guide Section --- */
                .guide-section {
                    flex: 1.1;
                    padding: 60px;
                    /* 섹션 배경도 더 투명하게 */
                    background: linear-gradient(135deg, rgba(255,255,255,0.02) 0%, transparent 100%);
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    border-right: 1px solid rgba(255, 255, 255, 0.08);
                }

                .luxury-title {
                    font-size: 3rem;
                    margin-bottom: 10px;
                    font-weight: 800;
                    letter-spacing: -1px;
                    background: linear-gradient(135deg, #fff 0%, #e0e0e0 50%, #a8edea 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    filter: drop-shadow(0 0 15px rgba(255,255,255,0.2));
                }

                .luxury-subtitle {
                    font-size: 1.3rem;
                    margin-bottom: 30px;
                    color: rgba(255, 255, 255, 0.6);
                    font-weight: 600;
                    letter-spacing: 1px;
                }

                .guide-list {
                    padding-left: 0;
                    list-style: none;
                    margin-bottom: 50px;
                }

                .guide-list li {
                    margin-bottom: 15px;
                    font-size: 1.05rem;
                    color: rgba(255, 255, 255, 0.85);
                    font-weight: 300;
                    line-height: 1.6;
                    display: flex;
                    align-items: center;
                }
                
                .guide-list li::before {
                    content: '✦';
                    color: #a8edea;
                    margin-right: 12px;
                    font-size: 0.8rem;
                }

                /* ✨ Tags Style (수정됨: 단일 색상 고정) */
                .shining-tags-container {
                    display: flex;
                    gap: 15px;
                    flex-wrap: wrap;
                }

                .shining-tag {
                    font-size: 1rem;
                    font-weight: 700;
                    letter-spacing: 1px;
                    
                    /* 🔥 애니메이션 및 그라데이션 제거, 단일 색상 적용 */
                    color: #f0e6d2; /* 고급스러운 크림 골드 색상 */
                    text-shadow: 0 0 8px rgba(240, 230, 210, 0.4); /* 은은한 고정 빛 번짐 */
                }

                /* --- Form Section --- */
                .form-section {
                    flex: 1;
                    padding: 60px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    /* 폼 섹션 배경도 더 투명하게 */
                    background: rgba(0,0,0,0.1);
                }

                .form-title {
                    font-size: 2.2rem;
                    margin-bottom: 30px;
                    color: white;
                    font-weight: 600;
                }

                .form-section form {
                    width: 100%;
                    max-width: 320px;
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }

                .glass-input {
                    padding: 18px 25px;
                    border-radius: 50px;
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    /* 입력창 배경도 더 투명하게 */
                    background: rgba(255, 255, 255, 0.03);
                    color: white;
                    font-size: 1rem;
                    font-family: 'Outfit', sans-serif;
                    transition: all 0.3s ease;
                }

                .glass-input:focus {
                    outline: none;
                    border-color: rgba(255, 255, 255, 0.5);
                    background: rgba(255, 255, 255, 0.08);
                    box-shadow: 0 0 20px rgba(255, 255, 255, 0.05);
                    transform: scale(1.02);
                }
                .glass-input::placeholder { color: rgba(255, 255, 255, 0.3); }

                .submit-btn {
                    margin-top: 10px;
                    padding: 18px;
                    border-radius: 50px;
                    border: none;
                    background: linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%);
                    color: #1a1a2e;
                    font-weight: 700;
                    font-size: 1.1rem;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                    box-shadow: 0 5px 15px rgba(142, 197, 252, 0.3);
                }

                .submit-btn:hover:not(:disabled) {
                    transform: translateY(-3px) scale(1.03);
                    box-shadow: 0 10px 25px rgba(142, 197, 252, 0.5);
                }
                
                .toggle-btn {
                    margin-top: 25px;
                    background: none;
                    border: none;
                    color: rgba(255, 255, 255, 0.6);
                    cursor: pointer;
                    font-size: 0.95rem;
                    font-family: 'Outfit', sans-serif;
                    transition: color 0.3s;
                }
                .toggle-btn:hover {
                    color: white;
                    text-decoration: underline;
                    text-underline-offset: 4px;
                }

                .message {
                    width: 100%;
                    max-width: 320px;
                    padding: 15px;
                    border-radius: 20px;
                    margin-bottom: 20px;
                    text-align: center;
                    font-size: 0.95rem;
                    backdrop-filter: blur(5px);
                }
                .success { 
                    background: rgba(74, 222, 128, 0.15); 
                    color: #4ade80; 
                    border: 1px solid rgba(74, 222, 128, 0.3); 
                }
                .error { 
                    background: rgba(248, 113, 113, 0.15); 
                    color: #f87171; 
                    border: 1px solid rgba(248, 113, 113, 0.3); 
                }

                @media (max-width: 900px) {
                      .auth-card {
                        flex-direction: column;
                        max-width: 500px;
                        border-radius: 40px;
                      }
                      .guide-section {
                        padding: 40px 30px;
                        border-right: none;
                        border-bottom: 1px solid rgba(255,255,255,0.1);
                        text-align: center;
                      }
                      .guide-list li { justify-content: center; }
                      /* 모바일에서 태그들도 중앙 정렬 */
                      .shining-tags-container { justify-content: center; }
                      .form-section { padding: 40px 30px; }
                }

                @media (max-width: 600px) {
                    .auth-content-container { padding: 20px; }
                    .luxury-title { font-size: 2.2rem; }
                    .form-title { font-size: 1.8rem; }
                }
            `}</style>
        </div>
    );
};

export default AuthPage;