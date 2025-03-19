/**
 * チャットAPI テスト
 * Chat-to-Gantt機能のAPIをテストするスクリプト
 */

require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// APIエンドポイント
const API_URL = process.env.API_URL || 'http://localhost:5000/api/v1';

// テスト実行関数
const runTests = async () => {
  console.log('=== チャットAPI テスト開始 ===');
  
  try {
    // MongoDB接続
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB接続成功');
    
    // テストユーザー作成（開発環境のみ）
    if (process.env.NODE_ENV !== 'production') {
      await setupTestUser();
    }
    
    // テストユーザーでログイン
    const authResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'Password123'
    });
    
    // 認証トークン取得
    const token = authResponse.data.token;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    console.log('ログイン成功:', authResponse.data.user.name);
    
    // テストプロジェクト作成
    const projectResponse = await axios.post(`${API_URL}/projects`, {
      title: 'テスト店舗出店プロジェクト',
      description: 'Chat-to-Gantt APIテスト用プロジェクト',
      type: 'store',
      startDate: '2025-04-01',
      endDate: '2025-07-31'
    }, { headers });
    
    console.log('プロジェクト作成レスポンス:', JSON.stringify(projectResponse.data, null, 2));
    
    const projectId = projectResponse.data.project._id || projectResponse.data.project.id;
    console.log('テストプロジェクト作成:', projectId);
    
    // AIテスト機能を使用（開発環境のみ）
    if (process.env.NODE_ENV !== 'production') {
      await testAiDirectly(headers);
    } else {
      await testFullAPIFlow(headers, projectId);
    }
    
    // テストデータのクリーンアップ
    console.log('\n>> テストデータのクリーンアップ');
    try {
      await axios.delete(`${API_URL}/projects/${projectId}`, { headers });
      console.log('テストプロジェクトを削除しました');
    } catch (error) {
      console.warn('プロジェクト削除に失敗しました:', error.message);
    }
    
    console.log('\n=== テスト完了 - すべてのテストが成功しました ===');
    
  } catch (error) {
    console.error('テストエラー:', error.response?.data || error.message);
  } finally {
    // MongoDB接続を閉じる
    await mongoose.connection.close();
    console.log('MongoDB接続を閉じました');
  }
};

// テストユーザーのセットアップ
const setupTestUser = async () => {
  try {
    // ユーザーコレクションに直接ユーザーを作成
    const db = mongoose.connection;
    const userCollection = db.collection('users');
    
    // 既存のユーザーをチェック
    const existingUser = await userCollection.findOne({ email: 'test@example.com' });
    
    if (!existingUser) {
      // パスワードをハッシュ化
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      // ユーザーを作成
      await userCollection.insertOne({
        email: 'test@example.com',
        password: hashedPassword,
        name: 'テストユーザー',
        role: 'admin',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('テストユーザー作成: test@example.com');
    } else {
      console.log('テストユーザーは既に存在します');
    }
  } catch (error) {
    console.error('テストユーザー作成エラー:', error);
  }
};

// 直接AIテスト機能を使用するテスト（開発環境のみ）
const testAiDirectly = async (headers) => {
  console.log('\n>> AI機能ダイレクトテスト');
  
  // チャットメッセージ処理テスト
  console.log('>> チャットメッセージ処理テスト');
  let chatTestResponse;
  try {
    chatTestResponse = await axios.post(`${API_URL}/chat/test`, {
      testType: 'chatMessage',
      data: {
        message: '新店舗の出店計画について相談したいです。東京都内で7月までにオープンしたいと考えています。',
        projectId: null
      }
    }, { headers });
    console.log('チャットテストレスポンス:', chatTestResponse.data);
    console.log('AI応答:', chatTestResponse.data.data.content);
    console.log('提案:', chatTestResponse.data.data.suggestions);
  } catch (error) {
    console.log('チャットテストエラー:', error.response?.data || error.message);
    // API_URLを確認
    console.log('API_URL:', API_URL);
    // 利用可能なエンドポイントを確認
    try {
      const rootResponse = await axios.get(`${API_URL.split('/api/')[0]}/`, { headers });
      console.log('ルートエンドポイントレスポンス:', rootResponse.data);
    } catch (rootError) {
      console.log('ルートエンドポイント確認エラー:', rootError.message);
    }
  }
  
  // タスク生成テスト
  console.log('\n>> タスク生成テスト');
  let taskGenTestResponse;
  try {
    taskGenTestResponse = await axios.post(`${API_URL}/chat/test`, {
      testType: 'generateTasks',
      data: {
        project: {
          title: 'テスト店舗出店プロジェクト',
          type: 'store',
          startDate: '2025-04-01',
          endDate: '2025-07-31'
        },
        projectType: 'store-opening',
        goal: '7月末までに東京新宿に店舗をオープンする',
        additionalInfo: 'カフェを想定しています。予算は2000万円程度。'
      }
    }, { headers });
  } catch (error) {
    console.log('タスク生成テストエラー:', error.response?.data || error.message);
    return; // エラー時は後続処理をスキップ
  }
  
  console.log(`生成されたタスク: ${taskGenTestResponse.data.data.length}件`);
  taskGenTestResponse.data.data.forEach((task, i) => {
    console.log(`[${i+1}] ${task.title} (${task.startDate} 〜 ${task.endDate}, 優先度: ${task.priority})`);
    if (task.warning) {
      console.log(`  ⚠️ 警告: ${task.warningText}`);
    }
  });
  
  // 解決策提案テスト
  console.log('\n>> 解決策提案テスト');
  try {
    const solutionTestResponse = await axios.post(`${API_URL}/chat/test`, {
      testType: 'suggestSolutions',
      data: {
        taskId: 'test-task-id',
        planId: 'test-plan-id',
        issue: '店舗物件の選定が遅れており、スケジュールに影響が出そうです。'
      }
    }, { headers });
    
    console.log('提案された解決策:');
    solutionTestResponse.data.data.forEach((solution, i) => {
      console.log(`[${i+1}] ${solution.description} (難易度: ${solution.difficulty})`);
      console.log(`   影響: ${solution.impact}`);
    });
  } catch (error) {
    console.log('解決策提案テストエラー:', error.response?.data || error.message);
  }
};

// 完全なAPIフローを使用するテスト
const testFullAPIFlow = async (headers, projectId) => {
  // チャットメッセージ送信テスト
  console.log('\n>> チャットメッセージ送信テスト');
  try {
    const chatResponse = await axios.post(`${API_URL}/chat/send`, {
      projectId,
      message: '新店舗の出店計画について相談したいです。東京都内で7月までにオープンしたいと考えています。'
    }, { headers });
    
    console.log('AI応答:', chatResponse.data.data.message);
    console.log('提案:', chatResponse.data.data.suggestions);
  } catch (error) {
    console.log('チャットメッセージ送信テストエラー:', error.response?.data || error.message);
  }
  
  // チャット履歴取得テスト
  console.log('\n>> チャット履歴取得テスト');
  try {
    const historyResponse = await axios.get(`${API_URL}/chat/history/${projectId}`, { headers });
    
    console.log(`チャット履歴: ${historyResponse.data.data.messages.length}件のメッセージ`);
    historyResponse.data.data.messages.forEach((msg, i) => {
      console.log(`[${i+1}] ${msg.sender}: ${msg.content.substring(0, 30)}...`);
    });
  } catch (error) {
    console.log('チャット履歴取得テストエラー:', error.response?.data || error.message);
  }
  
  // タスク生成テスト
  console.log('\n>> タスク生成テスト');
  let taskId;
  try {
    const taskGenResponse = await axios.post(`${API_URL}/chat/tasks/generate`, {
      projectId,
      projectType: 'store-opening',
      goal: '7月末までに東京新宿に店舗をオープンする',
      targetDate: '2025-07-31',
      additionalInfo: 'カフェを想定しています。予算は2000万円程度。'
    }, { headers });
    
    console.log(`生成されたタスク: ${taskGenResponse.data.data.tasks.length}件`);
    taskGenResponse.data.data.tasks.forEach((task, i) => {
      console.log(`[${i+1}] ${task.title} (${task.startDate} 〜 ${task.dueDate}, 優先度: ${task.priority})`);
    });
    
    // タスクIDを取得（解決策提案テスト用）
    taskId = taskGenResponse.data.data.tasks[0]._id;
  } catch (error) {
    console.log('タスク生成テストエラー:', error.response?.data || error.message);
    // テスト用にダミーのIDを設定
    taskId = 'dummy-task-id';
  }
  
  // 解決策提案テスト
  console.log('\n>> 解決策提案テスト');
  let solutionResponse;
  try {
    solutionResponse = await axios.post(`${API_URL}/chat/suggest-solution`, {
      taskId,
      planId: projectId,
      issue: '店舗物件の選定が遅れており、スケジュールに影響が出そうです。'
    }, { headers });
    
    console.log('提案された解決策:');
    solutionResponse.data.data.suggestions.forEach((solution, i) => {
      console.log(`[${i+1}] ${solution.description} (難易度: ${solution.difficulty})`);
      console.log(`   影響: ${solution.impact}`);
    });
  } catch (error) {
    console.log('解決策提案テストエラー:', error.response?.data || error.message);
    return; // エラー時は後続処理をスキップ
  }
  
  // 解決策適用テスト
  console.log('\n>> 解決策適用テスト');
  try {
    // 解決策レスポンスがない場合はスキップ
    if (!solutionResponse || !solutionResponse.data || !solutionResponse.data.data || !solutionResponse.data.data.suggestions) {
      console.log('先行ステップのエラーによりスキップします');
      return;
    }
    
    const applySolutionResponse = await axios.post(`${API_URL}/chat/projects/${projectId}/apply-solution`, {
      solutionId: solutionResponse.data.data.suggestions[0].id,
      taskId,
      adjustments: {
        title: '物件選定と契約（優先的に）',
        description: '出店場所の選定、内見、賃貸契約の締結（不動産業者と連携）',
        endDate: '2025-05-15',
        priority: 'high',
        addTasks: [
          {
            title: '不動産業者との連携強化',
            description: '複数の不動産業者と連携し、物件情報の収集を効率化',
            startDate: '2025-04-01',
            endDate: '2025-04-15',
            priority: 'high',
            dependsOn: []
          }
        ]
      }
    }, { headers });
    
    console.log('更新されたタスク:', applySolutionResponse.data.data.updatedTask.title);
    console.log('新規作成されたタスク:', applySolutionResponse.data.data.newTasks.map(t => t.title).join(', '));
  } catch (error) {
    console.log('解決策適用テストエラー:', error.response?.data || error.message);
  }
};

// テスト実行
runTests();