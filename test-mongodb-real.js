/**
 * 実際のMongoDBを使った統合テスト
 * 
 * このスクリプトはモックデータではなく実際のMongoDBを使ってAPIのテストを行います
 */

const { exec } = require('child_process');
const axios = require('axios');
const colors = require('colors');
require('dotenv').config();

// 環境変数を設定
process.env.NODE_ENV = 'production'; // モックデータを使わないよう本番環境設定
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
    title: '実DB用テストプロジェクト',
    description: '実際のMongoDBを使ったAPIテスト用のプロジェクトです',
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

// テスト実行
async function runRealDbTests() {
  console.log('===== 実際のMongoDBを使用したAPI テスト開始 =====');
  
  try {
    // ログインしてトークンを取得
    await login();
    
    // プロジェクト関連のテスト
    await runTest('プロジェクト統計情報取得', testGlobalStats);
    await runTest('プロジェクト作成', testCreateProject);
    await runTest('アクティブプロジェクト取得', testGetActiveProjects);
    
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

// サーバーの起動
console.log('APIサーバーを起動しています...');
const server = exec('node api/server.js', (error, stdout, stderr) => {
  if (error) {
    console.error(`サーバー起動エラー: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`サーバー起動エラー: ${stderr}`);
    return;
  }
});

// サーバーが起動するのを少し待ってからテスト実行
setTimeout(() => {
  runRealDbTests().then(() => {
    console.log('テストが完了しました。サーバーを終了します...');
    server.kill(); // サーバープロセスを終了
    process.exit(0);
  });
}, 3000);

// クリーンアップ処理
process.on('SIGINT', () => {
  if (server) {
    console.log('サーバーを終了しています...');
    server.kill();
  }
  process.exit(0);
});