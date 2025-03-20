import React, { useContext } from 'react';
import { ThemeContext } from '../../contexts/ThemeContext';

/**
 * 読み込み中のスピナーアニメーションコンポーネント
 * 
 * APIリクエストやページ遷移の読み込み中表示に使用される共通コンポーネント。
 * サイズ、色、オーバーレイオプションなどの設定が可能。
 * @param {Object} props
 * @param {string} props.size - スピナーのサイズ ('sm', 'md', 'lg')
 * @param {string} props.color - スピナーの色
 * @param {boolean} props.overlay - オーバーレイを表示するかどうか
 * @param {string} props.message - スピナーと共に表示するメッセージ
 */
const LoadingSpinner = ({ 
  size = 'md', 
  color, 
  overlay = false, 
  message = '読み込み中...' 
}) => {
  // テーマコンテキストを利用
  const { isDarkMode } = useContext(ThemeContext);
  
  // テーマに基づくデフォルトカラー
  const defaultColor = isDarkMode ? '#4299E1' : '#2B6CB0';
  const spinnerColor = color || defaultColor;
  
  // サイズに応じたクラス名
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };
  
  // スピナーのサイズクラス
  const spinnerSizeClass = sizeClasses[size] || sizeClasses.md;
  
  // SVGアニメーションのため、レンダリング時に新しいキーを生成
  const renderKey = Math.random().toString(36).substring(7);
  
  // スピナーが表示されるべきコンテナのクラス名
  const containerClass = overlay
    ? 'fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 z-50'
    : 'flex flex-col items-center justify-center';
    
  // メッセージのテキストカラー
  const textColorClass = overlay
    ? 'text-white'
    : isDarkMode
      ? 'text-gray-200'
      : 'text-gray-800';
  
  return (
    <div className={containerClass}>
      <svg
        key={renderKey}
        className={`${spinnerSizeClass} animate-spin`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        data-testid="loading-spinner"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke={spinnerColor}
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill={spinnerColor}
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      
      {message && (
        <div className={`mt-3 text-sm font-medium ${textColorClass}`}>
          {message}
        </div>
      )}
    </div>
  );
};

/**
 * フルスクリーンローディングインジケータ
 * 
 * ページ全体をカバーするローディングオーバーレイ。
 * メッセージのカスタマイズが可能。
 * @param {Object} props
 * @param {string} props.message - 表示するメッセージ
 */
export const FullPageLoader = ({ message = '読み込み中...' }) => (
  <LoadingSpinner size="lg" overlay={true} message={message} />
);

/**
 * ボタン内に表示するローディングスピナー
 * 
 * 送信ボタンなどでクリック後の処理中表示に使用。
 */
export const ButtonSpinner = ({ color }) => (
  <LoadingSpinner size="sm" color={color} message={null} />
);

/**
 * コンテンツ読み込み中に表示するプレースホルダー
 * 
 * APIからデータを取得中などに表示する簡易版。
 */
export const ContentLoader = ({ message = 'データを読み込み中...' }) => (
  <div className="py-10">
    <LoadingSpinner size="md" message={message} />
  </div>
);

export default LoadingSpinner;