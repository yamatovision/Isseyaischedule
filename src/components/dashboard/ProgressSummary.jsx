import React, { useEffect, useRef, useContext } from 'react';
import { ThemeContext } from '../../contexts/ThemeContext';
import Chart from 'chart.js/auto';

/**
 * 進捗サマリーコンポーネント
 * 
 * プロジェクト進捗状況の概要を円グラフで表示します。
 * 完了、進行中、未開始の各タスク数の割合を視覚的に表現します。
 */
const ProgressSummary = ({ stats }) => {
  // テーマコンテキストの利用
  const { isDarkMode } = useContext(ThemeContext);
  
  // Chart.jsのキャンバスへの参照
  const chartRef = useRef(null);
  // Chart.jsのインスタンスへの参照
  const chartInstance = useRef(null);
  
  // 統計情報のデータ処理（デフォルト値を設定）
  const safeStats = stats || {};
  const completed = safeStats.completedTasks || safeStats.completed || 0;
  const inProgress = safeStats.inProgressTasks || safeStats.inProgress || 0;
  const notStarted = safeStats.notStartedTasks || safeStats.notStarted || 0;
  const totalTasks = safeStats.totalTasks || (completed + inProgress + notStarted) || 0;
  
  // テーマに合わせた色の設定
  const chartColors = {
    completed: '#4caf50', // green-500
    inProgress: '#2196f3', // blue-500
    notStarted: isDarkMode ? '#4b5563' : '#e0e0e0', // gray-600 or gray-200
  };
  
  // グラフの初期化と更新
  useEffect(() => {
    if (chartRef.current) {
      // 既存のチャートがあれば破棄
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      
      // 新しいチャートを作成
      const ctx = chartRef.current.getContext('2d');
      chartInstance.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['完了', '進行中', '未着手'],
          datasets: [{
            data: [completed, inProgress, notStarted],
            backgroundColor: [
              chartColors.completed,
              chartColors.inProgress,
              chartColors.notStarted
            ],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%',
          plugins: {
            legend: {
              position: 'right',
              labels: {
                color: isDarkMode ? '#d1d5db' : '#4b5563', // gray-300 or gray-600
                padding: 15,
                font: {
                  size: 12
                }
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.raw || 0;
                  const percentage = totalTasks > 0 ? Math.round((value / totalTasks) * 100) : 0;
                  return `${label}: ${value}件 (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    }
    
    // コンポーネントのアンマウント時にチャートを破棄
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [completed, inProgress, notStarted, totalTasks, isDarkMode]);
  
  return (
    <div className={`dashboard-card ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4`}>
      <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
        全体の進捗状況
      </h3>
      
      <div className="progress-chart-container" style={{ height: '200px' }}>
        <canvas ref={chartRef}></canvas>
      </div>
      
      <div className={`text-center mt-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        全タスク数: {totalTasks} | 完了タスク: {completed}
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4">
        <div className="text-center">
          <div className="text-xl font-semibold text-green-500">{completed}</div>
          <div className="text-xs text-gray-500">完了</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-semibold text-blue-500">{inProgress}</div>
          <div className="text-xs text-gray-500">進行中</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-500">{notStarted}</div>
          <div className="text-xs text-gray-500">未着手</div>
        </div>
      </div>
    </div>
  );
};

export default ProgressSummary;