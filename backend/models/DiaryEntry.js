const mongoose = require('mongoose');

// 일기 항목 데이터 구조 정의
const DiaryEntrySchema = new mongoose.Schema({
    // 🔑 사용자 참조: 이 일기를 누가 썼는지 기록합니다. (User 모델의 ObjectId를 참조)
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // User 모델을 참조
        required: true
    },
    // 🔑 일기 내용: 필수로 긴 텍스트를 저장합니다.
    content: {
        type: String,
        required: true,
    },
    // 🔑 감정 태그: 일기에 부여된 감정 키워드들을 배열로 저장합니다.
    emotionTag: {
        type: [String], // 문자열 배열
        default: [],
    },
    // 🔑 일기 작성 날짜: 사용자가 기록한 시점의 날짜 (나중에 캘린더 뷰에서 사용)
    date: {
        type: Date,
        default: Date.now
    },
    // 🔑 생성 시간 기록
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    // MongoDB의 '_id' 대신 'id' 필드를 사용하도록 설정 (프론트엔드에서 사용 용이)
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true }
});

module.exports = mongoose.model('DiaryEntry', DiaryEntrySchema);