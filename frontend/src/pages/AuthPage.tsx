import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import StarsBackground from '../components/StarsBackground';
import BackgroundPlane from '../components/weather/BackgroundPlane'; 

const LOGIN_BG_PATH = '/images/login_bg.png';

const usageText = {
    title: "INFINITE DIARY",
    subtitle: "사용법",
    instructions: [
        "오늘 하루를 명상하라.",
        "회원가입 시 어떤 문자든 사용할 수 있다.",
        "처음 선택한 날씨에 따라 배경이 변화한다.",
        "거짓말은 절대 쓰지 않는다. 솔직해야 한다.",
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
            if (!isLogin) {
                // 회원가입
                await axios.post(`/api/auth/register`, {
                    userId,
                    password,
                    displayName: displayName || undefined, 
                });

                setMessage('Sign Up Successful! Please Login.');
                setIsLogin(true); 
                setUserId('');
                setPassword('');
                setDisplayName('');

            } else {
                // 로그인
                const response = await axios.post(`/api/auth/login`, { userId, password });

                const token = response.data.token;
                localStorage.setItem('diaryToken', token); 
                localStorage.setItem('username', response.data.displayName); 

                setMessage(`Welcome back, ${response.data.displayName}!`);
                
                setTimeout(() => {
                    navigate('/diary'); 
                }, 1000);
            }

        } catch (error: any) {
            if (error.response) {
                setMessage(`Error: ${error.response.data.message}`);
            } else {
                setMessage('Unknown Error. Please check server status.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page-wrapper">
            <Canvas 
                camera={{ position: [0, 0, 1] }} 
                style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    zIndex: 1, 
                    width: '100%', 
                    height: '100%',
                    backgroundColor: 'rgb(10, 10, 20)', 
                }} 
            >
                <BackgroundPlane texturePath={LOGIN_BG_PATH} />
                <StarsBackground /> 
                <ambientLight intensity={0.5} />
            </Canvas>

            <div className="auth-content-container">
                <div className="auth-card">
                    {/* 왼쪽: 사용법 가이드 */}
                    <div className="guide-section">
                        <h1 className="neon-blue-title">{usageText.title}</h1>
                        <h2>{usageText.subtitle}</h2>
                        <ul>
                            {usageText.instructions.map((line, index) => (
                                <li key={index}>{line}</li>
                            ))}
                        </ul>
                        <p className="tags neon-yellow-text">#기억 #본질 #감정 #성장 #기록</p>
                    </div>

                    {/* 오른쪽: 로그인/회원가입 폼 */}
                    <div className="form-section">
                        {/* 🔑 "로그인" -> "Login", "회원가입" -> "Sign Up"으로 변경 */}
                        <h3>{isLogin ? 'Login' : 'Sign Up'}</h3>

                        {message && <p className={`message ${message.includes('Error') || message.includes('실패') ? 'error' : 'success'}`}>{message}</p>} 

                        <form onSubmit={handleSubmit}>
                            {!isLogin && (
                                <input
                                    type="text"
                                    placeholder="Nickname (Optional)"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                />
                            )}
                            <input
                                type="text" 
                                placeholder="User ID" 
                                value={userId} 
                                onChange={(e) => setUserId(e.target.value)} 
                                required
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button type="submit" disabled={isLoading}>
                                {isLoading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
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
                            {isLogin ? "처음 오셨나요? 회원가입" : "환영합니다! 시작하기"}
                        </button>
                    </div>
                </div>
            </div>

            {/* CSS 스타일 (디자인 개선) */}
            <style>{`
                .auth-page-wrapper {
                    position: relative;
                    width: 100%;
                    min-height: 100vh;
                    overflow: hidden;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    color: white;
                    font-family: sans-serif;
                }

                .auth-content-container {
                    position: relative;
                    z-index: 10;
                    width: 100%;
                    padding: 20px;
                    display: flex;
                    justify-content: center;
                }

                .auth-card {
                    display: flex;
                    flex-direction: row;
                    background: rgba(10, 10, 20, 0.85); /* 배경을 좀 더 어둡게 */
                    backdrop-filter: blur(12px);
                    border-radius: 20px;
                    border: 1px solid rgba(0, 100, 255, 0.3); /* 테두리도 파란빛 */
                    box-shadow: 0 0 50px rgba(0, 0, 0, 0.7);
                    overflow: hidden;
                    max-width: 1100px; /* 카드 너비 확장 */
                    width: 100%;
                }

                .guide-section {
                    flex: 1.2; /* 가이드 섹션을 조금 더 넓게 */
                    padding: 50px;
                    background: linear-gradient(135deg, rgba(0, 20, 50, 0.4) 0%, rgba(0, 0, 0, 0.4) 100%);
                    border-right: 1px solid rgba(255, 255, 255, 0.1);
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }

                /* 🔑 1. 찐한 빛나는 파랑 (Neon Blue) 제목 */
                .neon-blue-title {
                    font-size: 3.5rem; /* 글씨 크기 키움 */
                    margin-bottom: 20px;
                    color: #00BFFF; /* Deep Sky Blue */
                    text-shadow: 
                        0 0 10px #00BFFF,
                        0 0 20px #00BFFF,
                        0 0 40px #0000FF; /* 파란색 네온 효과 */
                    font-weight: 800;
                    letter-spacing: 2px;
                }

                .guide-section h2 {
                    font-size: 1.8rem;
                    margin-bottom: 25px;
                    color: #ffcc00;
                    text-shadow: 0 0 5px rgba(255, 204, 0, 0.5);
                }

                .guide-section ul {
                    padding-left: 20px;
                    margin-bottom: 40px;
                }

                .guide-section li {
                    margin-bottom: 12px;
                    line-height: 1.7;
                    font-size: 1.2rem; /* 본문 글씨 크기 키움 */
                    color: #f0f0f0;
                    font-weight: 500;
                }

                /* 🔑 2. 노란색으로 빛나는 태그 */
                .neon-yellow-text {
                    color: #FFD700; /* Gold */
                    font-style: italic;
                    font-size: 1.1rem;
                    font-weight: bold;
                    text-shadow: 0 0 8px rgba(255, 215, 0, 0.8);
                }

                .form-section {
                    flex: 1;
                    padding: 50px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    min-width: 350px;
                }

                .form-section h3 {
                    font-size: 2.5rem; /* 로그인 제목 크기 키움 */
                    margin-bottom: 35px;
                    color: white;
                    text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
                }

                .form-section form {
                    width: 100%;
                    max-width: 380px;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .form-section input {
                    padding: 18px; /* 입력창 크기 키움 */
                    border-radius: 10px;
                    border: 1px solid #555;
                    background: rgba(255, 255, 255, 0.08);
                    color: white;
                    font-size: 1.1rem;
                }

                .form-section input:focus {
                    outline: none;
                    border-color: #00BFFF; /* 포커스 시 파란색 */
                    box-shadow: 0 0 10px rgba(0, 191, 255, 0.3);
                }

                .form-section button[type="submit"] {
                    padding: 18px;
                    border-radius: 10px;
                    border: none;
                    /* 버튼도 파란색 계열로 변경하여 통일감 */
                    background: linear-gradient(45deg, #00BFFF, #1E90FF);
                    color: white;
                    font-weight: bold;
                    font-size: 1.3rem;
                    cursor: pointer;
                    margin-top: 15px;
                    transition: transform 0.2s, box-shadow 0.2s;
                    box-shadow: 0 4px 15px rgba(0, 191, 255, 0.3);
                }

                .form-section button[type="submit"]:hover {
                    transform: scale(1.02);
                    box-shadow: 0 6px 20px rgba(0, 191, 255, 0.5);
                }

                .toggle-btn {
                    margin-top: 25px;
                    background: none;
                    border: none;
                    color: #aaa;
                    cursor: pointer;
                    text-decoration: underline;
                    font-size: 1rem;
                }
                .toggle-btn:hover {
                    color: #fff;
                }

                .message {
                    width: 100%;
                    max-width: 380px;
                    padding: 12px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    text-align: center;
                    font-size: 1rem;
                    font-weight: bold;
                }
                .success { background: rgba(0, 255, 204, 0.15); color: #00ffcc; }
                .error { background: rgba(255, 69, 0, 0.15); color: #ff4500; }

                /* 📱 모바일 반응형 스타일 (Mobile) */
                @media (max-width: 768px) {
                    .auth-page-wrapper {
                        align-items: flex-start;
                        height: auto;
                        overflow-y: auto;
                    }

                    .auth-content-container {
                        padding: 15px;
                        margin-top: 20px;
                        margin-bottom: 40px;
                    }

                    .auth-card {
                        flex-direction: column;
                        max-width: 100%;
                    }

                    .guide-section {
                        padding: 30px 20px;
                        border-right: none;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                        text-align: center;
                    }

                    .neon-blue-title {
                        font-size: 2.5rem; /* 모바일에서 제목 크기 조정 */
                    }
                    
                    .guide-section ul {
                        text-align: left;
                        display: inline-block;
                        padding-left: 0; /* 모바일에서 들여쓰기 제거 */
                        list-style-position: inside;
                    }
                    
                    .guide-section li {
                        font-size: 1.1rem;
                    }

                    .form-section {
                        padding: 40px 20px;
                    }
                }
            `}</style>
        </div>
    );
};

export default AuthPage;