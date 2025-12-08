const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // 🚨 중요: bcryptjs 사용 (배포 에러 방지)

const UserSchema = new mongoose.Schema({
    // 🔑 로그인 ID
    userId: { 
        type: String,
        required: true,
        unique: true, // 중복 ID 방지
        trim: true
    },
    // 🔒 비밀번호
    password: {
        type: String,
        required: true
    },
    // 👤 닉네임 (기본값 설정)
    displayName: { 
        type: String,
        default: '별의 여행자'
    }
});

// ===========================================
// 🛡️ 비밀번호 암호화 (저장 전 자동 실행)
// ===========================================
UserSchema.pre('save', async function(next) {
    // 비밀번호가 변경되었을 때만 암호화 (닉네임만 바꿀 때는 실행 안 됨)
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

// ===========================================
// 🔑 비밀번호 비교 메서드 (로그인 시 사용)
// ===========================================
UserSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// 모델 이름은 'User'로 내보냅니다.
module.exports = mongoose.model('User', UserSchema);