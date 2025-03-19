import React, { useContext } from 'react';
import { ThemeContext } from '../../contexts/ThemeContext';

/**
 * タスクリストコンポーネント
 * 
 * 直近の期限を迎えるタスクのリストを表示します。
 * 優先度によって視覚的に区別され、タスク名、関連プロジェクト、期限日を表示します。
 * 
 * 表示する直近タスクの基準:
 * 1. 期限切れタスク（最優先）
 * 2. 今日期限のタスク
 * 3. 今後7日以内に期限を迎えるタスク
 * 4. その他の未完了タスク（期限が近い順）
 */
const TaskList = ({ tasks, onTaskToggle }) => {
  // テーマコンテキストの利用
  const { isDarkMode } = useContext(ThemeContext);
  
  // タスクの整理とフィルタリング
  const processedTasks = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const oneWeekLater = new Date(today);
    oneWeekLater.setDate(oneWeekLater.getDate() + 7);
    
    // タスクを日付でソート
    return tasks
      .map(task => {
        const dueDate = new Date(task.dueDate || task.endDate);
        dueDate.setHours(0, 0, 0, 0);
        
        // タスクの状態を判断
        let status = 'upcoming';
        if (dueDate < today && !task.completed) {
          status = 'overdue'; // 期限切れ
        } else if (dueDate.getTime() === today.getTime()) {
          status = 'today'; // 今日期限
        } else if (dueDate <= oneWeekLater) {
          status = 'thisWeek'; // 今週期限
        }
        
        return {
          ...task,
          dueDateObj: dueDate,
          status
        };
      })
      .sort((a, b) => {
        // 1. 完了していないタスクを優先
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        
        // 2. ステータス優先度順（期限切れ > 今日 > 今週 > その他）
        const statusPriority = { overdue: 0, today: 1, thisWeek: 2, upcoming: 3 };
        if (a.status !== b.status) {
          return statusPriority[a.status] - statusPriority[b.status];
        }
        
        // 3. 日付順
        return a.dueDateObj - b.dueDateObj;
      })
      .slice(0, 5); // 最大5件まで表示
  }, [tasks]);
  
  // 優先度に応じたスタイルクラスを取得
  const getPriorityClass = (priority) => {
    switch(priority) {
      case 'high': return 'task-priority-high';
      case 'medium': return 'task-priority-medium';
      case 'low': return 'task-priority-low';
      default: return '';
    }
  };
  
  // 優先度に応じたラベルテキストと色を取得
  const getPriorityInfo = (priority) => {
    switch(priority) {
      case 'high':
        return {
          label: '高',
          bgColor: isDarkMode ? 'bg-red-800' : 'bg-red-100',
          textColor: isDarkMode ? 'text-red-200' : 'text-red-800'
        };
      case 'medium':
        return {
          label: '中',
          bgColor: isDarkMode ? 'bg-yellow-800' : 'bg-yellow-100',
          textColor: isDarkMode ? 'text-yellow-200' : 'text-yellow-800'
        };
      case 'low':
        return {
          label: '低',
          bgColor: isDarkMode ? 'bg-green-800' : 'bg-green-100',
          textColor: isDarkMode ? 'text-green-200' : 'text-green-800'
        };
      default:
        return {
          label: '通常',
          bgColor: isDarkMode ? 'bg-gray-700' : 'bg-gray-100',
          textColor: isDarkMode ? 'text-gray-300' : 'text-gray-800'
        };
    }
  };
  
  // 日付をフォーマット
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ja-JP', options);
  };
  
  // タスク期限ステータスに基づく表示スタイル
  const getTaskStatusStyle = (status) => {
    switch(status) {
      case 'overdue':
        return isDarkMode ? 'text-red-400' : 'text-red-600';
      case 'today':
        return isDarkMode ? 'text-yellow-400' : 'text-yellow-600';
      default:
        return '';
    }
  };
  
  return (
    <div className={`dashboard-card ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <h3 className={`text-lg font-medium p-4 pb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
        直近の期限タスク
      </h3>
      
      {processedTasks.length === 0 ? (
        <div className={`p-4 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          直近の期限タスクはありません
        </div>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {processedTasks.map((task) => {
            const priorityInfo = getPriorityInfo(task.priority);
            const statusStyle = getTaskStatusStyle(task.status);
            
            return (
              <li key={task.id} className={`relative ${getPriorityClass(task.priority)}`}>
                <div className="flex items-center px-4 py-3">
                  <button
                    className={`mr-3 flex-shrink-0 ${isDarkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-500 hover:text-blue-600'}`}
                    onClick={() => onTaskToggle(task.id)}
                    aria-label={task.completed ? 'タスクを未完了に設定' : 'タスクを完了に設定'}
                  >
                    {task.completed ? (
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    )}
                  </button>
                  
                  <div className="flex-grow min-w-0">
                    <p className={`font-medium truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-900'} ${task.completed ? 'line-through opacity-70' : ''}`}>
                      {task.title}
                    </p>
                    <p className={`text-sm truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} ${statusStyle}`}>
                      {task.planTitle || "プロジェクト"} | 
                      期限: {formatDate(task.dueDate || task.endDate)}
                      {task.status === 'overdue' && !task.completed && " (期限切れ)"}
                    </p>
                  </div>
                  
                  <div className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityInfo.bgColor} ${priorityInfo.textColor}`}>
                    {priorityInfo.label}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      
      {processedTasks.length > 0 && (
        <div className={`p-3 border-t text-center ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button className={`text-sm font-medium ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}>
            すべてのタスクを表示
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskList;