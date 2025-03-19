import React, { useState } from 'react';

/**
 * カレンダー連携コンポーネント
 * 
 * Googleカレンダーなどの外部カレンダーとの連携設定を管理します。
 */
const CalendarIntegration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // カレンダー連携設定の状態管理
  const [calendarSettings, setCalendarSettings] = useState({
    googleCalendarEnabled: false,
    syncAll: true,
    syncSpecific: false,
    syncContent: {
      taskDeadlines: true,
      milestones: true
    }
  });
  
  // カレンダー連携のトグル変更ハンドラー
  const handleToggleCalendar = () => {
    setCalendarSettings(prev => ({
      ...prev,
      googleCalendarEnabled: !prev.googleCalendarEnabled
    }));
  };
  
  // 同期プランの変更ハンドラー
  const handleSyncChange = (type) => {
    if (type === 'all') {
      setCalendarSettings(prev => ({
        ...prev,
        syncAll: true,
        syncSpecific: false
      }));
    } else {
      setCalendarSettings(prev => ({
        ...prev,
        syncAll: false,
        syncSpecific: true
      }));
    }
  };
  
  // 同期内容の変更ハンドラー
  const handleContentChange = (type) => {
    setCalendarSettings(prev => ({
      ...prev,
      syncContent: {
        ...prev.syncContent,
        [type]: !prev.syncContent[type]
      }
    }));
  };
  
  // カレンダー接続ハンドラー
  const handleConnectCalendar = () => {
    // 実際の実装では、Google OAuth認証フローに遷移させる
    alert('実際の実装時には、Googleの認証画面が表示されます');
  };
  
  // 設定保存ハンドラー
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      // API連携は実装済みの場合はここで実行
      // await updateCalendarSettings(calendarSettings);
      
      // 成功時の処理
      setTimeout(() => {
        setMessage({ type: 'success', text: 'カレンダー連携設定が正常に保存されました' });
        setIsLoading(false);
      }, 500);
    } catch (error) {
      setMessage({ type: 'error', text: 'カレンダー連携設定の保存に失敗しました' });
      setIsLoading(false);
    }
  };
  
  return (
    <div className="settings-card">
      <h2 className="settings-card-title">カレンダー連携</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="toggle-container">
          <span className="toggle-label">Googleカレンダーと連携</span>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={calendarSettings.googleCalendarEnabled} 
              onChange={handleToggleCalendar}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
        
        <button 
          type="button" 
          className="settings-button settings-button-secondary" 
          style={{ marginBottom: '24px' }} 
          onClick={handleConnectCalendar}
          disabled={calendarSettings.googleCalendarEnabled}
        >
          <span style={{ fontSize: '18px', marginRight: '8px', verticalAlign: 'middle' }}>+</span>
          カレンダーを接続
        </button>
        
        <div className="settings-divider"></div>
        
        <h3 style={{ marginBottom: '16px' }}>連携設定</h3>
        
        <div className="form-group">
          <label className="settings-form-label">同期するプラン</label>
          
          <div className="checkbox-group">
            <input 
              type="checkbox" 
              id="sync-all" 
              checked={calendarSettings.syncAll} 
              onChange={() => handleSyncChange('all')}
            />
            <label htmlFor="sync-all">すべてのプラン</label>
          </div>
          
          <div className="checkbox-group">
            <input 
              type="checkbox" 
              id="sync-specific" 
              checked={calendarSettings.syncSpecific} 
              onChange={() => handleSyncChange('specific')}
              disabled={!calendarSettings.googleCalendarEnabled}
            />
            <label htmlFor="sync-specific">特定のプランのみ</label>
          </div>
        </div>
        
        <div className="form-group">
          <label className="settings-form-label">同期内容</label>
          
          <div className="checkbox-group">
            <input 
              type="checkbox" 
              id="sync-tasks" 
              checked={calendarSettings.syncContent.taskDeadlines} 
              onChange={() => handleContentChange('taskDeadlines')}
              disabled={!calendarSettings.googleCalendarEnabled}
            />
            <label htmlFor="sync-tasks">タスク期限</label>
          </div>
          
          <div className="checkbox-group">
            <input 
              type="checkbox" 
              id="sync-milestones" 
              checked={calendarSettings.syncContent.milestones} 
              onChange={() => handleContentChange('milestones')}
              disabled={!calendarSettings.googleCalendarEnabled}
            />
            <label htmlFor="sync-milestones">マイルストーン</label>
          </div>
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
            disabled={isLoading || !calendarSettings.googleCalendarEnabled}
          >
            {isLoading ? '処理中...' : '保存'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CalendarIntegration;