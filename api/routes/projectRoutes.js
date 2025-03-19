const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authenticate } = require('../middleware/auth');

/**
 * プロジェクト関連のルート設定
 * 
 * プロジェクト・計画関連のAPIエンドポイントを定義します。
 * すべてのルートは認証が必要です。
 * 
 * 変更履歴:
 * - 2025/03/19: 初期実装
 * - 2025/03/19: 認証ミドルウェアの適用方法を修正
 */

// すべてのルートで認証を要求
// 各ルートに個別に認証ミドルウェアを適用

// プロジェクト一覧の取得
router.get('/', authenticate, projectController.getAllProjects);

// アクティブなプロジェクト一覧を取得（ダッシュボード用）
router.get('/active', authenticate, projectController.getActiveProjects);

// グローバル統計情報の取得（ダッシュボード用）
router.get('/stats/global', authenticate, projectController.getGlobalStats);

// 直近のタスク一覧の取得（ダッシュボード用）
router.get('/tasks/upcoming', authenticate, projectController.getUpcomingTasks);

// 新規プロジェクトの作成
router.post('/', authenticate, projectController.createProject);

// タスク付き新規プロジェクトの作成
router.post('/with-tasks', authenticate, projectController.createProjectWithTasks);

// 特定のプロジェクトの取得
router.get('/:id', authenticate, projectController.getProject);

// 特定のプロジェクトの更新
router.put('/:id', authenticate, projectController.updateProject);

// 特定のプロジェクトの削除（アーカイブ）
router.delete('/:id', authenticate, projectController.deleteProject);

// プロジェクトのタスク一覧の取得
router.get('/:id/tasks', authenticate, projectController.getProjectTasks);

// プロジェクトの統計情報の取得
router.get('/:id/stats', authenticate, projectController.getProjectStats);

// プロジェクトの進捗情報の取得
router.get('/:id/progress', authenticate, projectController.getProjectStats);

module.exports = router;