const { MongoClient } = require('mongodb');

// 環境変数から接続文字列を取得
// 実際の接続文字列は.envファイルに保存し、gitignoreで除外すること
const uri = process.env.MONGODB_URI || 'your_mongodb_connection_string'; // 本番環境では必ず環境変数から読み込む

async function testConnection() {
  const client = new MongoClient(uri);
  
  try {
    // MongoDBに接続
    await client.connect();
    console.log('MongoDB Atlas接続成功！');
    
    // データベースのリストを取得
    const databasesList = await client.db().admin().listDatabases();
    console.log('データベース一覧:');
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
    
  } catch (e) {
    console.error('MongoDB接続エラー:', e);
  } finally {
    // 接続を閉じる
    await client.close();
    console.log('MongoDB接続を閉じました');
  }
}

testConnection().catch(console.error);