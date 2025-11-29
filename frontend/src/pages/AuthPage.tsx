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
            // 🚨 [핵심 수정 1] 쿠키를 확실하게 주고받기 위한 설정 객체
            const axiosConfig = {
                withCredentials: true, // 배포 환경에서 필수! (쿠키 허용)
                headers: { 'Content-Type': 'application/json' }
            };

            if (!isLogin) {
                // 회원가입
                await axios.post(`/api/auth/register`, {
                    userId,
                    password,
                    displayName: displayName || 'Diary Keeper', // 이름 없으면 기본값 설정
                }, axiosConfig); // 👈 여기에 설정 추가

                setMessage('Sign Up Successful! Please Login.');
                setIsLogin(true); 
                setUserId('');
                setPassword('');
                setDisplayName('');

            } else {
                // 로그인
                const response = await axios.post(`/api/auth/login`, { 
                    userId, 
                    password 
                }, axiosConfig); // 👈 🚨 여기에 설정 추가 (이게 없어서 안 된 겁니다!)

                // 디버깅용 로그 (F12 콘솔에서 확인 가능)
                console.log('Login Response:', response.data);

                // 🚨 [핵심 수정 2] undefined 방지 로직
                // 서버에서 이름이 안 오면 userId를 대신 사용
                const finalDisplayName = response.data.displayName || response.data.userId || 'User';

                const token = response.data.token;
                // 로컬 스토리지에는 참고용으로만 저장 (실제 인증은 쿠키가 함)
                localStorage.setItem('diaryToken', token); 
                localStorage.setItem('username', finalDisplayName); 

                setMessage(`Welcome back, ${finalDisplayName}!`);
                
                setTimeout(() => {
                    navigate('/diary'); 
                }, 1000);
            }

        } catch (error: any) {
            console.error("Auth Error:", error); // 에러 로그 출력
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

            {/* CSS 스타일 */}
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
                    background: rgba(10, 10, 20, 0.85);
                    backdrop-filter: blur(12px);
                    border-radius: 20px;
                    border: 1px solid rgba(0, 100, 255, 0.3);
                    box-shadow: 0 0 50px rgba(0, 0, 0, 0.7);
                    overflow: hidden;
                    max-width: 1100px;
                    width: 100%;
                }

                .guide-section {
                    flex: 1.2;
                    padding: 50px;
                    background: linear-gradient(135deg, rgba(0, 20, 50, 0.4) 0%, rgba(0, 0, 0, 0.4) 100%);
                    border-right: 1px solid rgba(255, 255, 255, 0.1);
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }

                .neon-blue-title {
                    font-size: 3.5rem;
                    margin-bottom: 20px;
                    color: #00BFFF;
                    text-shadow: 
                        0 0 10px #00BFFF,
                        0 0 20px #00BFFF,
                        0 0 40px #0000FF;
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
                    color: #f0f0f0;
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
                    border: 1px solid #555;
                    background: rgba(255, 255, 255, 0.08);
                    color: white;
                    font-size: 1.1rem;
                }

                .form-section input:focus {
                    outline: none;
                    border-color: #00BFFF;
                    box-shadow: 0 0 10px rgba(0, 191, 255, 0.3);
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
                        font-size: 2.5rem;
                    }
                    
                    .guide-section ul {
                        text-align: left;
                        display: inline-block;
                        padding-left: 0;
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