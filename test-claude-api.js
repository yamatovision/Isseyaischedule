// Claude APIのテスト
const { Anthropic } = require('@anthropic-ai/sdk');

// Claude APIの設定
// 環境変数からAPIキーを読み込む
// 実際のAPIキーは.envファイルに保存し、gitignoreで除外すること
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY || 'YOUR_API_KEY', // 本番環境では必ず環境変数から読み込む
});

async function testClaudeAPI() {
  try {
    console.log('Claude APIに接続テスト中...');
    
    const message = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1000,
      messages: [
        { role: 'user', content: 'スケジュール管理アプリの開発について、簡単なアドバイスをください。' }
      ],
    });
    
    console.log('Claude APIのレスポンス:');
    console.log(message.content[0].text);
    
    return 'テスト成功';
  } catch (error) {
    console.error('Claude API接続エラー:', error);
    throw error;
  }
}

// テスト実行
testClaudeAPI()
  .then(result => console.log(result))
  .catch(error => console.error('テスト失敗:', error));