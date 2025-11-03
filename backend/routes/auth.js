const express = require('express');
const router = express.Router();
const User = require('../models/User'); 
const jwt = require('jsonwebtoken'); 

// ===============================================
// POST /api/auth/register (회원가입 API)
// ===============================================
router.post('/register', async (req, res) => {
    // 🔑 1. 요청이 도착했는지 즉시 로그로 남깁니다.
    console.log('--- REGISTER ATTEMPT START ---');
    console.log('Request Body:', req.body);
    
    const { userId, password, displayName } = req.body; 

    if (!userId || !password) {
        console.log('--- REGISTER FAILED: Missing userId or password ---');
        return res.status(400).json({ message: '사용자 ID와 비밀번호는 필수입니다.' });
    }

    try {
        // 2. ID 중복 확인
        console.log(`Finding user: ${userId}`);
        let user = await User.findOne({ userId }); 
        if (user) {
            console.log('--- REGISTER FAILED: User already exists ---');
            return res.status(400).json({ message: '이미 존재하는 사용자 ID입니다.' });
        }

        // 3. 새 사용자 생성
        console.log('Creating new user...');
        user = new User({
            userId, 
            password,
            displayName: displayName || 'Diary Keeper'
        });

        // 4. 🔑 여기가 실패 지점입니다. (DB 쓰기)
        console.log('Attempting to save user to DB...');
        await user.save(); // ⬅️ "쓰기 권한" 또는 "콜드 스타트"로 인해 여기서 실패할 수 있습니다.
        
        console.log('--- REGISTER SUCCESS ---');
        res.status(201).json({ 
            message: '회원가입 성공! 이제 로그인할 수 있습니다.',
            id: user.userId
        });

    } catch (error) {
        // 5. 🔑 100% 이 CATCH 블록이 실행되고 있습니다.
        console.error('--- !!! REGISTER CRITICAL ERROR !!! ---');
        console.error(error); // ⬅️ "진짜 오류 내용"이 여기에 찍힙니다.
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// ===============================================
// POST /api/auth/login (로그인 API)
// ===============================================
router.post('/login', async (req, res) => {
    // 🔑 1. 로그인 요청 로그
    console.log('--- LOGIN ATTEMPT START ---');
    console.log('Request Body:', req.body);
    
    const { userId, password } = req.body; 
    
    if (!userId || !password) {
        console.log('--- LOGIN FAILED: Missing userId or password ---');
        return res.status(400).json({ message: '사용자 ID와 비밀번호를 모두 입력해야 합니다.' });
    }

    try {
        // 2. 사용자 확인
        console.log(`Finding user: ${userId}`);
        const user = await User.findOne({ userId }); 
        if (!user) {
            console.log('--- LOGIN FAILED: User not found ---');
            return res.status(401).json({ message: 'ID가 존재하지 않거나 잘못되었습니다.' });
        }

        // 3. 비밀번호 확인
        console.log('Comparing password...');
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log('--- LOGIN FAILED: Password mismatch ---');
            return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
        }

        // 4. 토큰 생성
        console.log('Creating JWT Token...');
        const payload = { userId: user._id, displayName: user.displayName }; 
        
        const token = jwt.sign(
            payload, 
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        console.log('--- LOGIN SUCCESS ---');
        res.status(200).json({
            message: '로그인 성공!',
            token: token,
            displayName: user.displayName,
            userId: user.userId
        });

    } catch (error) {
        // 5. 🔑 로그인 CATCH 블록
        console.error('--- !!! LOGIN CRITICAL ERROR !!! ---');
        console.error(error); // ⬅️ "진짜 오류 내용"이 여기에 찍힙니다.
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

module.exports = router;