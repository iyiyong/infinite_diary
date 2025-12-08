const express = require('express');
const router = express.Router();
const User = require('../models/User'); // 모델 가져오기
const jwt = require('jsonwebtoken');

// ===============================================
// POST /api/auth/register (회원가입)
// ===============================================
router.post('/register', async (req, res) => {
    const { userId, password, displayName } = req.body;

    if (!userId || !password) {
        return res.status(400).json({ message: 'ID와 비밀번호를 입력해주세요.' });
    }

    try {
        const existingUser = await User.findOne({ userId });
        if (existingUser) {
            return res.status(400).json({ message: '이미 존재하는 ID입니다.' });
        }

        const newUser = new User({ userId, password, displayName });
        await newUser.save(); // 모델의 pre('save')가 비밀번호 암호화 자동 수행

        res.status(201).json({ message: '회원가입 성공!' });
    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ message: '서버 에러 발생' });
    }
});

// ===============================================
// POST /api/auth/login (로그인)
// ===============================================
router.post('/login', async (req, res) => {
    const { userId, password } = req.body;

    try {
        // 1. 유저 확인
        const user = await User.findOne({ userId });
        if (!user) {
            return res.status(404).json({ message: '존재하지 않는 ID입니다.' });
        }

        // 2. 비밀번호 확인 (User 모델의 메서드 사용)
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: '비밀번호가 틀렸습니다.' });
        }

        // 3. 토큰 생성
        const token = jwt.sign(
            { userId: user._id }, 
            process.env.JWT_SECRET || 'secretKey', // .env에 JWT_SECRET 없으면 'secretKey' 사용
            { expiresIn: '1d' }
        );

        // 4. 응답
        res.status(200).json({
            message: '로그인 성공!',
            token,
            userId: user.userId,
            displayName: user.displayName
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: '로그인 서버 에러' });
    }
});

module.exports = router;