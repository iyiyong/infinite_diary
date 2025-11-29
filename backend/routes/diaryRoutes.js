const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); // 인증 미들웨어
const DiaryEntry = require('../models/DiaryEntry'); // 일기 모델
const mongoose = require('mongoose'); 

// ===============================================
// POST /api/diary (일기 작성 및 수정)
// 🔑 기능 변경: 같은 날짜에 기록이 있으면 '수정', 없으면 '새로 작성'
// ===============================================
router.post('/', protect, async (req, res) => {
    const { content, emotion, weather, date } = req.body;

    if (!content || !emotion || !weather) {
        return res.status(400).json({ message: '내용, 감정, 날씨는 필수로 입력해야 합니다.' });
    }

    try {
        const userId = req.user._id;
        
        // 1. 요청받은 날짜(date)를 기준으로 "그날의 시작"과 "끝"을 계산
        // 클라이언트에서 보낸 date 문자열을 Date 객체로 변환
        const targetDate = new Date(date || Date.now());
        
        // 해당 날짜의 00:00:00 ~ 23:59:59 범위를 설정 (UTC 기준)
        const startOfDay = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate(), 0, 0, 0));
        const endOfDay = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate() + 1, 0, 0, 0));

        // 2. 이미 오늘 쓴 일기가 있는지 확인 (사용자 ID + 날짜 범위)
        const existingEntry = await DiaryEntry.findOne({
            user: userId,
            date: {
                $gte: startOfDay,
                $lt: endOfDay
            }
        });

        if (existingEntry) {
            // 🔄 A. 이미 존재하면 -> 덮어쓰기 (Update)
            existingEntry.content = content;
            existingEntry.emotion = emotion;
            existingEntry.weather = weather;
            existingEntry.date = targetDate; // 시간도 최신으로 업데이트

            const updatedEntry = await existingEntry.save();
            
            console.log(`[Diary Update] ${userId}님의 ${targetDate.toISOString().split('T')[0]} 일기가 수정되었습니다.`);
            
            return res.status(200).json({ 
                message: '오늘의 일기가 수정(덮어쓰기)되었습니다.',
                entry: updatedEntry 
            });

        } else {
            // 🆕 B. 없으면 -> 새로 만들기 (Create)
            const newEntry = new DiaryEntry({
                user: userId,
                content,
                emotion,
                weather,
                date: targetDate
            });

            const createdEntry = await newEntry.save();
            
            console.log(`[Diary Create] ${userId}님의 ${targetDate.toISOString().split('T')[0]} 새 일기가 기록되었습니다.`);

            return res.status(201).json({ 
                message: '일기가 우주에 성공적으로 기록되었습니다.',
                entry: createdEntry 
            });
        }

    } catch (error) {
        console.error('일기 저장 처리 중 오류 발생:', error);
        res.status(500).json({ message: '일기 저장에 실패했습니다.' });
    }
});


// ===============================================
// GET /api/diary/month/:year/:month (월별 일기 조회)
// ===============================================
router.get('/month/:year/:month', protect, async (req, res) => {
    try {
        const { year, month } = req.params;
        
        let userId;
        if (mongoose.Types.ObjectId.isValid(req.user._id)) {
            userId = new mongoose.Types.ObjectId(req.user._id); 
        } else {
            return res.status(401).json({ message: '사용자 ID가 유효하지 않습니다.' });
        }

        const startDate = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, 1, 0, 0, 0));
        const endDate = new Date(Date.UTC(parseInt(year), parseInt(month), 1, 0, 0, 0)); 
        
        const entries = await DiaryEntry.find({
            user: userId, 
            date: {
                $gte: startDate, 
                $lt: endDate     
            }
        }).sort({ date: 1 }); 

        res.status(200).json(entries);

    } catch (error) {
        console.error(`월별 기록 조회 중 최종 오류 발생 (${req.params.year}-${req.params.month}):`, error);
        res.status(500).json({ message: '월별 기록 조회에 실패했습니다.' });
    }
});


// ===============================================
// GET /api/diary (나의 모든 일기 조회 - 예시용)
// ===============================================
router.get('/', protect, async (req, res) => {
    try {
        const entries = await DiaryEntry.find({ user: req.user._id })
            .sort({ date: -1 }); 

        res.status(200).json(entries);

    } catch (error) {
        console.error('일기 조회 중 오류 발생:', error);
        res.status(500).json({ message: '일기 조회에 실패했습니다.' });
    }
});

module.exports = router;