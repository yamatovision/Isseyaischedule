import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './assets/css/styles.css'; // すべてのスタイルを1つのファイルにまとめました

/**
 * アプリケーションのエントリーポイント
 * 
 * Reactアプリケーションをルート要素に描画します。
 * 各種スタイルシートやグローバルなリソースもここで読み込みます。
 */

// ブラウザのDOMにアプリケーションをレンダリング
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// サービスワーカーの登録などの設定も将来的にはここに追加