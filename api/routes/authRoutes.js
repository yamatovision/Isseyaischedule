const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// ヘルスチェックエンドポイント
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

/**
 * 認証関連ルート定義
 * 
 * 変更履歴:
 * - 2025/03/19: 初期実装 (Geniemon)
 */

// 入力バリデーションルール
const loginValidation = [
  body('email').isEmail().withMessage('有効なメールアドレスを入力してください'),
  body('password').notEmpty().withMessage('パスワードを入力してください')
];

const registerValidation = [
  body('email').isEmail().withMessage('有効なメールアドレスを入力してください'),
  body('password')
    .isLength({ min: 8 }).withMessage('パスワードは8文字以上必要です')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])|(?=.*\d)|(?=.*[@$!%*?&])/)
    .withMessage('パスワードは英数字を含める必要があります'),
  body('invitationCode').notEmpty().withMessage('招待コードを入力してください')
];

const passwordResetValidation = [
  body('token').notEmpty().withMessage('トークンが必要です'),
  body('newPassword')
    .isLength({ min: 8 }).withMessage('パスワードは8文字以上必要です')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])|(?=.*\d)|(?=.*[@$!%*?&])/)
    .withMessage('パスワードは英数字を含める必要があります')
];

// 認証ルート
router.post('/login', loginValidation, authController.login);
router.post('/register', registerValidation, authController.register);
router.post('/logout', authController.logout);
router.get('/me', authMiddleware.authenticate, authController.getProfile);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', passwordResetValidation, authController.resetPassword);
router.post('/verify-invitation', authController.verifyInvitation);
router.post('/refresh-token', authController.refreshToken);
router.post('/google', authController.googleAuth);

// CSRFトークン取得エンドポイント（オプション）
router.get('/csrf-token', (req, res) => {
  const token = require('crypto').randomBytes(16).toString('hex');
  res.cookie('csrf_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  res.json({ csrfToken: token });
});

// 管理者用ルート（招待コード生成など）
router.post(
  '/create-invitation',
  [
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    body('expiresInDays').optional().isInt({ min: 1 }).withMessage('有効期限は1日以上である必要があります'),
    body('role').optional().isIn(['admin', 'user']).withMessage('役割は admin または user である必要があります'),
    body('email').optional().isEmail().withMessage('有効なメールアドレスを入力してください'),
    body('maxUses').optional().isInt({ min: 1 }).withMessage('最大使用回数は1回以上である必要があります')
  ],
  async (req, res) => {
    try {
      const { expiresInDays, role, email, maxUses } = req.body;
      const authService = require('../services/authService');
      
      const result = await authService.createInvitationCode(req.user.id, {
        expiresInDays,
        role,
        email,
        maxUses
      });
      
      if (result.success) {
        return res.status(201).json({
          success: true,
          code: result.code,
          expiresAt: result.expiresAt
        });
      } else {
        return res.status(400).json({
          success: false,
          message: result.message || '招待コードの作成に失敗しました'
        });
      }
    } catch (error) {
      console.error('Create invitation error:', error);
      return res.status(500).json({
        success: false,
        message: 'サーバーエラーが発生しました'
      });
    }
  }
);

module.exports = router;