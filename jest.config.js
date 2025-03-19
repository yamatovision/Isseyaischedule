/**
 * Jest-šÕ¡¤ë
 * 
 * ³óİüÍóÈÆ¹È(n-š
 */

module.exports = {
  // Æ¹È°ƒ
  testEnvironment: 'jsdom',
  
  // Æ¹ÈÕ¡¤ë"Ñ¿üó
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*-test.js'
  ],
  
  // «ĞìÃ¸-š
  collectCoverage: true,
  coverageDirectory: 'test-results/coverage',
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  
  // â¸åüëãz
  moduleNameMapper: {
    // CSSâ¸åüënâÃ¯
    '\\.(css|less|scss|sass)$': '<rootDir>/tests/qa/mocks/styleMock.js',
    // ;ÏûÕ¡¤ënâÃ¯
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 
      '<rootDir>/tests/qa/mocks/fileMock.js',
    // Ñ¹n¨¤ê¢¹
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  
  // Æ¹ÈMkŸLY‹»ÃÈ¢Ã×Õ¡¤ë
  setupFilesAfterEnv: [
    '<rootDir>/tests/qa/setup.js'
  ],
  
  // 	Û-š
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  
  // Èéó¹Õ©üà’!–Y‹Õ¡¤ëÑ¿üó
  transformIgnorePatterns: [
    '/node_modules/(?!(@material-ui|material-ui|react-router|chart.js))'
  ],
  
  // ĞÃÕ¡µ¤º-š
  maxWorkers: '50%',
  
  // Æ¹È¿¤à¢¦È
  testTimeout: 30000,
  
  // JestnŸL-kú›UŒ‹—wjÅ1’‘6
  verbose: true
};