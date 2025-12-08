require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');
const diaryRoutes = require('./routes/diaryRoutes');

const app = express();

// Render와 같은 프록시 뒤에 있을 때 보안 쿠키(Secure) 사용을 위해 필수
app.set('trust proxy', 1);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// ---------------------------------------------------------
// 🔐 CORS 설정 (핵심)
// ---------------------------------------------------------
const allowedOrigins = [
  process.env.CLIENT_URL,                       // 환경변수에 설정된 클라이언트 URL
  'https://infinite-diary-frontend.onrender.com', // 배포된 프론트엔드 주소 (마지막 슬래시 없음)
  'http://localhost:5173',                      // 로컬 Vite 개발 포트
  'http://localhost:3000'                       // 로컬 React/Node 개발 포트
].filter(Boolean); // 배열에서 undefined나 null, 빈 문자열 제거

const corsOptions = {
  origin: function (origin, callback) {
    // 1. origin이 없는 경우 (Postman, 서버 간 통신 등) 허용
    if (!origin) return callback(null, true);

    // 2. 허용 목록에 있는 경우 허용
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // 3. 차단되는 경우 로그 출력 (디버깅용)
      console.log(`🚫 CORS Blocked Origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // 쿠키/인증 헤더 허용
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  optionsSuccessStatus: 200 // 구형 브라우저/스마트TV 등을 위한 설정
};

app.use(cors(corsOptions));

// ---------------------------------------------------------
// 🛠️ 미들웨어 설정
// ---------------------------------------------------------
app.use(cookieParser());
app.use(express.json());

// 요청 로깅 미들웨어
app.use((req, res, next) => {
  console.log(`📝 [${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// ---------------------------------------------------------
// 🚦 라우트 설정
// ---------------------------------------------------------
// 헬스 체크용 루트 경로
app.get('/', (req, res) => {
  res.status(200).send('🌌 Infinite Diary Backend is Running Securely!');
});

app.use('/api/auth', authRoutes);
app.use('/api/diary', diaryRoutes);

// 404 에러 핸들러
app.use((req, res, next) => {
  res.status(404).json({ message: '요청하신 경로를 찾을 수 없습니다.' });
});

// 전역 에러 핸들러
app.use((err, req, res, next) => {
  console.error('💥 Server Error:', err.stack);
  res.status(500).json({ message: '서버 내부 오류 발생', error: err.message });
});

// ---------------------------------------------------------
// 🚀 서버 시작 및 DB 연결
// ---------------------------------------------------------
const startServer = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error('MONGO_URI 환경 변수가 설정되지 않았습니다.');
    }

    // Mongoose 연결 설정 (최신 버전은 옵션 불필요)
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB Connected Successfully');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🛡️  Allowed CORS Origins:`, allowedOrigins);
    });
  } catch (error) {
    console.error('❌ Server Start Failed:', error);
    process.exit(1); // 치명적 오류 시 프로세스 종료
  }
};

startServer();