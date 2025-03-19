const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const helmet = require('helmet');
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const chatRoutes = require('./routes/chatRoutes');
require('dotenv').config();

/**
 * API サーバーメインファイル
 * 
 * 変更履歴:
 * - 2025/03/19: 初期実装 (Geniemon)
 * - 2025/03/19: テスト用にMongoDBモックを追加
 */

// Express アプリケーション作成
const app = express();

// ミドルウェア設定
app.use(helmet()); // セキュリティヘッダー
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true, // クッキーをクロスオリジンリクエストで許可
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json()); // JSONパーサー
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Cookieパーサー

// リクエストロギング
app.use(morgan('dev'));

// APIバージョンとパス設定
const API_VERSION = process.env.API_VERSION || 'v1';
const API_BASE_PATH = `/api/${API_VERSION}`;

// ルート設定
app.use(`${API_BASE_PATH}/auth`, authRoutes);
app.use(`${API_BASE_PATH}/projects`, projectRoutes);
app.use(`${API_BASE_PATH}/tasks`, taskRoutes);
app.use(`${API_BASE_PATH}/chat`, chatRoutes);

// ヘルスチェックエンドポイント
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ルートエンドポイント
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'プランナビ API サーバー',
    version: API_VERSION,
    documentation: '/api-docs'
  });
});

// エラーハンドリングミドルウェア
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'サーバーエラーが発生しました',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404ハンドラー
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'APIエンドポイントが見つかりません'
  });
});

// MongoDB接続設定
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/plannavi';
    await mongoose.connect(mongoURI);
    console.log('MongoDB接続成功');
  } catch (error) {
    console.error('MongoDB接続エラー:', error);
    // 本番環境では接続失敗時にプロセスを終了
    if (process.env.NODE_ENV === 'production') {
      console.error('MongoDB接続に失敗したため、サーバーを終了します');
      process.exit(1);
    }
  }
};

// サーバー起動機能
const PORT = process.env.API_PORT || 5000;

// サーバー起動関数
const startServer = () => {
  // サーバーを直接起動する
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`サーバー起動: ポート ${PORT}`);
      console.log(`API エンドポイント: ${API_BASE_PATH}`);
      console.log(`環境: ${process.env.NODE_ENV || 'development'}`);
    });
  });
};

// サーバー起動処理の実行
startServer();

// グレースフルシャットダウン処理
process.on('SIGINT', async () => {
  console.log('サーバーシャットダウン中...');
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
    console.log('MongoDB接続を閉じました');
  }
  process.exit(0);
});