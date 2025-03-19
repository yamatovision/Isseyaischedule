/**
 * Jest-�ա��
 * 
 * �������ƹ�(n-�
 */

module.exports = {
  // ƹȰ�
  testEnvironment: 'jsdom',
  
  // ƹ�ա��"ѿ��
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*-test.js'
  ],
  
  // ���ø-�
  collectCoverage: true,
  coverageDirectory: 'test-results/coverage',
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  
  // �����z
  moduleNameMapper: {
    // CSS����n�ï
    '\\.(css|less|scss|sass)$': '<rootDir>/tests/qa/mocks/styleMock.js',
    // ;��ա��n�ï
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 
      '<rootDir>/tests/qa/mocks/fileMock.js',
    // ѹn��ꢹ
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  
  // ƹ�Mk�LY���Ȣ��ա��
  setupFilesAfterEnv: [
    '<rootDir>/tests/qa/setup.js'
  ],
  
  // 	�-�
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  
  // ���թ���!�Y�ա��ѿ��
  transformIgnorePatterns: [
    '/node_modules/(?!(@material-ui|material-ui|react-router|chart.js))'
  ],
  
  // ��ա���-�
  maxWorkers: '50%',
  
  // ƹȿ�ࢦ�
  testTimeout: 30000,
  
  // Jestn�L-k��U���wj�1��6
  verbose: true
};