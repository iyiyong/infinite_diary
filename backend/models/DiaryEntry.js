const mongoose = require('mongoose'); // 🔑 이 줄이 없으면 서버가 꺼집니다!

const diaryEntrySchema = new mongoose.Schema({
    // 🔑 사용자 ID 참조: ObjectId 타입이며 User 모델을 참조
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    content: {
        type: String,
        required: true,
    },
    // 🔑 날짜 필드: Date 타입으로 저장 및 쿼리의 기준이 됩니다.
    date: { 
        type: Date, 
        required: true,
        default: Date.now,
    },
    emotion: {
        type: String,
        required: true,
    },
    weather: {
        type: String,
        required: true,
    },
}, {
    timestamps: true // created/updated at 필드 자동 추가
});

// 🚨 조회 속도와 정확성을 위한 인덱스 설정
diaryEntrySchema.index({ user: 1, date: 1 }); 

module.exports = mongoose.model('DiaryEntry', diaryEntrySchema);