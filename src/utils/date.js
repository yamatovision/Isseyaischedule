/**
 * 日付操作ユーティリティ
 * 
 * プロジェクトとタスクの日付表示、計算、フォーマットに関する
 * 一貫したユーティリティ関数を提供します。
 */

/**
 * 日付を YYYY-MM-DD 形式にフォーマット
 * @param {Date|string} date - フォーマットする日付またはISOフォーマットの日付文字列
 * @returns {string} YYYY-MM-DD形式の文字列
 */
export const formatDateToIso = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  return d.toISOString().split('T')[0];
};

/**
 * 日付を表示用の短い形式にフォーマット
 * @param {Date|string} date - フォーマットする日付またはISOフォーマットの日付文字列
 * @returns {string} 'M月D日'形式の文字列
 */
export const formatDateShort = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
};

/**
 * 日付を表示用の中程度の長さの形式にフォーマット
 * @param {Date|string} date - フォーマットする日付またはISOフォーマットの日付文字列
 * @returns {string} 'YYYY年M月D日'形式の文字列
 */
export const formatDateMedium = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
};

/**
 * 日付を表示用の長い形式にフォーマット
 * @param {Date|string} date - フォーマットする日付またはISOフォーマットの日付文字列
 * @returns {string} 'YYYY年M月D日(曜日)'形式の文字列
 */
export const formatDateLong = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const weekday = weekdays[d.getDay()];
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日(${weekday})`;
};

/**
 * 日付を相対的な表現でフォーマット
 * @param {Date|string} date - フォーマットする日付またはISOフォーマットの日付文字列
 * @returns {string} '今日', '明日', 'X日前', 'X日後'などの相対的な表現
 */
export const formatDateRelative = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const diffTime = d.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  if (d.getTime() === today.getTime()) return '今日';
  if (d.getTime() === tomorrow.getTime()) return '明日';
  if (d.getTime() === yesterday.getTime()) return '昨日';
  
  if (diffDays > 0) {
    return `${diffDays}日後`;
  } else {
    return `${Math.abs(diffDays)}日前`;
  }
};

/**
 * 二つの日付間の日数を計算
 * @param {Date|string} startDate - 開始日
 * @param {Date|string} endDate - 終了日
 * @returns {number} 日数差
 */
export const calculateDaysBetween = (startDate, endDate) => {
  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const end = endDate instanceof Date ? endDate : new Date(endDate);
  
  // 時間部分を除去して日付のみで計算
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * 日付が現在の日付以降かどうかを確認
 * @param {Date|string} date - 確認する日付
 * @returns {boolean} 現在以降の日付の場合はtrue
 */
export const isFutureOrToday = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  const today = new Date();
  
  // 日付のみで比較するために時間をリセット
  d.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  return d >= today;
};

/**
 * 日付が過去の日付かどうかを確認
 * @param {Date|string} date - 確認する日付
 * @returns {boolean} 過去の日付の場合はtrue
 */
export const isPast = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  const today = new Date();
  
  // 日付のみで比較するために時間をリセット
  d.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  return d < today;
};

/**
 * 現在の日付がスタート日とエンド日の間にあるかを確認
 * @param {Date|string} startDate - スタート日
 * @param {Date|string} endDate - エンド日
 * @returns {boolean} 現在の日付が範囲内にある場合はtrue
 */
export const isDateInRange = (startDate, endDate) => {
  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const end = endDate instanceof Date ? endDate : new Date(endDate);
  const today = new Date();
  
  // 日付のみで比較するために時間をリセット
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  return today >= start && today <= end;
};

/**
 * 日付を指定した日数だけ先に進める
 * @param {Date|string} date - 基準となる日付
 * @param {number} days - 追加する日数
 * @returns {Date} 新しい日付オブジェクト
 */
export const addDays = (date, days) => {
  const d = date instanceof Date ? new Date(date) : new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

/**
 * 特定の月の日数を取得
 * @param {number} year - 年
 * @param {number} month - 月（0-11）
 * @returns {number} 指定された月の日数
 */
export const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

/**
 * 曜日を考慮した営業日（平日）を計算
 * @param {Date|string} startDate - 開始日
 * @param {number} businessDays - 営業日数
 * @returns {Date} 計算された営業日
 */
export const addBusinessDays = (startDate, businessDays) => {
  const d = startDate instanceof Date ? new Date(startDate) : new Date(startDate);
  let remainingDays = businessDays;
  
  while (remainingDays > 0) {
    d.setDate(d.getDate() + 1);
    // 土曜日(6)または日曜日(0)でない場合だけカウント
    if (d.getDay() !== 0 && d.getDay() !== 6) {
      remainingDays--;
    }
  }
  
  return d;
};