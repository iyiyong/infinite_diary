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

// 🔑 CORS 허용 목록에 'http://localhost:3000'을 추가했습니다.
const allowedOrigins = [
  process.env.CLIENT_URL,                      
  'https://infinite-diary-frontend.onrender.com', 
  'http://localhost:5173', // 기존 Vite 포트
  'http://localhost:3000'  // 🚨 추가됨: 현재 프론트엔드 포트
];

app.use(cors({
  origin: function (origin, callback) {
    // origin이 없거나(서버 간 통신) 허용 목록에 있으면 통과
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`🚫 CORS 차단됨: ${origin}`);
      callback(new Error('CORS 정책에 의해 차단되었습니다.'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.use(cookieParser());
app.use(express.json());

// 요청 로깅
app.use((req, res, next) => {
  console.log(`📝 [${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

app.get('/', (req, res) => {
  res.status(200).send('Infinite Diary Backend Running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/diary', diaryRoutes);

app.use((req, res, next) => {
  res.status(404).json({ message: '경로를 찾을 수 없습니다.' });
});

app.use((err, req, res, next) => {
  console.error('💥 Server Error:', err.stack);
  res.status(500).json({ message: '서버 내부 오류', error: err.message });
});

const startServer = async () => {
  try {
    if (!MONGO_URI) throw new Error('MONGO_URI 없음');
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB 연결 성공');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`Allowed Origins: ${allowedOrigins.join(', ')}`);
    });
  } catch (error) {
    console.error('❌ Server Start Failed:', error);
  }
};

startServer();