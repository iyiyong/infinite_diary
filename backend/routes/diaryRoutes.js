const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); // 🔑 인증 미들웨어 불러오기
const DiaryEntry = require('../models/DiaryEntry'); // 🔑 일기 모델 불러오기

// ===============================================
// POST /api/diary (일기 작성)
// 접근 제한: 로그인한 사용자만 가능 (protect 미들웨어 사용)
// ===============================================
router.post('/', protect, async (req, res) => {
    // req.user는 protect 미들웨어를 통과하며 할당된 로그인 사용자 정보입니다.
    const { content, emotionTag, date } = req.body;

    if (!content) {
        return res.status(400).json({ message: '일기 내용은 필수로 입력해야 합니다.' });
    }

    try {
        const newEntry = new DiaryEntry({
            user: req.user._id, // 🔑 로그인 사용자의 _id를 일기장에 기록
            content,
            emotionTag: emotionTag || [],
            date: date || Date.now() 
        });

        const createdEntry = await newEntry.save();
        res.status(201).json({ 
            message: '일기가 우주에 성공적으로 기록되었습니다.',
            entry: createdEntry 
        });

    } catch (error) {
        console.error('일기 저장 중 오류 발생:', error);
        res.status(500).json({ message: '일기 저장에 실패했습니다.' });
    }
});

// ===============================================
// GET /api/diary (나의 모든 일기 조회)
// 접근 제한: 로그인한 사용자만 가능
// ===============================================
router.get('/', protect, async (req, res) => {
    try {
        // 🔑 현재 로그인한 사용자의 일기만 찾아서 응답
        const entries = await DiaryEntry.find({ user: req.user._id })
            .sort({ date: -1 }); // 최신 일기부터 정렬

        res.status(200).json(entries);

    } catch (error) {
        console.error('일기 조회 중 오류 발생:', error);
        res.status(500).json({ message: '일기 조회에 실패했습니다.' });
    }
});


module.exports = router;