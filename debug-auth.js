/**
 * 認証デバッグスクリプト
 * 
 * ユーザー認証の問題を診断するためのスクリプトです
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();
const User = require('./api/models/User');

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

// 認証テスト
const testAuthentication = async () => {
  try {
    // テストユーザーを取得
    const email = 'test@example.com';
    const password = 'Password123';
    
    console.log(`ユーザー認証テスト: ${email}`);
    
    const user = await User.findOne({ email });
    if (!user) {
      console.error('ユーザーが見つかりません');
      return;
    }
    
    console.log('ユーザー情報:');
    console.log(`- ID: ${user._id}`);
    console.log(`- Email: ${user.email}`);
    console.log(`- Name: ${user.name}`);
    console.log(`- Role: ${user.role}`);
    console.log(`- パスワードハッシュ: ${user.password}`);
    
    // 手動でパスワード検証を実行
    console.log('\nパスワード検証テスト:');
    console.log(`- 入力パスワード: ${password}`);
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log(`- パスワード検証結果: ${isPasswordValid}`);
    
    // ユーザーモデルのメソッドでパスワード検証
    const isModelPasswordValid = await user.comparePassword(password);
    console.log(`- モデルメソッドによるパスワード検証結果: ${isModelPasswordValid}`);
    
    // テスト用に新しいパスワードをハッシュ化
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(password, salt);
    console.log(`- 新しいハッシュ: ${newHash}`);
    
    // 新しいハッシュと元のパスワードを検証
    const isNewHashValid = await bcrypt.compare(password, newHash);
    console.log(`- 新しいハッシュとの検証結果: ${isNewHashValid}`);
    
    return { user, isPasswordValid, isModelPasswordValid };
  } catch (error) {
    console.error('認証テストエラー:', error);
  }
};

// ユーザーパスワード更新
const updateUserPassword = async (userId, newPassword) => {
  try {
    // ユーザーを取得
    const user = await User.findById(userId);
    if (!user) {
      console.error('ユーザーが見つかりません');
      return false;
    }
    
    // パスワードをハッシュ化
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // パスワードを更新
    user.password = hashedPassword;
    await user.save();
    
    console.log(`パスワードを更新しました: ${user.email}`);
    return true;
  } catch (error) {
    console.error('パスワード更新エラー:', error);
    return false;
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

  // ユーザー認証テスト
  const authResult = await testAuthentication();
  
  // パスワード検証に失敗した場合、パスワードを更新する
  if (authResult && !authResult.isPasswordValid) {
    console.log('\nパスワード検証に失敗しました。パスワードを更新します...');
    const updated = await updateUserPassword(authResult.user._id, 'Password123');
    
    if (updated) {
      console.log('パスワードを更新しました。再度認証をテストします...');
      await testAuthentication();
    }
  }

  // 接続を閉じる
  await mongoose.connection.close();
  console.log('MongoDB接続を閉じました');
};

// スクリプト実行
main();