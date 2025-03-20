import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import AccountSettings from '../components/settings/AccountSettings';

/**
 * 設定画面ページ
 * 
 * ユーザー設定を管理する画面です。
 * - アカウント設定（プロフィール、パスワード変更、アカウント削除）
 */
const Settings = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="settings-container">Loading...</div>;
  }

  if (!user) {
    return <div className="settings-container">認証が必要です</div>;
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>アカウント設定</h1>
      </div>
      
      <div className={`settings-tab-content active`}>
        <AccountSettings />
      </div>
    </div>
  );
};

export default Settings;