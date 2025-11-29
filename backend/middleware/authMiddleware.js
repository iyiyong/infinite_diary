const jwt = require('jsonwebtoken');
const User = require('../models/User'); 

// 클라이언트에서 보낸 JWT 토큰을 검증하는 미들웨어 함수
const protect = async (req, res, next) => {
    let token;

    // 🔥 [핵심 수정] 순서 변경! 
    // 헤더(Header)를 1순위로 확인합니다. (좀비 쿠키 무시 전략)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
        // console.log("🔑 헤더에서 토큰 발견!");
    }
    // 2순위: 헤더에 없으면 쿠키 확인
    else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
        // console.log("🍪 쿠키에서 토큰 발견!");
    }

    // 토큰이 아예 없는 경우
    if (!token) {
        // console.log("❌ 인증 실패: 토큰 없음");
        return res.status(401).json({ message: '인증 실패: 로그인이 필요합니다.' });
    }

    try {
        // 토큰 검증
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.userId).select('-password');

        if (!req.user) {
            return res.status(401).json({ message: '인증 실패: 사용자 정보를 찾을 수 없습니다.' });
        }

        // 인증 성공!
        next();

    } catch (error) {
        console.error('❌ JWT 인증 오류:', error.message);
        return res.status(401).json({ message: '인증 실패: 토큰이 유효하지 않거나 만료되었습니다.' });
    }
};

module.exports = { protect };