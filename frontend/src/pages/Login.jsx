import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import LoadingSpinner from '../components/common/LoadingSpinner';

/**
 * ログイン/新規登録ページコンポーネント
 * 
 * このページでは以下の機能を提供します：
 * - 既存ユーザーのログイン
 * - 招待コードを使った新規ユーザー登録
 * - ログイン/登録フォームの切り替え
 * - エラーメッセージの表示
 * - ログイン成功時のリダイレクト
 */
const Login = () => {
  // 認証コンテキストから認証状態と関数を取得
  const { isAuthenticated, loading, error } = useContext(AuthContext);
  
  // ローカルの状態管理
  const [isLogin, setIsLogin] = useState(true); // ログインモードか登録モードか
  const [localLoading, setLocalLoading] = useState(false); // ローカルの読み込み状態
  const [localError, setLocalError] = useState(null); // ローカルのエラーメッセージ
  
  // リダイレクト用のフック
  const navigate = useNavigate();
  const location = useLocation();
  
  // リダイレクト先（クエリパラメータから取得、なければダッシュボード）
  const from = location.state?.from?.pathname || '/dashboard';

  // 認証状態が変わったときのリダイレクト処理
  useEffect(() => {
    console.log('【ログイン】認証状態の変更を検知: isAuthenticated=', isAuthenticated, 'loading=', loading);
    
    // すでに認証済みで、ローディングが完了している場合
    if (isAuthenticated && !loading) {
      console.log('【ログイン】認証済みユーザーをリダイレクトします', from);
      
      // リダイレクトを即時実行
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, loading, navigate, from]);

  // 認証コンテキストのエラーをローカルにコピー
  useEffect(() => {
    if (error) {
      setLocalError(error);
    }
  }, [error]);

  // ログイン/登録モードの切り替え
  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setLocalError(null); // モード切り替え時にエラーをクリア
  };

  // 処理中に表示するローディングスピナー
  if (loading || localLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          {/* ロゴと見出し */}
          <div className="login-header">
            <img 
              src="/logo.svg" 
              alt="プランナビ"
              className="login-logo"
              onError={(e) => {
                e.target.onerror = null;
                // 外部サービスを使わずテキストとして表示
                e.target.style.display = 'none';
                const textLogo = document.createElement('div');
                textLogo.textContent = 'プランナビ';
                textLogo.style.fontSize = '24px';
                textLogo.style.fontWeight = 'bold';
                textLogo.style.margin = '10px 0';
                e.target.parentNode.insertBefore(textLogo, e.target.nextSibling);
              }}
            />
            <h1 className="login-title">{isLogin ? 'ログイン' : '新規登録'}</h1>
            <p className="login-subtitle">
              {isLogin 
                ? '経営管理ツールへログイン' 
                : '招待コードを使って新しいアカウントを作成'}
            </p>
          </div>

          {/* エラーメッセージ */}
          {localError && (
            <div className="login-error">
              <p>{localError}</p>
            </div>
          )}

          {/* ログイン/登録フォーム */}
          <div className="login-form-container">
            {isLogin ? (
              <LoginForm 
                onLoading={setLocalLoading}
                onError={setLocalError}
              />
            ) : (
              <RegisterForm 
                onLoading={setLocalLoading}
                onError={setLocalError}
              />
            )}
          </div>

          {/* モード切り替えリンク */}
          <div className="login-mode-toggle">
            <p>
              {isLogin ? 'アカウントをお持ちでないですか？' : 'すでにアカウントをお持ちですか？'}
            </p>
            <button 
              onClick={toggleAuthMode}
              className="login-toggle-button"
            >
              {isLogin ? '新規登録' : 'ログイン'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;