require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// ==========================================
// 1. 보안 및 통신 설정 (CORS)
// ==========================================
app.use(cors({
    origin: [
        'https://infinite-diary-frontend.onrender.com', // 배포된 프론트엔드 주소
        'http://localhost:5173', // 로컬 Vite 개발 주소
        'http://localhost:3000'  // 로컬 React 개발 주소
    ],
    credentials: true, // 쿠키/토큰 주고받기 허용
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json());

// ==========================================
// 2. 데이터베이스 연결
// ==========================================
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected Successfully'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// ==========================================
// 3. 라우트 연결 (여기가 제일 중요!!)
// ==========================================

// (1) 로그인/회원가입 기능 연결
// 파일명이 routes/auth.js 인지 꼭 확인하세요!
const authRoutes = require('./routes/auth'); 
app.use('/api/auth', authRoutes); // -> 주소: /api/auth/login

// (2) 일기 기능 연결
const diaryRoutes = require('./routes/diaryRoutes');
app.use('/api/diary', diaryRoutes); // -> 주소: /api/diary/month/...

// 기본 주소 확인용
app.get('/', (req, res) => res.send('Infinite Diary Backend Running! 🚀'));

// ==========================================
// 4. 서버 실행
// ==========================================
// 로컬에서는 5000번 포트 강제 사용 (프론트엔드랑 겹치지 않게)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});