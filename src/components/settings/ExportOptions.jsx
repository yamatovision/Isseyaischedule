import React, { useState } from 'react';

/**
 * エクスポートオプションコンポーネント
 * 
 * データのエクスポート形式や内容の設定を管理します。
 */
const ExportOptions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // エクスポート設定の状態管理
  const [exportSettings, setExportSettings] = useState({
    format: 'pdf',
    content: {
      allPlans: true,
      taskList: true,
      progressStatus: true
    }
  });
  
  // エクスポート形式変更ハンドラー
  const handleFormatChange = (e) => {
    setExportSettings(prev => ({
      ...prev,
      format: e.target.value
    }));
  };
  
  // エクスポート内容変更ハンドラー
  const handleContentChange = (contentType) => {
    setExportSettings(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [contentType]: !prev.content[contentType]
      }
    }));
  };
  
  // エクスポート実行ハンドラー
  const handleExport = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      // API連携は実装済みの場合はここで実行
      // 実際のシステムではここでエクスポートAPIを呼び出す
      // const response = await exportData(exportSettings);
      
      // 成功時の処理
      setTimeout(() => {
        setMessage({ type: 'success', text: `データが${exportSettings.format.toUpperCase()}形式でエクスポートされました` });
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      setMessage({ type: 'error', text: 'エクスポートに失敗しました' });
      setIsLoading(false);
    }
  };
  
  return (
    <div className="settings-card">
      <h2 className="settings-card-title">データエクスポート</h2>
      
      <form onSubmit={handleExport}>
        <div className="form-group">
          <label className="settings-form-label">エクスポート形式</label>
          
          <div className="checkbox-group">
            <input 
              type="radio" 
              name="export-format" 
              id="export-pdf" 
              value="pdf"
              checked={exportSettings.format === 'pdf'} 
              onChange={handleFormatChange}
            />
            <label htmlFor="export-pdf">PDF</label>
          </div>
          
          <div className="checkbox-group">
            <input 
              type="radio" 
              name="export-format" 
              id="export-excel" 
              value="excel"
              checked={exportSettings.format === 'excel'} 
              onChange={handleFormatChange}
            />
            <label htmlFor="export-excel">Excel</label>
          </div>
          
          <div className="checkbox-group">
            <input 
              type="radio" 
              name="export-format" 
              id="export-csv" 
              value="csv"
              checked={exportSettings.format === 'csv'} 
              onChange={handleFormatChange}
            />
            <label htmlFor="export-csv">CSV</label>
          </div>
        </div>
        
        <div className="form-group">
          <label className="settings-form-label">エクスポート内容</label>
          
          <div className="checkbox-group">
            <input 
              type="checkbox" 
              id="export-all-plans" 
              checked={exportSettings.content.allPlans} 
              onChange={() => handleContentChange('allPlans')}
            />
            <label htmlFor="export-all-plans">すべてのプラン</label>
          </div>
          
          <div className="checkbox-group">
            <input 
              type="checkbox" 
              id="export-tasks" 
              checked={exportSettings.content.taskList} 
              onChange={() => handleContentChange('taskList')}
            />
            <label htmlFor="export-tasks">タスク一覧</label>
          </div>
          
          <div className="checkbox-group">
            <input 
              type="checkbox" 
              id="export-progress" 
              checked={exportSettings.content.progressStatus} 
              onChange={() => handleContentChange('progressStatus')}
            />
            <label htmlFor="export-progress">進捗状況</label>
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
            disabled={isLoading}
          >
            {isLoading ? '処理中...' : 'エクスポート'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExportOptions;