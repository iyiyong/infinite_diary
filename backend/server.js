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
  'http://localhost:5173',                      // 로컬 개발 주소
  'http://localhost:3000',                      // 로컬 개발 주소 (혹시 몰라서 추가)
  'https://infinite-diary-frontend.onrender.com', // 🚨 배포된 프론트엔드 주소 (스크린샷 보고 넣음)
  'https://infinite-diary.onrender.com'           // (혹시 주소가 다를까봐 예비용)
];

app.use(cors({
  origin: function (origin, callback) {
    // origin이 없거나(서버끼리 통신) 허용 목록에 있으면 통과
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`🚫 차단된 요청 출처: ${origin}`); // 로그로 확인 가능하게 함
      callback(new Error('CORS 정책에 의해 차단되었습니다.'));
    }
  },
  credentials: true, // 쿠키/토큰 전달 허용
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.use(cookieParser());
app.use(express.json());

// ---------------------------------------------------------
// 🛠️ 기본 설정
// ---------------------------------------------------------
app.get('/', (req, res) => {
  res.status(200).send('Infinite Diary Backend is Running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/diary', diaryRoutes);

// 에러 핸들링
app.use((req, res, next) => {
  res.status(404).json({ message: '경로를 찾을 수 없습니다.' });
});

const startServer = async () => {
  try {
    if (!MONGO_URI) throw new Error('MONGO_URI 환경 변수가 없습니다.');
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB 연결 성공');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Server Start Failed:', error);
  }
};

startServer();