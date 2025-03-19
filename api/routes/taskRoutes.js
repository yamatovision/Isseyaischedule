const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const taskController = require('../controllers/taskController');

/**
 * タスク関連のルート設定
 * 
 * タスク関連のAPIエンドポイントを定義します。
 * すべてのルートは認証が必要です。
 * 
 * 変更履歴:
 * - 2025/03/19: 初期実装
 * - 2025/03/19: タスクコントローラーを利用するように更新
 */

// タスク一覧取得（プロジェクト別）
router.get('/project/:projectId', authenticate, taskController.getProjectTasks);

// 注: 直近のタスク一覧取得は /api/v1/projects/tasks/upcoming で提供されています

// タスク作成
router.post('/', authenticate, taskController.createTask);

// タスク詳細取得 - 明示的なルートの後に配置
router.get('/:id', authenticate, taskController.getTask);

// タスク更新
router.put('/:id', authenticate, taskController.updateTask);

// タスク削除
router.delete('/:id', authenticate, taskController.deleteTask);

// タスクステータス更新
router.patch('/:id/status', authenticate, taskController.updateTaskStatus);

// タスクの完了状態を切り替え
router.patch('/:id/toggle', authenticate, taskController.toggleTaskCompletion);

// タスク生成 (AIによる自動生成)
router.post('/generate', authenticate, require('../controllers/chatController').generateTasks);

module.exports = router;