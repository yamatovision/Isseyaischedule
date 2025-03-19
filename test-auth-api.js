const axios = require('axios');

// 環境変数を読み込む
const API_URL = 'https://isseyaischedule-production.up.railway.app/api/v1';
console.log('API URL:', API_URL);

// テスト用のダミーデータ
const testLoginData = {
  email: 'test@example.com',
  password: 'password123',
  rememberMe: true
};

const testRegisterData = {
  email: 'newuser@example.com',
  password: 'newpassword123',
  invitationCode: 'DEMO2025'
};

// ログインエンドポイントのテスト
async function testLoginEndpoint() {
  console.log('=== ログインエンドポイントのテスト ===');
  try {
    const response = await axios.post(`${API_URL}/auth/login`, testLoginData);
    console.log('ログインレスポンス ステータス:', response.status);
    console.log('ログインレスポンス データ:', response.data);
    return response.data.token; // 認証トークンを返す
  } catch (error) {
    console.error('ログインエラー:', error.response ? error.response.data : error.message);
    return null;
  }
}

// 登録エンドポイントのテスト
async function testRegisterEndpoint() {
  console.log('=== 登録エンドポイントのテスト ===');
  try {
    const response = await axios.post(`${API_URL}/auth/register`, testRegisterData);
    console.log('登録レスポンス ステータス:', response.status);
    console.log('登録レスポンス データ:', response.data);
    return response.data.token; // 認証トークンを返す
  } catch (error) {
    console.error('登録エラー:', error.response ? error.response.data : error.message);
    return null;
  }
}

// ユーザープロフィール取得のテスト
async function testGetProfileEndpoint(token) {
  console.log('=== プロフィール取得エンドポイントのテスト ===');
  if (!token) {
    console.log('認証トークンがありません。スキップします。');
    return;
  }
  
  try {
    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('プロフィールレスポンス ステータス:', response.status);
    console.log('プロフィールレスポンス データ:', response.data);
  } catch (error) {
    console.error('プロフィール取得エラー:', error.response ? error.response.data : error.message);
  }
}

// 招待コード検証エンドポイントのテスト
async function testVerifyInvitationEndpoint(code = 'DEMO2025') {
  console.log('=== 招待コード検証エンドポイントのテスト ===');
  try {
    const response = await axios.post(`${API_URL}/auth/verify-invitation`, { code });
    console.log('招待コード検証レスポンス ステータス:', response.status);
    console.log('招待コード検証レスポンス データ:', response.data);
  } catch (error) {
    console.error('招待コード検証エラー:', error.response ? error.response.data : error.message);
  }
}

// テスト実行
async function runTests() {
  console.log('API認証エンドポイントテスト開始');
  console.log('------------------------------');
  
  // 招待コード検証テスト
  await testVerifyInvitationEndpoint();
  console.log('------------------------------');
  
  // ログインテスト
  const loginToken = await testLoginEndpoint();
  console.log('------------------------------');
  
  // プロフィール取得テスト
  await testGetProfileEndpoint(loginToken);
  console.log('------------------------------');
  
  // 登録テスト
  const registerToken = await testRegisterEndpoint();
  console.log('------------------------------');
  
  console.log('API認証エンドポイントテスト完了');
}

// テスト実行
runTests().catch(error => {
  console.error('テスト実行エラー:', error);
});