const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();
const colors = require('colors');

// モデルのインポート
const User = require('./api/models/User');
const Project = require('./api/models/Project');
const Task = require('./api/models/Task');

// MongoDB接続設定
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    console.log(`MongoDB URI: ${mongoURI}`.gray);
    
    await mongoose.connect(mongoURI);
    console.log('MongoDB接続に成功しました'.green);
    return true;
  } catch (error) {
    console.error('MongoDB接続エラー:'.red, error);
    return false;
  }
};

// テストユーザーデータ
const testUsers = [
  {
    email: 'test@example.com',
    password: 'Password123',
    name: 'テストユーザー',
    role: 'user'
  },
  {
    email: 'admin@example.com',
    password: 'Admin123',
    name: '管理者ユーザー',
    role: 'admin'
  }
];

// テストプロジェクトデータ
const createTestProjects = (userId) => [
  {
    title: 'サンプルプロジェクト1',
    description: 'テスト用のプロジェクトです',
    type: 'project',
    startDate: '2025-03-01',
    endDate: '2025-06-30',
    owner: userId,
    status: 'in_progress',
    progress: 35
  },
  {
    title: 'サンプルプロジェクト2',
    description: '別のテスト用プロジェクト',
    type: 'project',
    startDate: '2025-04-01',
    endDate: '2025-07-31',
    owner: userId,
    status: 'planning',
    progress: 10
  }
];

// テストタスクデータ
const createTestTasks = (userId, projectId) => [
  {
    title: 'サンプルタスク1',
    description: 'テスト用のタスクです',
    project: projectId,
    status: 'in_progress',
    priority: 'high',
    dueDate: '2025-03-25',
    createdBy: userId
  },
  {
    title: 'サンプルタスク2',
    description: 'もうひとつのテスト用タスク',
    project: projectId,
    status: 'not_started',
    priority: 'medium',
    dueDate: '2025-04-05',
    createdBy: userId
  },
  {
    title: 'サンプルタスク3',
    description: '完了済みのタスク',
    project: projectId,
    status: 'completed',
    priority: 'low',
    dueDate: '2025-03-15',
    completedDate: new Date().toISOString(),
    createdBy: userId
  }
];

// データ作成処理
const seedData = async () => {
  try {
    // 既存データをクリア（オプション）
    console.log('既存データを削除中...'.yellow);
    await User.deleteMany({ email: { $in: testUsers.map(user => user.email) } });
    console.log('既存のテストユーザーを削除しました'.yellow);

    console.log('テストデータをデータベースに挿入中...'.cyan);

    // ユーザーを挿入
    const createdUsers = [];
    for (const userData of testUsers) {
      // パスワードはモデルのpre-save hookでハッシュ化されるのでそのまま設定
      const user = new User({
        ...userData,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await user.save();
      createdUsers.push(user);
      console.log(`ユーザーを作成しました: ${userData.email}`.green);
    }

    // メインユーザーでプロジェクトとタスクを作成
    const mainUser = createdUsers[0];
    
    // プロジェクトを挿入
    const projectsData = createTestProjects(mainUser._id);
    const createdProjects = [];
    
    for (const projectData of projectsData) {
      const project = new Project({
        ...projectData,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: mainUser._id
      });

      await project.save();
      createdProjects.push(project);
      console.log(`プロジェクトを作成しました: ${projectData.title}`.green);
    }
    
    // タスクを挿入
    const mainProject = createdProjects[0];
    const tasksData = createTestTasks(mainUser._id, mainProject._id);
    
    for (const taskData of tasksData) {
      const task = new Task({
        ...taskData,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await task.save();
      console.log(`タスクを作成しました: ${taskData.title}`.green);
    }

    console.log('\nテストデータの挿入が完了しました！'.green.bold);
    console.log(`テストユーザー: ${testUsers.map(u => u.email).join(', ')}`.cyan);
    console.log(`すべてのユーザーのパスワード: ${testUsers[0].password}`.cyan);
    
    return true;
  } catch (error) {
    console.error('テストデータ挿入中にエラーが発生しました:'.red, error);
    return false;
  }
};

// メイン実行関数
const main = async () => {
  // データベース接続
  const isConnected = await connectDB();
  if (!isConnected) {
    console.error('データベース接続に失敗したため、プロセスを終了します'.red);
    process.exit(1);
  }

  // テストデータ挿入
  const isSeeded = await seedData();
  if (!isSeeded) {
    console.error('テストデータの挿入に失敗しました'.red);
    process.exit(1);
  }

  // 接続を閉じる
  await mongoose.connection.close();
  console.log('MongoDB接続を閉じました'.gray);
  process.exit(0);
};

// スクリプト実行
main();