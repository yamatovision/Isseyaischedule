/**
 * AI関連ユーティリティ
 * Chat-to-Ganttインターフェース用の関数群
 * 
 * 変更履歴:
 * - 2025/03/19: 初期実装 (Claude)
 * - 2025/03/19: 循環参照問題を修正 (Claude)
 * - 2025/03/19: API呼び出し方法を修正 (Claude)
 * - 2025/03/19: 正しいAPIパス構造の使用とObjectIDエラー処理 (Claude)
 * - 2025/03/19: 認証トークン管理を修正 (Claude)
 */

import axios from 'axios';
import { CHAT } from '../shared/index';
import { getAuthHeader } from './auth';

// APIインスタンスを作成（循環参照を避けるため、chatApi.jsからインポートしない）
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  }
});

// リクエストインターセプターを設定
api.interceptors.request.use(
  (config) => {
    // 認証ヘッダーを取得して追加
    const token = localStorage.getItem('plannavi_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('【警告】認証トークンがありません。API呼び出しは失敗する可能性があります。');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * ObjectId形式を検証
 * @param {string} id 検証するID
 * @returns {boolean} ObjectId形式として有効かどうか
 */
const isValidObjectId = (id) => {
  return id === 'new' || /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * プロジェクトIDを安全な形式に変換
 * @param {string} projectId プロジェクトID
 * @returns {string} 安全なプロジェクトID
 */
const getSafeProjectId = (projectId) => {
  // 新規プロジェクトまたは有効なObjectIdならそのまま返す
  if (projectId === 'new' || isValidObjectId(projectId)) {
    return projectId;
  }
  
  // それ以外の場合は「new」として扱う（テスト用モックIDの場合など）
  console.warn(`無効なプロジェクトID形式: ${projectId}、"new"として処理します`);
  return 'new';
};

/**
 * AIにメッセージを送信してレスポンスを取得
 * @param {string} message ユーザーメッセージ
 * @param {string} projectId プロジェクトID
 * @param {Array} conversation オプションの会話履歴配列
 * @returns {Promise<Object>} AIの応答
 */
export const sendChatMessage = async (message, projectId, conversation = []) => {
  try {
    // プロジェクトIDを安全な形式に変換
    const safeProjectId = getSafeProjectId(projectId);
    
    // 会話履歴がある場合はそれを含める
    const response = await api.post(CHAT.SEND, { 
      message, 
      projectId: safeProjectId,
      conversation: conversation.length > 0 ? conversation : undefined 
    });
    return response.data.data;
  } catch (error) {
    console.error('AIチャットエラー:', error);
    throw new Error('AIとの通信中にエラーが発生しました');
  }
};

/**
 * プロジェクトのチャット履歴を取得
 * @param {string} projectId プロジェクトID
 * @returns {Promise<Array>} チャット履歴
 */
export const getChatHistory = async (projectId) => {
  try {
    // プロジェクトIDを安全な形式に変換
    const safeProjectId = getSafeProjectId(projectId);
    
    const response = await api.get(CHAT.HISTORY(safeProjectId));
    return response.data.data;
  } catch (error) {
    console.error('チャット履歴取得エラー:', error);
    throw new Error('チャット履歴の取得中にエラーが発生しました');
  }
};

/**
 * AIを使用したタスク生成
 * @param {string} projectId プロジェクトID（不要、後方互換性のために残す）
 * @param {string} projectType プロジェクトタイプ（不要、後方互換性のために残す）
 * @param {Object} options タスク生成オプション
 * @returns {Promise<Array>} 生成されたタスク
 */
export const generateTasks = async (projectId, projectType, options = {}) => {
  try {
    const { conversationHistory } = options;
    
    if (!conversationHistory) {
      throw new Error('会話履歴が必要です');
    }
    
    const response = await api.post(CHAT.GENERATE_TASKS, {
      conversationHistory
    });
    
    return response.data.data;
  } catch (error) {
    console.error('タスク生成エラー:', error);
    throw new Error('タスクの生成中にエラーが発生しました');
  }
};

/**
 * 問題に対する解決策を取得
 * @param {string} taskId タスクID
 * @param {string} planId プロジェクトID
 * @param {string} issue 問題の説明
 * @returns {Promise<Array>} 提案された解決策
 */
export const getSolutions = async (taskId, planId, issue) => {
  try {
    // プロジェクトIDを安全な形式に変換
    const safePlanId = getSafeProjectId(planId);
    
    const response = await api.post(CHAT.SUGGEST_SOLUTION, {
      taskId,
      planId: safePlanId,
      issue
    });
    
    return response.data.data.suggestions;
  } catch (error) {
    console.error('解決策取得エラー:', error);
    throw new Error('解決策の取得中にエラーが発生しました');
  }
};

/**
 * 解決策を適用する
 * @param {string} projectId プロジェクトID
 * @param {string} solutionId 解決策ID
 * @param {string} taskId タスクID
 * @param {Object} adjustments タスクの調整内容
 * @returns {Promise<Object>} 更新後のデータ
 */
export const applySolution = async (projectId, solutionId, taskId, adjustments) => {
  try {
    // プロジェクトIDを安全な形式に変換
    const safeProjectId = getSafeProjectId(projectId);
    
    const response = await api.post(CHAT.APPLY_SOLUTION(safeProjectId), {
      solutionId,
      taskId,
      adjustments
    });
    
    return response.data.data;
  } catch (error) {
    console.error('解決策適用エラー:', error);
    throw new Error('解決策の適用中にエラーが発生しました');
  }
};

/**
 * テンプレートメッセージを生成
 * @param {string} type メッセージタイプ
 * @returns {string} テンプレートメッセージ
 */
export const getTemplateMessage = (type) => {
  const templates = {
    welcome: 'こんにちは！プロジェクトナビゲーターへようこそ。新しいプロジェクト計画を一緒に作成しましょう。どのようなプロジェクトを計画していますか？',
    projectType: 'プロジェクトタイプを選択してください:',
    details: 'さらに詳しい情報を教えていただけますか？\n• 目標完了日はいつですか？\n• 特に重視したい点はありますか？\n• 予算や人員の制約はありますか？',
    generatingTasks: 'プロジェクト計画を作成しています。少々お待ちください...',
    taskGenerated: 'タスクリストを作成しました。ご確認ください。',
    error: '申し訳ありません、エラーが発生しました。もう一度お試しください。'
  };
  
  return templates[type] || 'どのようにお手伝いできますか？';
};

/**
 * プロジェクトタイプの選択肢を取得
 * @returns {Array} プロジェクトタイプ選択肢
 */
export const getProjectTypeOptions = () => {
  return [
    { value: 'store-opening', label: '新店舗の出店' },
    { value: 'product-launch', label: '新商品の開発' },
    { value: 'company-establishment', label: '会社設立' },
    { value: 'event-planning', label: 'イベント開催' }
  ];
};