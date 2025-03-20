import React, { createContext, useState, useEffect } from 'react';
import { getToken, setToken, removeToken } from '../utils/auth.js';

// API呼び出しをインポート
import { login, register, logout, getProfile } from '../api/authApi';

/**
 * 認証コンテキスト
 * 
 * アプリケーション全体で認証状態を管理するためのコンテキスト
 * - ユーザー情報
 * - 認証状態
 * - ログイン/ログアウト/登録機能
 * を提供します。
 */
// コンテキストの作成
export const AuthContext = createContext();

// AuthProviderコンポーネント
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 初期認証状態チェック
  useEffect(() => {
    const initAuth = async () => {
      console.log('【認証】初期認証状態を確認中...');
      try {
        const token = getToken();
        console.log('【認証】トークンの存在:', !!token);
        
        if (token) {
          try {
            // 実際のAPI呼び出し
            console.log('【認証】プロフィール取得API呼び出し');
            const response = await getProfile();
            console.log('【認証】プロフィール取得結果:', response.status);
            
            if (response.status === 'success') {
              console.log('【認証】認証成功 - ユーザー:', response.data.user.email);
              setUser(response.data.user);
              setIsAuthenticated(true);
            } else {
              console.log('【認証】トークンは存在するが、APIレスポンスが失敗 - リフレッシュを試みます');
              // TODO: リフレッシュトークン実装後に追加
              // refreshTokenをAPIから取得するロジックを実装
              removeToken();
            }
          } catch (apiErr) {
            console.error('【API連携エラー】プロフィール取得に失敗しました', apiErr);
            // リフレッシュトークンを使ってトークンを再取得するロジックをここに実装
            removeToken();
          }
        } else {
          console.log('【認証】トークンなし - 未認証状態');
          // トークンがない場合は未認証状態として処理
          setUser(null);
          setIsAuthenticated(false);
          // ログイン画面以外の場合はログイン画面へリダイレクト
          if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
            console.log('【認証】トークンがないためログイン画面へリダイレクトします');
            window.location.href = '/login';
          }
        }
      } catch (err) {
        console.error('【認証エラー】初期化処理でエラーが発生しました', err);
        removeToken();
      } finally {
        console.log('【認証】初期認証チェック完了 - ローディング状態を解除');
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
      // 実際のAPI呼び出し
      const response = await login(credentials);
      console.log('ログインレスポンス:', response);
      
      // API応答をバックエンド形式に合わせて処理
      if (response.success && response.token) {
        // localStorage に正しく保存
        setToken(response.token);
        setUser(response.user || { id: 'unknown', email: credentials.email });
        setIsAuthenticated(true);
        
        // 認証情報を保存後、最新の認証情報を取得してみる
        try {
          console.log('【認証】ログイン後に最新プロフィールを取得します');
          const profileResponse = await getProfile();
          if (profileResponse.success) {
            console.log('【認証】プロフィール取得に成功しました', profileResponse.user);
            setUser(profileResponse.user);
          }
        } catch (profileErr) {
          console.error('【認証】プロフィール取得に失敗しましたが、ログインは成功しています', profileErr);
        }
        
        // AuthContext内部の形式に変換して返す
        return {
          status: 'success',
          data: {
            token: response.token,
            user: response.user
          }
        };
      }
    } catch (err) {
      console.error('【API連携エラー】ログインに失敗しました', err);
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
      // 実際のAPI呼び出し
      const response = await register(userData);
      if (response.status === 'success') {
        setToken(response.data.token);
        setUser(response.data.user);
        setIsAuthenticated(true);
        return response.data;
      }
    } catch (err) {
      console.error('【API連携エラー】ユーザー登録に失敗しました', err);
      setError(err.response?.data?.message || '登録に失敗しました');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ログアウト処理
  const handleLogout = async () => {
    try {
      // 実際のAPI呼び出し
      await logout();
    } catch (err) {
      console.error('【API連携エラー】ログアウトに失敗しました', err);
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

// default exportは使用しない（循環参照の防止）