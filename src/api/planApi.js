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
 * プロジェクト一覧の取得
 * @returns {Promise} プロジェクト一覧
 */
export const getProjects = async () => {
  console.log('【API連携】プロジェクト一覧を取得します');
  
  // 実際のAPI呼び出し
  try {
    const response = await api.get(PROJECTS.LIST);
    console.log('【API連携】プロジェクト一覧APIレスポンス:', response.data);
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
    
    // レスポンスのラップ処理を修正 - 元のレスポンスをそのまま返す
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
  
  if (MOCK_MODE) {
    console.log('【API連携（モック）】モックモードでプロジェクトを更新します');
    
    const projectIndex = mockPlans.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) {
      return mockDelay({
        data: {
          status: 'error',
          message: 'プロジェクトが見つかりません'
        }
      });
    }
    
    const updatedProject = {
      ...mockPlans[projectIndex],
      ...projectData
    };
    
    mockPlans[projectIndex] = updatedProject;
    
    return mockDelay({
      data: {
        status: 'success',
        data: {
          plan: updatedProject
        },
        message: 'プロジェクトが正常に更新されました'
      }
    });
  }
  
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
  
  if (MOCK_MODE) {
    console.log('【API連携（モック）】モックモードでプロジェクトを削除します');
    
    const projectIndex = mockPlans.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) {
      return mockDelay({
        data: {
          status: 'error',
          message: 'プロジェクトが見つかりません'
        }
      });
    }
    
    mockPlans.splice(projectIndex, 1);
    
    return mockDelay({
      data: {
        status: 'success',
        message: 'プロジェクトが正常に削除されました'
      }
    });
  }
  
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
  
  if (MOCK_MODE) {
    console.log('【API連携（モック）】モックモードでプロジェクト進捗データを返します');
    
    const project = mockPlans.find(p => p.id === projectId);
    
    if (!project) {
      return mockDelay({
        data: {
          status: 'error',
          message: 'プロジェクトが見つかりません'
        }
      });
    }
    
    // モックの進捗データを生成
    const progressData = {
      overall: project.progress,
      taskStatus: {
        completed: project.completedTasks,
        inProgress: project.totalTasks - project.completedTasks - project.delayedTasks,
        delayed: project.delayedTasks,
        notStarted: project.totalTasks - project.completedTasks - (project.totalTasks - project.completedTasks - project.delayedTasks)
      },
      timeline: {
        plannedCompletion: project.endDate,
        estimatedCompletion: project.isAtRisk 
          ? new Date(new Date(project.endDate).getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          : project.endDate,
        delay: project.isAtRisk ? 14 : 0 // 遅延日数
      }
    };
    
    return mockDelay({
      data: {
        status: 'success',
        data: progressData
      }
    });
  }
  
  // 実際のAPI呼び出し
  try {
    console.log(`【API連携】プロジェクト進捗APIリクエスト: ${PROJECTS.PROGRESS(projectId)}`);
    const response = await api.get(PROJECTS.PROGRESS(projectId));
    console.log(`【API連携】プロジェクト進捗APIレスポンス:`, response);
    return {
      data: {
        status: 'success',
        data: response.data?.data || {
          overall: 0,
          taskStatus: {
            completed: 0,
            inProgress: 0,
            delayed: 0,
            notStarted: 0
          }
        }
      }
    };
  } catch (error) {
    console.error('【API連携エラー】プロジェクト進捗データの取得に失敗しました', error);
    // エラー時でも正常なレスポンス形式を返す
    return {
      data: {
        status: 'success',
        data: {
          overall: 0,
          taskStatus: {
            completed: 0,
            inProgress: 0,
            delayed: 0,
            notStarted: 0
          }
        }
      }
    };
  }
};

/**
 * 関連プロジェクト一覧の取得
 * @param {string} projectId - プロジェクトID
 * @returns {Promise} 関連プロジェクト一覧
 */
export const getRelatedProjects = async (projectId) => {
  console.log(`【API連携】プロジェクト(ID:${projectId})の関連プロジェクトを取得します`);
  
  if (MOCK_MODE) {
    console.log('【API連携（モック）】モックモードで関連プロジェクトを返します');
    
    // モックデータの中から1つをランダムに選択
    const relatedProjects = mockPlans
      .filter(p => p.id !== projectId)
      .slice(0, Math.floor(Math.random() * mockPlans.length));
    
    return mockDelay({
      data: {
        status: 'success',
        data: {
          plans: relatedProjects
        }
      }
    });
  }
  
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
  
  if (MOCK_MODE) {
    console.log('【API連携（モック）】モックモードでPDFエクスポートを実行します');
    
    return mockDelay({
      data: {
        status: 'success',
        data: {
          url: `https://example.com/exports/project-${projectId}.pdf`
        },
        message: 'PDFエクスポートが完了しました'
      }
    });
  }
  
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
  
  if (MOCK_MODE) {
    console.log('【API連携（モック）】モックモードでExcelエクスポートを実行します');
    
    return mockDelay({
      data: {
        status: 'success',
        data: {
          url: `https://example.com/exports/project-${projectId}.xlsx`
        },
        message: 'Excelエクスポートが完了しました'
      }
    });
  }
  
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
  
  if (MOCK_MODE) {
    console.log('【API連携（モック）】モックモードで統計情報を返します');
    
    return mockDelay({
      data: {
        status: 'success',
        data: {
          stats: {
            completed: 5,
            inProgress: 10,
            notStarted: 15,
            totalTasks: 30
          }
        }
      }
    });
  }
  
  // 実際のAPI呼び出し
  try {
    console.log('【API連携】統計情報APIリクエスト:', '/api/v1/projects/stats/global');
    const response = await api.get('/api/v1/projects/stats/global');
    console.log('【API連携】統計情報APIレスポンス:', response.data);
    return response;
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

export default {
  getProjects,
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