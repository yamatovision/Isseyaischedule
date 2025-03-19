const jwt = require('jsonwebtoken');

/**
 * JWT認証ヘルパー関数
 * 
 * 変更履歴:
 * - 2025/03/19: 初期実装 (Geniemon)
 */

// アクセストークン生成
exports.generateAccessToken = (user) => {
  return jwt.sign(
    { 
      id: user._id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET || 'your_jwt_secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// リフレッシュトークン生成
exports.generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.REFRESH_TOKEN_SECRET || 'your_refresh_token_secret',
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d' }
  );
};

// トークン検証
exports.verifyToken = (token, isRefreshToken = false) => {
  try {
    const secret = isRefreshToken 
      ? (process.env.REFRESH_TOKEN_SECRET || 'your_refresh_token_secret')
      : (process.env.JWT_SECRET || 'your_jwt_secret');
    
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};

// トークンからユーザーIDを抽出
exports.getUserIdFromToken = (token, isRefreshToken = false) => {
  const decoded = this.verifyToken(token, isRefreshToken);
  return decoded ? decoded.id : null;
};

// トークンの有効期限チェック
exports.isTokenExpired = (token, isRefreshToken = false) => {
  const decoded = this.verifyToken(token, isRefreshToken);
  if (!decoded || !decoded.exp) return true;
  
  // expはUNIX時間（秒）なのでミリ秒に変換して比較
  return decoded.exp * 1000 < Date.now();
};

// クライアント用のトークン情報を整形
exports.getTokenInfo = (token) => {
  const decoded = this.verifyToken(token);
  if (!decoded) return null;
  
  return {
    id: decoded.id,
    email: decoded.email,
    role: decoded.role,
    expires: new Date(decoded.exp * 1000).toISOString()
  };
};