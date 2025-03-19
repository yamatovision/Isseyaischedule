import React, { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

/**
 * ログインフォームコンポーネント
 * 
 * メールアドレスとパスワードによるログインフォームを提供します。
 * 「ログイン情報を保存」オプションとGoogleログインも実装。
 */
const LoginForm = ({ onLoading, onError }) => {
  // 認証コンテキストからログイン関数を取得
  const { login } = useContext(AuthContext);
  
  // マウント状態を追跡するref
  const isMountedRef = useRef(true);
  
  // アンマウント時にフラグを更新
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  // フォームの状態管理
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  // 入力フィールドの変更ハンドラ
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    // チェックボックスの場合はchecked、それ以外はvalueを使用
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // 状態を安全に更新する関数
  const safeSetLoading = (state) => {
    if (isMountedRef.current) {
      onLoading(state);
    } else {
      console.log('【ログイン】コンポーネントはアンマウントされているため、状態を更新しません');
    }
  };
  
  const safeSetError = (error) => {
    if (isMountedRef.current) {
      onError(error);
    } else {
      console.log('【ログイン】コンポーネントはアンマウントされているため、エラーを更新しません');
    }
  };
  
  // フォーム送信ハンドラ
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // フォームバリデーション
    if (!formData.email || !formData.password) {
      safeSetError('メールアドレスとパスワードを入力してください');
      return;
    }
    
    try {
      // ローディング状態を設定
      safeSetLoading(true);
      console.log('【ログイン】ログイン処理を開始します:', formData.email);
      
      // AuthContextのログイン関数を呼び出し
      const result = await login(formData);
      console.log('【ログイン】ログイン成功:', result);
      
      // 成功時の処理（必要に応じて）
      if (isMountedRef.current) {
        console.log('【ログイン】コンポーネントがまだマウントされています');
      } else {
        console.log('【ログイン】コンポーネントはすでにアンマウントされています');
      }
    } catch (error) {
      // エラーメッセージの処理
      console.error('【ログインエラー】', error);
      const errorMsg = error.response?.data?.message || 'ログインに失敗しました。認証情報を確認してください。';
      safeSetError(errorMsg);
    } finally {
      // 処理完了後、ローディング状態を解除（コンポーネントがマウントされている場合のみ）
      if (isMountedRef.current) {
        safeSetLoading(false);
      }
    }
  };
  
  // Googleログインハンドラ（OAuth処理）
  const handleGoogleLogin = () => {
    safeSetError('Googleログインは現在準備中です。メールアドレスとパスワードでログインしてください。');
    // 実際のGoogle OAuth実装は後日行う
  };
  
  // パスワードリセットハンドラ
  const handleForgotPassword = () => {
    safeSetError('パスワードリセット機能は現在準備中です。');
    // パスワードリセット画面へのリンクや処理を実装予定
  };
  
  return (
    <form className="login-form" onSubmit={handleSubmit}>
      {/* メールアドレス入力フィールド */}
      <div className="form-group">
        <label htmlFor="email">メールアドレス</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="メールアドレスを入力"
          required
        />
      </div>
      
      {/* パスワード入力フィールド */}
      <div className="form-group">
        <label htmlFor="password">パスワード</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="パスワードを入力"
          required
        />
      </div>
      
      {/* ログイン情報を保存するチェックボックスとパスワードを忘れた場合のリンク */}
      <div className="form-options">
        <div className="remember-me">
          <input
            type="checkbox"
            id="rememberMe"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
          />
          <label htmlFor="rememberMe">ログイン情報を保存</label>
        </div>
        
        <button
          type="button"
          className="forgot-password-link"
          onClick={handleForgotPassword}
        >
          パスワードをお忘れですか？
        </button>
      </div>
      
      {/* ログインボタン */}
      <button type="submit" className="login-button">
        ログイン
      </button>
      
      {/* または区切り線 */}
      <div className="login-divider">
        <span>または</span>
      </div>
      
      {/* Googleログインボタン */}
      <button
        type="button"
        className="google-login-button"
        onClick={handleGoogleLogin}
      >
        <svg className="google-icon" viewBox="0 0 24 24">
          <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
        </svg>
        Googleでログイン
      </button>
    </form>
  );
};

export default LoginForm;