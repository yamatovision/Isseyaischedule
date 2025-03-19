const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// MongoDB接続
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/schedle';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB接続成功'))
  .catch(err => {
    console.error('MongoDB接続エラー:', err);
    process.exit(1);
  });

// Userモデルを読み込む
const User = require('./api/models/User');

async function createAdminUser() {
  try {
    // すでに存在するかチェック
    const existingUser = await User.findOne({ email: 'lisence@mikoto.co.jp' });
    
    if (existingUser) {
      console.log('ユーザーはすでに存在します。情報を更新します...');
      existingUser.password = 'Mikoto@123';
      existingUser.role = 'admin';
      await existingUser.save();
      console.log('管理者ユーザー情報を更新しました:', existingUser.email);
    } else {
      // 新規ユーザー作成
      const newUser = new User({
        email: 'lisence@mikoto.co.jp',
        password: 'Mikoto@123',
        name: 'Mikoto Admin',
        role: 'admin'
      });
      
      await newUser.save();
      console.log('新規管理者ユーザーを作成しました:', newUser.email);
    }
    
    console.log('処理が完了しました');
  } catch (error) {
    console.error('エラーが発生しました:', error);
  } finally {
    // 接続を閉じる
    mongoose.connection.close();
    console.log('MongoDB接続を閉じました');
  }
}

createAdminUser();