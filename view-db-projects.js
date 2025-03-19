/**
 * MongoDB内のプロジェクトデータを直接確認するスクリプト
 */

const mongoose = require('mongoose');
require('dotenv').config();
const Project = require('./api/models/Project');
const User = require('./api/models/User');
const Task = require('./api/models/Task');

// MongoDB接続
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/plannavi';
    console.log(`MongoDB URI: ${mongoURI}`);
    
    await mongoose.connect(mongoURI);
    console.log('MongoDB接続に成功しました');
    return true;
  } catch (error) {
    console.error('MongoDB接続エラー:', error);
    return false;
  }
};

// ユーザー取得
const getUsers = async () => {
  try {
    const users = await User.find().select('-password');
    console.log('== ユーザー一覧 ==');
    users.forEach(user => {
      console.log(`ID: ${user._id}`);
      console.log(`Email: ${user.email}`);
      console.log(`Name: ${user.name}`);
      console.log(`Role: ${user.role}`);
      console.log('-----------------');
    });
    return users;
  } catch (error) {
    console.error('ユーザー取得エラー:', error);
    return [];
  }
};

// プロジェクト取得
const getProjects = async () => {
  try {
    const projects = await Project.find();
    console.log('== プロジェクト一覧 ==');
    projects.forEach(project => {
      console.log(`ID: ${project._id}`);
      console.log(`Title: ${project.title}`);
      console.log(`Description: ${project.description}`);
      console.log(`Status: ${project.status}`);
      console.log(`Owner: ${project.owner}`);
      console.log('-----------------');
    });
    return projects;
  } catch (error) {
    console.error('プロジェクト取得エラー:', error);
    return [];
  }
};

// タスク取得
const getTasks = async () => {
  try {
    const tasks = await Task.find();
    console.log('== タスク一覧 ==');
    tasks.forEach(task => {
      console.log(`ID: ${task._id}`);
      console.log(`Title: ${task.title}`);
      console.log(`Project: ${task.project}`);
      console.log(`Status: ${task.status}`);
      console.log(`Due Date: ${task.dueDate}`);
      console.log('-----------------');
    });
    return tasks;
  } catch (error) {
    console.error('タスク取得エラー:', error);
    return [];
  }
};

// メイン実行
const main = async () => {
  // MongoDB接続
  const isConnected = await connectDB();
  if (!isConnected) {
    console.error('データベース接続に失敗しました');
    process.exit(1);
  }

  // データ取得
  const users = await getUsers();
  const projects = await getProjects();
  const tasks = await getTasks();

  // 統計情報
  console.log('\n== 統計情報 ==');
  console.log(`ユーザー数: ${users.length}`);
  console.log(`プロジェクト数: ${projects.length}`);
  console.log(`タスク数: ${tasks.length}`);

  // 接続を閉じる
  await mongoose.connection.close();
  console.log('MongoDB接続を閉じました');
};

// スクリプト実行
main();