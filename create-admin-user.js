/**
 * 管理者ユーザー作成スクリプト
 * 
 * 一成という名前の管理者ユーザーを登録します
 * メール: blackmonster0313@gmail.com
 * パスワード: isseymonster0313
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const colors = require('colors');
require('dotenv').config();

// MongoDB Atlas接続情報
const mongoUri = 'mongodb+srv://blackmonster0313:isseymonster0313@cluster0.fj8ph.mongodb.net/plannavi?retryWrites=true&w=majority&appName=Cluster0';

// ユーザースキーマ定義
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  profilePicture: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// ユーザー作成関数
async function createAdminUser() {
  try {
    console.log('===== 管理者ユーザー作成開始 =====');
    console.log(`${colors.cyan('接続中:')} ${mongoUri}`);
    
    // データベースに接続
    await mongoose.connect(mongoUri);
    console.log(`${colors.green('接続成功!')}`);
    
    // ユーザーモデル定義
    const User = mongoose.model('User', UserSchema);
    
    // 既存ユーザーの確認
    const existingUser = await User.findOne({ email: 'blackmonster0313@gmail.com' });
    
    if (existingUser) {
      console.log(`${colors.yellow('注意:')} このメールアドレスのユーザーは既に存在します。`);
      console.log(`${colors.yellow('ユーザー情報:')} 名前=${existingUser.name}, ロール=${existingUser.role}`);
      
      // 既存のユーザーを更新する場合
      console.log(`${colors.cyan('既存ユーザーを管理者に更新します...')}`);
      
      existingUser.name = '一成';
      existingUser.role = 'admin';
      
      // パスワードの更新（セキュリティ対策）
      const salt = await bcrypt.genSalt(10);
      existingUser.password = await bcrypt.hash('isseymonster0313', salt);
      
      await existingUser.save();
      console.log(`${colors.green('成功:')} ユーザーを更新しました。`);
      
    } else {
      // 新規ユーザー作成
      console.log(`${colors.cyan('新規管理者ユーザーを作成します...')}`);
      
      // パスワードのハッシュ化
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('isseymonster0313', salt);
      
      const newUser = new User({
        name: '一成',
        email: 'blackmonster0313@gmail.com',
        password: hashedPassword,
        role: 'admin'
      });
      
      await newUser.save();
      console.log(`${colors.green('成功:')} 管理者ユーザーを作成しました。`);
    }
    
    // データベース内のすべてのユーザーを表示
    const allUsers = await User.find({}).select('-password');
    console.log(`${colors.yellow('データベース内のユーザー一覧:')}`);
    
    if (allUsers.length === 0) {
      console.log('- ユーザーは登録されていません');
    } else {
      allUsers.forEach((user, index) => {
        console.log(`${index + 1}. 名前: ${user.name}, メール: ${user.email}, 権限: ${user.role}`);
      });
    }
    
    // 接続を閉じる
    await mongoose.connection.close();
    console.log(`${colors.gray('データベース接続を閉じました')}`);
    
    console.log('\n===== ユーザー作成完了 =====');
    console.log(`${colors.green('管理者ユーザー:')} 一成`);
    console.log(`${colors.green('メールアドレス:')} blackmonster0313@gmail.com`);
    console.log(`${colors.green('パスワード:')} isseymonster0313`);
    
  } catch (error) {
    console.error(`${colors.red('エラー:')} ${error.message}`);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
}

// スクリプト実行
createAdminUser();