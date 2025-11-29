const jwt = require('jsonwebtoken');
const User = require('../models/User'); 

// 클라이언트에서 보낸 JWT 토큰을 검증하는 미들웨어 함수
const protect = async (req, res, next) => {
    let token;

    // 1. 쿠키에서 토큰 확인 (브라우저 자동 전송)
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }
    // 2. 쿠키에 없으면, 헤더에서 토큰 확인 (수동 전송 'Bearer <token>')
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // 3. 토큰이 아예 없는 경우
    if (!token) {
        console.log('❌ 인증 실패: 쿠키와 헤더 모두 토큰이 없습니다.');
        return res.status(401).json({ message: '인증 실패: 로그인이 필요합니다.' });
    }

    try {
        // 4. 토큰 검증 및 payload 디코딩
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 5. 사용자 정보 조회 (비밀번호 제외)
        req.user = await User.findById(decoded.userId).select('-password');

        if (!req.user) {
            return res.status(401).json({ message: '인증 실패: 사용자 정보를 찾을 수 없습니다.' });
        }

        // 인증 성공!
        // console.log(`✅ 인증 성공: User ${req.user.userId}`);
        next();

    } catch (error) {
        console.error('❌ JWT 인증 오류:', error.message);
        return res.status(401).json({ message: '인증 실패: 토큰이 유효하지 않거나 만료되었습니다.' });
    }
};

module.exports = { protect };