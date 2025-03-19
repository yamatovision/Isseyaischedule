const mongoose = require('mongoose');

/**
 * プロジェクトモデル定義
 * 
 * プロジェクト（計画）情報を格納するモデル。
 * 
 * 変更履歴:
 * - 2025/03/19: 初期実装
 * - 2025/03/19: モデルをシンプル化
 * - 2025/03/19: さらにシンプル化
 */
const ProjectSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'プロジェクト名は必須です'],
    trim: true,
    maxlength: [100, 'プロジェクト名は100文字以内にしてください']
  },
  description: { 
    type: String,
    trim: true,
    maxlength: [1000, '説明は1000文字以内にしてください']
  },
  startDate: {
    type: Date,
    required: [true, '開始日は必須です']
  },
  endDate: {
    type: Date,
    required: [true, '終了日は必須です'],
    validate: {
      validator: function(value) {
        // 終了日が開始日より後であることを確認
        return this.startDate <= value;
      },
      message: '終了日は開始日以降に設定してください'
    }
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'プロジェクトオーナーは必須です']
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['viewer', 'editor', 'manager'],
      default: 'viewer'
    }
  }],
  status: {
    type: String,
    enum: ['planning', 'in_progress', 'completed', 'on_hold', 'cancelled'],
    default: 'planning'
  },
  isArchived: {
    type: Boolean,
    default: false
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
  // 仮想フィールドをJSONに含める
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 更新日時を自動更新
ProjectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// タスク参照の仮想フィールド
ProjectSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'projectId'
});

// 残り時間計算のメソッド
ProjectSchema.methods.calculateTimeRemaining = function() {
  const today = new Date();
  const endDate = new Date(this.endDate);
  
  // 既に終了している場合
  if (today > endDate) return 0;
  
  // 残り日数を計算
  const diffTime = Math.abs(endDate - today);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// プロジェクトの統計情報計算 (シンプル化版)
ProjectSchema.methods.getStats = async function() {
  try {
    // タスクを取得
    const Task = mongoose.model('Task');
    
    // 各種タスク数をクエリで直接取得
    const totalTasks = await Task.countDocuments({ projectId: this._id });
    const completedTasks = await Task.countDocuments({ projectId: this._id, status: 'completed' });
    const inProgressTasks = await Task.countDocuments({ projectId: this._id, status: 'in_progress' });
    const notStartedTasks = await Task.countDocuments({ projectId: this._id, status: 'not_started' });
    const delayedTasks = await Task.countDocuments({ 
      projectId: this._id, 
      status: { $ne: 'completed' },
      dueDate: { $lt: new Date() }
    });
    
    // 進捗率を計算（タスクがない場合は0%）
    const progress = totalTasks === 0 
      ? 0 
      : Math.round((completedTasks / totalTasks) * 100);
    
    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      notStartedTasks,
      delayedTasks,
      progress
    };
  } catch (error) {
    console.error('プロジェクト統計情報計算エラー:', error);
    return {
      totalTasks: 0,
      completedTasks: 0,
      inProgressTasks: 0,
      notStartedTasks: 0,
      delayedTasks: 0,
      progress: 0
    };
  }
};

module.exports = mongoose.model('Project', ProjectSchema);