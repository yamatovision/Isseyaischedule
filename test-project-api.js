const axios = require('axios');
const colors = require('colors');

// 環境変数を読み込む
const API_URL = process.env.API_URL || 'http://localhost:5000/api/v1';
console.log('API URL:', API_URL);

// テスト用のダミーデータ
let authToken = '';
let projectId = '';

// テスト結果を保存
const testResults = {
  success: 0,
  fail: 0,
  total: 0
};

// テスト実行関数
const runTest = async (name, testFn) => {
  testResults.total++;
  console.log(`\n${colors.cyan('テスト:')} ${name}`);
  
  try {
    await testFn();
    testResults.success++;
    console.log(`${colors.green('✓ 成功')}`);
  } catch (error) {
    testResults.fail++;
    console.error(`${colors.red('✗ 失敗:')} ${error.message}`);
    if (error.response) {
      console.error(`  ${colors.yellow('ステータス:')} ${error.response.status}`);
      console.error(`  ${colors.yellow('レスポンス:')} ${JSON.stringify(error.response.data, null, 2)}`);
    }
  }
};

// ログインしてトークンを取得
const login = async () => {
  console.log('=== 認証トークンの取得 ===');
  try {
    const loginData = {
      email: 'test@example.com',
      password: 'Password123'
    };
    
    const response = await axios.post(`${API_URL}/auth/login`, loginData);
    
    if (response.data.success && response.data.token) {
      authToken = response.data.token;
      console.log(colors.green('認証トークン取得成功'));
      return response.data.token;
    } else {
      throw new Error('トークンが取得できませんでした');
    }
  } catch (error) {
    console.error(colors.red('認証エラー:'), error.message);
    if (error.response) {
      console.error(`ステータス: ${error.response.status}`);
      console.error('レスポンス:', error.response.data);
    }
    throw error;
  }
};

// プロジェクト関連のテスト

// プロジェクト統計情報取得
const testGlobalStats = async () => {
  const response = await axios.get(`${API_URL}/projects/stats/global`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  
  console.log('統計情報レスポンス:', response.data);
  
  if (!response.data.success) {
    throw new Error('統計情報の取得に失敗しました');
  }
  
  const stats = response.data.stats;
  console.log('完了タスク:', stats.completed);
  console.log('進行中タスク:', stats.inProgress);
  console.log('未開始タスク:', stats.notStarted);
  console.log('全タスク数:', stats.totalTasks);
};

// プロジェクト作成テスト
const testCreateProject = async () => {
  const newProject = {
    title: 'テストプロジェクト',
    description: 'APIテスト用のプロジェクトです',
    type: 'project',
    startDate: '2025-03-20',
    endDate: '2025-06-30'
  };
  
  const response = await axios.post(`${API_URL}/projects`, newProject, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  
  console.log('プロジェクト作成レスポンス:', response.data);
  
  if (!response.data.success || !response.data.project) {
    throw new Error('プロジェクト作成に失敗しました');
  }
  
  // 作成したプロジェクトIDを保存
  projectId = response.data.project._id || response.data.project.id;
  console.log('作成されたプロジェクトID:', projectId);
};

// アクティブプロジェクト取得テスト
const testGetActiveProjects = async () => {
  const response = await axios.get(`${API_URL}/projects/active`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  
  console.log('アクティブプロジェクト取得レスポンス:', response.data);
  
  if (!response.data.success) {
    throw new Error('アクティブプロジェクトの取得に失敗しました');
  }
  
  const projects = response.data.projects;
  console.log(`取得したプロジェクト数: ${projects.length}`);
  
  if (projects.length > 0) {
    console.log('最初のプロジェクト:', projects[0].title);
  }
};

// プロジェクト詳細取得テスト
const testGetProject = async () => {
  // アクティブプロジェクトから最初のプロジェクトIDを取得
  if (!projectId) {
    console.log('プロジェクトIDが未設定。アクティブプロジェクトから取得を試みます...');
    try {
      // アクティブプロジェクトを取得してIDを設定
      const activeResponse = await axios.get(`${API_URL}/projects/active`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      if (activeResponse.data.success && activeResponse.data.projects.length > 0) {
        projectId = activeResponse.data.projects[0].id;
        console.log(`アクティブプロジェクトからIDを取得: ${projectId}`);
      } else {
        throw new Error('アクティブなプロジェクトが見つかりません');
      }
    } catch (error) {
      throw new Error('プロジェクトIDを取得できませんでした: ' + error.message);
    }
  }
  
  const response = await axios.get(`${API_URL}/projects/${projectId}`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  
  console.log('プロジェクト詳細取得レスポンス:', response.data);
  
  if (!response.data.success || !response.data.project) {
    throw new Error('プロジェクト詳細の取得に失敗しました');
  }
  
  const project = response.data.project;
  console.log('プロジェクト名:', project.title);
  console.log('プロジェクト説明:', project.description);
  console.log('開始日:', project.startDate);
  console.log('終了日:', project.endDate);
};

// タスク作成テスト
const testCreateTask = async () => {
  // アクティブプロジェクトから最初のプロジェクトIDを取得
  if (!projectId) {
    console.log('プロジェクトIDが未設定。アクティブプロジェクトから取得を試みます...');
    try {
      // アクティブプロジェクトを取得してIDを設定
      const activeResponse = await axios.get(`${API_URL}/projects/active`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      if (activeResponse.data.success && activeResponse.data.projects.length > 0) {
        projectId = activeResponse.data.projects[0].id;
        console.log(`アクティブプロジェクトからIDを取得: ${projectId}`);
      } else {
        throw new Error('アクティブなプロジェクトが見つかりません');
      }
    } catch (error) {
      throw new Error('プロジェクトIDを取得できませんでした: ' + error.message);
    }
  }
  
  const newTask = {
    title: 'テストタスク',
    description: 'APIテスト用のタスクです',
    project: projectId,
    priority: 'high',
    dueDate: '2025-04-15'
  };
  
  const response = await axios.post(`${API_URL}/tasks`, newTask, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  
  console.log('タスク作成レスポンス:', response.data);
  
  if (!response.data.success || !response.data.task) {
    throw new Error('タスク作成に失敗しました');
  }
  
  // 作成したタスクIDを保存
  const taskId = response.data.task._id || response.data.task.id;
  console.log('作成されたタスクID:', taskId);
};

// 直近のタスク取得テスト
const testGetUpcomingTasks = async () => {
  const response = await axios.get(`${API_URL}/projects/tasks/upcoming`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  
  console.log('直近のタスク取得レスポンス:', response.data);
  
  if (!response.data.success) {
    throw new Error('直近のタスクの取得に失敗しました');
  }
  
  const tasks = response.data.tasks;
  console.log(`取得したタスク数: ${tasks.length}`);
  
  if (tasks.length > 0) {
    console.log('最初のタスク:', tasks[0].title);
    console.log('期限日:', tasks[0].dueDate);
    console.log('優先度:', tasks[0].priority);
  }
};

// プロジェクト更新テスト
const testUpdateProject = async () => {
  // アクティブプロジェクトから最初のプロジェクトIDを取得
  if (!projectId) {
    console.log('プロジェクトIDが未設定。アクティブプロジェクトから取得を試みます...');
    try {
      // アクティブプロジェクトを取得してIDを設定
      const activeResponse = await axios.get(`${API_URL}/projects/active`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      if (activeResponse.data.success && activeResponse.data.projects.length > 0) {
        projectId = activeResponse.data.projects[0].id;
        console.log(`アクティブプロジェクトからIDを取得: ${projectId}`);
      } else {
        throw new Error('アクティブなプロジェクトが見つかりません');
      }
    } catch (error) {
      throw new Error('プロジェクトIDを取得できませんでした: ' + error.message);
    }
  }
  
  const updateData = {
    title: 'テストプロジェクト（更新済み）',
    description: '更新されたプロジェクト説明',
    status: 'in_progress'
  };
  
  const response = await axios.put(`${API_URL}/projects/${projectId}`, updateData, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  
  console.log('プロジェクト更新レスポンス:', response.data);
  
  if (!response.data.success || !response.data.project) {
    throw new Error('プロジェクト更新に失敗しました');
  }
  
  console.log('更新後のプロジェクト名:', response.data.project.title);
  console.log('更新後のステータス:', response.data.project.status);
};

// プロジェクト削除（アーカイブ）テスト
const testDeleteProject = async () => {
  // アクティブプロジェクトから最初のプロジェクトIDを取得
  if (!projectId) {
    console.log('プロジェクトIDが未設定。アクティブプロジェクトから取得を試みます...');
    try {
      // アクティブプロジェクトを取得してIDを設定
      const activeResponse = await axios.get(`${API_URL}/projects/active`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      if (activeResponse.data.success && activeResponse.data.projects.length > 0) {
        projectId = activeResponse.data.projects[0].id;
        console.log(`アクティブプロジェクトからIDを取得: ${projectId}`);
      } else {
        throw new Error('アクティブなプロジェクトが見つかりません');
      }
    } catch (error) {
      throw new Error('プロジェクトIDを取得できませんでした: ' + error.message);
    }
  }
  
  const response = await axios.delete(`${API_URL}/projects/${projectId}`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  
  console.log('プロジェクト削除レスポンス:', response.data);
  
  if (!response.data.success) {
    throw new Error('プロジェクト削除に失敗しました');
  }
  
  console.log('削除メッセージ:', response.data.message);
};

// テスト実行
async function runTests() {
  console.log('===== プロジェクトAPI テスト開始 =====');
  
  try {
    // ログインしてトークンを取得
    await login();
    
    // プロジェクト関連のテスト
    await runTest('プロジェクト統計情報取得', testGlobalStats);
    await runTest('プロジェクト作成', testCreateProject);
    await runTest('アクティブプロジェクト取得', testGetActiveProjects);
    await runTest('プロジェクト詳細取得', testGetProject);
    await runTest('タスク作成', testCreateTask);
    await runTest('直近のタスク取得', testGetUpcomingTasks);
    await runTest('プロジェクト更新', testUpdateProject);
    await runTest('プロジェクト削除', testDeleteProject);
    
    // テスト結果サマリーを表示
    console.log('\n===== テスト結果サマリー =====');
    console.log(`全テスト数: ${testResults.total}`);
    console.log(`${colors.green('成功:')} ${testResults.success}`);
    console.log(`${colors.red('失敗:')} ${testResults.fail}`);
    console.log('============================');
    
  } catch (error) {
    console.error(colors.red('\nテスト実行中にエラーが発生しました:'), error.message);
  }
}

// テスト実行
runTests().catch(error => {
  console.error('テスト実行エラー:', error);
});