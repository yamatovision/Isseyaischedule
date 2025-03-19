/**
 * ガントチャート関連ユーティリティ
 * Chat-to-Ganttでのガントチャート表示機能
 * 
 * 変更履歴:
 * - 2025/03/19: 初期実装 (Claude)
 */

/**
 * タスクデータからガントチャート表示用のデータを生成
 * @param {Array} tasks タスクリスト
 * @param {Date} startDate プロジェクト開始日
 * @param {Date} endDate プロジェクト終了日
 * @returns {Object} ガントチャート表示用データ
 */
export const prepareGanttData = (tasks, startDate, endDate) => {
  if (!tasks || tasks.length === 0) return { tasks: [], timeRange: [] };
  
  // 全体の日付範囲を調整
  let start, end;
  
  // startDateがDate型に変換可能かチェック
  if (startDate) {
    start = startDate instanceof Date ? startDate : new Date(startDate);
    if (isNaN(start.getTime())) {
      // 無効な日付の場合は最初のタスクの開始日を使用
      start = new Date(Math.min(...tasks.map(t => new Date(t.startDate).getTime())));
    }
  } else {
    start = new Date(Math.min(...tasks.map(t => new Date(t.startDate).getTime())));
  }
  
  // endDateがDate型に変換可能かチェック
  if (endDate) {
    end = endDate instanceof Date ? endDate : new Date(endDate);
    if (isNaN(end.getTime())) {
      // 無効な日付の場合は最後のタスクの終了日を使用
      end = new Date(Math.max(...tasks.map(t => new Date(t.dueDate || t.endDate).getTime())));
    }
  } else {
    end = new Date(Math.max(...tasks.map(t => new Date(t.dueDate || t.endDate).getTime())));
  }
  
  // 1ヶ月単位で時間範囲を生成
  const timeRange = getMonthRange(start, end);
  
  // タスクの整形
  const formattedTasks = tasks.map(task => ({
    id: task._id,
    title: task.title,
    description: task.description,
    startDate: new Date(task.startDate),
    endDate: new Date(task.dueDate || task.endDate),
    startPosition: calculatePosition(new Date(task.startDate), start, end),
    duration: calculateDuration(new Date(task.startDate), new Date(task.dueDate || task.endDate)),
    priority: task.priority,
    status: task.status,
    warning: task.isAtRisk || task.warning,
    warningText: task.riskDescription || task.warningText
  }));
  
  return {
    tasks: formattedTasks,
    timeRange
  };
};

/**
 * 開始日と終了日の間の月リストを生成
 * @param {Date} start 開始日
 * @param {Date} end 終了日
 * @returns {Array} 月のリスト
 */
export const getMonthRange = (start, end) => {
  const months = [];
  const current = new Date(start);
  current.setDate(1); // 月の初日に設定
  
  while (current <= end) {
    months.push({
      text: `${current.getFullYear()}年${current.getMonth() + 1}月`,
      date: new Date(current)
    });
    current.setMonth(current.getMonth() + 1);
  }
  
  return months;
};

/**
 * タスクの開始位置（％）を計算
 * @param {Date} taskStart タスク開始日
 * @param {Date} projectStart プロジェクト開始日
 * @param {Date} projectEnd プロジェクト終了日
 * @returns {number} 開始位置（％）
 */
export const calculatePosition = (taskStart, projectStart, projectEnd) => {
  // 日付オブジェクトでない場合は変換
  const tStart = taskStart instanceof Date ? taskStart : new Date(taskStart);
  const pStart = projectStart instanceof Date ? projectStart : new Date(projectStart);
  const pEnd = projectEnd instanceof Date ? projectEnd : new Date(projectEnd);
  
  // 不正な日付の場合はデフォルト値を返す
  if (isNaN(tStart.getTime()) || isNaN(pStart.getTime()) || isNaN(pEnd.getTime())) {
    console.warn('Invalid date in calculatePosition', { taskStart, projectStart, projectEnd });
    return 0;
  }
  
  const projectDuration = pEnd.getTime() - pStart.getTime();
  if (projectDuration <= 0) return 0;
  
  const taskOffset = tStart.getTime() - pStart.getTime();
  return Math.max(0, Math.min(100, (taskOffset / projectDuration) * 100));
};

/**
 * タスクの期間（％）を計算
 * @param {Date} taskStart タスク開始日
 * @param {Date} taskEnd タスク終了日
 * @param {Date} projectStart プロジェクト開始日
 * @param {Date} projectEnd プロジェクト終了日
 * @returns {number} 期間（％）
 */
export const calculateDuration = (taskStart, taskEnd, projectStart, projectEnd) => {
  // 日付オブジェクトでない場合は変換
  const tStart = taskStart instanceof Date ? taskStart : new Date(taskStart);
  const tEnd = taskEnd instanceof Date ? taskEnd : new Date(taskEnd);
  
  // 不正な日付の場合はデフォルト値を返す
  if (isNaN(tStart.getTime()) || isNaN(tEnd.getTime())) {
    console.warn('Invalid date in calculateDuration', { taskStart, taskEnd });
    return 1;
  }
  
  if (projectStart && projectEnd) {
    const pStart = projectStart instanceof Date ? projectStart : new Date(projectStart);
    const pEnd = projectEnd instanceof Date ? projectEnd : new Date(projectEnd);
    
    if (isNaN(pStart.getTime()) || isNaN(pEnd.getTime())) {
      console.warn('Invalid project date in calculateDuration', { projectStart, projectEnd });
      // デフォルトでは日数計算を使用
      const DAY_MS = 86400000; // 1日のミリ秒数
      return Math.max(1, Math.ceil((tEnd.getTime() - tStart.getTime()) / DAY_MS));
    }
    
    const projectDuration = pEnd.getTime() - pStart.getTime();
    if (projectDuration <= 0) return 1;
    
    const taskDuration = tEnd.getTime() - tStart.getTime();
    return Math.max(1, (taskDuration / projectDuration) * 100);
  } else {
    // プロジェクト期間が指定されていない場合、日数で計算
    const DAY_MS = 86400000; // 1日のミリ秒数
    return Math.max(1, Math.ceil((tEnd.getTime() - tStart.getTime()) / DAY_MS));
  }
};

/**
 * 日付を「yyyy/MM/dd」形式でフォーマット
 * @param {Date|string} date フォーマットする日付
 * @returns {string} フォーマットされた日付
 */
export const formatDate = (date) => {
  if (!date) return '日付なし';
  
  try {
    const d = new Date(date);
    
    // 日付が無効な場合
    if (isNaN(d.getTime())) {
      return '無効な日付';
    }
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  } catch (error) {
    console.warn('Invalid date in formatDate', date);
    return '無効な日付';
  }
};

/**
 * 現在日を基準にしたタスクのステータスを判定
 * @param {Object} task タスク
 * @returns {string} ステータス
 */
export const getTaskTimeStatus = (task) => {
  if (!task) return 'unknown';
  
  try {
    const now = new Date();
    const start = task.startDate instanceof Date ? task.startDate : new Date(task.startDate);
    const end = task.endDate instanceof Date ? task.endDate : 
                task.dueDate instanceof Date ? task.dueDate : 
                new Date(task.endDate || task.dueDate);
    
    // 日付が無効な場合
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.warn('Invalid date in getTaskTimeStatus', { start: task.startDate, end: task.endDate || task.dueDate });
      return 'unknown';
    }
    
    if (now < start) return 'upcoming';
    if (now > end) return task.status === 'completed' ? 'completed' : 'overdue';
    return 'in-progress';
  } catch (error) {
    console.warn('Error in getTaskTimeStatus', error);
    return 'unknown';
  }
};

/**
 * タスクの優先度に基づいた色を取得
 * @param {string} priority 優先度
 * @returns {string} 色コード
 */
export const getPriorityColor = (priority) => {
  const colors = {
    high: '#f44336',   // 赤
    medium: '#ff9800', // オレンジ
    low: '#4caf50'     // 緑
  };
  return colors[priority] || colors.medium;
};