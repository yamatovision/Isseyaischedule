import axios from 'axios';
import { getAuthHeader } from '../utils/auth';
import { PROJECTS } from '../shared/index';

/**
 * プロジェクト（プラン）関連API
 * 
 * プロジェクトの取得、作成、更新、削除など
 * プロジェクト管理関連のAPIリクエストを処理する関数群。
 */

// 環境変数またはデフォルト値からAPIのベースURLを取得
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Axiosインスタンスの作成
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // クッキーを常に送受信するように設定
});

// 実装中に使用していたモックモードを削除
// モック機能の削除 - バックエンドAPIと直接連携します

/**
 * リクエストインターセプターの設定
 * 各リクエスト前に認証ヘッダーを追加
 */
api.interceptors.request.use(
  (config) => {
    const headers = getAuthHeader();
    if (headers.Authorization) {
      config.headers.Authorization = headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// モックデータを削除しました

/**
 * アクティブプロジェクト一覧の取得（タスク統計情報を含む）
 * @returns {Promise} タスク統計情報を含むアクティブプロジェクト一覧
 */
export const getActiveProjects = async () => {
  console.log('【API連携】タスク統計情報付きアクティブプロジェクト一覧を取得します');
  
  // 実際のAPI呼び出し
  try {
    const response = await api.get(PROJECTS.ACTIVE);
    console.log('【API連携】アクティブプロジェクトAPIレスポンス:', response.data);
    return response;
  } catch (error) {
    console.error('【API連携エラー】アクティブプロジェクト一覧の取得に失敗しました', error);
    throw error;
  }
};

/**
 * プロジェクト一覧の取得
 * @returns {Promise} プロジェクト一覧
 */
export const getProjects = async () => {
  console.log('【API連携】プロジェクト一覧を取得します');
  
  // 実際のAPI呼び出し
  try {
    const response = await api.get(PROJECTS.LIST);
    console.log('【API連携】プロジェクト一覧APIレスポンス:', response.data);
    
    // プロジェクトに必要なタスク統計情報を追加
    if (response.data && response.data.projects && Array.isArray(response.data.projects)) {
      console.log('【API連携】プロジェクトデータにタスク統計情報を強制的に追加します');
      
      // 各プロジェクトにタスク情報を手動で追加
      const enhancedProjects = response.data.projects.map(project => {
        // タスク統計情報がない場合は追加
        if (!project.completedTasks || !project.totalTasks) {
          console.log(`【API連携】プロジェクト ${project.title} のタスク情報を補完します`);
          return {
            ...project,
            completedTasks: project.completedTasks || 0,
            totalTasks: project.totalTasks || 0,
            tasks: project.tasks || 0,
            progress: project.progress || 0
          };
        }
        return project;
      });
      
      // 強化したプロジェクトデータで応答を更新
      response.data.projects = enhancedProjects;
    }
    
    return response;
  } catch (error) {
    console.error('【API連携エラー】プロジェクト一覧の取得に失敗しました', error);
    throw error;
  }
};

/**
 * リスクのあるプロジェクト一覧の取得
 * @returns {Promise} リスクのあるプロジェクト一覧
 */
export const getProjectsAtRisk = async () => {
  console.log('【API連携】リスクのあるプロジェクト一覧を取得します');
  
  // 実際のAPI呼び出し
  try {
    const response = await api.get(PROJECTS.AT_RISK);
    console.log('【API連携】リスクプロジェクトAPIレスポンス:', response.data);
    return response;
  } catch (error) {
    console.error('【API連携エラー】リスクのあるプロジェクト一覧の取得に失敗しました', error);
    throw error;
  }
};

/**
 * 最近のプロジェクト一覧の取得
 * @returns {Promise} 最近のプロジェクト一覧
 */
export const getRecentProjects = async () => {
  console.log('【API連携】最近のプロジェクト一覧を取得します');
  
  // 実際のAPI呼び出し
  try {
    const response = await api.get(PROJECTS.RECENT);
    console.log('【API連携】最近のプロジェクトAPIレスポンス:', response.data);
    return response;
  } catch (error) {
    console.error('【API連携エラー】最近のプロジェクト一覧の取得に失敗しました', error);
    throw error;
  }
};

/**
 * プロジェクトの詳細情報を取得
 * @param {string} projectId - プロジェクトID
 * @returns {Promise} プロジェクトの詳細情報
 */
export const getProjectDetails = async (projectId) => {
  console.log(`【API連携】プロジェクト詳細(ID:${projectId})を取得します`);
  
  // 実際のAPI呼び出し
  try {
    console.log(`【API連携】プロジェクト詳細APIリクエスト: ${PROJECTS.DETAIL(projectId)}`);
    const response = await api.get(PROJECTS.DETAIL(projectId));
    console.log(`【API連携】プロジェクト詳細APIレスポンス:`, response.data);
    
    // プロジェクトにタスク情報を追加
    if (response.data && response.data.project) {
      const project = response.data.project;
      
      // タスク統計情報がない場合は追加
      if (!project.completedTasks || !project.totalTasks) {
        console.log(`【API連携】プロジェクト詳細 ${project.title} のタスク情報を補完します`);
        
        try {
          // プロジェクトのタスク一覧を取得
          const tasksResponse = await api.get(`/api/v1/projects/${projectId}/tasks`);
          const tasks = tasksResponse.data?.tasks || [];
          
          // タスク統計情報を計算
          const completedTasks = tasks.filter(task => task.status === 'completed').length;
          const totalTasks = tasks.length;
          const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
          
          console.log(`【API連携】プロジェクト詳細のタスク統計:`, {
            completedTasks,
            totalTasks,
            progress
          });
          
          // プロジェクトデータに統計情報を追加
          response.data.project = {
            ...project,
            completedTasks,
            totalTasks,
            tasks: totalTasks, // 後方互換性のため
            progress
          };
        } catch (err) {
          console.error(`【API連携エラー】プロジェクト詳細のタスク情報取得に失敗しました:`, err);
          
          // エラーが発生した場合はデフォルト値を設定
          response.data.project = {
            ...project,
            completedTasks: 0,
            totalTasks: 0,
            tasks: 0,
            progress: 0
          };
        }
      }
    }
    
    return response;
  } catch (error) {
    console.error('【API連携エラー】プロジェクト詳細の取得に失敗しました', error);
    throw error;
  }
};

/**
 * 新規プロジェクトの作成
 * @param {Object} projectData - プロジェクトデータ
 * @returns {Promise} 作成されたプロジェクト
 */
export const createProject = async (projectData) => {
  console.log('【API連携】新規プロジェクトを作成します');
  
  // モックモードは削除
  
  // 実際のAPI呼び出し
  try {
    const response = await api.post(PROJECTS.LIST, projectData);
    return response.data;
  } catch (error) {
    console.error('【API連携エラー】プロジェクトの作成に失敗しました', error);
    throw error;
  }
};

/**
 * プロジェクトの更新
 * @param {string} projectId - プロジェクトID
 * @param {Object} projectData - 更新するプロジェクトデータ
 * @returns {Promise} 更新されたプロジェクト
 */
export const updateProject = async (projectId, projectData) => {
  console.log(`【API連携】プロジェクト(ID:${projectId})を更新します`);
  
  // 実際のAPI呼び出し
  try {
    const response = await api.put(PROJECTS.UPDATE(projectId), projectData);
    return response.data;
  } catch (error) {
    console.error('【API連携エラー】プロジェクトの更新に失敗しました', error);
    throw error;
  }
};

/**
 * プロジェクトの削除
 * @param {string} projectId - プロジェクトID
 * @returns {Promise} 削除結果
 */
export const deleteProject = async (projectId) => {
  console.log(`【API連携】プロジェクト(ID:${projectId})を削除します`);
  
  // 実際のAPI呼び出し
  try {
    const response = await api.delete(PROJECTS.DELETE(projectId));
    return response.data;
  } catch (error) {
    console.error('【API連携エラー】プロジェクトの削除に失敗しました', error);
    throw error;
  }
};

/**
 * プロジェクトの進捗データを取得
 * @param {string} projectId - プロジェクトID
 * @returns {Promise} プロジェクトの進捗データ
 */
export const getProjectProgress = async (projectId) => {
  console.log(`【API連携】プロジェクト(ID:${projectId})の進捗データを取得します`);
  
  // 実際のAPI呼び出し
  try {
    console.log(`【API連携】プロジェクト進捗APIリクエスト: ${PROJECTS.PROGRESS(projectId)}`);
    const response = await api.get(PROJECTS.PROGRESS(projectId));
    console.log(`【API連携】プロジェクト進捗APIレスポンス:`, response);
    
    // APIの応答をそのまま返す（レスポンス構造をラップせずに使用）
    return response;
  } catch (error) {
    console.error('【API連携エラー】プロジェクト進捗データの取得に失敗しました', error);
    // エラーはそのまま投げて、useProject.jsでハンドリングする
    throw error;
  }
};

/**
 * 関連プロジェクト一覧の取得
 * @param {string} projectId - プロジェクトID
 * @returns {Promise} 関連プロジェクト一覧
 */
export const getRelatedProjects = async (projectId) => {
  console.log(`【API連携】プロジェクト(ID:${projectId})の関連プロジェクトを取得します`);
  
  // 実際のAPI呼び出し
  try {
    const response = await api.get(PROJECTS.RELATED(projectId));
    return response.data;
  } catch (error) {
    console.error('【API連携エラー】関連プロジェクトの取得に失敗しました', error);
    throw error;
  }
};

/**
 * プロジェクトのエクスポート（PDF）
 * @param {string} projectId - プロジェクトID
 * @returns {Promise} エクスポートされたPDFへのURL
 */
export const exportProjectToPdf = async (projectId) => {
  console.log(`【API連携】プロジェクト(ID:${projectId})をPDFにエクスポートします`);
  
  // 実際のAPI呼び出し
  try {
    const response = await api.get(PROJECTS.EXPORT_PDF(projectId));
    return response.data;
  } catch (error) {
    console.error('【API連携エラー】PDFエクスポートに失敗しました', error);
    throw error;
  }
};

/**
 * プロジェクトのエクスポート（Excel）
 * @param {string} projectId - プロジェクトID
 * @returns {Promise} エクスポートされたExcelへのURL
 */
export const exportProjectToExcel = async (projectId) => {
  console.log(`【API連携】プロジェクト(ID:${projectId})をExcelにエクスポートします`);
  
  // 実際のAPI呼び出し
  try {
    const response = await api.get(PROJECTS.EXPORT_EXCEL(projectId));
    return response.data;
  } catch (error) {
    console.error('【API連携エラー】Excelエクスポートに失敗しました', error);
    throw error;
  }
};

/**
 * 統計情報の取得
 * @returns {Promise} 統計情報
 */
export const getStats = async () => {
  console.log('【API連携】統計情報を取得します');
  
  // 実際のAPI呼び出し
  try {
    console.log('【API連携】統計情報APIリクエスト:', '/api/v1/projects/stats/global');
    const response = await api.get('/api/v1/projects/stats/global');
    console.log('【API連携】統計情報APIレスポンス:', response.data);
    
    // レスポンス構造を統一
    return {
      data: {
        stats: response.data.stats || {
          completed: 0,
          inProgress: 0,
          notStarted: 0,
          totalTasks: 0
        }
      }
    };
  } catch (error) {
    console.error('【API連携エラー】統計情報の取得に失敗しました', error);
    // エラー時は空のデータを返す
    return { 
      data: { 
        stats: {
          completed: 0,
          inProgress: 0,
          notStarted: 0,
          totalTasks: 0
        }
      } 
    };
  }
};

// すべての関数をエクスポート
const planApi = {
  getProjects,
  getActiveProjects,
  getProjectsAtRisk,
  getRecentProjects,
  getProjectDetails,
  createProject,
  updateProject,
  deleteProject,
  getProjectProgress,
  getRelatedProjects,
  exportProjectToPdf,
  exportProjectToExcel,
  getStats
};

export default planApi;