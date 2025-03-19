/**
 * Anthropic Claude API接続テスト
 * Claude APIに直接リクエストを送信し、レスポンスをチェックします
 */

const axios = require('axios');
require('dotenv').config();

// 直接APIキーを使用 (実運用コードでは環境変数を使用するべき)
const apiKey = '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';

console.log('使用するAPIキー:', apiKey.substring(0, 12) + '...');

// APIリクエスト関数
async function testClaudeAPI() {
  try {
    console.log('Claude APIをテスト中...');
    
    // リクエスト設定
    const requestBody = {
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: 'Hello, Claude. This is a test message.'
        }
      ]
    };
    
    console.log('リクエストURL: https://api.anthropic.com/v1/messages');
    console.log('リクエストボディ:', JSON.stringify(requestBody, null, 2));
    console.log('使用しているヘッダー:');
    console.log('- x-api-key: [非表示]');
    console.log('- anthropic-version: 2023-06-01');
    console.log('- Content-Type: application/json');
    
    // APIリクエスト送信
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      requestBody,
      {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        }
      }
    );
    
    // 成功レスポンス
    console.log('\n=== 成功! ===');
    console.log('ステータスコード:', response.status);
    console.log('レスポンスデータ:', JSON.stringify(response.data, null, 2));
    return true;
    
  } catch (error) {
    // エラーレスポンス
    console.log('\n=== エラー! ===');
    
    if (error.response) {
      // サーバーからのエラーレスポンス
      console.log('ステータスコード:', error.response.status);
      console.log('エラーデータ:', JSON.stringify(error.response.data, null, 2));
      console.log('レスポンスヘッダー:', JSON.stringify(error.response.headers, null, 2));
    } else if (error.request) {
      // リクエストは送信されたがレスポンスがない
      console.log('リクエストは送信されましたが、レスポンスがありませんでした');
      console.log(error.request);
    } else {
      // リクエスト設定時のエラー
      console.log('エラーメッセージ:', error.message);
    }
    
    console.log('\n考えられる問題:');
    console.log('1. APIキーが無効か期限切れである');
    console.log('2. APIキーに対応するアカウントで利用制限に達した');
    console.log('3. リクエスト形式が正しくない');
    console.log('4. APIキーに関連するアカウントで支払い情報に問題がある');
    
    return false;
  }
}

// メイン実行関数
async function main() {
  console.log('=== Claude API テスト ===');
  
  if (!apiKey) {
    console.error('環境変数にAI_API_KEYが設定されていません。');
    process.exit(1);
  }
  
  try {
    const success = await testClaudeAPI();
    if (success) {
      console.log('\nテスト成功: Claude APIに正常に接続できました!');
    } else {
      console.log('\nテスト失敗: Claude APIに接続できませんでした。');
    }
  } catch (e) {
    console.error('予期せぬエラーが発生しました:', e);
  }
}

// スクリプト実行
main();