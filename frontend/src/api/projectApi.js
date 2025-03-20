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

// モックモードは無効化していますが、変数は残しておく
const MOCK_MODE = false;
// ダミーのmockDelay関数（互換性のため）
const mockDelay = (mockResponse) => {
  return Promise.resolve(mockResponse);
};

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

// モック用のプランデータ
const mockPlans = [
  {
    id: 'plan-001',
    title: '新規出店計画',
    description: '東京都内に新店舗をオープンするための計画',
    type: 'store',
    startDate: '2025-04-01',
    endDate: '2025-08-15',
    progress: 25,
    totalTasks: 32,
    completedTasks: 8,
    delayedTasks: 2,
    isAtRisk: false,
    resources: [
      { id: 'res-001', name: '人員A', type: 'human', capacity: 1, unit: '人' },
      { id: 'res-002', name: '予算', type: 'budget', capacity: 5000000, unit: '円' }
    ]
  },
  {
    id: 'plan-002',
    title: 'マーケティングキャンペーン',
    description: '夏季販促イベントの企画と実施',
    type: 'marketing',
    startDate: '2025-06-01',
    endDate: '2025-07-31',
    progress: 10,
    totalTasks: 18,
    completedTasks: 2,
    delayedTasks: 0,
    isAtRisk: false,
    resources: [
      { id: 'res-003', name: 'マーケティングチーム', type: 'human', capacity: 3, unit: '人' },
      { id: 'res-004', name: '広告予算', type: 'budget', capacity: 2000000, unit: '円' }
    ]
  },
  {
    id: 'plan-003',
    title: '新商品開発プロジェクト',
    description: '次世代製品の企画から発売まで',
    type: 'product',
    startDate: '2025-03-01',
    endDate: '2025-10-31',
    progress: 42,
    totalTasks: 45,
    completedTasks: 19,
    delayedTasks: 3,
    isAtRisk: true,
    riskFactors: ['部材調達の遅延', '開発工数の増加'],
    resources: [
      { id: 'res-005', name: '開発チーム', type: 'human', capacity: 5, unit: '人' },
      { id: 'res-006', name: '開発環境', type: 'facility', capacity: 1, unit: '式' }
    ]
  }
];

/**
 * プロジェクト一覧の取得
 * @returns {Promise} プロジェクト一覧
 */
export const getProjects = async () => {
  console.log('【API連携】プロジェクト一覧を取得します');
  
  if (MOCK_MODE) {
    console.log('【API連携（モック）】モックモードでプロジェクト一覧を返します');
    
    return mockDelay({
      data: {
        status: 'success',
        data: {
          plans: mockPlans
        }
      }
    });
  }
  
  // 実際のAPI呼び出し
  try {
    const response = await api.get(PROJECTS.LIST);
    return response.data;
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
  
  if (MOCK_MODE) {
    console.log('【API連携（モック）】モックモードでリスクのあるプロジェクト一覧を返します');
    
    const atRiskPlans = mockPlans.filter(plan => plan.isAtRisk);
    
    return mockDelay({
      data: {
        status: 'success',
        data: {
          plans: atRiskPlans
        }
      }
    });
  }
  
  // 実際のAPI呼び出し
  try {
    const response = await api.get(PROJECTS.AT_RISK);
    return response.data;
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
  
  if (MOCK_MODE) {
    console.log('【API連携（モック）】モックモードで最近のプロジェクト一覧を返します');
    
    // モックデータの場合は全てのプロジェクトを返す
    return mockDelay({
      data: {
        status: 'success',
        data: {
          plans: mockPlans
        }
      }
    });
  }
  
  // 実際のAPI呼び出し
  try {
    const response = await api.get(PROJECTS.RECENT);
    return response.data;
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
  
  if (MOCK_MODE) {
    console.log('【API連携（モック）】モックモードでプロジェクト詳細を返します');
    
    const project = mockPlans.find(p => p.id === projectId);
    
    if (!project) {
      return mockDelay({
        data: {
          status: 'error',
          message: 'プロジェクトが見つかりません'
        }
      });
    }
    
    return mockDelay({
      data: {
        status: 'success',
        data: {
          plan: project
        }
      }
    });
  }
  
  // 実際のAPI呼び出し
  try {
    const response = await api.get(PROJECTS.DETAIL(projectId));
    return response.data;
  } catch (error) {
    console.error('【API連携エラー】プロジェクト詳細の取得に失敗しました', error);
    
    // ObjectId形式のエラーを明示的にハンドリング
    if (error.response && error.response.status === 400) {
      return {
        status: 'error',
        message: error.response.data.message || 'プロジェクトIDが不正です',
        data: null
      };
    }
    
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
  
  if (MOCK_MODE) {
    console.log('【API連携（モック）】モックモードで新規プロジェクトを作成します');
    
    const newProject = {
      id: `plan-${Math.floor(Math.random() * 1000)}`,
      ...projectData,
      progress: 0,
      completedTasks: 0,
      delayedTasks: 0,
      isAtRisk: false,
      totalTasks: 0
    };
    
    mockPlans.push(newProject);
    
    return mockDelay({
      data: {
        status: 'success',
        data: {
          plan: newProject
        },
        message: 'プロジェクトが正常に作成されました'
      }
    });
  }
  
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
 * タスク一覧から新規プロジェクトを作成する
 * @param {Object} projectInfo - プロジェクト基本情報（title, description, type, など）
 * @param {Array} tasks - プロジェクトに追加するタスク一覧
 * @returns {Promise} 作成されたプロジェクトとタスク
 */
export const createProjectWithTasks = async (projectInfo, tasks) => {
  console.log('【API連携】タスク付きの新規プロジェクトを作成します');
  
  if (MOCK_MODE) {
    console.log('【API連携（モック）】モックモードでタスク付きの新規プロジェクトを作成します');
    
    const newProject = {
      id: `plan-${Math.floor(Math.random() * 1000)}`,
      ...projectInfo,
      progress: 0,
      completedTasks: 0,
      delayedTasks: 0,
      isAtRisk: false,
      totalTasks: tasks.length || 0
    };
    
    mockPlans.push(newProject);
    
    return mockDelay({
      data: {
        status: 'success',
        data: {
          project: newProject,
          tasks: tasks.map((task, index) => ({
            ...task,
            id: `task-${newProject.id}-${index}`,
            projectId: newProject.id
          }))
        },
        message: 'プロジェクトとタスクが正常に作成されました'
      }
    });
  }
  
  // 実際のAPI呼び出し
  try {
    // 新しいタスクモデルに適合するようにタスクデータを変換
    const normalizedTasks = tasks.map(task => {
      // 既存のprojectIdを削除するため、taskからprojectIdを除外した新しいオブジェクトを作成
      const { projectId, id, _id, ...taskWithoutIds } = task;
      
      // タスクオブジェクトの基本構造を作成
      const normalizedTask = {
        title: taskWithoutIds.title,
        description: taskWithoutIds.description || '',
        startDate: taskWithoutIds.startDate || null,
        dueDate: taskWithoutIds.dueDate || taskWithoutIds.endDate || null, // dueDateを優先、なければendDateを使用
        status: taskWithoutIds.status || 'not_started',
        tags: taskWithoutIds.tags || []
      };

      // 優先度はオプションなので、存在する場合のみ追加
      if (taskWithoutIds.priority) {
        normalizedTask.priority = taskWithoutIds.priority;
      }

      // 完了日付は、status === 'completed'の場合のみ設定
      if (taskWithoutIds.status === 'completed') {
        normalizedTask.completedDate = taskWithoutIds.completedDate || new Date().toISOString();
      }

      // 明示的にprojectIdを含めないことで、バックエンド側で新しいプロジェクトIDを割り当てることを保証
      console.log('【API連携】タスク正規化: 古いIDを削除:', { 
        removedId: id || _id, 
        removedProjectId: projectId 
      });

      return normalizedTask;
    });

    console.log('【API連携】正規化されたタスクデータ:', normalizedTasks);

    // プロジェクトとタスクを一括で作成するAPIエンドポイントを呼び出し
    const response = await api.post(`${PROJECTS.LIST}/with-tasks`, {
      project: projectInfo,
      tasks: normalizedTasks
    });
    return response.data;
  } catch (error) {
    console.error('【API連携エラー】プロジェクトとタスクの作成に失敗しました', error);
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
    const response = await api.get(PROJECTS.PROGRESS(projectId));
    return response.data;
  } catch (error) {
    console.error('【API連携エラー】プロジェクト進捗データの取得に失敗しました', error);
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
    const response = await api.get(PROJECTS.STATS);
    return response.data;
  } catch (error) {
    console.error('【API連携エラー】統計情報の取得に失敗しました', error);
    throw error;
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