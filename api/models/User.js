const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

/**
 * ユーザーモデル定義
 * 
 * 変更履歴:
 * - 2025/03/19: 初期実装 (Geniemon)
 */
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'メールアドレスの形式が無効です']
  },
  password: {
    type: String,
    required: true,
    minlength: [8, 'パスワードは8文字以上必要です']
  },
  name: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  profilePicture: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  googleId: {
    type: String,
    sparse: true
  }
});

// パスワードハッシュ化
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    console.log('パスワードハッシュ化前:', this.password);
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('パスワードハッシュ化後:', this.password);
    this.updatedAt = Date.now();
    next();
  } catch (error) {
    console.error('パスワードハッシュ化エラー:', error);
    next(error);
  }
});

// パスワード検証メソッド
UserSchema.methods.comparePassword = async function(password) {
  console.log('パスワード検証:');
  console.log('- 入力パスワード:', password);
  console.log('- 保存されたハッシュ:', this.password);
  const isMatch = await bcrypt.compare(password, this.password);
  console.log('- 検証結果:', isMatch);
  return isMatch;
};

// 最終ログイン時間更新メソッド
UserSchema.methods.updateLastLogin = async function() {
  this.lastLogin = Date.now();
  return this.save();
};

// 出力するJSONからパスワードを除外
UserSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', UserSchema);