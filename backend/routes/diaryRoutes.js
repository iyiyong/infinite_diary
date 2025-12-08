const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// ===============================================
// 1. 모델 정의 (파일 경로 에러 방지용 통합)
// ===============================================
const diarySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    emotion: { type: String, required: true },
    weather: { type: String, required: true },
    content: { type: String, required: true },
}, { timestamps: true });

// 이미 모델이 컴파일되어 있으면 그것을 쓰고, 없으면 새로 만듭니다.
const DiaryEntry = mongoose.models.DiaryEntry || mongoose.model('DiaryEntry', diarySchema);

// ===============================================
// 2. 인증 미들웨어 (없을 경우를 대비한 가짜 미들웨어)
// ===============================================
// 실제 authMiddleware가 있다면 require로 가져오시고, 
// 테스트 중이라서 자꾸 에러가 난다면 아래 주석을 풀고 임시로 사용하세요.
/*
const protect = (req, res, next) => {
    // 임시 테스트용 가짜 유저 ID (실제 배포시엔 반드시 주석 처리하고 원래 미들웨어 사용)
    req.user = { _id: "6578a1b2c3d4e5f6a7b8c9d0" }; 
    next();
};
*/
// ⚠️ 원래 쓰시던 미들웨어 경로가 맞는지 꼭 확인하세요!
const { protect } = require('../middleware/authMiddleware'); 


// ===============================================
// POST /api/diary (일기 작성 및 수정)
// ===============================================
router.post('/', protect, async (req, res) => {
    const { content, emotion, weather, date } = req.body;

    if (!content || !emotion || !weather) {
        return res.status(400).json({ message: '내용, 감정, 날씨는 필수로 입력해야 합니다.' });
    }

    try {
        const userId = req.user._id;
        
        // 날짜 처리 (UTC 기준 00:00 ~ 23:59)
        const targetDate = new Date(date || Date.now());
        const startOfDay = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate(), 0, 0, 0));
        const endOfDay = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate() + 1, 0, 0, 0));

        // 이미 오늘 쓴 일기가 있는지 확인
        const existingEntry = await DiaryEntry.findOne({
            user: userId,
            date: { $gte: startOfDay, $lt: endOfDay }
        });

        if (existingEntry) {
            // [수정]
            existingEntry.content = content;
            existingEntry.emotion = emotion;
            existingEntry.weather = weather;
            existingEntry.date = targetDate; 
            const updatedEntry = await existingEntry.save();
            return res.status(200).json({ message: '수정 완료', entry: updatedEntry });
        } else {
            // [생성]
            const newEntry = new DiaryEntry({
                user: userId,
                content,
                emotion,
                weather,
                date: targetDate
            });
            const createdEntry = await newEntry.save();
            return res.status(201).json({ message: '작성 완료', entry: createdEntry });
        }
    } catch (error) {
        console.error('일기 저장 실패:', error);
        res.status(500).json({ message: '서버 에러' });
    }
});


// ===============================================
// GET /api/diary/month/:year/:month (월별 조회)
// 🚨 프론트엔드 호출 주소: /api/diary/month/2025/12
// ===============================================
router.get('/month/:year/:month', protect, async (req, res) => {
    try {
        const { year, month } = req.params;
        const userId = req.user._id;

        // 해당 월의 1일 00:00:00 (UTC)
        const startDate = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, 1, 0, 0, 0));
        // 다음 달의 1일 00:00:00 (UTC) -> 해당 월의 끝까지 조회됨
        const endDate = new Date(Date.UTC(parseInt(year), parseInt(month), 1, 0, 0, 0)); 
        
        console.log(`[조회 요청] User: ${userId}, 기간: ${startDate.toISOString()} ~ ${endDate.toISOString()}`);

        const entries = await DiaryEntry.find({
            user: userId, 
            date: { $gte: startDate, $lt: endDate }
        }).sort({ date: 1 }); 

        res.status(200).json(entries);

    } catch (error) {
        console.error(`월별 조회 실패:`, error);
        res.status(500).json({ message: '월별 조회 실패' });
    }
});

// ===============================================
// GET /api/diary (전체 조회)
// ===============================================
router.get('/', protect, async (req, res) => {
    try {
        const entries = await DiaryEntry.find({ user: req.user._id }).sort({ date: -1 });
        res.status(200).json(entries);
    } catch (error) {
        res.status(500).json({ message: '조회 실패' });
    }
});

module.exports = router;