require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// ==========================================
// 1. 보안 및 CORS 설정 (배포 주소 허용)
// ==========================================
app.use(cors({
    origin: [
        'https://infinite-diary-frontend.onrender.com', // 프론트엔드 배포 주소
        'http://localhost:5173', // 로컬 Vite
        'http://localhost:3000'  // 로컬 CRA
    ],
    credentials: true,
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
// 3. 라우트 설정 (가장 중요한 부분)
// ==========================================
const diaryRoutes = require('./routes/diaryRoutes');

// 프론트엔드가 '/api/diary'로 요청하므로 여기서도 'diary'로 받습니다.
app.use('/api/diary', diaryRoutes);

// 서버 상태 확인용 (브라우저에서 백엔드 주소 접속 시 확인 가능)
app.get('/', (req, res) => {
    res.send('Infinite Diary Backend is Running! 🚀');
});

// ==========================================
// 4. 서버 실행
// ==========================================
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});