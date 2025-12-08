// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// ==========================================
// [중요] 배포 환경에 맞춘 CORS 설정
// ==========================================
const allowedOrigins = [
  'https://infinite-diary-frontend.onrender.com', // 프론트엔드 배포 주소
  'http://localhost:3000', // 로컬 개발용 (테스트 시 필요)
  'http://localhost:5173'  // Vite 사용 시 로컬 주소 (필요하다면)
];

app.use(cors({
  origin: function (origin, callback) {
    // origin이 없거나(서버끼리 통신) 허용된 리스트에 있으면 통과
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS 정책에 의해 차단되었습니다.'));
    }
  },
  credentials: true // 쿠키/세션 정보 전달 허용
}));

app.use(express.json()); // JSON 데이터 파싱

// ==========================================
// DB 연결 (MongoDB)
// ==========================================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch(err => console.error('MongoDB Connection Error:', err));


// ==========================================
// 라우트 (기존 기능 유지)
// ==========================================
// 예시 라우트입니다. 작성하신 diaryRoutes 파일이 있다면 그대로 사용하세요.
const diaryRoutes = require('./routes/diaryRoutes'); // 경로가 맞는지 확인하세요
app.use('/api/diaries', diaryRoutes);


// ==========================================
// 서버 실행
// ==========================================
const PORT = process.env.PORT || 8080; // Render는 포트를 동적으로 할당하므로 process.env.PORT 필수
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});