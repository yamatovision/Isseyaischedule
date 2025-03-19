const mongoose = require('mongoose');
const crypto = require('crypto');

/**
 * 招待コードモデル定義
 * 
 * 変更履歴:
 * - 2025/03/19: 初期実装 (Geniemon)
 */
const InvitationSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  usedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  usedAt: {
    type: Date
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  maxUses: {
    type: Number,
    default: 1
  },
  useCount: {
    type: Number,
    default: 0
  }
});

// 招待コード生成の静的メソッド
InvitationSchema.statics.generateInvitationCode = function(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  const randomBytes = crypto.randomBytes(length);
  
  for (let i = 0; i < length; i++) {
    const index = randomBytes[i] % chars.length;
    code += chars[index];
  }
  
  // コードの可読性向上のため4文字ごとにハイフンを挿入
  if (length >= 8) {
    code = code.substring(0, 4) + '-' + code.substring(4, 8);
    if (length > 8) {
      code += '-' + code.substring(8);
    }
  }
  
  return code;
};

// 招待コード検証の静的メソッド
InvitationSchema.statics.validateInvitation = async function(code) {
  const invitation = await this.findOne({
    code,
    isUsed: false,
    expiresAt: { $gt: new Date() },
    $or: [
      { maxUses: { $gt: 0 }, useCount: { $lt: '$maxUses' } },
      { maxUses: 0 } // 無制限の場合
    ]
  });
  
  return invitation;
};

// 招待コード使用済みマークの静的メソッド
InvitationSchema.statics.markAsUsed = async function(code, userId) {
  const invitation = await this.findOne({ code });
  
  if (!invitation) return false;
  
  // 単一使用の招待コード
  if (invitation.maxUses === 1) {
    invitation.isUsed = true;
    invitation.usedBy = userId;
    invitation.usedAt = new Date();
    invitation.useCount = 1;
    await invitation.save();
    return true;
  }
  
  // 複数使用可能な招待コード
  invitation.useCount += 1;
  if (invitation.useCount >= invitation.maxUses && invitation.maxUses > 0) {
    invitation.isUsed = true;
  }
  await invitation.save();
  return true;
};

module.exports = mongoose.model('Invitation', InvitationSchema);