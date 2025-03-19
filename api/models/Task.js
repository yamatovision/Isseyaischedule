const mongoose = require('mongoose');

/**
 * タスクモデル定義
 * 
 * プロジェクト内のタスク情報を格納するモデル。
 * 
 * 変更履歴:
 * - 2025/03/19: 初期実装
 * - 2025/03/19: モデルをシンプル化
 * - 2025/03/19: さらにシンプル化
 * - 2025/03/19: projectとprojectIdの重複を解消し単一フィールド(projectId)に統一
 */
const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'タスク名は必須です'],
    trim: true,
    maxlength: [200, 'タスク名は200文字以内にしてください']
  },
  description: {
    type: String,
    trim: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'プロジェクトIDは必須です']
  },

  // 日程
  startDate: {
    type: Date
  },
  dueDate: {
    type: Date,
    required: [true, '期限日は必須です']
  },
  completedDate: {
    type: Date
  },

  // ステータス
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed', 'delayed'],
    default: 'not_started'
  },

  // 重要度・タグ（オプショナル）
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  tags: [{
    type: String,
    trim: true
  }],

  // 担当（オプショナル）
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 更新日時を自動更新
TaskSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // タスクが完了に変更された場合、完了日時を設定
  if (this.isModified('status') && this.status === 'completed' && !this.completedDate) {
    this.completedDate = new Date();
  }
  
  next();
});

// タスクが期限切れかどうかを確認するメソッド
TaskSchema.methods.isOverdue = function() {
  const today = new Date();
  return this.dueDate < today && this.status !== 'completed';
};

// タスクが期限間近かどうかを確認するメソッド（デフォルトは3日以内）
TaskSchema.methods.isUpcoming = function(days = 3) {
  if (this.status === 'completed') return false;
  
  const today = new Date();
  const dueDate = new Date(this.dueDate);
  const diffTime = Math.abs(dueDate - today);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays <= days && dueDate >= today;
};

module.exports = mongoose.model('Task', TaskSchema);