const jwt = require('jsonwebtoken');
const User = require('../models/User');
const jwtHelper = require('../utils/jwtHelper');

/**
 * 認証ミドルウェア
 * APIリクエストの認証とアクセス制御を担当
 * 
 * 変更履歴:
 * - 2025/03/19: 初期実装 (Geniemon)
 * - 2025/03/19: モジュールのデフォルトエクスポートを修正
 * - 2025/03/19: テスト環境の特別処理を削除
 */

// JWT認証ミドルウェア
const authenticate = async (req, res, next) => {
  try {
    
    // ヘッダーからトークン取得
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '認証トークンがありません'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // トークン検証
    const decoded = jwtHelper.verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: '無効な認証トークンです'
      });
    }
    
    // トークンの有効期限チェック
    if (jwtHelper.isTokenExpired(token)) {
      return res.status(401).json({
        success: false,
        message: '認証トークンの期限が切れています'
      });
    }
    
    // ユーザー存在確認
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'ユーザーが見つかりません'
      });
    }
    
    // ユーザーが停止されていないか確認
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'このアカウントは停止されています'
      });
    }
    
    // リクエストオブジェクトにユーザー情報を追加
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '認証トークンの期限が切れています'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: '無効な認証トークンです'
    });
  }
};

// 管理者権限チェックミドルウェア
const isAdmin = (req, res, next) => {
  
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'この操作を実行する権限がありません'
    });
  }
};

// オプショナル認証ミドルウェア
// トークンがある場合はユーザー情報を追加するが、なくてもエラーにならない
const optionalAuth = async (req, res, next) => {
  try {
    
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwtHelper.verifyToken(token);
    
    if (decoded && !jwtHelper.isTokenExpired(token)) {
      const user = await User.findById(decoded.id).select('-password');
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next();
  }
};

// CSRFトークン検証ミドルウェア
const verifyCsrfToken = (req, res, next) => {
  
  // Get the CSRF token from the request header or body
  const csrfToken = req.headers['x-csrf-token'] || req.body._csrf;
  
  // Get the CSRF token from the cookie
  const cookieCsrfToken = req.cookies.csrf_token;
  
  // If CSRF protection is not required in development mode
  if (process.env.NODE_ENV === 'development' && process.env.DISABLE_CSRF === 'true') {
    return next();
  }
  
  // Verify the token
  if (!csrfToken || !cookieCsrfToken || csrfToken !== cookieCsrfToken) {
    return res.status(403).json({
      success: false,
      message: 'CSRFトークンが無効です'
    });
  }
  
  next();
};

// モジュールのエクスポート - オブジェクトとしてエクスポート
module.exports = {
  authenticate,
  isAdmin,
  optionalAuth,
  verifyCsrfToken
};