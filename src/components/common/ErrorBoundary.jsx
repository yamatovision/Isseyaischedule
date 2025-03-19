import React, { Component } from 'react';

/**
 * エラーバウンダリーコンポーネント
 * 
 * 子コンポーネントツリー内で発生した JavaScript エラーをキャッチし、
 * エラーが発生したコンポーネントツリーではなく、
 * フォールバック UI を表示するためのエラーバウンダリコンポーネント。
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  /**
   * エラーをキャッチして状態を更新
   * @param {Error} error - キャッチされたエラー
   */
  static getDerivedStateFromError(error) {
    // エラーが発生したことを状態に反映
    return { hasError: true };
  }

  /**
   * エラー発生時のライフサイクルメソッド
   * エラー情報を収集し、必要に応じてエラーレポートを送信
   * @param {Error} error - キャッチされたエラー
   * @param {Object} errorInfo - エラー発生時のコンポーネントスタック情報
   */
  componentDidCatch(error, errorInfo) {
    // エラー情報を設定
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // エラーロギング
    console.error('エラーバウンダリーがエラーをキャッチしました:', error, errorInfo);
    
    // ここでエラー追跡サービスにレポートを送信することも可能
    // 例: reportErrorToService(error, errorInfo);
  }

  /**
   * エラー状態をリセットし、コンポーネントを再レンダリング
   */
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  }

  render() {
    // エラーが発生した場合はフォールバックUIを表示
    if (this.state.hasError) {
      // カスタムフォールバックUIがある場合はそれを使用
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // デフォルトのエラーメッセージ
      return (
        <div className="error-boundary p-6 rounded-lg bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-200 m-4 shadow-md">
          <h2 className="text-xl font-bold mb-4">エラーが発生しました</h2>
          <p className="mb-4">
            申し訳ありませんが、このコンポーネントで予期しないエラーが発生しました。
          </p>
          
          {/* 詳細なエラー情報（開発モードでのみ表示） */}
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded overflow-auto max-h-64">
              <p className="text-red-600 dark:text-red-400 font-bold">エラー: {this.state.error.toString()}</p>
              {this.state.errorInfo && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400">
                    詳細情報
                  </summary>
                  <pre className="mt-2 text-xs overflow-auto p-2 bg-gray-100 dark:bg-gray-900 rounded">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
          )}
          
          {/* リセットボタン */}
          <div className="mt-6">
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              再試行
            </button>
            
            {this.props.showHomeButton !== false && (
              <button
                onClick={() => window.location.href = '/'}
                className="ml-4 px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                ホームに戻る
              </button>
            )}
          </div>
        </div>
      );
    }

    // エラーがない場合は子コンポーネントを通常どおりレンダリング
    return this.props.children;
  }
}

export default ErrorBoundary;