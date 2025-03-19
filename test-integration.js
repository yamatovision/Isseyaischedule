const puppeteer = require('puppeteer');
const colors = require('colors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

/**
 * フロントエンド・バックエンド繋ぎ込みテストスクリプト
 * 実際のブラウザを使って認証フローが正しく動作するかをテスト
 */

// 環境変数の設定
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';
const API_URL = process.env.API_URL || 'http://localhost:5001/api/v1';
const SCREENSHOTS_DIR = path.join(__dirname, 'test-results', 'screenshots');

// テスト結果
const testResults = [];

// スクリーンショットディレクトリの作成
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

// テスト結果をコンソールに出力する関数
const logResult = (testName, success, message, details = null) => {
  const result = {
    test: testName,
    success,
    message,
    timestamp: new Date().toISOString(),
    details: details || null
  };
  
  testResults.push(result);
  
  const statusText = success ? 'PASS'.green : 'FAIL'.red;
  console.log(`[${statusText}] ${testName}: ${message}`);
  if (details) {
    console.log(JSON.stringify(details, null, 2));
  }
  console.log('-----------------------------------');
};

// スクリーンショットを撮る関数
const takeScreenshot = async (page, name) => {
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const filename = `${name}-${timestamp}.png`;
  const filePath = path.join(SCREENSHOTS_DIR, filename);
  
  await page.screenshot({ path: filePath, fullPage: true });
  console.log(`📸 スクリーンショット保存: ${filename}`.cyan);
  
  return filename;
};

// 招待コードを取得する関数
async function getInvitationCode() {
  try {
    // 管理者ユーザーでログイン
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@example.com', // 管理者ユーザーのメールアドレス
      password: 'adminPassword123' // 管理者ユーザーのパスワード
    });
    
    if (!loginResponse.data.success || !loginResponse.data.token) {
      console.log('管理者ログインに失敗しました。デフォルトの招待コードを使用します。'.yellow);
      return 'DEMO-2025';
    }
    
    // 招待コード生成
    const inviteResponse = await axios.post(`${API_URL}/auth/create-invitation`, 
      {
        expiresInDays: 7,
        role: 'user',
        maxUses: 1
      },
      {
        headers: {
          'Authorization': `Bearer ${loginResponse.data.token}`
        }
      }
    );
    
    if (inviteResponse.data.success && inviteResponse.data.code) {
      console.log(`招待コードを生成しました: ${inviteResponse.data.code}`.green);
      return inviteResponse.data.code;
    } else {
      console.log('招待コード生成に失敗しました。デフォルトの招待コードを使用します。'.yellow);
      return 'DEMO-2025';
    }
  } catch (error) {
    console.log('招待コード取得中にエラーが発生しました。デフォルトの招待コードを使用します。'.yellow);
    console.error(error.message);
    return 'DEMO-2025';
  }
}

// 登録フローのテスト
async function testRegistrationFlow(page, invitationCode) {
  console.log('新規ユーザー登録フローのテスト...'.yellow);
  
  try {
    // ランダムなメールアドレスを生成
    const randomEmail = `test${Math.floor(Math.random() * 1000000)}@example.com`;
    const password = 'TestPassword123';
    
    // ログインページにアクセス
    await page.goto(`${FRONTEND_URL}/login`);
    await page.waitForSelector('body', { timeout: 5000 });
    await takeScreenshot(page, 'login-page');
    
    // 新規登録タブまたはリンクをクリック
    const registerLinkSelector = '.login-toggle-button';
    await page.waitForSelector(registerLinkSelector, { timeout: 5000 });
    await page.click(registerLinkSelector);
    
    // 少し待機してフォームが切り替わるのを待つ
    await new Promise(resolve => setTimeout(resolve, 1000));
    await takeScreenshot(page, 'register-form');
    
    // 登録フォームに入力
    await page.waitForSelector('input[name="email"]', { timeout: 5000 });
    await page.type('input[name="email"]', randomEmail);
    await page.type('input[name="password"]', password);
    await page.type('input[name="invitationCode"]', invitationCode);
    
    // フォーム送信後のスクリーンショット
    await takeScreenshot(page, 'register-form-filled');
    
    // 登録ボタンをクリック
    const registerButtonSelector = 'button[type="submit"]';
    await page.waitForSelector(registerButtonSelector, { timeout: 5000 });
    await page.click(registerButtonSelector);
    
    // 登録処理中はローディングが表示されるはず
    await page.waitForTimeout(2000);
    
    // ダッシュボード画面にリダイレクトされるか、成功メッセージが表示されるのを待つ
    try {
      // ダッシュボードへのリダイレクトか成功メッセージのどちらかを待つ
      await Promise.race([
        page.waitForNavigation({ timeout: 5000 }),
        page.waitForSelector('.MuiAlert-standardSuccess, .success-message', { timeout: 5000 })
      ]);
      
      const currentUrl = page.url();
      await takeScreenshot(page, 'after-register');
      
      if (currentUrl.includes('/dashboard')) {
        logResult('新規ユーザー登録', true, 'ユーザー登録が成功し、ダッシュボードにリダイレクトされました', {
          email: randomEmail,
          redirectUrl: currentUrl
        });
      } else {
        // ページ上に成功メッセージがあるか確認
        const successMessage = await page.evaluate(() => {
          const element = document.querySelector('.MuiAlert-standardSuccess, .success-message');
          return element ? element.textContent : null;
        });
        
        if (successMessage) {
          logResult('新規ユーザー登録', true, '登録成功メッセージが表示されました', {
            email: randomEmail, 
            message: successMessage
          });
        } else {
          logResult('新規ユーザー登録', false, 'ダッシュボードへのリダイレクトがなく、成功メッセージも確認できませんでした');
        }
      }
    } catch (error) {
      // エラーメッセージを確認
      const errorMessage = await page.evaluate(() => {
        const element = document.querySelector('.MuiAlert-standardError, .error-message');
        return element ? element.textContent : null;
      });
      
      await takeScreenshot(page, 'register-error');
      
      if (errorMessage) {
        logResult('新規ユーザー登録', false, `登録エラーメッセージ: ${errorMessage}`, {
          email: randomEmail
        });
      } else {
        logResult('新規ユーザー登録', false, 'リダイレクトやメッセージの検出に失敗しました', {
          error: error.message
        });
      }
    }
    
    return { email: randomEmail, password };
  } catch (error) {
    await takeScreenshot(page, 'register-exception');
    logResult('新規ユーザー登録', false, `例外が発生しました: ${error.message}`);
    return null;
  }
}

// ログインフローのテスト
async function testLoginFlow(page, email, password) {
  console.log('ログインフローのテスト...'.yellow);
  
  try {
    // メールとパスワードが指定されていない場合はデフォルト値を使用
    email = email || 'test@example.com';
    password = password || 'Password123';
    
    // ログインページにアクセス
    await page.goto(`${FRONTEND_URL}/login`);
    await page.waitForSelector('body', { timeout: 5000 });
    await takeScreenshot(page, 'login-page-before-login');
    
    // ログインフォームに入力
    await page.waitForSelector('input[name="email"]', { timeout: 5000 });
    await page.type('input[name="email"]', email);
    await page.type('input[name="password"]', password);
    
    // ログイン情報を保存するチェックボックスが存在する場合はチェック
    try {
      await page.waitForSelector('input[name="rememberMe"]', { timeout: 1000 });
      await page.click('input[name="rememberMe"]');
    } catch (e) {
      // チェックボックスが存在しない場合は無視
    }
    
    await takeScreenshot(page, 'login-form-filled');
    
    // ログインボタンをクリック
    const loginButtonSelector = 'button[type="submit"]';
    await page.waitForSelector(loginButtonSelector, { timeout: 5000 });
    await page.click(loginButtonSelector);
    
    // ログイン処理中はローディングが表示されるはず
    // Puppeteer v13 以降では waitForTimeout ではなく setTimeout を使用
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // ダッシュボード画面にリダイレクトされるか、成功メッセージが表示されるのを待つ
    try {
      // ダッシュボードへのリダイレクトか成功メッセージのどちらかを待つ
      await Promise.race([
        page.waitForNavigation({ timeout: 5000 }),
        page.waitForSelector('.MuiAlert-standardSuccess, .success-message', { timeout: 5000 })
      ]);
      
      const currentUrl = page.url();
      await takeScreenshot(page, 'after-login');
      
      if (currentUrl.includes('/dashboard')) {
        logResult('ログイン', true, 'ログインが成功し、ダッシュボードにリダイレクトされました', {
          email,
          redirectUrl: currentUrl
        });
        return true;
      } else {
        // ページ上に成功メッセージがあるか確認
        const successMessage = await page.evaluate(() => {
          const element = document.querySelector('.MuiAlert-standardSuccess, .success-message');
          return element ? element.textContent : null;
        });
        
        if (successMessage) {
          logResult('ログイン', true, 'ログイン成功メッセージが表示されました', {
            email, 
            message: successMessage
          });
          return true;
        } else {
          logResult('ログイン', false, 'ダッシュボードへのリダイレクトがなく、成功メッセージも確認できませんでした');
          return false;
        }
      }
    } catch (error) {
      // エラーメッセージを確認
      const errorMessage = await page.evaluate(() => {
        const element = document.querySelector('.MuiAlert-standardError, .error-message');
        return element ? element.textContent : null;
      });
      
      await takeScreenshot(page, 'login-error');
      
      if (errorMessage) {
        logResult('ログイン', false, `ログインエラーメッセージ: ${errorMessage}`, {
          email
        });
      } else {
        logResult('ログイン', false, 'リダイレクトやメッセージの検出に失敗しました', {
          error: error.message
        });
      }
      return false;
    }
  } catch (error) {
    await takeScreenshot(page, 'login-exception');
    logResult('ログイン', false, `例外が発生しました: ${error.message}`);
    return false;
  }
}

// ログアウトフローのテスト
async function testLogoutFlow(page) {
  console.log('ログアウトフローのテスト...'.yellow);
  
  try {
    // ログアウトボタンを探す
    // ヘッダーまたはサイドバーにあることが多い
    const logoutSelectors = [
      'button:contains("ログアウト")', 
      'a:contains("ログアウト")',
      '.logout-button',
      'button[aria-label="logout"]',
      '.MuiIconButton-root[title="ログアウト"]'
    ];
    
    let logoutButton = null;
    
    for (const selector of logoutSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 1000 });
        logoutButton = selector;
        break;
      } catch (e) {
        // このセレクタでは見つからなかった
      }
    }
    
    if (!logoutButton) {
      await takeScreenshot(page, 'logout-button-not-found');
      logResult('ログアウト', false, 'ログアウトボタンが見つかりませんでした');
      return false;
    }
    
    // スクリーンショットを撮る
    await takeScreenshot(page, 'before-logout');
    
    // ログアウトボタンをクリック
    await page.click(logoutButton);
    
    // ログアウト処理を待つ
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // ログインページにリダイレクトされるのを待つ
    try {
      await Promise.race([
        page.waitForNavigation({ timeout: 5000 }),
        page.waitForSelector('input[name="email"]', { timeout: 5000 })
      ]);
      
      const currentUrl = page.url();
      await takeScreenshot(page, 'after-logout');
      
      if (currentUrl.includes('/login')) {
        logResult('ログアウト', true, 'ログアウトが成功し、ログインページにリダイレクトされました', {
          redirectUrl: currentUrl
        });
        return true;
      } else {
        // ページ上にログインフォームがあるか確認
        const hasLoginForm = await page.evaluate(() => {
          return !!document.querySelector('input[name="email"]');
        });
        
        if (hasLoginForm) {
          logResult('ログアウト', true, 'ログアウトが成功し、ログインフォームが表示されました');
          return true;
        } else {
          logResult('ログアウト', false, 'ログインページへのリダイレクトが確認できませんでした');
          return false;
        }
      }
    } catch (error) {
      await takeScreenshot(page, 'logout-error');
      logResult('ログアウト', false, `ログアウト後のリダイレクト検出に失敗しました: ${error.message}`);
      return false;
    }
  } catch (error) {
    await takeScreenshot(page, 'logout-exception');
    logResult('ログアウト', false, `例外が発生しました: ${error.message}`);
    return false;
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
  const filePath = path.join(resultsDir, `integration-test-${timestamp}.json`);
  
  const resultData = {
    timestamp: new Date().toISOString(),
    frontendUrl: FRONTEND_URL,
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

// メインのテスト実行関数
async function runTests() {
  console.log(`=== フロントエンド-バックエンド繋ぎ込みテスト開始 ===`.cyan);
  console.log(`フロントエンドURL: ${FRONTEND_URL}`.cyan);
  console.log(`バックエンドURL: ${API_URL}`.cyan);
  console.log('========================================='.cyan);
  
  let browser;
  try {
    // 招待コードを取得
    const invitationCode = await getInvitationCode();
    
    // ブラウザを起動
    browser = await puppeteer.launch({
      headless: false, // テストを視覚的に確認するためにheadlessモードをオフに
      args: ['--window-size=1280,800'],
      defaultViewport: { width: 1280, height: 800 }
    });
    
    const page = await browser.newPage();
    
    // 認証フローのテスト
    // 1. 新規ユーザー登録
    const userData = await testRegistrationFlow(page, invitationCode);
    
    // 2. 一度ログアウトする（登録後に自動ログインしている場合）
    await testLogoutFlow(page);
    
    // 3. 登録したユーザーでログイン
    if (userData) {
      await testLoginFlow(page, userData.email, userData.password);
    } else {
      // 登録に失敗した場合は既存ユーザーでログイン
      await testLoginFlow(page);
    }
    
    // 4. ログアウト
    await testLogoutFlow(page);
    
    // テスト結果を保存
    saveTestResults();
    
    console.log('\n=== フロントエンド-バックエンド繋ぎ込みテスト完了 ==='.cyan);
  } catch (error) {
    console.error('テスト実行中にエラーが発生しました:', error);
    saveTestResults();
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// テスト実行
runTests();