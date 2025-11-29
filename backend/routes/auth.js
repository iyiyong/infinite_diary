const express = require('express');
const router = express.Router();
const User = require('../models/User'); 
const jwt = require('jsonwebtoken'); 

// ===============================================
// POST /api/auth/register (회원가입)
// ===============================================
router.post('/register', async (req, res) => {
    console.log('--- REGISTER ATTEMPT START ---');
    const { userId, password, displayName } = req.body; 

    if (!userId || !password) {
        return res.status(400).json({ message: '사용자 ID와 비밀번호는 필수입니다.' });
    }

    try {
        let user = await User.findOne({ userId }); 
        if (user) {
            return res.status(400).json({ message: '이미 존재하는 사용자 ID입니다.' });
        }

        user = new User({
            userId, 
            password,
            displayName: displayName || 'Diary Keeper'
        });

        await user.save(); 
        
        console.log('--- REGISTER SUCCESS ---');
        res.status(201).json({ 
            message: '회원가입 성공! 이제 로그인할 수 있습니다.',
            id: user.userId
        });

    } catch (error) {
        console.error('--- REGISTER ERROR ---', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// ===============================================
// POST /api/auth/login (로그인)
// ===============================================
router.post('/login', async (req, res) => {
    console.log('--- LOGIN ATTEMPT START ---');
    const { userId, password } = req.body; 
    
    if (!userId || !password) {
        return res.status(400).json({ message: '아이디와 비밀번호를 입력해주세요.' });
    }

    try {
        const user = await User.findOne({ userId }); 
        if (!user) {
            return res.status(401).json({ message: '존재하지 않는 아이디입니다.' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
        }

        // 토큰 생성
        const token = jwt.sign(
            { userId: user._id, displayName: user.displayName }, 
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // 쿠키 설정 (옵션)
        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie('token', token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            maxAge: 24 * 60 * 60 * 1000
        });

        console.log(`--- LOGIN SUCCESS: ${userId} ---`);
        
        // 🚨 [핵심] JSON 응답에 토큰을 반드시 포함해야 합니다!
        res.status(200).json({
            message: '로그인 성공!',
            token: token,  // 👈 이 줄이 없으면 프론트엔드가 토큰을 못 받아서 에러가 납니다.
            displayName: user.displayName,
            userId: user.userId
        });

    } catch (error) {
        console.error('--- LOGIN ERROR ---', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

module.exports = router;