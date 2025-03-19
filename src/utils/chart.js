/**
 * グラフ描画ユーティリティ
 * 
 * Chart.jsを使用したグラフ描画のヘルパー関数群。
 * プロジェクト全体で一貫したグラフスタイルを提供します。
 */

// テーマカラーの定義
export const CHART_COLORS = {
  primary: '#1976d2',
  secondary: '#dc004e',
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',
  light: '#e0e0e0',
  dark: '#212121',
  completed: '#4caf50',
  inProgress: '#2196f3',
  notStarted: '#e0e0e0',
  delayed: '#f44336',
  atRisk: '#ff9800'
};

// 透過カラーの生成
export const getTransparentColor = (color, alpha = 0.2) => {
  // 既にrgbaの場合
  if (color.startsWith('rgba')) {
    return color.replace(/rgba\((.+),[^,]+\)/, `rgba($1,${alpha})`);
  }
  
  // 16進数カラーコードの場合
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  
  // rgbの場合
  if (color.startsWith('rgb')) {
    return color.replace('rgb', 'rgba').replace(')', `,${alpha})`);
  }
  
  return color;
};

/**
 * 進捗グラフ用の標準設定オブジェクトを生成
 * @param {Array} data - グラフデータ
 * @param {Array} labels - ラベル配列
 * @returns {Object} Chart.js用の設定オブジェクト
 */
export const createProgressChartConfig = (data, labels) => {
  return {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: [
          CHART_COLORS.completed,
          CHART_COLORS.inProgress,
          CHART_COLORS.notStarted,
          CHART_COLORS.delayed
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
          position: 'bottom',
          labels: {
            boxWidth: 12,
            padding: 15
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.formattedValue;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = Math.round((context.raw / total) * 100);
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    }
  };
};

/**
 * ガントチャートの設定オブジェクトを生成
 * @param {Array} tasks - タスク配列
 * @returns {Object} Chart.js用の設定オブジェクト
 */
export const createGanttChartConfig = (tasks) => {
  // タスクを開始日でソート
  const sortedTasks = [...tasks].sort((a, b) => 
    new Date(a.startDate) - new Date(b.startDate)
  );
  
  // ガントチャート用のデータ整形
  const labels = sortedTasks.map(task => task.title);
  const datasets = [
    {
      label: 'タスク期間',
      data: sortedTasks.map(task => {
        const start = new Date(task.startDate);
        const end = new Date(task.endDate);
        const duration = (end - start) / (1000 * 60 * 60 * 24); // 日数に変換
        return duration;
      }),
      barPercentage: 0.5,
      backgroundColor: sortedTasks.map(task => {
        switch(task.status) {
          case 'completed': return CHART_COLORS.completed;
          case 'in-progress': return CHART_COLORS.inProgress;
          case 'not-started': return CHART_COLORS.notStarted;
          case 'delayed': return CHART_COLORS.delayed;
          default: return CHART_COLORS.primary;
        }
      })
    }
  ];
  
  // 日付の最小値と最大値を取得
  const dates = tasks.flatMap(task => [new Date(task.startDate), new Date(task.endDate)]);
  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));
  
  return {
    type: 'horizontalBar', // 横向きの棒グラフ
    data: {
      labels,
      datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y', // Y軸がインデックス（ラベル）
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'day',
            displayFormats: {
              day: 'MM/DD'
            }
          },
          min: minDate,
          max: maxDate
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              const task = sortedTasks[context.dataIndex];
              return [
                `期間: ${task.startDate} ~ ${task.endDate}`,
                `進捗: ${task.progress}%`,
                `状態: ${task.status}`
              ];
            }
          }
        }
      }
    }
  };
};

/**
 * 時系列データ用の標準グラフ設定オブジェクトを生成
 * @param {Array} data - データ配列
 * @param {Array} labels - ラベル配列
 * @param {String} label - データセットのラベル
 * @returns {Object} Chart.js用の設定オブジェクト
 */
export const createTimeSeriesChartConfig = (data, labels, label = 'データ') => {
  return {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label,
        data,
        backgroundColor: getTransparentColor(CHART_COLORS.primary, 0.2),
        borderColor: CHART_COLORS.primary,
        tension: 0.3, // 曲線の滑らかさ
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: true
        }
      }
    }
  };
};

/**
 * 複数系列の比較グラフ設定オブジェクトを生成
 * @param {Array} datasets - データセット配列（各データセットは{label, data, color}形式）
 * @param {Array} labels - ラベル配列
 * @returns {Object} Chart.js用の設定オブジェクト
 */
export const createComparisonChartConfig = (datasets, labels) => {
  // データセットの整形
  const formattedDatasets = datasets.map((dataset, index) => {
    const color = dataset.color || Object.values(CHART_COLORS)[index % Object.values(CHART_COLORS).length];
    return {
      label: dataset.label,
      data: dataset.data,
      backgroundColor: getTransparentColor(color, 0.2),
      borderColor: color,
      tension: 0.3,
      fill: true
    };
  });
  
  return {
    type: 'line',
    data: {
      labels,
      datasets: formattedDatasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: true
        }
      }
    }
  };
};

/**
 * リスク分布グラフ（バブルチャート）の設定オブジェクト生成
 * @param {Array} tasks - タスク配列
 * @returns {Object} Chart.js用の設定オブジェクト
 */
export const createRiskBubbleChartConfig = (tasks) => {
  // リスクのあるタスクのみをフィルター
  const riskTasks = tasks.filter(task => task.isAtRisk || task.warning);
  
  // バブルチャート用のデータポイント生成
  const dataPoints = riskTasks.map(task => {
    // タスクの重要度を計算（優先度が高いほど、期限が近いほど重要）
    const priorityWeight = task.priority === 'high' ? 3 : task.priority === 'medium' ? 2 : 1;
    const dueDate = new Date(task.endDate);
    const today = new Date();
    const daysUntilDue = Math.max(0, Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24)));
    
    // 重要度スコア（0-10の範囲）
    let importanceScore;
    if (daysUntilDue === 0) {
      importanceScore = 10; // 今日が期限
    } else if (daysUntilDue <= 3) {
      importanceScore = 8 + priorityWeight; // 3日以内に期限
    } else if (daysUntilDue <= 7) {
      importanceScore = 5 + priorityWeight; // 1週間以内に期限
    } else {
      importanceScore = priorityWeight; // それ以外
    }
    
    // x軸: 期限までの日数
    // y軸: タスクの進捗率
    // バブルサイズ: 重要度スコア
    return {
      x: daysUntilDue,
      y: task.progress,
      r: importanceScore, // バブルの半径
      task // 元のタスク情報を保持
    };
  });
  
  return {
    type: 'bubble',
    data: {
      datasets: [{
        label: 'リスクタスク',
        data: dataPoints,
        backgroundColor: dataPoints.map(point => 
          point.task.priority === 'high' ? getTransparentColor(CHART_COLORS.error, 0.7) :
          point.task.priority === 'medium' ? getTransparentColor(CHART_COLORS.warning, 0.7) :
          getTransparentColor(CHART_COLORS.info, 0.7)
        ),
        borderColor: dataPoints.map(point => 
          point.task.priority === 'high' ? CHART_COLORS.error :
          point.task.priority === 'medium' ? CHART_COLORS.warning :
          CHART_COLORS.info
        ),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: {
            display: true,
            text: '期限までの日数'
          },
          min: 0
        },
        y: {
          title: {
            display: true,
            text: '進捗率 (%)'
          },
          min: 0,
          max: 100
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              const point = context.raw;
              const task = point.task;
              return [
                `タスク: ${task.title}`,
                `期限: ${task.endDate}`,
                `進捗: ${task.progress}%`,
                `優先度: ${task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}`,
                task.riskDescription ? `リスク: ${task.riskDescription}` : null
              ].filter(Boolean);
            }
          }
        }
      }
    }
  };
};