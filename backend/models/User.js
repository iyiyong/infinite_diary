const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    // 🔑 'email' 필드를 'userId'로 변경
    userId: { 
        type: String,
        required: true,
        unique: true, // ID는 여전히 중복될 수 없음
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    displayName: { 
        type: String,
        default: 'Diary Keeper'
    }
});
// ... (나머지 password 해시 및 비교 로직은 그대로 유지)
// ...

// ===========================================
// 🛡️ 중요: 비밀번호 저장 전 해시(암호화) 처리
// ===========================================
// 사용자가 비밀번호를 입력하면, DB에 저장되기 전에 이 코드가 실행됩니다.
// 이로써 DB가 해킹당해도 비밀번호는 안전합니다. (배포 보안 필수)
UserSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

// 로그인 시 입력된 비밀번호와 DB의 해시된 비밀번호를 비교하는 메서드
UserSchema.methods.comparePassword = function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);