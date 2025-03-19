/**
 * MongoDB Atlasのコレクション一覧表示スクリプト
 */

const mongoose = require('mongoose');
const colors = require('colors');
require('dotenv').config();

// MongoDB Atlas接続情報
const mongoUri = 'mongodb+srv://blackmonster0313:isseymonster0313@cluster0.fj8ph.mongodb.net/plannavi?retryWrites=true&w=majority&appName=Cluster0';

async function listCollections() {
  try {
    console.log(`${colors.cyan('MongoDB接続中:')} ${mongoUri}`);
    
    // データベースに接続
    await mongoose.connect(mongoUri);
    console.log(`${colors.green('接続成功!')}`);
    
    // コレクション一覧を取得
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    console.log(`${colors.yellow('データベース内のコレクション一覧:')}`);
    
    if (collections.length === 0) {
      console.log(`- ${colors.gray('コレクションがありません')}`);
    } else {
      collections.forEach((collection, index) => {
        console.log(`${index + 1}. ${colors.cyan(collection.name)} (${collection.type})`);
      });
    }
    
    console.log(`\n${colors.yellow('アプリケーションの主要コレクション概要:')}`);
    console.log(`- ${colors.cyan('users')}: ユーザー情報（認証、ロール、プロフィール）`);
    console.log(`- ${colors.cyan('projects')}: プロジェクト情報（タイトル、説明、日程など）`);
    console.log(`- ${colors.cyan('tasks')}: タスク情報（タイトル、担当者、期限、ステータスなど）`);
    console.log(`- ${colors.cyan('invitations')}: プロジェクト招待情報（招待メール、有効期限など）`);
    console.log(`- ${colors.cyan('chathistories')}: AIチャット履歴（メッセージ、タイムスタンプなど）`);
    
    // 各コレクションのドキュメント数を表示
    console.log(`\n${colors.yellow('各コレクションのドキュメント数:')}`);
    for (const collection of collections) {
      const count = await mongoose.connection.db.collection(collection.name).countDocuments();
      console.log(`- ${colors.cyan(collection.name)}: ${count}件`);
    }
    
    // 接続を閉じる
    await mongoose.connection.close();
    console.log(`${colors.gray('データベース接続を閉じました')}`);
    
  } catch (error) {
    console.error(`${colors.red('エラー:')} ${error.message}`);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
}

// スクリプト実行
listCollections();