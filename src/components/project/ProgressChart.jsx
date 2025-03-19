import React, { useEffect, useRef } from 'react';
import { 
  Paper, 
  Typography, 
  Grid, 
  Box, 
  LinearProgress,
  useTheme
} from '@material-ui/core';
import Chart from 'chart.js/auto';

/**
 * プロジェクト進捗グラフコンポーネント
 * 
 * プロジェクトの進捗状況を様々なグラフで可視化します。
 * - タスク状態の円グラフ
 * - 優先度別のタスク分布棒グラフ
 * - 週次進捗トレンドライングラフ
 */
const ProgressChart = ({ stats, weeklyProgress = [] }) => {
  const theme = useTheme();
  const taskStatusChartRef = useRef(null);
  const weeklyProgressChartRef = useRef(null);
  const taskStatusChart = useRef(null);
  const weeklyProgressChart = useRef(null);
  
  // statsがnullまたはundefinedの場合、空のオブジェクトをデフォルト値として使用
  const safeStats = stats || {};
  
  // デフォルト値の設定
  const taskStatusData = {
    completedTasks: safeStats.completedTasks || 0,
    inProgressTasks: safeStats.inProgressTasks || 0,
    notStartedTasks: safeStats.notStartedTasks || 0,
    delayedTasks: safeStats.overdueCount || 0
  };
  
  const priorityData = {
    high: safeStats.tasksByPriority?.high || 0,
    medium: safeStats.tasksByPriority?.medium || 0,
    low: safeStats.tasksByPriority?.low || 0
  };
  
  // 円グラフの初期化・更新
  useEffect(() => {
    if (taskStatusChartRef.current) {
      // 既存のチャートを破棄
      if (taskStatusChart.current) {
        taskStatusChart.current.destroy();
      }
      
      const ctx = taskStatusChartRef.current.getContext('2d');
      
      taskStatusChart.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['完了', '進行中', '未着手', '遅延'],
          datasets: [{
            data: [
              taskStatusData.completedTasks,
              taskStatusData.inProgressTasks,
              taskStatusData.notStartedTasks,
              taskStatusData.delayedTasks
            ],
            backgroundColor: [
              '#4caf50', // 完了: 緑
              '#2196f3', // 進行中: 青
              '#9e9e9e', // 未着手: グレー
              '#f44336'  // 遅延: 赤
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
                boxWidth: 15,
                padding: 15
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const value = context.raw;
                  const percentage = Math.round((value / total) * 100);
                  return `${context.label}: ${value}件 (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    }
    
    return () => {
      // コンポーネントのアンマウント時にチャートを破棄
      if (taskStatusChart.current) {
        taskStatusChart.current.destroy();
      }
    };
  }, [taskStatusData]);
  
  // 週次進捗グラフの初期化・更新
  useEffect(() => {
    if (weeklyProgressChartRef.current && weeklyProgress.length > 0) {
      // 既存のチャートを破棄
      if (weeklyProgressChart.current) {
        weeklyProgressChart.current.destroy();
      }
      
      const ctx = weeklyProgressChartRef.current.getContext('2d');
      
      // データの準備
      const labels = weeklyProgress.map(item => item.weekLabel);
      const actualProgress = weeklyProgress.map(item => item.actualProgress);
      const plannedProgress = weeklyProgress.map(item => item.plannedProgress);
      
      weeklyProgressChart.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: '実際の進捗',
              data: actualProgress,
              borderColor: theme.palette.primary.main,
              backgroundColor: `${theme.palette.primary.main}20`, // 透明度を追加
              tension: 0.3,
              fill: true
            },
            {
              label: '予定進捗',
              data: plannedProgress,
              borderColor: '#9e9e9e',
              borderDash: [5, 5],
              backgroundColor: 'transparent',
              tension: 0.3,
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              ticks: {
                callback: function(value) {
                  return `${value}%`;
                }
              }
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `${context.dataset.label}: ${context.raw}%`;
                }
              }
            }
          }
        }
      });
    }
    
    return () => {
      // コンポーネントのアンマウント時にチャートを破棄
      if (weeklyProgressChart.current) {
        weeklyProgressChart.current.destroy();
      }
    };
  }, [weeklyProgress, theme]);
  
  // 週次進捗データがない場合のモックデータ
  const mockWeeklyProgress = [
    { weekLabel: '第1週', actualProgress: 15, plannedProgress: 18 },
    { weekLabel: '第2週', actualProgress: 28, plannedProgress: 35 },
    { weekLabel: '第3週', actualProgress: 42, plannedProgress: 50 },
    { weekLabel: '第4週', actualProgress: 58, plannedProgress: 65 },
    { weekLabel: '第5週', actualProgress: 65, plannedProgress: 80 }
  ];
  
  // 使用するデータ
  const progressData = weeklyProgress.length > 0 ? weeklyProgress : mockWeeklyProgress;
  
  // 総タスク数
  const totalTasks = taskStatusData.completedTasks + 
                     taskStatusData.inProgressTasks + 
                     taskStatusData.notStartedTasks + 
                     taskStatusData.delayedTasks;
  
  // 優先度別の割合計算
  const totalPriority = priorityData.high + priorityData.medium + priorityData.low;
  const highPercentage = totalPriority > 0 ? (priorityData.high / totalPriority) * 100 : 0;
  const mediumPercentage = totalPriority > 0 ? (priorityData.medium / totalPriority) * 100 : 0;
  const lowPercentage = totalPriority > 0 ? (priorityData.low / totalPriority) * 100 : 0;
  
  return (
    <Grid container spacing={3}>
      {/* タスク状態の円グラフ */}
      <Grid item xs={12} md={6}>
        <Paper style={{ padding: 16 }}>
          <Typography variant="h6" gutterBottom>
            タスク進捗状況
          </Typography>
          <div style={{ height: 250, position: 'relative' }}>
            {totalTasks > 0 ? (
              <canvas ref={taskStatusChartRef} />
            ) : (
              <Box 
                display="flex" 
                justifyContent="center" 
                alignItems="center" 
                height="100%"
              >
                <Typography variant="body1" color="textSecondary">
                  データがありません
                </Typography>
              </Box>
            )}
          </div>
          
          <Box mt={2}>
            <Grid container spacing={1}>
              <Grid item xs={3} style={{ textAlign: 'center' }}>
                <Typography variant="h6" color="primary">
                  {taskStatusData.completedTasks}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  完了
                </Typography>
              </Grid>
              <Grid item xs={3} style={{ textAlign: 'center' }}>
                <Typography variant="h6" style={{ color: '#2196f3' }}>
                  {taskStatusData.inProgressTasks}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  進行中
                </Typography>
              </Grid>
              <Grid item xs={3} style={{ textAlign: 'center' }}>
                <Typography variant="h6" style={{ color: '#9e9e9e' }}>
                  {taskStatusData.notStartedTasks}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  未着手
                </Typography>
              </Grid>
              <Grid item xs={3} style={{ textAlign: 'center' }}>
                <Typography variant="h6" style={{ color: '#f44336' }}>
                  {taskStatusData.delayedTasks}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  遅延
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Grid>
      
      {/* 優先度別タスク数 */}
      <Grid item xs={12} md={6}>
        <Paper style={{ padding: 16 }}>
          <Typography variant="h6" gutterBottom>
            優先度別タスク数
          </Typography>
          <Box my={3}>
            <Box mb={2}>
              <Box display="flex" justifyContent="space-between" mb={0.5}>
                <Typography variant="body2">
                  高優先度
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {priorityData.high}件 ({Math.round(highPercentage)}%)
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={highPercentage} 
                style={{ 
                  height: 8, 
                  borderRadius: 4,
                  backgroundColor: `${theme.palette.error.light}30`,
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: theme.palette.error.main
                  }
                }}
              />
            </Box>
            
            <Box mb={2}>
              <Box display="flex" justifyContent="space-between" mb={0.5}>
                <Typography variant="body2">
                  中優先度
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {priorityData.medium}件 ({Math.round(mediumPercentage)}%)
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={mediumPercentage} 
                style={{ 
                  height: 8, 
                  borderRadius: 4,
                  backgroundColor: `${theme.palette.warning.light}30`
                }}
                color="primary"
              />
            </Box>
            
            <Box mb={2}>
              <Box display="flex" justifyContent="space-between" mb={0.5}>
                <Typography variant="body2">
                  低優先度
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {priorityData.low}件 ({Math.round(lowPercentage)}%)
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={lowPercentage} 
                style={{ 
                  height: 8, 
                  borderRadius: 4,
                  backgroundColor: `${theme.palette.success.light}30`,
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: theme.palette.success.main
                  }
                }}
              />
            </Box>
          </Box>
          
          <Box mt={3}>
            <Typography variant="body2" color="textSecondary" align="center">
              全{totalPriority}件のタスク
            </Typography>
          </Box>
        </Paper>
      </Grid>
      
      {/* 週次進捗トレンド */}
      <Grid item xs={12}>
        <Paper style={{ padding: 16 }}>
          <Typography variant="h6" gutterBottom>
            週次進捗トレンド
          </Typography>
          <div style={{ height: 300, position: 'relative' }}>
            {progressData.length > 0 ? (
              <canvas ref={weeklyProgressChartRef} />
            ) : (
              <Box 
                display="flex" 
                justifyContent="center" 
                alignItems="center" 
                height="100%"
              >
                <Typography variant="body1" color="textSecondary">
                  データがありません
                </Typography>
              </Box>
            )}
          </div>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default ProgressChart;