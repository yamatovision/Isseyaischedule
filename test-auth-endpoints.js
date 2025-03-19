const axios = require('axios');
const colors = require('colors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

/**
 * 認証APIエンドポイントテストスクリプト
 * バックエンドの全認証エンドポイントの動作確認
 */

// 環境変数を読み込む
const API_URL = process.env.API_URL || 'http://localhost:5001/api/v1';
let AUTH_TOKEN = '';
let INVITATION_CODE = '';

// テスト結果を保存する配列
const testResults = [];

// テスト結果をコンソールと結果ファイルに出力する関数
const logResult = (testName, success, message, data = null) => {
  const result = {
    test: testName,
    success,
    message,
    timestamp: new Date().toISOString(),
    data: data ? JSON.stringify(data) : null
  };
  
  testResults.push(result);
  
  const statusText = success ? 'PASS'.green : 'FAIL'.red;
  console.log(`[${statusText}] ${testName}: ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
  console.log('-----------------------------------');
};

// 招待コード生成エンドポイントのテスト（管理者権限が必要）
async function testCreateInvitation(token) {
  try {
    console.log('招待コード生成エンドポイントのテスト...'.yellow);
    
    const response = await axios.post(`${API_URL}/auth/create-invitation`, 
      {
        expiresInDays: 7,
        role: 'user',
        maxUses: 1
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    if (response.data && response.data.success && response.data.code) {
      INVITATION_CODE = response.data.code;
      logResult('招待コード生成', true, '招待コードが生成されました', { code: response.data.code });
      return response.data.code;
    } else {
      logResult('招待コード生成', false, '招待コードの生成に失敗しました', response.data);
      return null;
    }
  } catch (error) {
    logResult('招待コード生成', false, 
      '招待コード生成エラー: ' + (error.response?.data?.message || error.message),
      error.response?.data || null
    );
    return null;
  }
}

// 招待コード検証エンドポイントのテスト
async function testVerifyInvitation(code = 'DEMO-2025') {
  try {
    console.log('招待コード検証エンドポイントのテスト...'.yellow);
    
    // コードが明示的に送信されていることを確認
    console.log(`招待コードを検証中: ${code}`);
    
    const response = await axios.post(`${API_URL}/auth/verify-invitation`, { code });
    logResult('招待コード検証', response.data.success, 
      response.data.message || '招待コード検証完了',
      response.data
    );
    return response.data.success;
  } catch (error) {
    logResult('招待コード検証', false, 
      '招待コード検証エラー: ' + (error.response?.data?.message || error.message),
      error.response?.data || null
    );
    return false;
  }
}

// 登録エンドポイントのテスト
async function testRegisterEndpoint() {
  try {
    console.log('登録エンドポイントのテスト...'.yellow);
    
    // テスト用のランダムメールアドレスを生成
    const randomEmail = `test${Math.floor(Math.random() * 1000000)}@example.com`;
    
    const testData = {
      email: randomEmail,
      password: 'TestPassword123',
      invitationCode: INVITATION_CODE || 'DEMO-2025'
    };
    
    const response = await axios.post(`${API_URL}/auth/register`, testData);
    
    if (response.data && response.data.success && response.data.token) {
      AUTH_TOKEN = response.data.token;
      logResult('ユーザー登録', true, 'ユーザー登録が成功しました', {
        email: testData.email,
        token: response.data.token ? '[REDACTED]' : null,
        user: response.data.user
      });
      return response.data.token;
    } else {
      logResult('ユーザー登録', false, 'ユーザー登録に失敗しました', response.data);
      return null;
    }
  } catch (error) {
    logResult('ユーザー登録', false, 
      'ユーザー登録エラー: ' + (error.response?.data?.message || error.message),
      error.response?.data || null
    );
    return null;
  }
}

// ログインエンドポイントのテスト
async function testLoginEndpoint(email = 'test@example.com', password = 'Password123') {
  try {
    console.log('ログインエンドポイントのテスト...'.yellow);
    
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
      rememberMe: true
    });
    
    if (response.data && response.data.success && response.data.token) {
      AUTH_TOKEN = response.data.token;
      logResult('ログイン', true, 'ログインが成功しました', {
        email,
        token: '[REDACTED]',
        user: response.data.user
      });
      return response.data.token;
    } else {
      logResult('ログイン', false, 'ログインに失敗しました', response.data);
      return null;
    }
  } catch (error) {
    logResult('ログイン', false, 
      'ログインエラー: ' + (error.response?.data?.message || error.message),
      error.response?.data || null
    );
    return null;
  }
}

// ユーザープロフィール取得のテスト
async function testGetProfileEndpoint(token) {
  try {
    console.log('プロフィール取得エンドポイントのテスト...'.yellow);
    
    if (!token) {
      logResult('プロフィール取得', false, '認証トークンがありません');
      return;
    }
    
    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    logResult('プロフィール取得', response.data.success, 
      'プロフィール取得が成功しました',
      response.data
    );
  } catch (error) {
    logResult('プロフィール取得', false, 
      'プロフィール取得エラー: ' + (error.response?.data?.message || error.message),
      error.response?.data || null
    );
  }
}

// パスワードリセットリクエストのテスト
async function testForgotPasswordEndpoint(email = 'test@example.com') {
  try {
    console.log('パスワードリセットリクエストのテスト...'.yellow);
    
    const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
    
    logResult('パスワードリセットリクエスト', response.data.success, 
      response.data.message || 'パスワードリセットリクエストが完了しました',
      response.data
    );
  } catch (error) {
    logResult('パスワードリセットリクエスト', false, 
      'パスワードリセットリクエストエラー: ' + (error.response?.data?.message || error.message),
      error.response?.data || null
    );
  }
}

// ログアウトエンドポイントのテスト
async function testLogoutEndpoint(token) {
  try {
    console.log('ログアウトエンドポイントのテスト...'.yellow);
    
    if (!token) {
      logResult('ログアウト', false, '認証トークンがありません');
      return;
    }
    
    const response = await axios.post(`${API_URL}/auth/logout`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    logResult('ログアウト', response.data.success, 
      response.data.message || 'ログアウトが成功しました',
      response.data
    );
  } catch (error) {
    logResult('ログアウト', false, 
      'ログアウトエラー: ' + (error.response?.data?.message || error.message),
      error.response?.data || null
    );
  }
}

// テスト結果をファイルに保存
function saveTestResults() {
  const resultsDir = path.join(__dirname, 'test-results');
  
  // ディレクトリがなければ作成
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const filePath = path.join(resultsDir, `auth-test-${timestamp}.json`);
  
  const resultData = {
    timestamp: new Date().toISOString(),
    apiUrl: API_URL,
    results: testResults,
    summary: {
      total: testResults.length,
      passed: testResults.filter(r => r.success).length,
      failed: testResults.filter(r => !r.success).length
    }
  };
  
  fs.writeFileSync(filePath, JSON.stringify(resultData, null, 2));
  console.log(`テスト結果を保存しました: ${filePath}`.cyan);
  
  // サマリーを表示
  console.log('\nテスト結果サマリー:'.cyan);
  console.log(`総テスト数: ${resultData.summary.total}`);
  console.log(`成功: ${resultData.summary.passed}`.green);
  console.log(`失敗: ${resultData.summary.failed}`.red);
}

// すべてのテストを順番に実行
async function runTests() {
  console.log('=== 認証APIエンドポイントテスト開始 ==='.cyan);
  console.log(`API URL: ${API_URL}`.cyan);
  console.log('===================================='.cyan);
  
  try {
    // 最初にログインでトークンを取得し、管理者権限でテスト
    const adminToken = await testLoginEndpoint();
    
    // 招待コード生成（管理者権限が必要）
    if (adminToken) {
      await testCreateInvitation(adminToken);
    }
    
    // 招待コード検証
    await testVerifyInvitation(INVITATION_CODE);
    
    // 新規ユーザー登録
    const registerToken = await testRegisterEndpoint();
    
    // 新規ユーザーのプロフィール取得
    if (registerToken) {
      await testGetProfileEndpoint(registerToken);
    }
    
    // パスワードリセットリクエスト
    await testForgotPasswordEndpoint();
    
    // ログアウト
    if (registerToken) {
      await testLogoutEndpoint(registerToken);
    }
    
    // ユーザー登録・ログインが失敗した場合のフォールバックテスト
    if (!registerToken && !adminToken) {
      console.log('フォールバックテスト: 既存ユーザーでログイン試行'.yellow);
      const loginToken = await testLoginEndpoint();
      
      if (loginToken) {
        await testGetProfileEndpoint(loginToken);
        await testLogoutEndpoint(loginToken);
      }
    }
    
    // テスト結果を保存
    saveTestResults();
    
    console.log('\n=== 認証APIエンドポイントテスト完了 ==='.cyan);
  } catch (error) {
    console.error('テスト実行中にエラーが発生しました:', error);
    saveTestResults();
  }
}

// テスト実行
runTests();