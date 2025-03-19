/**
 * プロジェクトAPIテスト実行スクリプト
 * 
 * このスクリプトは以下の処理を行います：
 * 1. サーバーを起動
 * 2. テストデータをMongoDBに挿入
 * 3. Save as Project 機能テストを実行
 * 4. テスト結果を保存
 * 
 * 使用方法: node run-project-test.js
 */

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const colors = require('colors');

// 実行時に環境変数を設定
process.env.NODE_ENV = 'development';
console.log(`環境: ${process.env.NODE_ENV}`.cyan);

// 結果保存用ディレクトリを作成
const resultDir = path.join(__dirname, 'test-results');
if (!fs.existsSync(resultDir)) {
  fs.mkdirSync(resultDir, { recursive: true });
}

// タイムスタンプ
const timestamp = new Date().toISOString().replace(/:/g, '-');

// ステップ1: テストデータをシードする
console.log('ステップ1: テストデータを MongoDB に挿入中...'.yellow);

const seedProcess = spawn('node', ['seed-test-data.js'], {
  stdio: 'inherit',
  env: { ...process.env }
});

seedProcess.on('close', (seedCode) => {
  if (seedCode !== 0) {
    console.error('テストデータの挿入に失敗しました。プロセスを終了します。'.red);
    process.exit(1);
  }

  console.log('テストデータの挿入が完了しました！'.green);
  
  // ステップ2: サーバーを起動
  console.log('\nステップ2: APIサーバーを起動中...'.yellow);
  
  const serverProcess = spawn('node', ['api/server.js'], {
    stdio: 'pipe', // 'pipe' に変更して出力をキャプチャ
    env: { ...process.env }
  });
  
  let serverOutput = '';
  
  // サーバー出力を収集
  serverProcess.stdout.on('data', (data) => {
    const output = data.toString();
    serverOutput += output;
    process.stdout.write(output);
    
    // サーバーが起動完了したら、テストを実行
    if (output.includes('サーバー起動: ポート')) {
      console.log('\nサーバーが起動しました。テストを実行します...'.green);
      
      // 少し待ってからテストを実行（サーバーが完全に準備できるまで）
      setTimeout(() => {
        // ステップ3: Save as Project 機能テストを実行
        console.log('\nステップ3: Save as Project 機能テストを実行中...'.yellow);
        
        const testProcess = spawn('node', ['test-save-as-project.js'], {
          stdio: 'inherit',
          env: { ...process.env }
        });
        
        testProcess.on('close', (testCode) => {
          console.log(`\nテスト実行が完了しました。結果コード: ${testCode}`.cyan);
          
          // サーバープロセスを終了
          serverProcess.kill();
          
          // 結果のステータスに基づいてメッセージを表示
          if (testCode === 0) {
            console.log('すべてのテストが成功しました！'.green.bold);
          } else {
            console.log('一部のテストが失敗しました。詳細はログを確認してください。'.yellow.bold);
          }
          
          // プロセスを終了
          process.exit(testCode);
        });
      }, 2000); // 2秒待機
    }
  });
  
  serverProcess.stderr.on('data', (data) => {
    process.stderr.write(data.toString());
  });
  
  // エラーハンドリング
  serverProcess.on('error', (error) => {
    console.error('サーバープロセスの起動エラー:'.red, error);
    process.exit(1);
  });
});

// Ctrl+C で中断された場合、子プロセスをクリーンアップ
process.on('SIGINT', () => {
  console.log('\nテストプロセスを中断しています...'.yellow);
  process.exit(2);
});