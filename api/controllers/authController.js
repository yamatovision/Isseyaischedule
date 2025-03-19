const authService = require('../services/authService');
const emailService = require('../services/emailService');
const { validationResult } = require('express-validator');

/**
 * 認証コントローラー
 * 認証関連のリクエスト処理を担当
 * 
 * 変更履歴:
 * - 2025/03/19: 初期実装 (Geniemon)
 * - 2025/03/19: テスト用のモックレスポンスを追加
 */

// 変更履歴:
// - 2025/03/19: テスト用のモック処理を削除

// ログイン処理
exports.login = async (req, res) => {
  try {
    console.log('【API連携】ログインAPI呼び出し開始');
    
    // 入力検証
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password, rememberMe } = req.body;
    console.log(`【API連携】ログイン試行: ${email}`);
    
    
    const authResult = await authService.authenticateUser(email, password, rememberMe);
    
    if (authResult.success) {
      console.log(`【API連携】ログイン成功: ${email}`);
      
      // リフレッシュトークンをHTTPOnly Cookieで設定
      if (authResult.refreshToken) {
        res.cookie('refresh_token', authResult.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7日間
          sameSite: 'strict'
        });
      }
      
      return res.status(200).json({
        success: true,
        token: authResult.token,
        user: authResult.user
      });
    } else {
      console.log(`【API連携】ログイン失敗: ${email}`);
      return res.status(401).json({
        success: false,
        message: authResult.message || '認証情報が無効です'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました'
    });
  }
};

// 新規ユーザー登録
exports.register = async (req, res) => {
  try {
    console.log('【API連携】ユーザー登録API呼び出し開始');
    
    // 入力検証
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password, invitationCode } = req.body;
    console.log(`【API連携】ユーザー登録試行: ${email}`);
    
    
    // 招待コードの検証
    const isValidInvitation = await authService.verifyInvitationCode(invitationCode);
    if (!isValidInvitation) {
      return res.status(400).json({
        success: false,
        message: '無効または期限切れの招待コードです'
      });
    }
    
    // ユーザー登録
    const registrationResult = await authService.registerUser(email, password, invitationCode);
    
    if (registrationResult.success) {
      console.log(`【API連携】ユーザー登録成功: ${email}`);
      
      // リフレッシュトークンをHTTPOnly Cookieで設定
      if (registrationResult.refreshToken) {
        res.cookie('refresh_token', registrationResult.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7日間
          sameSite: 'strict'
        });
      }
      
      // ウェルカムメール送信
      await emailService.sendWelcomeEmail(email, registrationResult.user.name);
      
      return res.status(201).json({
        success: true,
        token: registrationResult.token,
        user: registrationResult.user
      });
    } else {
      console.log(`【API連携】ユーザー登録失敗: ${email}`);
      return res.status(400).json({
        success: false,
        message: registrationResult.message || 'ユーザー登録に失敗しました'
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました'
    });
  }
};

// ログアウト処理
exports.logout = async (req, res) => {
  try {
    console.log('【API連携】ログアウトAPI呼び出し開始');
    
    // クライアント側でトークンを削除するためのCookieクリア
    res.clearCookie('refresh_token');
    
    return res.status(200).json({
      success: true,
      message: 'ログアウトしました'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました'
    });
  }
};

// 現在のユーザー情報取得
exports.getProfile = async (req, res) => {
  try {
    console.log('【API連携】ユーザープロフィール取得API呼び出し開始');
    
    
    // authenticate ミドルウェアによって req.user が設定されている
    return res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました'
    });
  }
};

// パスワードリセットリクエスト
exports.forgotPassword = async (req, res) => {
  try {
    console.log('【API連携】パスワードリセットリクエストAPI呼び出し開始');
    
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'メールアドレスが必要です'
      });
    }
    
    
    // パスワードリセットトークン生成とメール送信
    const result = await authService.generatePasswordResetToken(email);
    
    // セキュリティのため、結果に関わらず同じレスポンスを返す
    return res.status(200).json({
      success: true,
      message: 'パスワードリセット手順をメールで送信しました（メールアドレスが登録されている場合）'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました'
    });
  }
};

// パスワードリセット実行
exports.resetPassword = async (req, res) => {
  try {
    console.log('【API連携】パスワードリセット実行API呼び出し開始');
    
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'トークンと新しいパスワードが必要です'
      });
    }
    
    
    // パスワードリセット実行
    const result = await authService.resetPassword(token, newPassword);
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        message: result.message
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました'
    });
  }
};

// 招待コード検証
exports.verifyInvitation = async (req, res) => {
  try {
    console.log('【API連携】招待コード検証API呼び出し開始');
    
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: '招待コードが必要です'
      });
    }
    
    
    // 招待コード検証
    const isValid = await authService.verifyInvitationCode(code);
    
    return res.status(200).json({
      success: isValid,
      message: isValid ? '有効な招待コードです' : '無効または期限切れの招待コードです'
    });
  } catch (error) {
    console.error('Verify invitation error:', error);
    return res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました'
    });
  }
};

// アクセストークン更新（リフレッシュトークン使用）
exports.refreshToken = async (req, res) => {
  try {
    console.log('【API連携】トークンリフレッシュAPI呼び出し開始');
    
    // クッキーからリフレッシュトークン取得
    const refreshToken = req.cookies.refresh_token;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'リフレッシュトークンがありません'
      });
    }
    
    
    // リフレッシュトークンでの認証更新
    const result = await authService.refreshAuthentication(refreshToken);
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        token: result.token,
        user: result.user
      });
    } else {
      // リフレッシュトークンが無効な場合はクッキーをクリア
      res.clearCookie('refresh_token');
      
      return res.status(401).json({
        success: false,
        message: result.message || 'トークンの更新に失敗しました'
      });
    }
  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました'
    });
  }
};

// Googleログイン処理
exports.googleAuth = async (req, res) => {
  try {
    console.log('【API連携】Googleログイン処理API呼び出し開始');
    
    // Googleから受け取ったプロファイル情報
    const { googleProfile } = req.body;
    
    if (!googleProfile || !googleProfile.email) {
      return res.status(400).json({
        success: false,
        message: 'Google認証情報が不足しています'
      });
    }
    
    
    // Googleログイン/登録処理
    const result = await authService.handleGoogleAuth(googleProfile);
    
    if (result.success) {
      // リフレッシュトークンをHTTPOnly Cookieで設定
      if (result.refreshToken) {
        res.cookie('refresh_token', result.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7日間
          sameSite: 'strict'
        });
      }
      
      return res.status(200).json({
        success: true,
        token: result.token,
        user: result.user
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.message || 'Google認証に失敗しました'
      });
    }
  } catch (error) {
    console.error('Google auth error:', error);
    return res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました'
    });
  }
};