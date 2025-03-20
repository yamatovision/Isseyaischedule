import React, { useState } from 'react';

/**
 * 通知設定コンポーネント
 * 
 * アプリ内通知やメール通知などの設定を管理します。
 */
const NotificationSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // 通知設定の状態管理
  const [notificationSettings, setNotificationSettings] = useState({
    appNotifications: true,
    emailNotifications: true,
    reminders: {
      oneDay: true,
      threeDays: true,
      oneWeek: false
    },
    notificationTime: '10:00'
  });
  
  // トグル切り替えハンドラー
  const handleToggleChange = (setting) => {
    setNotificationSettings(prev => {
      if (setting === 'appNotifications' || setting === 'emailNotifications') {
        return { ...prev, [setting]: !prev[setting] };
      }
      return prev;
    });
  };
  
  // リマインダー設定変更ハンドラー
  const handleReminderChange = (reminderType) => {
    setNotificationSettings(prev => {
      return {
        ...prev,
        reminders: {
          ...prev.reminders,
          [reminderType]: !prev.reminders[reminderType]
        }
      };
    });
  };
  
  // 通知時間変更ハンドラー
  const handleTimeChange = (e) => {
    setNotificationSettings(prev => ({
      ...prev,
      notificationTime: e.target.value
    }));
  };
  
  // 設定保存ハンドラー
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      // API連携は実装済みの場合はここで実行
      // await updateNotificationSettings(notificationSettings);
      
      // 成功時の処理
      setTimeout(() => {
        setMessage({ type: 'success', text: '通知設定が正常に保存されました' });
        setIsLoading(false);
      }, 500);
    } catch (error) {
      setMessage({ type: 'error', text: '通知設定の保存に失敗しました' });
      setIsLoading(false);
    }
  };
  
  return (
    <div className="settings-card">
      <h2 className="settings-card-title">通知設定</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="toggle-container">
          <span className="toggle-label">アプリ内通知</span>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={notificationSettings.appNotifications} 
              onChange={() => handleToggleChange('appNotifications')}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
        
        <div className="toggle-container">
          <span className="toggle-label">メール通知</span>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={notificationSettings.emailNotifications} 
              onChange={() => handleToggleChange('emailNotifications')}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
        
        <div className="settings-divider"></div>
        
        <h3 style={{ marginBottom: '16px' }}>タスク通知</h3>
        
        <div className="form-group">
          <label className="settings-form-label">リマインダー通知</label>
          
          <div className="checkbox-group">
            <input 
              type="checkbox" 
              id="remind-1day" 
              checked={notificationSettings.reminders.oneDay} 
              onChange={() => handleReminderChange('oneDay')}
            />
            <label htmlFor="remind-1day">期限の1日前</label>
          </div>
          
          <div className="checkbox-group">
            <input 
              type="checkbox" 
              id="remind-3days" 
              checked={notificationSettings.reminders.threeDays} 
              onChange={() => handleReminderChange('threeDays')}
            />
            <label htmlFor="remind-3days">期限の3日前</label>
          </div>
          
          <div className="checkbox-group">
            <input 
              type="checkbox" 
              id="remind-1week" 
              checked={notificationSettings.reminders.oneWeek} 
              onChange={() => handleReminderChange('oneWeek')}
            />
            <label htmlFor="remind-1week">期限の1週間前</label>
          </div>
        </div>
        
        <div className="form-group">
          <label className="settings-form-label" htmlFor="notification-time">通知時間</label>
          <select 
            id="notification-time" 
            className="settings-input" 
            value={notificationSettings.notificationTime} 
            onChange={handleTimeChange}
          >
            <option value="9:00">9:00</option>
            <option value="10:00">10:00</option>
            <option value="12:00">12:00</option>
            <option value="15:00">15:00</option>
            <option value="18:00">18:00</option>
          </select>
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
  );
};

export default NotificationSettings;