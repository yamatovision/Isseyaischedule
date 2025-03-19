/**
 * チャットルート
 * Chat-to-Gantt機能で使用するAPIルートを定義
 * 
 * 変更履歴:
 * - 2025/03/19: 初期実装 (Claude)
 */

const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/auth');

// 認証ミドルウェアを適用
router.use(authMiddleware.authenticate);

// チャットメッセージ送信
router.post('/send', chatController.sendMessage);

// チャット履歴取得
router.get('/history/:projectId', chatController.getChatHistory);

// タスク生成
router.post('/tasks/generate', chatController.generateTasks);

// 問題解決策提案
router.post('/suggest-solution', chatController.suggestSolution);

// 解決策適用
router.post('/projects/:projectId/apply-solution', chatController.applySolution);

// テスト用エンドポイント
// if (process.env.NODE_ENV !== 'production') {
//   router.post('/test', chatController.testAiFunction);
// }

module.exports = router;