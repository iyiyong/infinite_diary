const jwt = require('jsonwebtoken');
const User = require('../models/User'); // 사용자 모델 불러오기

// 클라이언트에서 보낸 JWT 토큰을 검증하는 미들웨어 함수
const protect = async (req, res, next) => {
    let token;

    // 1. 요청 헤더에서 토큰 확인: 'Bearer <token>' 형식인지 확인
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 'Bearer ' 부분을 제외하고 실제 토큰 값만 추출
            token = req.headers.authorization.split(' ')[1];

            // 2. 토큰 검증 및 payload 디코딩
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. 디코딩된 userId(MongoDB의 _id)로 사용자 정보를 조회합니다.
            // 비밀번호를 제외한 사용자 정보를 req.user에 할당합니다.
            req.user = await User.findById(decoded.userId).select('-password');

            if (req.user) {
                // 인증 성공: 다음 미들웨어 또는 라우터 로직으로 진행
                next(); 
            } else {
                // 사용자 ID는 있지만 DB에 사용자가 없는 경우 (매우 드묾)
                res.status(401).json({ message: '인증 실패: 사용자 정보를 찾을 수 없습니다.' });
            }


        } catch (error) {
            console.error('JWT 인증 오류:', error.message);
            // 토큰이 유효하지 않거나 만료된 경우
            res.status(401).json({ message: '인증 실패: 토큰이 유효하지 않거나 만료되었습니다.' });
        }
    }

    // 4. 토큰이 아예 없는 경우
    if (!token) {
        res.status(401).json({ message: '인증 실패: 접근 토큰이 필요합니다.' });
    }
};

module.exports = { protect };