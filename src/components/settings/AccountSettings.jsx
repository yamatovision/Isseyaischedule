import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { updateProfile, changePassword, deleteAccount } from '../../api/authApi';

/**
 * アカウント設定コンポーネント
 * 
 * プロフィール設定、パスワード変更、アカウント削除の機能を提供します。
 */
const AccountSettings = () => {
  const { user, logout } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // プロフィールデータの状態管理
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  
  // パスワード変更データの状態管理
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // プロフィールデータ変更ハンドラー
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };
  
  // パスワードデータ変更ハンドラー
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };
  
  // プロフィール更新送信ハンドラー
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const response = await updateProfile(profileData);
      setMessage({ type: 'success', text: 'プロフィールが正常に更新されました' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'プロフィールの更新に失敗しました' });
    } finally {
      setIsLoading(false);
    }
  };
  
  // パスワード変更送信ハンドラー
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    
    // 確認パスワードと新パスワードの一致を確認
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: '新しいパスワードと確認用パスワードが一致しません' });
      setIsLoading(false);
      return;
    }
    
    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setMessage({ type: 'success', text: 'パスワードが正常に変更されました' });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'パスワードの変更に失敗しました' });
    } finally {
      setIsLoading(false);
    }
  };
  
  // アカウント削除ハンドラー
  const handleAccountDelete = async () => {
    if (window.confirm('アカウントを削除しますか？この操作は取り消せません。')) {
      setIsLoading(true);
      try {
        await deleteAccount();
        logout(); // ログアウト処理
        // ログインページへリダイレクトは AuthContext 内で処理される
      } catch (error) {
        setMessage({ type: 'error', text: error.response?.data?.message || 'アカウントの削除に失敗しました' });
        setIsLoading(false);
      }
    }
  };
  
  // ユーザーのイニシャルを生成
  const getInitials = () => {
    if (!user?.name) return '?';
    return user.name.split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  return (
    <div>
      {/* プロフィール設定セクション */}
      <div className="settings-card">
        <h2 className="settings-card-title">プロフィール設定</h2>
        
        <div className="settings-avatar-container">
          <div className="settings-avatar">{getInitials()}</div>
          <div className="settings-avatar-actions">
            <button className="settings-button settings-button-secondary">画像を変更</button>
          </div>
        </div>
        
        <form onSubmit={handleProfileSubmit}>
          <div className="form-group">
            <label className="settings-form-label" htmlFor="name">名前</label>
            <input
              className="settings-input"
              type="text"
              id="name"
              name="name"
              value={profileData.name}
              onChange={handleProfileChange}
            />
          </div>
          
          <div className="form-group">
            <label className="settings-form-label" htmlFor="email">メールアドレス</label>
            <input
              className="settings-input"
              type="email"
              id="email"
              name="email"
              value={profileData.email}
              onChange={handleProfileChange}
            />
          </div>
          
          {message.type === 'success' && message.text && (
            <div className="success-message">{message.text}</div>
          )}
          
          {message.type === 'error' && message.text && (
            <div className="error-message">{message.text}</div>
          )}
          
          <div className="settings-form-actions">
            <button 
              className="settings-button" 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? '処理中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
      
      {/* パスワード変更セクション */}
      <div className="settings-card">
        <h2 className="settings-card-title">パスワード変更</h2>
        
        <form onSubmit={handlePasswordSubmit}>
          <div className="form-group">
            <label className="settings-form-label" htmlFor="currentPassword">現在のパスワード</label>
            <input
              className="settings-input"
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
            />
          </div>
          
          <div className="form-group">
            <label className="settings-form-label" htmlFor="newPassword">新しいパスワード</label>
            <input
              className="settings-input"
              type="password"
              id="newPassword"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
            />
          </div>
          
          <div className="form-group">
            <label className="settings-form-label" htmlFor="confirmPassword">パスワード確認</label>
            <input
              className="settings-input"
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
            />
          </div>
          
          <div className="settings-form-actions">
            <button 
              className="settings-button" 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? '処理中...' : 'パスワードを変更'}
            </button>
          </div>
        </form>
      </div>
      
      {/* アカウント削除セクション */}
      <div className="settings-card">
        <h2 className="settings-card-title">アカウント削除</h2>
        <p>アカウントを削除すると、すべてのデータが永久に削除されます。この操作は元に戻せません。</p>
        
        <div className="settings-form-actions">
          <button 
            className="settings-button settings-button-danger" 
            onClick={handleAccountDelete} 
            disabled={isLoading}
          >
            {isLoading ? '処理中...' : 'アカウントを削除'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;