// フロントエンドのビルド用設定ファイル（Vercelデプロイ用）
module.exports = {
  webpack: {
    configure: {
      resolve: {
        extensions: ['.js', '.jsx', '.json'],
        modules: ['node_modules', 'src']
      }
    }
  },
  babel: {
    plugins: [
      process.env.NODE_ENV === 'development' && ['react-refresh/babel']
    ].filter(Boolean)
  }
};