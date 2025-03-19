// Jest用のセットアップファイル
import '@testing-library/jest-dom';
import React from 'react';

// グローバルなモック
global.fetch = jest.fn();

// コンソールのクリア
console.clear = jest.fn();

// 環境変数の設定
process.env.REACT_APP_API_URL = 'http://localhost:8000';

// Material-UIのSVGアイコンのモック
jest.mock('@material-ui/icons', () => {
  const icons = {};
  
  // モックアイコンコンポーネントの生成
  const createMockIcon = (name) => {
    const Icon = () => {
      return <span data-testid={`icon-${name}`} />;
    };
    return Icon;
  };
  
  // 一般的なアイコンをモック
  const commonIcons = [
    'Menu', 'Home', 'Dashboard', 'Settings', 'Person',
    'Edit', 'Delete', 'Add', 'Search', 'MoreVert',
    'Today', 'Warning', 'GetApp', 'ZoomIn', 'ZoomOut',
    'FilterList', 'Sort', 'Info'
  ];
  
  commonIcons.forEach(iconName => {
    icons[iconName] = createMockIcon(iconName);
  });
  
  return icons;
});