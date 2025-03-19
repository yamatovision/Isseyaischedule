import axios from 'axios';
import { getAuthHeader } from '../utils/auth';
import { TASKS } from '../shared/index';

/**
 * タスク関連API
 * 
 * プロジェクト内のタスクの取得、作成、更新、削除など
 * タスク管理関連のAPIリクエストを処理する関数群。
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

// モックモードを完全に廃止
const MOCK_MODE = false;
// 疑似遅延設定（廃止）
const API_DELAY = 0;

/**
 * APIレスポンスのモック遅延処理
 * @param {Object} mockResponse - モックレスポンス
 * @returns {Promise} 遅延後のレスポンスを返すPromise
 */
const mockDelay = (mockResponse) => {
  return new Promise(resolve => {
    setTimeout(() => resolve(mockResponse), API_DELAY || 500);
  });
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

// モック用のタスクデータ
const mockTasks = {
  'plan-001': [
    {
      id: 'task-001',
      projectId: 'plan-001',
      title: '店舗物件の選定',
      description: '東京都内の候補物件を調査し、3件に絞り込む',
      startDate: '2025-04-01',
      endDate: '2025-04-30',
      progress: 100,
      status: 'completed',
      priority: 'high',
      isAtRisk: false,
      dependsOn: [],
      order: 1
    },
    {
      id: 'task-002',
      projectId: 'plan-001',
      title: '店舗レイアウト設計',
      description: '出店予定店舗の内装設計図を作成',
      startDate: '2025-05-01',
      endDate: '2025-05-15',
      progress: 75,
      status: 'in-progress',
      priority: 'medium',
      isAtRisk: false,
      dependsOn: ['task-001'],
      order: 2
    },
    {
      id: 'task-003',
      projectId: 'plan-001',
      title: '内装工事の発注',
      description: '設計図に基づき内装工事業者に発注',
      startDate: '2025-05-16',
      endDate: '2025-05-30',
      progress: 0,
      status: 'not-started',
      priority: 'medium',
      isAtRisk: true,
      riskDescription: '見積もりの遅延により工事開始が遅れる可能性あり',
      dependsOn: ['task-002'],
      order: 3
    },
    {
      id: 'task-004',
      projectId: 'plan-001',
      title: '什器・備品の発注',
      description: '店舗運営に必要な設備・備品の発注',
      startDate: '2025-06-01',
      endDate: '2025-06-15',
      progress: 0,
      status: 'not-started',
      priority: 'medium',
      isAtRisk: false,
      dependsOn: ['task-002'],
      order: 4
    }
  ],
  'plan-002': [
    {
      id: 'task-005',
      projectId: 'plan-002',
      title: 'マーケティング戦略策定',
      description: '夏季キャンペーンの全体戦略を策定',
      startDate: '2025-06-01',
      endDate: '2025-06-10',
      progress: 100,
      status: 'completed',
      priority: 'high',
      isAtRisk: false,
      dependsOn: [],
      order: 1
    },
    {
      id: 'task-006',
      projectId: 'plan-002',
      title: 'ターゲット顧客分析',
      description: '既存顧客データの分析とターゲットセグメントの選定',
      startDate: '2025-06-05',
      endDate: '2025-06-15',
      progress: 50,
      status: 'in-progress',
      priority: 'high',
      isAtRisk: false,
      dependsOn: [],
      order: 2
    }
  ],
  'plan-003': [
    {
      id: 'task-007',
      projectId: 'plan-003',
      title: '市場調査分析',
      description: '競合製品・市場トレンドの調査',
      startDate: '2025-03-01',
      endDate: '2025-03-31',
      progress: 100,
      status: 'completed',
      priority: 'high',
      isAtRisk: false,
      dependsOn: [],
      order: 1
    },
    {
      id: 'task-008',
      projectId: 'plan-003',
      title: '製品コンセプト策定',
      description: '顧客ニーズに基づく製品コンセプトの策定',
      startDate: '2025-04-01',
      endDate: '2025-04-15',
      progress: 100,
      status: 'completed',
      priority: 'high',
      isAtRisk: false,
      dependsOn: ['task-007'],
      order: 2
    },
    {
      id: 'task-009',
      projectId: 'plan-003',
      title: 'プロトタイプ開発',
      description: '初期プロトタイプの設計・作成',
      startDate: '2025-04-16',
      endDate: '2025-05-15',
      progress: 90,
      status: 'in-progress',
      priority: 'high',
      isAtRisk: false,
      dependsOn: ['task-008'],
      order: 3
    },
    {
      id: 'task-010',
      projectId: 'plan-003',
      title: 'ユーザーテスト実施',
      description: 'プロトタイプのユーザーテスト計画・実施',
      startDate: '2025-05-16',
      endDate: '2025-05-31',
      progress: 0,
      status: 'not-started',
      priority: 'medium',
      isAtRisk: true,
      riskDescription: 'プロトタイプの完成遅延によりテスト開始が遅れる可能性あり',
      dependsOn: ['task-009'],
      order: 4
    }
  ]
};

// 直近のタスク一覧（期限が近いタスク）
const mockUpcomingTasks = [
  {
    id: 'task-002',
    projectId: 'plan-001',
    title: '店舗レイアウト設計',
    description: '出店予定店舗の内装設計図を作成',
    startDate: '2025-05-01',
    endDate: '2025-05-15',
    progress: 75,
    status: 'in-progress',
    priority: 'medium',
    isAtRisk: false,
    dependsOn: ['task-001'],
    order: 2
  },
  {
    id: 'task-006',
    projectId: 'plan-002',
    title: 'ターゲット顧客分析',
    description: '既存顧客データの分析とターゲットセグメントの選定',
    startDate: '2025-06-05',
    endDate: '2025-06-15',
    progress: 50,
    status: 'in-progress',
    priority: 'high',
    isAtRisk: false,
    dependsOn: [],
    order: 2
  },
  {
    id: 'task-009',
    projectId: 'plan-003',
    title: 'プロトタイプ開発',
    description: '初期プロトタイプの設計・作成',
    startDate: '2025-04-16',
    endDate: '2025-05-15',
    progress: 90,
    status: 'in-progress',
    priority: 'high',
    isAtRisk: false,
    dependsOn: ['task-008'],
    order: 3
  }
];

// リスクのあるタスク一覧
const mockTasksAtRisk = [
  {
    id: 'task-003',
    projectId: 'plan-001',
    title: '内装工事の発注',
    description: '設計図に基づき内装工事業者に発注',
    startDate: '2025-05-16',
    endDate: '2025-05-30',
    progress: 0,
    status: 'not-started',
    priority: 'medium',
    isAtRisk: true,
    riskDescription: '見積もりの遅延により工事開始が遅れる可能性あり',
    dependsOn: ['task-002'],
    order: 3
  },
  {
    id: 'task-010',
    projectId: 'plan-003',
    title: 'ユーザーテスト実施',
    description: 'プロトタイプのユーザーテスト計画・実施',
    startDate: '2025-05-16',
    endDate: '2025-05-31',
    progress: 0,
    status: 'not-started',
    priority: 'medium',
    isAtRisk: true,
    riskDescription: 'プロトタイプの完成遅延によりテスト開始が遅れる可能性あり',
    dependsOn: ['task-009'],
    order: 4
  }
];

/**
 * プロジェクト内のタスク一覧を取得
 * @param {string} projectId - プロジェクトID
 * @returns {Promise} タスク一覧
 */
export const getProjectTasks = async (projectId) => {
  console.log(`【API連携】プロジェクト(ID:${projectId})のタスク一覧を取得します`);
  
  if (MOCK_MODE) {
    console.log('【API連携（モック）】モックモードでタスク一覧を返します');
    
    const tasks = mockTasks[projectId] || [];
    
    return mockDelay({
      data: {
        status: 'success',
        data: {
          tasks
        }
      }
    });
  }
  
  // 実際のAPI呼び出し
  try {
    console.log(`【API連携】タスク一覧APIリクエスト: ${TASKS.LIST(projectId)}`);
    const response = await api.get(TASKS.LIST(projectId));
    console.log(`【API連携】タスク一覧APIレスポンス:`, response.data);
    
    // デバッグ用に詳細ログ出力
    if (response?.data?.tasks) {
      console.log(`【API連携】タスク取得件数: ${response.data.tasks.length}件`);
      if (response.data.tasks.length > 0) {
        // 少なくとも1つタスクがあればその構造を確認
        console.log(`【API連携】タスク例:`, response.data.tasks[0]);
      }
    } else {
      console.log(`【API連携】タスクなし、レスポンス構造:`, response.data);
    }
    
    // フロントエンドとの互換性のためにレスポンスをラップせず直接返す
    return response;
  } catch (error) {
    console.error('【API連携エラー】タスク一覧の取得に失敗しました', error);
    // エラー時でも正常なレスポンス形式を返す
    return {
      data: {
        success: true,
        tasks: []
      }
    };
  }
};

/**
 * 直近の期限タスク一覧を取得
 * @returns {Promise} 直近の期限タスク一覧
 */
export const getUpcomingTasks = async () => {
  console.log('【API連携】直近の期限タスク一覧を取得します');
  
  if (MOCK_MODE) {
    console.log('【API連携（モック）】モックモードで直近の期限タスク一覧を返します');
    
    return mockDelay({
      data: {
        status: 'success',
        data: {
          tasks: mockUpcomingTasks
        }
      }
    });
  }
  
  // 実際のAPI呼び出し
  try {
    // プロジェクトルーターのエンドポイントを使用
    const response = await api.get('/api/v1/projects/tasks/upcoming');
    console.log('【API連携】直近のタスク一覧APIレスポンス:', response.data);
    
    // レスポンスデータ構造の確認とデバッグ
    if (response.data.tasks) {
      console.log(`【API連携】直近のタスク取得件数: ${response.data.tasks.length}件`);
    }
    
    return response.data;
  } catch (error) {
    console.error('【API連携エラー】直近の期限タスク一覧の取得に失敗しました', error);
    // エラー時は空の配列を返す
    return { data: { tasks: [] } };
  }
};

/**
 * リスクのあるタスク一覧を取得
 * @returns {Promise} リスクのあるタスク一覧
 */
export const getTasksAtRisk = async () => {
  console.log('【API連携】リスクのあるタスク一覧を取得します');
  
  if (MOCK_MODE) {
    console.log('【API連携（モック）】モックモードでリスクのあるタスク一覧を返します');
    
    return mockDelay({
      data: {
        status: 'success',
        data: {
          tasks: mockTasksAtRisk
        }
      }
    });
  }
  
  // 実際のAPI呼び出し
  try {
    const response = await api.get(TASKS.AT_RISK);
    return response.data;
  } catch (error) {
    console.error('【API連携エラー】リスクのあるタスク一覧の取得に失敗しました', error);
    throw error;
  }
};

/**
 * タスクの詳細情報を取得
 * @param {string} taskId - タスクID
 * @returns {Promise} タスクの詳細情報
 */
export const getTaskDetails = async (taskId) => {
  console.log(`【API連携】タスク詳細(ID:${taskId})を取得します`);
  
  if (MOCK_MODE) {
    console.log('【API連携（モック）】モックモードでタスク詳細を返します');
    
    // すべてのプロジェクトのタスクからIDに一致するものを検索
    const task = Object.values(mockTasks)
      .flat()
      .find(t => t.id === taskId);
    
    if (!task) {
      return mockDelay({
        data: {
          status: 'error',
          message: 'タスクが見つかりません'
        }
      });
    }
    
    return mockDelay({
      data: {
        status: 'success',
        data: {
          task
        }
      }
    });
  }
  
  // 実際のAPI呼び出し
  try {
    const response = await api.get(TASKS.DETAIL(taskId));
    return response.data;
  } catch (error) {
    console.error('【API連携エラー】タスク詳細の取得に失敗しました', error);
    throw error;
  }
};

/**
 * 新規タスクの作成
 * @param {string} projectId - プロジェクトID
 * @param {Object} taskData - タスクデータ
 * @returns {Promise} 作成されたタスク
 */
export const createTask = async (projectId, taskData) => {
  console.log(`【API連携】プロジェクト(ID:${projectId})に新規タスクを作成します`);
  
  if (MOCK_MODE) {
    console.log('【API連携（モック）】モックモードで新規タスクを作成します');
    
    if (!mockTasks[projectId]) {
      mockTasks[projectId] = [];
    }
    
    const newTask = {
      id: `task-${Math.floor(Math.random() * 1000)}`,
      projectId,
      ...taskData,
      progress: 0,
      status: 'not-started',
      isAtRisk: false,
      order: mockTasks[projectId].length + 1
    };
    
    mockTasks[projectId].push(newTask);
    
    return mockDelay({
      data: {
        status: 'success',
        data: {
          task: newTask
        },
        message: 'タスクが正常に作成されました'
      }
    });
  }
  
  // 実際のAPI呼び出し
  try {
    console.log(`【API連携】タスク作成APIリクエスト: ${TASKS.CREATE(projectId)}`, taskData);
    const response = await api.post(TASKS.CREATE(projectId), taskData);
    console.log(`【API連携】タスク作成APIレスポンス:`, response.data);
    // 元のレスポンスをそのまま返す
    return response;
  } catch (error) {
    console.error('【API連携エラー】タスクの作成に失敗しました', error);
    throw error;
  }
};

/**
 * タスクの更新
 * @param {string} taskId - タスクID
 * @param {Object} taskData - 更新するタスクデータ
 * @returns {Promise} 更新されたタスク
 */
export const updateTask = async (taskId, taskData) => {
  console.log(`【API連携】タスク(ID:${taskId})を更新します`);
  
  if (MOCK_MODE) {
    console.log('【API連携（モック）】モックモードでタスクを更新します');
    
    // すべてのプロジェクトのタスクを検索
    let updatedTask = null;
    
    for (const projectId in mockTasks) {
      const taskIndex = mockTasks[projectId].findIndex(t => t.id === taskId);
      
      if (taskIndex !== -1) {
        updatedTask = {
          ...mockTasks[projectId][taskIndex],
          ...taskData
        };
        
        mockTasks[projectId][taskIndex] = updatedTask;
        break;
      }
    }
    
    if (!updatedTask) {
      return mockDelay({
        data: {
          status: 'error',
          message: 'タスクが見つかりません'
        }
      });
    }
    
    return mockDelay({
      data: {
        status: 'success',
        data: {
          task: updatedTask
        },
        message: 'タスクが正常に更新されました'
      }
    });
  }
  
  // 実際のAPI呼び出し
  try {
    console.log(`【API連携】タスク更新APIリクエスト: ${TASKS.UPDATE(taskId)}`, taskData);
    const response = await api.put(TASKS.UPDATE(taskId), taskData);
    console.log(`【API連携】タスク更新APIレスポンス:`, response.data);
    // 元のレスポンスをそのまま返す
    return response;
  } catch (error) {
    console.error('【API連携エラー】タスクの更新に失敗しました', error);
    throw error;
  }
};

/**
 * タスクのステータス更新
 * @param {string} taskId - タスクID
 * @param {string} status - 新しいステータス
 * @param {number} progress - 進捗率
 * @returns {Promise} 更新されたタスク
 */
export const updateTaskStatus = async (taskId, status, progress) => {
  console.log(`【API連携】タスク(ID:${taskId})のステータスを更新します: ${status}, 進捗: ${progress}%`);
  
  if (MOCK_MODE) {
    console.log('【API連携（モック）】モックモードでタスクステータスを更新します');
    
    // すべてのプロジェクトのタスクを検索
    let updatedTask = null;
    
    for (const projectId in mockTasks) {
      const taskIndex = mockTasks[projectId].findIndex(t => t.id === taskId);
      
      if (taskIndex !== -1) {
        updatedTask = {
          ...mockTasks[projectId][taskIndex],
          status,
          progress
        };
        
        mockTasks[projectId][taskIndex] = updatedTask;
        break;
      }
    }
    
    if (!updatedTask) {
      return mockDelay({
        data: {
          status: 'error',
          message: 'タスクが見つかりません'
        }
      });
    }
    
    return mockDelay({
      data: {
        status: 'success',
        data: {
          task: updatedTask
        },
        message: 'タスクのステータスが正常に更新されました'
      }
    });
  }
  
  // 実際のAPI呼び出し
  try {
    const response = await api.patch(TASKS.UPDATE_STATUS(taskId), { status, progress });
    return response.data;
  } catch (error) {
    console.error('【API連携エラー】タスクのステータス更新に失敗しました', error);
    throw error;
  }
};

/**
 * タスクの削除
 * @param {string} taskId - タスクID
 * @returns {Promise} 削除結果
 */
export const deleteTask = async (taskId) => {
  console.log(`【API連携】タスク(ID:${taskId})を削除します`);
  
  if (MOCK_MODE) {
    console.log('【API連携（モック）】モックモードでタスクを削除します');
    
    let taskDeleted = false;
    
    // すべてのプロジェクトのタスクから削除
    for (const projectId in mockTasks) {
      const initialLength = mockTasks[projectId].length;
      mockTasks[projectId] = mockTasks[projectId].filter(t => t.id !== taskId);
      
      if (mockTasks[projectId].length < initialLength) {
        taskDeleted = true;
        break;
      }
    }
    
    if (!taskDeleted) {
      return mockDelay({
        data: {
          status: 'error',
          message: 'タスクが見つかりません'
        }
      });
    }
    
    return mockDelay({
      data: {
        status: 'success',
        message: 'タスクが正常に削除されました'
      }
    });
  }
  
  // 実際のAPI呼び出し
  try {
    console.log(`【API連携】タスク削除APIリクエスト: ${TASKS.DELETE(taskId)}`);
    const response = await api.delete(TASKS.DELETE(taskId));
    console.log(`【API連携】タスク削除APIレスポンス:`, response.data);
    // 元のレスポンスをそのまま返す
    return response;
  } catch (error) {
    console.error('【API連携エラー】タスクの削除に失敗しました', error);
    throw error;
  }
};

/**
 * AIによるタスク生成
 * @param {Object} generationParams - タスク生成パラメータ
 * @returns {Promise} 生成されたタスク一覧
 */
export const generateTasks = async (generationParams) => {
  console.log('【API連携】AIによるタスク生成を実行します');
  
  if (MOCK_MODE) {
    console.log('【API連携（モック）】モックモードでAIタスク生成を実行します');
    
    // モックで生成するタスクのテンプレート
    const taskTemplates = [
      {
        title: '要件定義',
        description: 'プロジェクトの要件を明確化し文書化する',
        duration: 14, // 日数
        priority: 'high',
        dependencies: []
      },
      {
        title: '設計フェーズ',
        description: '詳細設計書の作成と承認',
        duration: 21,
        priority: 'high',
        dependencies: [0] // 要件定義に依存
      },
      {
        title: '開発環境準備',
        description: '開発に必要なツールとリソースの準備',
        duration: 7,
        priority: 'medium',
        dependencies: [0] // 要件定義に依存
      },
      {
        title: '実装フェーズ',
        description: '設計に基づいたシステム実装',
        duration: 30,
        priority: 'high',
        dependencies: [1, 2] // 設計フェーズと開発環境準備に依存
      },
      {
        title: 'テスト計画策定',
        description: 'テスト戦略と詳細計画の作成',
        duration: 10,
        priority: 'medium',
        dependencies: [1] // 設計フェーズに依存
      },
      {
        title: 'テスト実施',
        description: '機能テスト、結合テスト、システムテストの実施',
        duration: 21,
        priority: 'high',
        dependencies: [3, 4] // 実装フェーズとテスト計画に依存
      },
      {
        title: '文書化',
        description: 'ユーザーマニュアルと技術文書の作成',
        duration: 14,
        priority: 'medium',
        dependencies: [3] // 実装フェーズに依存
      },
      {
        title: 'トレーニング',
        description: 'ユーザーへのシステム利用トレーニング',
        duration: 7,
        priority: 'medium',
        dependencies: [5, 6] // テスト実施と文書化に依存
      },
      {
        title: '本番環境準備',
        description: '本番環境のセットアップと構成',
        duration: 10,
        priority: 'high',
        dependencies: [5] // テスト実施に依存
      },
      {
        title: 'リリース',
        description: 'システムの本番環境へのデプロイ',
        duration: 3,
        priority: 'high',
        dependencies: [7, 8] // トレーニングと本番環境準備に依存
      }
    ];
    
    // プロジェクトの開始日からタスクを生成
    const startDate = new Date(generationParams.targetDate);
    startDate.setMonth(startDate.getMonth() - 4); // ターゲット日から4ヶ月前を開始日とする
    
    const generatedTasks = [];
    let currentDate = new Date(startDate);
    
    // タスクの生成
    for (let i = 0; i < taskTemplates.length; i++) {
      const template = taskTemplates[i];
      
      // 依存タスクの中で最も遅い終了日を取得
      if (template.dependencies.length > 0) {
        const dependencyEndDates = template.dependencies.map(depIndex => {
          const depTask = generatedTasks[depIndex];
          return new Date(depTask.endDate);
        });
        
        const maxEndDate = new Date(Math.max(...dependencyEndDates));
        currentDate = maxEndDate;
      }
      
      const taskStartDate = new Date(currentDate);
      const taskEndDate = new Date(currentDate);
      taskEndDate.setDate(taskEndDate.getDate() + template.duration);
      
      // 新しいタスクの作成
      const newTask = {
        id: `gen-task-${i}`,
        projectId: generationParams.projectId,
        title: template.title,
        description: template.description,
        startDate: taskStartDate.toISOString().split('T')[0],
        endDate: taskEndDate.toISOString().split('T')[0],
        progress: 0,
        status: 'not-started',
        priority: template.priority,
        isAtRisk: false,
        dependsOn: template.dependencies.map(depIndex => generatedTasks[depIndex].id),
        order: i + 1
      };
      
      generatedTasks.push(newTask);
      currentDate = new Date(taskEndDate);
    }
    
    // 警告の生成（ターゲット日に間に合わない場合）
    const lastTaskEndDate = new Date(generatedTasks[generatedTasks.length - 1].endDate);
    const targetDate = new Date(generationParams.targetDate);
    
    const warnings = [];
    if (lastTaskEndDate > targetDate) {
      const daysDiff = Math.ceil((lastTaskEndDate - targetDate) / (1000 * 60 * 60 * 24));
      warnings.push({
        type: 'timeline',
        message: `ターゲット日に対して計画が${daysDiff}日間超過しています。スケジュールの見直しをお勧めします。`,
        relatedTaskId: generatedTasks[generatedTasks.length - 1].id
      });
    }
    
    // ランダムにリスクを追加
    const riskTaskIndex = Math.floor(Math.random() * (generatedTasks.length - 2)) + 1;
    generatedTasks[riskTaskIndex].isAtRisk = true;
    generatedTasks[riskTaskIndex].riskDescription = 'このタスクには追加リソースが必要になる可能性があります';
    
    warnings.push({
      type: 'resource',
      message: `${generatedTasks[riskTaskIndex].title}のリソース要件を見直してください。`,
      relatedTaskId: generatedTasks[riskTaskIndex].id
    });
    
    return mockDelay({
      data: {
        status: 'success',
        data: {
          tasks: generatedTasks,
          warnings
        },
        message: 'AIによるタスク生成が完了しました'
      }
    });
  }
  
  // 実際のAPI呼び出し
  try {
    const response = await api.post(TASKS.GENERATE_TASKS, generationParams);
    return response.data;
  } catch (error) {
    console.error('【API連携エラー】AIタスク生成に失敗しました', error);
    throw error;
  }
};

export default {
  getProjectTasks,
  getUpcomingTasks,
  getTasksAtRisk,
  getTaskDetails,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  generateTasks
};