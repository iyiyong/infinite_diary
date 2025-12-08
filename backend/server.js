require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');
const diaryRoutes = require('./routes/diaryRoutes');

const app = express();
app.set('trust proxy', 1);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// ---------------------------------------------------------
// 🔐 CORS 설정 (여기가 핵심입니다!)
// ---------------------------------------------------------
const allowedOrigins = [
  'http://localhost:5173',                      // 로컬 개발 주소 (Vite)
  'http://localhost:3000',                      // 로컬 개발 주소 (혹시 몰라서)
  'https://infinite-diary-frontend.onrender.com', // 🚨 [중요] 배포된 프론트엔드 주소 (스크린샷 에러 해결용)
  // 혹시 주소가 조금 다를 경우를 대비해 아래 것도 추가
  'https://infinite-diary.onrender.com'           
];

app.use(cors({
  origin: function (origin, callback) {
    // 1. origin이 없는 경우 (Postman, 서버 간 통신 등) 허용
    if (!origin) return callback(null, true);

    // 2. 허용 목록에 있는 경우 통과
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // 3. 차단된 경우 로그 출력 (Render 로그에서 확인 가능)
      console.log(`🚫 CORS Blocked: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // 쿠키/토큰 전달 허용
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.use(cookieParser());
app.use(express.json());

// ---------------------------------------------------------
// 🛠️ 기본 라우트 및 에러 핸들링
// ---------------------------------------------------------
app.get('/', (req, res) => {
  res.status(200).send('🌌 Infinite Diary Backend is Running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/diary', diaryRoutes);

app.use((req, res, next) => {
  res.status(404).json({ message: '경로를 찾을 수 없습니다.' });
});

// ---------------------------------------------------------
// 🚀 서버 시작
// ---------------------------------------------------------
const startServer = async () => {
  try {
    if (!MONGO_URI) throw new Error('MONGO_URI 환경 변수가 없습니다.');
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB 연결 성공');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🛡️ Allowed Origins:`, allowedOrigins);
    });
  } catch (error) {
    console.error('❌ Server Start Failed:', error);
  }
};

startServer();