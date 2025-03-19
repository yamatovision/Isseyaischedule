const { spawn } = require('child_process');
const colors = require('colors');
const path = require('path');
const waitOn = require('wait-on');
require('dotenv').config();

/**
 * バックエンドとフロントエンドを同時に起動し、
 * 両方の準備ができたら繋ぎ込みテストを実行するスクリプト
 */

// 環境変数 - ポート番号を既存サーバーと競合しないように設定
const FRONTEND_PORT = process.env.PORT || 3001; // 3000から変更
const BACKEND_PORT = process.env.API_PORT || 5001; // 5000から変更
const FRONTEND_URL = `http://localhost:${FRONTEND_PORT}`;
const BACKEND_URL = `http://localhost:${BACKEND_PORT}`;

// 子プロセスの参照を保持
let frontendProcess = null;
let backendProcess = null;

// プロセスの出力を色付きで表示
function printProcessOutput(name, data, isError = false) {
  const color = name === 'frontend' ? 'blue' : 'green';
  const prefix = `[${name.toUpperCase()}]`[color];
  
  const text = data.toString().trim();
  if (!text) return;
  
  text.split('\n').forEach(line => {
    if (isError) {
      console.error(`${prefix} ${line.red}`);
    } else {
      console.log(`${prefix} ${line}`);
    }
  });
}

// フロントエンドを起動
function startFrontend() {
  console.log('フロントエンドを起動しています...'.blue);
  
  // React開発サーバー起動
  frontendProcess = spawn('npm', ['start'], {
    cwd: path.resolve(__dirname),
    env: { ...process.env, BROWSER: 'none' }, // ブラウザを自動で開かない
    shell: true
  });
  
  frontendProcess.stdout.on('data', data => printProcessOutput('frontend', data));
  frontendProcess.stderr.on('data', data => printProcessOutput('frontend', data));
  
  frontendProcess.on('error', error => {
    console.error(`フロントエンド起動エラー: ${error.message}`.red);
  });
  
  frontendProcess.on('close', code => {
    console.log(`フロントエンドプロセスが終了しました。終了コード: ${code}`.blue);
  });
}

// バックエンドを起動
function startBackend() {
  console.log('バックエンドを起動しています...'.green);
  
  // Expressサーバー起動
  backendProcess = spawn('npm', ['run', 'dev:server'], {
    cwd: path.resolve(__dirname),
    shell: true
  });
  
  backendProcess.stdout.on('data', data => printProcessOutput('backend', data));
  backendProcess.stderr.on('data', data => printProcessOutput('backend', data));
  
  backendProcess.on('error', error => {
    console.error(`バックエンド起動エラー: ${error.message}`.red);
  });
  
  backendProcess.on('close', code => {
    console.log(`バックエンドプロセスが終了しました。終了コード: ${code}`.green);
  });
}

// 繋ぎ込みテストを実行
function startIntegrationTest() {
  console.log('\n両サーバーの準備が完了しました。繋ぎ込みテストを開始します...'.yellow);
  
  const testProcess = spawn('node', ['test-integration.js'], {
    cwd: path.resolve(__dirname),
    shell: true,
    stdio: 'inherit'
  });
  
  testProcess.on('error', error => {
    console.error(`繋ぎ込みテスト実行エラー: ${error.message}`.red);
  });
  
  testProcess.on('close', code => {
    console.log(`\n繋ぎ込みテストが完了しました。終了コード: ${code}`.yellow);
    cleanup();
  });
}

// プロセスを終了
function cleanup() {
  console.log('\nプロセスをクリーンアップしています...'.cyan);
  
  if (frontendProcess) {
    frontendProcess.kill();
  }
  
  if (backendProcess) {
    backendProcess.kill();
  }
  
  console.log('すべてのプロセスをクリーンアップしました。'.cyan);
}

// メイン実行関数
async function run() {
  console.log('=== フロントエンド・バックエンド繋ぎ込みテスト環境起動 ==='.cyan);
  
  // Ctrl+Cで終了時の処理
  process.on('SIGINT', () => {
    console.log('\n中断シグナルを受信しました。プロセスを終了します...'.yellow);
    cleanup();
    process.exit(0);
  });
  
  // サーバー起動
  startBackend();
  startFrontend();
  
  // 両方のサーバーが起動するのを待つ
  try {
    console.log(`\nフロントエンドとバックエンドの準備ができるまで待機しています...`.cyan);
    console.log(`フロントエンドURL: ${FRONTEND_URL}`.blue);
    console.log(`バックエンドURL: ${BACKEND_URL}/health`.green);
    
    // ヘルスチェックエンドポイントと/loginページの両方が利用可能になるまで待機
    await waitOn({
      resources: [
        `${BACKEND_URL}/health`,
        `${FRONTEND_URL}/login`
      ],
      timeout: 60000, // 60秒
      interval: 1000,
      validateStatus: status => status !== 404,
    });
    
    // サーバーの準備ができてから少し待機
    console.log('\nサーバーの準備ができました。少々お待ちください...'.cyan);
    // 十分な時間を確保するためにタイムアウトを長くする
    setTimeout(startIntegrationTest, 5000);
  } catch (error) {
    console.error(`サーバー起動待機中にエラーが発生しました: ${error.message}`.red);
    cleanup();
    process.exit(1);
  }
}

// 実行
run();