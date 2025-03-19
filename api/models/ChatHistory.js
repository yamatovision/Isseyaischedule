/**
 * チャット履歴モデル
 * プロジェクトごとのAIとのチャット履歴を保存
 * 
 * 変更履歴:
 * - 2025/03/19: 初期実装 (Claude)
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// チャットメッセージスキーマ
const MessageSchema = new Schema({
  sender: {
    type: String,
    enum: ['user', 'ai', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// チャット履歴スキーマ
const ChatHistorySchema = new Schema({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  messages: {
    type: [MessageSchema],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// インデックスの作成
ChatHistorySchema.index({ projectId: 1 });

module.exports = mongoose.model('ChatHistory', ChatHistorySchema);