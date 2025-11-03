// infinite_diary/frontend/src/pages/AuthPage.tsx

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// 🔑 수정: 환경 변수에서 API 주소를 가져옵니다.
const API_URL = import.meta.env.VITE_API_URL; 

const usageText = {
    title: "INFINITE_DIARY",
    subtitle: "사용법",
    instructions: [
        "오늘하루를 되돌아 본다",
        "배울점을 찾고 하루를 기록하며 성장을 도모한다",
        "회원가입 규칙은 아이디는 영어 비밀번호는 숫자가 보편적이다",
        "매일매일 그날에 일기를 기록할수있다",
        "기록하고 하루가 지나면 영구적으로 저장된다",
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
                await axios.post(`${API_URL}/api/auth/register`, {
                    userId,
                    password,
                    displayName: displayName || undefined, 
                });

                setMessage('회원가입 성공! 이제 로그인할 수 있습니다.');
                setIsLogin(true); 
                setUserId('');
                setPassword('');
                setDisplayName('');

            } else {
                // 로그인
                const response = await axios.post(`${API_URL}/api/auth/login`, { userId, password });

                const token = response.data.token;
                localStorage.setItem('diaryToken', token); 
                localStorage.setItem('username', response.data.displayName); 

                setMessage(`로그인 성공! 환영합니다, ${response.data.displayName}님!`);
                
                setTimeout(() => {
                    navigate('/'); 
                }, 1000);
            }

        } catch (error: any) {
            if (error.response) {
                setMessage(`오류: ${error.response.data.message}`);
            } else {
                setMessage('알 수 없는 오류가 발생했습니다. 서버 상태를 확인하세요.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="usage-guide">
                <h1>{usageText.title}</h1>
                <h2>{usageText.subtitle}</h2>
                <ul>
                    {usageText.instructions.map((line, index) => (
                        <li key={index}>{line}</li>
                    ))}
                </ul>
                <p className="floating-tag">#기억 #본질 #감정 #성장 #기록</p>
            </div>

            <div className="auth-form-box">
                <h3>{isLogin ? '로그인' : '회원가입'}</h3>

                {message && <p className={`message ${message.startsWith('오류') ? 'error-message' : 'success-message'}`}>{message}</p>} 

                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <input
                            type="text"
                            placeholder="닉네임 (선택 사항)"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                        />
                    )}
                    <input
                        type="text" 
                        placeholder="사용자 ID" 
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
                        {isLoading ? '처리 중...' : (isLogin ? '로그인' : '가입하기')}
                    </button>
                </form>
                <button 
                    className="toggle-button" 
                    onClick={() => {
                        setIsLogin(!isLogin);
                        setMessage(''); 
                        setUserId(''); 
                        setPassword('');
                    }}
                    disabled={isLoading}
                >
                    {isLogin ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
                </button>
            </div>
        </div>
    );
};

export default AuthPage;