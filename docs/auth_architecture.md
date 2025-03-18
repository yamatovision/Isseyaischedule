# 認証システムアーキテクチャ

## 概要

プランナビアプリケーションの認証システムは、JWT（JSON Web Token）ベースの堅牢で拡張性のある認証フローを採用し、セキュリティ、ユーザビリティ、保守性のバランスを重視して設計されています。

## 設計原則

### 1. レイヤー分離アーキテクチャ

認証システムは明確に分離された階層で構成され、責任範囲を明確化しています。

#### Controller層
- リクエスト/レスポンス処理
- 入力データのバリデーション
- HTTPステータスコードの適切な管理
- 実装ファイル: `/api/controllers/authController.js`

#### Service層
- 認証ビジネスロジックの実装
- トークン生成/検証
- ユーザーアカウント操作
- パスワード管理
- 実装ファイル: `/api/services/authService.js`

#### Data Access層
- データベース操作
- ユーザーモデル定義
- 招待コードモデル定義
- 実装ファイル: `/api/models/User.js`, `/api/models/Invitation.js`

#### Middleware層
- リクエスト認証
- ルートごとの権限検証
- トークン検証
- 実装ファイル: `/api/middleware/auth.js`

#### Client層
- 認証状態管理（React Context）
- トークン保存（localStorage/Cookie）
- ログイン/ログアウトUI
- 実装ファイル: `/src/contexts/AuthContext.jsx`, `/src/utils/auth.js`

### 2. 単一責任の原則

- 各ファイルは単一の機能領域に責任を持つ
- 各メソッドは明確に定義された1つのタスクを実行
- 認証ロジックとビジネスロジックを厳密に分離

### 3. JWTベースの認証フロー

#### トークン管理
- アクセストークン（短期間有効）とリフレッシュトークン（長期間有効）の分離
- アクセストークンのみをAPIリクエストに使用
- HTTPOnly Cookie でのリフレッシュトークン保存
- アクセストークンはローカルストレージに保存

#### トークンリフレッシュ機構
- アクセストークン期限切れ時の自動リフレッシュ
- インターセプターによるリフレッシュロジックの透過的実装
- リフレッシュトークン無効時の再ログイン要求

#### セキュリティ対策
- XSS対策：センシティブなトークンはHTTPOnly Cookieで保存
- CSRF対策：CSRF対策トークンの実装
- トークン失効機能の実装

### 4. ユーザー関連操作の標準化

#### 認証フロー
1. 登録プロセス
   - 招待コード検証
   - ユーザー情報入力と検証
   - アカウント作成
   - 初回ログイン

2. ログインプロセス
   - 認証情報検証
   - トークン生成
   - ユーザー情報取得

3. ログアウトプロセス
   - トークン無効化
   - クライアント側ストレージのクリア

#### アカウント管理
- パスワードリセット機能
- プロフィール更新
- アカウント削除

#### 権限管理
- ロールベースのアクセス制御（admin, user）
- 機能ごとの権限チェック

### 5. エラーハンドリングの一貫性

#### エラータイプの標準化
- 認証エラー（無効な認証情報、期限切れトークンなど）
- 入力検証エラー（無効なメールフォーマット、短すぎるパスワードなど）
- アクセス制御エラー（権限不足）
- サーバーエラー

#### レスポンス形式の標準化
```json
{
  "success": false,
  "message": "エラーが発生しました",
  "errors": [
    {
      "field": "email",
      "message": "無効なメールアドレス形式です"
    }
  ]
}
```

#### セキュリティを考慮した詳細度
- ユーザーに必要な情報のみを提供
- センシティブな詳細を隠蔽（例：「ユーザーが存在しません」の代わりに「認証情報が無効です」）

## 実装詳細

### フロントエンド実装

#### AuthContext
```jsx
// /src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { login, register, logout, refreshToken, getProfile } from '../api/authApi';
import { getToken, setToken, removeToken } from '../utils/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 初期認証状態チェック
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = getToken();
        if (token) {
          const profileResponse = await getProfile();
          setUser(profileResponse.data.user);
          setIsAuthenticated(true);
        }
      } catch (err) {
        removeToken();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // ログイン処理
  const handleLogin = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const response = await login(credentials);
      setToken(response.data.token);
      setUser(response.data.user);
      setIsAuthenticated(true);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'ログインに失敗しました');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 登録処理
  const handleRegister = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await register(userData);
      setToken(response.data.token);
      setUser(response.data.user);
      setIsAuthenticated(true);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || '登録に失敗しました');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ログアウト処理
  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      removeToken();
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
```

#### auth.js ユーティリティ
```javascript
// /src/utils/auth.js
const TOKEN_KEY = process.env.REACT_APP_AUTH_TOKEN_NAME || 'auth_token';

// トークンの取得
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

// トークンの保存
export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

// トークンの削除
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

// 認証ヘッダーの作成
export const getAuthHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// トークンの有効性確認（期限切れチェック）
export const isTokenValid = () => {
  const token = getToken();
  if (!token) return false;
  
  try {
    // トークンのペイロード部分をデコード
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch (e) {
    return false;
  }
};
```

#### authApi.js
```javascript
// /src/api/authApi.js
import axios from 'axios';
import { getAuthHeader } from '../utils/auth';
import { AUTH } from '../shared/index';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// リクエストインターセプターでAuthヘッダーを追加
api.interceptors.request.use(
  (config) => {
    const headers = getAuthHeader();
    if (headers.Authorization) {
      config.headers.Authorization = headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// レスポンスインターセプターでエラーハンドリング
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // 401エラーかつトークンリフレッシュが未試行の場合
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // リフレッシュトークンで新しいアクセストークンを取得
        const response = await api.post(AUTH.REFRESH_TOKEN);
        const { token } = response.data;
        
        // 新しいトークンを保存して再リクエスト
        localStorage.setItem('auth_token', token);
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // リフレッシュに失敗した場合はログイン画面へリダイレクト
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// 認証API呼び出し関数
export const login = (credentials) => {
  return api.post(AUTH.LOGIN, credentials);
};

export const register = (userData) => {
  return api.post(AUTH.REGISTER, userData);
};

export const logout = () => {
  return api.post(AUTH.LOGOUT);
};

export const forgotPassword = (email) => {
  return api.post(AUTH.FORGOT_PASSWORD, { email });
};

export const resetPassword = (token, newPassword) => {
  return api.post(AUTH.RESET_PASSWORD, { token, newPassword });
};

export const verifyInvitation = (code) => {
  return api.post(AUTH.VERIFY_INVITATION, { code });
};

export const getProfile = () => {
  return api.get(AUTH.ME);
};
```

### バックエンド実装

#### User.js モデル
```javascript
// /api/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'メールアドレスの形式が無効です']
  },
  password: {
    type: String,
    required: true,
    minlength: [8, 'パスワードは8文字以上必要です']
  },
  name: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  profilePicture: {
    type: String
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

// パスワードハッシュ化
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.updatedAt = Date.now();
    next();
  } catch (error) {
    next(error);
  }
});

// パスワード検証メソッド
UserSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);
```

#### authController.js
```javascript
// /api/controllers/authController.js
const authService = require('../services/authService');
const { validationResult } = require('express-validator');

// ログイン処理
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password, rememberMe } = req.body;
    const authResult = await authService.authenticateUser(email, password, rememberMe);
    
    if (authResult.success) {
      // リフレッシュトークンをHTTPOnly Cookieで設定
      if (authResult.refreshToken) {
        res.cookie('refresh_token', authResult.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7日間
        });
      }
      
      return res.status(200).json({
        success: true,
        token: authResult.token,
        user: authResult.user
      });
    } else {
      return res.status(401).json({
        success: false,
        message: '認証情報が無効です'
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password, invitationCode } = req.body;
    
    // 招待コードの検証
    const isValidInvitation = await authService.verifyInvitationCode(invitationCode);
    if (!isValidInvitation) {
      return res.status(400).json({
        success: false,
        message: '無効または期限切れの招待コードです'
      });
    }
    
    // ユーザー登録
    const registrationResult = await authService.registerUser(email, password);
    
    if (registrationResult.success) {
      // 使用済み招待コードをマーク
      await authService.markInvitationAsUsed(invitationCode, registrationResult.user.id);
      
      // リフレッシュトークンをHTTPOnly Cookieで設定
      if (registrationResult.refreshToken) {
        res.cookie('refresh_token', registrationResult.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7日間
        });
      }
      
      return res.status(201).json({
        success: true,
        token: registrationResult.token,
        user: registrationResult.user
      });
    } else {
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

// その他の認証コントローラー関数（パスワードリセット、プロフィール取得など）
```

#### authService.js
```javascript
// /api/services/authService.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Invitation = require('../models/Invitation');

// ユーザー認証
exports.authenticateUser = async (email, password, rememberMe = false) => {
  try {
    // ユーザー検索
    const user = await User.findOne({ email });
    if (!user) {
      return { success: false, message: '認証情報が無効です' };
    }
    
    // パスワード検証
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return { success: false, message: '認証情報が無効です' };
    }
    
    // トークン生成
    const token = generateAccessToken(user);
    
    // リフレッシュトークン生成（rememberMeがtrueの場合）
    let refreshToken = null;
    if (rememberMe) {
      refreshToken = generateRefreshToken(user);
    }
    
    return {
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        profilePicture: user.profilePicture
      }
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false, message: 'サーバーエラーが発生しました' };
  }
};

// ユーザー登録
exports.registerUser = async (email, password) => {
  try {
    // メールアドレスの重複チェック
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { success: false, message: 'このメールアドレスは既に使用されています' };
    }
    
    // 新規ユーザー作成
    const newUser = new User({
      email,
      password
    });
    
    await newUser.save();
    
    // トークン生成
    const token = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);
    
    return {
      success: true,
      token,
      refreshToken,
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      }
    };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: 'ユーザー登録に失敗しました' };
  }
};

// 招待コード検証
exports.verifyInvitationCode = async (code) => {
  try {
    const invitation = await Invitation.findOne({ 
      code, 
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });
    
    return !!invitation;
  } catch (error) {
    console.error('Invitation verification error:', error);
    return false;
  }
};

// 招待コードを使用済みにマーク
exports.markInvitationAsUsed = async (code, userId) => {
  try {
    await Invitation.findOneAndUpdate(
      { code },
      { 
        isUsed: true,
        usedBy: userId,
        usedAt: new Date()
      }
    );
    return true;
  } catch (error) {
    console.error('Marking invitation error:', error);
    return false;
  }
};

// アクセストークン生成
const generateAccessToken = (user) => {
  return jwt.sign(
    { 
      id: user._id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
};

// リフレッシュトークン生成
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' }
  );
};

// その他の認証サービス関数
```

#### auth.js ミドルウェア
```javascript
// /api/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT認証ミドルウェア
exports.authenticate = async (req, res, next) => {
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // ユーザー存在確認
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'ユーザーが見つかりません'
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
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'この操作を実行する権限がありません'
    });
  }
};
```

## セキュリティ対策

本認証システムでは以下のセキュリティ対策を実装しています：

1. **パスワードハッシュ化**： bcryptを使用した安全なハッシュ化
2. **JWT認証**： ステートレスな認証メカニズム
3. **HTTPOnly Cookie**： リフレッシュトークンのXSS攻撃防止
4. **アクセストークンとリフレッシュトークンの分離**： セキュリティレベルの向上
5. **トークン有効期限の設定**： 短期のアクセストークン
6. **入力検証**： すべての入力に対する徹底的な検証
7. **エラーメッセージの一般化**： センシティブな情報の漏洩防止
8. **HTTPS通信の強制**： 本番環境での安全な通信
9. **CORS設定**： 適切なオリジン制限

## 展開プラン

認証システムの実装は以下の順序で進められます：

1. モデル定義（User.js, Invitation.js）
2. ユーティリティとヘルパー関数の実装
3. 認証サービスの実装
4. コントローラーの実装
5. ミドルウェアの実装
6. フロントエンドの認証コンテキスト実装
7. ログイン/登録フォームの実装
8. API連携の実装
9. 保護されたルートの設定
10. テストとセキュリティレビュー

この段階的なアプローチにより、確実に堅牢な認証システムを構築することが可能となります。