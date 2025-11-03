const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// 🔑 라우트 파일들을 한 번만 불러옵니다.
const authRoutes = require('./routes/auth'); 
const diaryRoutes = require('./routes/diaryRoutes');

// 환경 변수 로드 (가장 먼저 실행되어야 합니다)
require('dotenv').config(); 

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL;

// ===================================
// 1. 핵심 미들웨어 등록 (순서 중요!)
// ===================================

// 🔑 CORS를 가장 먼저 적용하여 모든 요청에 대해 CORS 헤더를 설정합니다. (오류 해결)
const corsOptions = {
    origin: CLIENT_URL,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
};
app.use(cors(corsOptions));

// JSON 본문 파싱을 적용합니다.
app.use(express.json()); 

// ===================================
// 2. 라우터 연결 영역 (DB 연결이 성공하기 전에 정의)
// ===================================

// 초기 테스트용 라우트
app.get('/', (req, res) => {
    res.send('infinite_diary 백엔드 서버가 작동 중입니다.');
});

// 🔑 인증 라우트를 /api/auth 경로로 연결합니다. (중복 제거)
app.use('/api/auth', authRoutes); 

// 🔑 일기 라우트를 /api/diary 경로로 연결합니다. (중복 제거)
app.use('/api/diary', diaryRoutes);


// ===================================
// 3. 데이터베이스 연결 및 서버 시작 (안정성 강화)
// ===================================

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB 연결 성공: infinite_diary_db'); 
        
        // 🚀 DB 연결 성공 시에만 서버를 시작하여 안정성을 확보합니다.
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`CORS Client URL: ${CLIENT_URL}`);
        });
    })
    .catch(err => {
        console.error('❌ MongoDB 연결 오류:', err.message);
        console.error('⚠️ 환경 변수 MONGO_URI와 로컬 DB 서버 실행 상태를 확인하세요.');
    });