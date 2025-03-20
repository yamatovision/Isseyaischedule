import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { verifyInvitation } from '../../api/authApi';

/**
 * 新規ユーザー登録フォームコンポーネント
 * 
 * メールアドレス、パスワード、招待コードによる新規ユーザー登録フォームを提供します。
 * 招待コードの検証とフォームバリデーションを実装しています。
 */
const RegisterForm = ({ onLoading, onError }) => {
  // 認証コンテキストから登録関数を取得
  const { register } = useContext(AuthContext);
  
  // フォームの状態管理
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    invitationCode: ''
  });
  
  // フォームのバリデーション状態
  const [validation, setValidation] = useState({
    passwordMatch: true,
    passwordStrength: true,
    invitationValid: null
  });
  
  // 入力フィールドの変更ハンドラ
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // フォームデータの更新
    setFormData({
      ...formData,
      [name]: value
    });
    
    // パスワード入力時のバリデーション
    if (name === 'password' || name === 'confirmPassword') {
      // パスワードの一致チェック（confirmPasswordが入力されている場合のみ）
      if (formData.confirmPassword || name === 'confirmPassword') {
        const match = name === 'password' 
          ? value === formData.confirmPassword
          : formData.password === value;
        
        setValidation(prev => ({
          ...prev,
          passwordMatch: match
        }));
      }
      
      // パスワード強度チェック（passwordが入力されている場合のみ）
      if (name === 'password' && value) {
        // 少なくとも8文字で、英数字混合であるか確認
        const isStrong = value.length >= 8 && 
                        /[A-Za-z]/.test(value) && 
                        /[0-9]/.test(value);
        
        setValidation(prev => ({
          ...prev,
          passwordStrength: isStrong
        }));
      }
    }
    
    // 招待コードの検証（コードが入力されたら自動的に検証を開始）
    if (name === 'invitationCode' && value.length >= 8) {
      validateInvitationCode(value);
    }
  };
  
  // 招待コードの検証関数
  const validateInvitationCode = async (code) => {
    // コードが空の場合は検証しない
    if (!code) return;
    
    try {
      onLoading(true); // ローディング状態の設定
      console.log('【登録】招待コードの検証を開始します');
      
      const response = await verifyInvitation(code);
      
      // 検証結果の更新
      setValidation(prev => ({
        ...prev,
        invitationValid: response.data.status === 'success'
      }));
      
      // 無効な招待コードの場合はエラーを表示
      if (response.data.status !== 'success') {
        onError('無効な招待コードです。正しい招待コードを入力してください。');
      } else {
        onError(null); // エラーをクリア
      }
    } catch (error) {
      console.error('【登録エラー】招待コード検証に失敗しました', error);
      setValidation(prev => ({
        ...prev,
        invitationValid: false
      }));
      onError('招待コードの検証に失敗しました。もう一度お試しください。');
    } finally {
      onLoading(false); // ローディング状態の解除
    }
  };
  
  // フォーム送信ハンドラ
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 基本的なバリデーション
    if (!formData.email || !formData.password || !formData.invitationCode) {
      onError('すべての項目を入力してください');
      return;
    }
    
    // パスワード一致チェック
    if (formData.password !== formData.confirmPassword) {
      setValidation(prev => ({
        ...prev,
        passwordMatch: false
      }));
      onError('パスワードが一致しません');
      return;
    }
    
    // パスワード強度チェック
    const isPasswordStrong = formData.password.length >= 8 && 
                            /[A-Za-z]/.test(formData.password) && 
                            /[0-9]/.test(formData.password);
    
    if (!isPasswordStrong) {
      setValidation(prev => ({
        ...prev,
        passwordStrength: false
      }));
      onError('パスワードは8文字以上で、英字と数字を含める必要があります');
      return;
    }
    
    try {
      // ローディング状態の設定
      onLoading(true);
      console.log('【登録】ユーザー登録処理を開始します');
      
      // 登録データの準備（確認用パスワードは除く）
      const registerData = {
        email: formData.email,
        password: formData.password,
        invitationCode: formData.invitationCode
      };
      
      // AuthContextの登録関数を呼び出し
      await register(registerData);
      
      // 成功した場合は自動的にリダイレクトされるので、
      // ここで特に何かする必要はありません
    } catch (error) {
      // エラーメッセージの処理
      console.error('【登録エラー】', error);
      const errorMsg = error.response?.data?.message || 'ユーザー登録に失敗しました。入力情報を確認してください。';
      onError(errorMsg);
    } finally {
      // 処理完了後、ローディング状態を解除
      onLoading(false);
    }
  };
  
  // Googleログインハンドラ（OAuth処理）
  const handleGoogleLogin = () => {
    onError('Google登録は現在準備中です。メールアドレスとパスワードで登録してください。');
    // 実際のGoogle OAuth実装は後日行う
  };
  
  return (
    <form className="register-form" onSubmit={handleSubmit}>
      {/* メールアドレス入力フィールド */}
      <div className="form-group">
        <label htmlFor="register-email">メールアドレス</label>
        <input
          type="email"
          id="register-email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="メールアドレスを入力"
          required
        />
      </div>
      
      {/* パスワード入力フィールド */}
      <div className="form-group">
        <label htmlFor="register-password">パスワード</label>
        <input
          type="password"
          id="register-password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="8文字以上、英数字を含む"
          required
        />
        {formData.password && !validation.passwordStrength && (
          <p className="validation-error">パスワードは8文字以上で、英字と数字を含む必要があります</p>
        )}
      </div>
      
      {/* パスワード確認フィールド */}
      <div className="form-group">
        <label htmlFor="confirm-password">パスワード（確認）</label>
        <input
          type="password"
          id="confirm-password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="パスワードを再入力"
          required
        />
        {formData.confirmPassword && !validation.passwordMatch && (
          <p className="validation-error">パスワードが一致しません</p>
        )}
      </div>
      
      {/* 招待コード入力フィールド */}
      <div className="form-group">
        <label htmlFor="invitation-code">招待コード</label>
        <input
          type="text"
          id="invitation-code"
          name="invitationCode"
          value={formData.invitationCode}
          onChange={handleChange}
          placeholder="管理者から提供された招待コードを入力"
          required
        />
        {validation.invitationValid === false && (
          <p className="validation-error">無効な招待コードです</p>
        )}
        {validation.invitationValid === true && (
          <p className="validation-success">有効な招待コードです</p>
        )}
      </div>
      
      {/* 登録ボタン */}
      <button type="submit" className="register-button">
        アカウント登録
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
        Googleで登録
      </button>
      
      {/* 招待制についての説明 */}
      <div className="invitation-note">
        <p>※ プランナビは招待制です。招待コードなしではご登録いただけません。</p>
      </div>
    </form>
  );
};

export default RegisterForm;