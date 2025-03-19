/**
 * MongoDB Atlas接続テスト
 * 本番環境のMongoDB Atlasへの接続をテストするスクリプト
 */

const mongoose = require('mongoose');
const colors = require('colors');
require('dotenv').config();

// MongoDB Atlas接続情報 - 直接指定して確実にテスト
const mongoUri = 'mongodb+srv://blackmonster0313:isseymonster0313@cluster0.fj8ph.mongodb.net/plannavi?retryWrites=true&w=majority&appName=Cluster0';

console.log(`${colors.cyan('接続テスト:')} ${mongoUri}`);

async function testConnection() {
  try {
    await mongoose.connect(mongoUri);
    
    console.log(`${colors.green('接続成功!')} MongoDB Atlas クラスターに接続できました`);
    
    // 接続できたデータベースの情報を表示
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`${colors.yellow('データベース内のコレクション:')}`);
    
    if (collections.length === 0) {
      console.log(`- ${colors.gray('コレクションがありません（新しいデータベース）')}`);
    } else {
      collections.forEach(col => {
        console.log(`- ${col.name}`);
      });
    }
    
    // タスクとプロジェクトのコレクションを作成（存在しない場合）
    try {
      // テスト用のスキーマ定義
      const TaskSchema = new mongoose.Schema({
        title: String,
        description: String,
        projectId: mongoose.Schema.Types.ObjectId,
        project: mongoose.Schema.Types.ObjectId,
        startDate: Date,
        dueDate: Date,
        status: String,
        createdBy: mongoose.Schema.Types.ObjectId,
        createdAt: { type: Date, default: Date.now }
      });
      
      const ProjectSchema = new mongoose.Schema({
        title: String,
        description: String,
        startDate: Date,
        endDate: Date,
        owner: mongoose.Schema.Types.ObjectId,
        status: String,
        createdAt: { type: Date, default: Date.now }
      });
      
      // モデル定義（コレクションがない場合は作成される）
      const Task = mongoose.model('Task', TaskSchema);
      const Project = mongoose.model('Project', ProjectSchema);
      
      // サンプルプロジェクトの作成
      const testProject = new Project({
        title: 'テストプロジェクト',
        description: 'MongoDB Atlas接続テスト用のプロジェクト',
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        owner: new mongoose.Types.ObjectId(),
        status: 'planning'
      });
      
      // プロジェクトを保存
      const savedProject = await testProject.save();
      console.log(`${colors.green('テストプロジェクトを作成しました:')} ${savedProject._id}`);
      
      // サンプルタスクの作成
      const testTask = new Task({
        title: 'テストタスク',
        description: 'MongoDB Atlas接続テスト用のタスク',
        projectId: savedProject._id,
        project: savedProject._id,
        startDate: new Date(),
        dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
        status: 'not_started',
        createdBy: new mongoose.Types.ObjectId()
      });
      
      // タスクを保存
      const savedTask = await testTask.save();
      console.log(`${colors.green('テストタスクを作成しました:')} ${savedTask._id}`);
      
      // 作成したデータを確認
      const tasks = await Task.find({ projectId: savedProject._id });
      console.log(`${colors.yellow('作成したプロジェクトのタスク数:')} ${tasks.length}`);
      
      // 更新後のコレクション一覧を表示
      const updatedCollections = await mongoose.connection.db.listCollections().toArray();
      console.log(`${colors.yellow('更新後のコレクション:')}`);
      updatedCollections.forEach(col => {
        console.log(`- ${col.name}`);
      });
      
    } catch (error) {
      console.error(`${colors.red('テストデータ作成エラー:')} ${error.message}`);
    }
    
    // 接続を閉じる
    await mongoose.connection.close();
    console.log(`${colors.gray('データベース接続を閉じました')}`);
    return true;
    
  } catch (error) {
    console.error(`${colors.red('接続失敗:')} ${error.message}`);
    return false;
  }
}

// テスト実行
async function runTest() {
  console.log('===== MongoDB Atlas 接続テスト開始 =====');
  
  const connected = await testConnection();
  
  if (connected) {
    console.log(`\n${colors.green('成功:')} MongoDB Atlas に接続できました。データベースは正常に機能しています。`);
  } else {
    console.log(`\n${colors.red('接続に失敗しました')} .env ファイルの MONGODB_URI 設定を確認してください。`);
  }
  
  console.log('\n===== テスト完了 =====');
}

// テスト実行
runTest();