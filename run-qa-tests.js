/**
 * 品質管理テスト実行スクリプト
 * 
 * 使用法:
 * $ node run-qa-tests.js [--api] [--component] [--security] [--all]
 * 
 * オプション:
 *   --api        APIテストを実行
 *   --component  コンポーネントテストを実行
 *   --security   セキュリティテストを実行
 *   --all        すべてのテストを実行（デフォルト）
 */

const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

// 環境変数設定
process.env.API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';
process.env.AUTH_TOKEN = process.env.AUTH_TOKEN || 'test-token';
process.env.TEST_PROJECT_ID = process.env.TEST_PROJECT_ID || 'test-project-001';
process.env.TEST_TASK_ID = process.env.TEST_TASK_ID || 'test-task-001';

// 結果保存ディレクトリ
const RESULTS_DIR = path.join(__dirname, 'test-results');
if (!fs.existsSync(RESULTS_DIR)) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

// 実行日時
const RUN_TIMESTAMP = new Date().toISOString().replace(/:/g, '-');

// コマンドライン引数解析
const args = process.argv.slice(2);
const runOptions = {
  api: args.includes('--api') || args.includes('--all') || args.length === 0,
  component: args.includes('--component') || args.includes('--all') || args.length === 0,
  security: args.includes('--security') || args.includes('--all') || args.length === 0
};

/**
 * コマンド実行関数
 */
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      stdio: 'inherit',
      ...options
    });
    
    proc.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`コマンド実行に失敗しました: ${command} ${args.join(' ')} (終了コード: ${code})`));
      }
    });
    
    proc.on('error', err => {
      reject(err);
    });
  });
}

/**
 * APIテスト実行
 */
async function runAPITests() {
  console.log('\n===== APIテスト実行 =====');
  
  try {
    await runCommand('node', ['tests/qa/api-test.js']);
    console.log('✅ APIテスト成功');
    return true;
  } catch (error) {
    console.error('❌ APIテスト失敗:', error.message);
    return false;
  }
}

/**
 * コンポーネントテスト実行
 */
async function runComponentTests() {
  console.log('\n===== コンポーネントテスト実行 =====');
  
  try {
    await runCommand('npx', ['jest', 'tests/qa/component-test.js', '--config', 'jest.config.js']);
    console.log('✅ コンポーネントテスト成功');
    return true;
  } catch (error) {
    console.error('❌ コンポーネントテスト失敗:', error.message);
    return false;
  }
}

/**
 * セキュリティテスト実行
 */
async function runSecurityTests() {
  console.log('\n===== セキュリティテスト実行 =====');
  
  try {
    await runCommand('node', ['tests/qa/security-test.js']);
    console.log('✅ セキュリティテスト成功');
    return true;
  } catch (error) {
    console.error('❌ セキュリティテスト失敗:', error.message);
    return false;
  }
}

/**
 * 全テスト実行
 */
async function runAllTests() {
  console.log('品質管理テスト実行中...');
  console.log(`実行日時: ${new Date().toLocaleString()}`);
  
  const results = {
    api: false,
    component: false,
    security: false
  };
  
  // APIテスト
  if (runOptions.api) {
    results.api = await runAPITests();
  }
  
  // コンポーネントテスト
  if (runOptions.component) {
    results.component = await runComponentTests();
  }
  
  // セキュリティテスト
  if (runOptions.security) {
    results.security = await runSecurityTests();
  }
  
  // 結果集計
  const success = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).filter(key => runOptions[key]).length;
  
  console.log('\n===== テスト結果 =====');
  console.log(`実行: ${total}`);
  console.log(`成功: ${success}`);
  console.log(`失敗: ${total - success}`);
  
  // 詳細結果
  console.log('\n===== 詳細結果 =====');
  Object.entries(results).forEach(([key, value]) => {
    if (runOptions[key]) {
      console.log(`${key}テスト: ${value ? '✅ 成功' : '❌ 失敗'}`);
    }
  });
  
  // 結果保存
  const resultSummary = {
    timestamp: RUN_TIMESTAMP,
    results,
    success,
    total,
    options: runOptions
  };
  
  const resultFile = path.join(RESULTS_DIR, `qa-test-summary-${RUN_TIMESTAMP}.json`);
  fs.writeFileSync(resultFile, JSON.stringify(resultSummary, null, 2));
  
  console.log(`\n結果保存先: ${resultFile}`);
  
  // 失敗がある場合は終了コード1で終了
  if (success < total) {
    process.exit(1);
  }
}

// テスト実行
runAllTests().catch(error => {
  console.error('テスト実行中にエラーが発生しました:', error);
  process.exit(1);
});