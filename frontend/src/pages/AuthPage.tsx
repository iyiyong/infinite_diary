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
            // 🚨 쿠키/헤더 설정
            const axiosConfig = {
                withCredentials: true, 
                headers: { 'Content-Type': 'application/json' }
            };

            if (!isLogin) {
                // 회원가입
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
                // 로그인
                const response = await axios.post(`/api/auth/login`, { 
                    userId, 
                    password 
                }, axiosConfig);

                console.log('Login Response:', response.data);

                // 🚨 [핵심 수정] 환영 메시지 로직 개선
                let finalDisplayName = response.data.displayName || response.data.userId;
                
                // 만약 서버 데이터가 없거나 기본값이면, 입력한 아이디를 사용
                if (!finalDisplayName || finalDisplayName === 'Diary Keeper') {
                    finalDisplayName = userId;
                }

                const token = response.data.token;
                localStorage.setItem('diaryToken', token); 
                localStorage.setItem('username', finalDisplayName); 

                // 🎉 이제 "Welcome back, 육성지!" 처럼 나옵니다.
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
                setMessage('서버 연결에 실패했습니다.');
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
                    /* 모바일 스크롤 고려 */
                    height: 100%;
                    overflow-y: auto;
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
                    /* PC 애니메이션 */
                    animation: fadeIn 0.8s ease-out;
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
                    transition: all 0.3s;
                }

                .form-section input:focus {
                    outline: none;
                    border-color: #00BFFF;
                    box-shadow: 0 0 15px rgba(0, 191, 255, 0.4);
                    background: rgba(255, 255, 255, 0.15);
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

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* 📱 모바일 반응형 스타일 (Mobile) */
                @media (max-width: 768px) {
                    .auth-page-wrapper {
                        align-items: flex-start;
                        height: auto;
                        min-height: 100vh;
                        background-color: rgb(10, 10, 20); /* 배경색 강제 적용 (캔버스 로드 전 깜빡임 방지) */
                    }

                    .auth-content-container {
                        padding: 15px;
                        margin-top: 0; /* 모바일에서 위쪽 여백 제거 */
                        margin-bottom: 20px;
                        align-items: center; /* 중앙 정렬 */
                    }

                    .auth-card {
                        flex-direction: column;
                        max-width: 100%;
                        margin-top: 20px;
                        margin-bottom: 40px; /* 하단 여백 확보 */
                        border-radius: 15px; /* 모바일에서 둥글기 살짝 조정 */
                    }

                    .guide-section {
                        padding: 30px 20px;
                        border-right: none;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                        text-align: center;
                    }

                    .neon-blue-title {
                        font-size: 2.2rem; /* 제목 크기 줄임 */
                        margin-bottom: 15px;
                    }
                    
                    .guide-section h2 {
                        font-size: 1.4rem;
                        margin-bottom: 20px;
                    }

                    .guide-section ul {
                        text-align: left;
                        display: inline-block;
                        padding-left: 0;
                        list-style-position: inside;
                        margin-bottom: 20px;
                    }
                    
                    .guide-section li {
                        font-size: 1rem; /* 리스트 폰트 줄임 */
                        margin-bottom: 8px;
                    }

                    .form-section {
                        padding: 30px 20px; /* 패딩 축소 */
                        min-width: auto; /* 최소 너비 해제 */
                    }

                    .form-section h3 {
                        font-size: 2rem; /* 로그인 제목 줄임 */
                        margin-bottom: 25px;
                    }

                    .form-section input {
                        padding: 15px; /* 입력창 높이 조정 */
                        font-size: 1rem;
                    }

                    .form-section button[type="submit"] {
                        padding: 15px; /* 버튼 높이 조정 */
                        font-size: 1.1rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default AuthPage;