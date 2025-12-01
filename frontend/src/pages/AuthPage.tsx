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
            const axiosConfig = {
                withCredentials: true, 
                headers: { 'Content-Type': 'application/json' }
            };

            if (!isLogin) {
                await axios.post(`/api/auth/register`, {
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
                const response = await axios.post(`/api/auth/login`, { 
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
            {/* Canvas Container: Fixed background that stays put while scrolling */}
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
                <div className="auth-card">
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

                    <div className="form-section">
                        <h3>{isLogin ? 'Login' : 'Sign Up'}</h3>

                        {message && <p className={`message ${message.includes('Error') || message.includes('실패') ? 'error' : 'success'}`}>{message}</p>} 

                        <form onSubmit={handleSubmit}>
                            {!isLogin && (
                                <input
                                    type="text"
                                    placeholder="닉네임 (선택사항)"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                />
                            )}
                            <input
                                type="text" 
                                placeholder="아이디" 
                                value={userId} 
                                onChange={(e) => setUserId(e.target.value)} 
                                required
                            />
                            <input
                                type="password"
                                placeholder="비밀번호"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button type="submit" disabled={isLoading}>
                                {isLoading ? '처리 중...' : (isLogin ? '로그인' : '회원가입')}
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

            <style>{`
                /* Wrapper handles scrolling, Canvas is fixed behind it */
                .auth-page-wrapper {
                    position: relative;
                    width: 100%;
                    height: 100vh;
                    overflow-y: auto; /* Enable vertical scroll */
                    overflow-x: hidden;
                    -webkit-overflow-scrolling: touch; /* Smooth scroll on iOS */
                    background-color: rgb(10, 10, 20);
                    color: white;
                    font-family: sans-serif;
                }

                .canvas-container {
                    position: fixed; /* Fixes background */
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 0;
                    pointer-events: none; /* Let clicks pass through if needed */
                }

                .auth-content-container {
                    position: relative;
                    z-index: 10;
                    width: 100%;
                    min-height: 100%;
                    padding: 40px 20px; /* Add padding for scroll breathing room */
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    box-sizing: border-box;
                }

                .auth-card {
                    display: flex;
                    flex-direction: row;
                    /* Glassmorphism: Transparent background to show stars */
                    background: rgba(15, 25, 40, 0.45); 
                    backdrop-filter: blur(10px); /* Blurs the background elements slightly for readability */
                    -webkit-backdrop-filter: blur(10px);
                    border-radius: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
                    overflow: hidden;
                    max-width: 1100px;
                    width: 100%;
                    animation: fadeIn 0.8s ease-out;
                }

                .guide-section {
                    flex: 1.2;
                    padding: 50px;
                    /* Gradient overlay for text contrast but still transparent */
                    background: linear-gradient(135deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.0) 100%);
                    border-right: 1px solid rgba(255, 255, 255, 0.1);
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }

                .neon-blue-title {
                    font-size: 3.5rem;
                    margin-bottom: 20px;
                    color: #00BFFF;
                    text-shadow: 0 0 10px #00BFFF, 0 0 20px #00BFFF, 0 0 40px #0000FF;
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
                    font-size: 1.2rem;
                    color: rgba(255, 255, 255, 0.9);
                    font-weight: 500;
                }

                .neon-yellow-text {
                    color: #FFD700;
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
                    background: rgba(0,0,0,0.2); /* Slight darkening for form area */
                }

                .form-section h3 {
                    font-size: 2.5rem;
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
                    padding: 18px;
                    border-radius: 10px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                    font-size: 1.1rem;
                    transition: all 0.3s;
                }

                .form-section input:focus {
                    outline: none;
                    border-color: #00BFFF;
                    box-shadow: 0 0 15px rgba(0, 191, 255, 0.4);
                    background: rgba(255, 255, 255, 0.2);
                }

                .form-section button[type="submit"] {
                    padding: 18px;
                    border-radius: 10px;
                    border: none;
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
                    color: rgba(255, 255, 255, 0.7);
                    cursor: pointer;
                    text-decoration: underline;
                    font-size: 1rem;
                }
                .toggle-btn:hover { color: #fff; }

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
                .success { background: rgba(0, 255, 204, 0.2); color: #00ffcc; border: 1px solid rgba(0, 255, 204, 0.3); }
                .error { background: rgba(255, 69, 0, 0.2); color: #ff4500; border: 1px solid rgba(255, 69, 0, 0.3); }

                @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

                /* --- Mobile / Responsive Tweaks --- */
                @media (max-width: 900px) {
                     .auth-card {
                        flex-direction: column;
                        max-width: 600px;
                     }
                     .guide-section {
                        border-right: none;
                        border-bottom: 1px solid rgba(255,255,255,0.1);
                        padding: 40px 30px;
                     }
                }

                @media (max-width: 600px) {
                    .auth-content-container {
                        padding: 20px 15px;
                        align-items: flex-start; /* Start from top on mobile to allow scrolling down */
                    }
                    
                    .auth-card {
                        margin-top: 20px;
                        margin-bottom: 40px; /* Space at bottom for scrolling */
                        background: rgba(15, 25, 40, 0.6); /* Slightly darker on mobile for better text readability */
                        backdrop-filter: blur(8px);
                    }

                    .guide-section {
                        padding: 30px 20px;
                        text-align: center;
                    }
                    
                    .neon-blue-title { font-size: 2.5rem; }
                    .guide-section h2 { font-size: 1.5rem; }
                    .guide-section ul { 
                        display: inline-block; 
                        text-align: left; 
                        padding-left: 0;
                        list-style-position: inside;
                    }
                    .guide-section li { font-size: 1.1rem; }

                    .form-section {
                        padding: 30px 20px;
                        min-width: auto;
                    }
                    .form-section h3 { font-size: 2rem; }
                    .form-section input { font-size: 1rem; padding: 15px; }
                }
            `}</style>
        </div>
    );
};

export default AuthPage;