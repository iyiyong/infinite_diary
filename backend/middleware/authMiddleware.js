const jwt = require('jsonwebtoken');
const User = require('../models/User'); 

// 클라이언트에서 보낸 JWT 토큰을 검증하는 미들웨어 함수
const protect = async (req, res, next) => {
    let token;

    // 🔍 디버깅용 로그: 요청이 들어왔음을 알림
    console.log(`[AuthMiddleware] 요청 도착! URL: ${req.originalUrl}`);
    console.log(`[AuthMiddleware] Headers:`, req.headers.authorization ? 'Exist' : 'None');
    console.log(`[AuthMiddleware] Cookies:`, req.cookies ? Object.keys(req.cookies) : 'None');

    // 🔥 1순위: 헤더(Header) 확인 (프론트엔드에서 보낸 진짜 토큰)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
        console.log(`✅ [AuthMiddleware] 헤더에서 토큰 발견! 값: ${token}`); // 👈 여기에 받은 토큰 값을 직접 찍어봅니다.
    }
    // 2순위: 쿠키 확인 (백업)
    else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
        console.log(`🍪 [AuthMiddleware] 쿠키에서 토큰 발견! 값: ${token}`);
    }

    // 토큰이 아예 없는 경우
    if (!token) {
        console.log("❌ [AuthMiddleware] 실패: 토큰이 아예 없습니다.");
        return res.status(401).json({ message: '인증 실패: 로그인이 필요합니다 (토큰 없음).' });
    }

    try {
        // 토큰 검증
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // console.log(`[AuthMiddleware] 토큰 해독 완료: UserID ${decoded.userId}`);

        req.user = await User.findById(decoded.userId).select('-password');

        if (!req.user) {
            console.log("❌ [AuthMiddleware] 실패: DB에서 유저를 찾을 수 없음");
            return res.status(401).json({ message: '인증 실패: 사용자 정보를 찾을 수 없습니다.' });
        }

        // 인증 성공!
        console.log("🎉 [AuthMiddleware] 인증 성공! 통과!");
        next();

    } catch (error) {
        console.error('❌ [AuthMiddleware] JWT 검증 실패:', error.message);
        console.error('❌ [AuthMiddleware] 문제가 된 토큰:', token); // 👈 에러 발생 시 토큰 값을 한 번 더 보여줍니다.
        return res.status(401).json({ message: '인증 실패: 토큰이 유효하지 않거나 만료되었습니다.' });
    }
};

module.exports = { protect };