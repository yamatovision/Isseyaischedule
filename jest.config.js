/**
 * Jest設定ファイル
 * 
 * テストの実行環境と設定を定義
 */

module.exports = {
  // テスト環境
  testEnvironment: 'jsdom',
  
  // テストファイルパターン
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*-test.js'
  ],
  
  // カバレッジ設定
  collectCoverage: true,
  coverageDirectory: 'test-results/coverage',
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  
  // モジュールマッピング
  moduleNameMapper: {
    // CSSファイルのモック
    '\\.(css|less|scss|sass)$': '<rootDir>/tests/qa/mocks/styleMock.js',
    // 画像ファイルのモック
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 
      '<rootDir>/tests/qa/mocks/fileMock.js',
    // パスエイリアス
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  
  // テスト実行前の準備スクリプト
  setupFilesAfterEnv: [
    '<rootDir>/tests/qa/setup.js'
  ],
  
  // トランスフォーム設定
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  
  // トランスフォーム対象外のパターン
  transformIgnorePatterns: [
    '/node_modules/(?!(@material-ui|material-ui|react-router|chart.js))'
  ],
  
  // ワーカー設定
  maxWorkers: '50%',
  
  // テストタイムアウト
  testTimeout: 30000,
  
  // Jestの詳細なログ出力
  verbose: true
};