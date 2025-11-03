// infinite_diary/backend/routes/auth.js

const express = require('express');
const router = express.Router();
const User = require('../models/User'); 
const jwt = require('jsonwebtoken'); 

// ===============================================
// POST /api/auth/register (회원가입 API)
// ===============================================
router.post('/register', async (req, res) => {
    // 🔑 email 대신 userId로 받습니다.
    const { userId, password, displayName } = req.body; 

    if (!userId || !password) {
        return res.status(400).json({ message: '사용자 ID와 비밀번호는 필수입니다.' });
    }

    try {
        // 1. ID 중복 확인
        let user = await User.findOne({ userId }); // 🔑 userId로 조회
        if (user) {
            return res.status(400).json({ message: '이미 존재하는 사용자 ID입니다.' });
        }

        // 2. 새 사용자 생성
        user = new User({
            userId, // 🔑 userId 저장
            password,
            displayName: displayName || 'Diary Keeper'
        });

        await user.save();

        res.status(201).json({ 
            message: '회원가입 성공! 이제 로그인할 수 있습니다.',
            id: user.userId
        });

    } catch (error) {
        // ... (오류 처리 생략)
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// ===============================================
// POST /api/auth/login (로그인 API)
// ===============================================
router.post('/login', async (req, res) => {
    // 🔑 email 대신 userId로 받습니다.
    const { userId, password } = req.body; 
    
    if (!userId || !password) {
        return res.status(400).json({ message: '사용자 ID와 비밀번호를 모두 입력해야 합니다.' });
    }

    try {
        const user = await User.findOne({ userId }); // 🔑 userId로 조회
        if (!user) {
            return res.status(401).json({ message: 'ID가 존재하지 않거나 잘못되었습니다.' });
        }

        // ... (비밀번호 일치 확인 로직은 그대로 유지)

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
        }

        // ... (JWT 생성 로직은 그대로 유지)

        const payload = { userId: user._id, displayName: user.displayName }; // 🔑 payload에 userId 저장 (선택적: _id가 더 일반적)
        
        const token = jwt.sign(
            payload, 
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            message: '로그인 성공!',
            token: token,
            displayName: user.displayName,
            userId: user.userId // 🔑 응답에 userId 포함
        });

    } catch (error) {
        // ... (오류 처리 생략)
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

module.exports = router;