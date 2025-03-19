/**
 * ガントチャートコンポーネント
 * タスクのタイムラインを視覚的に表示するコンポーネント
 * 
 * 変更履歴:
 * - 2025/03/19: 初期実装 (Claude)
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, Typography, Paper, IconButton, Tooltip, 
  Chip, Dialog, DialogTitle, DialogContent, 
  DialogActions, Button, TextField, MenuItem, 
  Select, FormControl, InputLabel 
} from '@material-ui/core';
import TodayIcon from '@material-ui/icons/Today';
import WarningIcon from '@material-ui/icons/Warning';
import GetAppIcon from '@material-ui/icons/GetApp';
import ZoomInIcon from '@material-ui/icons/ZoomIn';
import ZoomOutIcon from '@material-ui/icons/ZoomOut';
import EditIcon from '@material-ui/icons/Edit';
import InfoIcon from '@material-ui/icons/Info';
import { 
  prepareGanttData, formatDate, getTaskTimeStatus, 
  getPriorityColor 
} from '../../utils/gantt';

/**
 * 日付をinput[type="date"]で使用できる形式（YYYY-MM-DD）に変換
 * 文字列やDateオブジェクトなど複数の形式に対応
 * @param {string|Date} dateValue - 変換する日付
 * @returns {string} YYYY-MM-DD形式の日付文字列
 */
const formatDateForInput = (dateValue) => {
  if (!dateValue) return '';
  
  let date;
  // 日付がすでにDateオブジェクトの場合
  if (dateValue instanceof Date) {
    date = dateValue;
  } 
  // 日付が文字列の場合
  else if (typeof dateValue === 'string') {
    // すでにYYYY-MM-DD形式（時間部分なし）の場合はそのまま返す
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return dateValue;
    }
    
    // ISOフォーマット（YYYY-MM-DDTHH:mm:ss.sssZ）の場合はT以降を切り捨て
    if (dateValue.includes('T')) {
      return dateValue.split('T')[0];
    }
    
    // それ以外の場合はDateオブジェクトに変換
    date = new Date(dateValue);
  }
  else {
    // 想定外の型の場合は空文字を返す
    return '';
  }
  
  // 不正な日付の場合（例：Invalid Date）
  if (isNaN(date.getTime())) {
    return '';
  }
  
  // YYYY-MM-DD形式の文字列に変換
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * タスク詳細ダイアログ
 */
const TaskDetailDialog = ({ open, onClose, task, onEdit }) => {
  if (!task) return null;
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {task.title}
        {task.warning && (
          <Chip 
            icon={<WarningIcon />} 
            label="リスクあり" 
            color="warning" 
            size="small" 
            sx={{ ml: 1 }}
          />
        )}
      </DialogTitle>
      
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {task.description}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="body2">
            <strong>開始日:</strong> {formatDate(task.startDate)}
          </Typography>
          <Typography variant="body2">
            <strong>終了日:</strong> {formatDate(task.endDate)}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', mb: 2 }}>
          <Typography variant="body2" sx={{ mr: 3 }}>
            <strong>優先度:</strong> {
              task.priority === 'high' ? '高' :
              task.priority === 'low' ? '低' : '中'
            }
          </Typography>
          <Typography variant="body2">
            <strong>状態:</strong> {
              task.status === 'completed' ? '完了' :
              task.status === 'in_progress' ? '進行中' : '未着手'
            }
          </Typography>
        </Box>
        
        {task.warning && task.warningText && (
          <Box 
            className="task-detail-status warning"
            sx={{ 
              backgroundColor: '#fff3e0',
              p: 2,
              borderRadius: 1,
              display: 'flex',
              alignItems: 'flex-start'
            }}
          >
            <WarningIcon color="warning" sx={{ mr: 1, mt: 0.2 }} />
            <Typography variant="body2">
              {task.warningText}
            </Typography>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>閉じる</Button>
        <Button 
          startIcon={<EditIcon />}
          variant="contained"
          color="primary"
          onClick={() => {
            onEdit(task);
            onClose();
          }}
        >
          編集
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/**
 * タスク編集ダイアログ
 */
const TaskEditDialog = ({ open, onClose, task, onSave }) => {
  const [editedTask, setEditedTask] = useState(task);
  
  // タスク変更時に編集データを更新
  useEffect(() => {
    setEditedTask(task);
  }, [task]);
  
  if (!task) return null;
  
  // フィールド変更ハンドラー
  const handleChange = (field, value) => {
    setEditedTask(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // 保存ハンドラー
  const handleSave = () => {
    onSave(editedTask);
    onClose();
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>タスクの編集</DialogTitle>
      
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <TextField
            label="タスク名"
            fullWidth
            value={editedTask?.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
            margin="normal"
          />
          
          <TextField
            label="説明"
            fullWidth
            multiline
            rows={3}
            value={editedTask?.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            margin="normal"
          />
          
          <Box sx={{ display: 'flex', gap: 2, my: 2 }}>
            <TextField
              label="開始日"
              type="date"
              value={formatDateForInput(editedTask?.startDate) || ''}
              onChange={(e) => handleChange('startDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            
            <TextField
              label="終了日"
              type="date"
              value={formatDateForInput(editedTask?.endDate || editedTask?.dueDate) || ''}
              onChange={(e) => {
                handleChange('endDate', e.target.value);
                handleChange('dueDate', e.target.value);
              }}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, my: 2 }}>
            <FormControl fullWidth>
              <InputLabel>優先度</InputLabel>
              <Select
                value={editedTask?.priority || 'medium'}
                label="優先度"
                onChange={(e) => handleChange('priority', e.target.value)}
              >
                <MenuItem value="high">高</MenuItem>
                <MenuItem value="medium">中</MenuItem>
                <MenuItem value="low">低</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>状態</InputLabel>
              <Select
                value={editedTask?.status || 'not_started'}
                label="状態"
                onChange={(e) => handleChange('status', e.target.value)}
              >
                <MenuItem value="not_started">未着手</MenuItem>
                <MenuItem value="in_progress">進行中</MenuItem>
                <MenuItem value="completed">完了</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          {editedTask?.warning && (
            <Box sx={{ mt: 2 }}>
              <TextField
                label="リスク・警告内容"
                fullWidth
                multiline
                rows={2}
                value={editedTask?.warningText || editedTask?.riskDescription || ''}
                onChange={(e) => {
                  handleChange('warningText', e.target.value);
                  handleChange('riskDescription', e.target.value);
                }}
                margin="normal"
              />
            </Box>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>キャンセル</Button>
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleSave}
        >
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/**
 * ガントチャートコンポーネント
 */
const GanttChart = ({ tasks = [], projectStartDate, projectEndDate, onTaskUpdate }) => {
  // State
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [showTaskEdit, setShowTaskEdit] = useState(false);
  const chartRef = useRef(null);
  
  // ガントチャートデータの準備
  const ganttData = prepareGanttData(tasks, projectStartDate, projectEndDate);
  
  // ズームレベルの変更
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 2));
  };
  
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  };
  
  // タスクバーのクリック処理
  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowTaskDetail(true);
  };
  
  // タスク編集ダイアログを開く
  const handleEditTask = (task) => {
    setSelectedTask(task);
    setShowTaskEdit(true);
  };
  
  // タスク更新処理
  const handleTaskSave = (updatedTask) => {
    if (onTaskUpdate) {
      onTaskUpdate(updatedTask);
    }
  };
  
  // ガントチャートのエクスポート
  const handleExport = () => {
    // TODO: ガントチャートのエクスポート機能を実装
    console.log('ガントチャートをエクスポート');
  };
  
  // 現在の日付位置を計算
  const calculateTodayPosition = () => {
    if (!ganttData.tasks.length) return '0%';
    
    const today = new Date();
    const start = new Date(
      Math.min(...ganttData.tasks.map(t => new Date(t.startDate).getTime()))
    );
    const end = new Date(
      Math.max(...ganttData.tasks.map(t => new Date(t.endDate).getTime()))
    );
    
    const totalDuration = end.getTime() - start.getTime();
    if (totalDuration <= 0) return '0%';
    
    const todayOffset = today.getTime() - start.getTime();
    const position = (todayOffset / totalDuration) * 100;
    
    return `${Math.max(0, Math.min(100, position))}%`;
  };
  
  return (
    <Box className="gantt-column">
      {/* ガントチャートヘッダー */}
      <Box className="gantt-header">
        <Typography variant="h6">
          プロジェクトタイムライン
        </Typography>
        
        <Box className="gantt-controls">
          <Tooltip title="縮小">
            <IconButton 
              size="small" 
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.5}
            >
              <ZoomOutIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="拡大">
            <IconButton 
              size="small" 
              onClick={handleZoomIn}
              disabled={zoomLevel >= 2}
            >
              <ZoomInIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="エクスポート">
            <IconButton 
              size="small" 
              onClick={handleExport}
            >
              <GetAppIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* ガントチャート本体 */}
      <Box className="gantt-chart" ref={chartRef}>
        {ganttData.tasks.length > 0 ? (
          <>
            {/* 月表示 */}
            <Box className="timeline-months" style={{ 
              minWidth: `${ganttData.timeRange.length * 300 * zoomLevel}px`,
              display: 'flex',
              borderBottom: '1px solid #e0e0e0'
            }}>
              {ganttData.timeRange.map((month, index) => (
                <Box 
                  key={index} 
                  className="timeline-month"
                  style={{ 
                    minWidth: `${300 * zoomLevel}px`,
                    padding: '12px 16px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    borderRight: '1px solid #e0e0e0',
                    backgroundColor: '#f5f5f5'
                  }}
                >
                  {month.text}
                </Box>
              ))}
            </Box>
            
            {/* 現在の日付を示す縦線 */}
            <Box 
              className="timeline-now" 
              sx={{ left: calculateTodayPosition() }}
            />
            
            {/* タスク行 */}
            {ganttData.tasks.map((task) => (
              <Box key={task.id} className="gantt-row">
                {/* タスク情報部分 */}
                <Box className="gantt-task">
                  <Box className={`task-priority ${task.priority}`} />
                  <Box className="task-details">
                    <Box className="task-title">
                      {task.title}
                      {task.warning && (
                        <Tooltip title={task.warningText || "潜在的なリスクがあります"}>
                          <WarningIcon className="task-warning" />
                        </Tooltip>
                      )}
                    </Box>
                    <Box className="task-dates">
                      {formatDate(task.startDate)} 〜 {formatDate(task.endDate)}
                    </Box>
                  </Box>
                </Box>
                
                {/* ガントチャートのタイムライン部分 */}
                <Box 
                  className="gantt-timeline"
                  style={{ 
                    minWidth: `${ganttData.timeRange.length * 300 * zoomLevel}px`,
                    backgroundSize: `${100 * zoomLevel}px 100%`,
                    position: 'relative',
                    height: '40px',
                    borderBottom: '1px solid #f0f0f0',
                    background: 'linear-gradient(to right, #f9f9f9 1px, transparent 1px)',
                    backgroundSize: '100px 100%'
                  }}
                >
                  <Tooltip
                    title={
                      <>
                        <Typography variant="subtitle2">{task.title}</Typography>
                        <Typography variant="body2">{task.description}</Typography>
                        <Typography variant="caption">
                          {formatDate(task.startDate)} 〜 {formatDate(task.endDate)}
                        </Typography>
                      </>
                    }
                  >
                    <Box 
                      className={`timeline-bar ${task.priority} ${getTaskTimeStatus(task)}`}
                      style={{ 
                        position: 'absolute',
                        left: `${task.startPosition}%`,
                        width: `${task.duration}%`,
                        backgroundColor: getPriorityColor(task.priority),
                        height: '28px',
                        top: '6px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 8px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        minWidth: '80px'
                      }}
                      onClick={() => handleTaskClick(task)}
                    >
                      {task.title}
                    </Box>
                  </Tooltip>
                </Box>
              </Box>
            ))}
          </>
        ) : (
          // タスクがない場合の表示
          <Box className="empty-state">
            <InfoIcon className="empty-icon" />
            <Typography variant="subtitle1">
              タスクが作成されていません
            </Typography>
            <Typography variant="body2" color="textSecondary">
              AIアシスタントにプロジェクトについて伝えると、タスク計画が生成されます
            </Typography>
          </Box>
        )}
      </Box>
      
      {/* タスク詳細ダイアログ */}
      <TaskDetailDialog 
        open={showTaskDetail}
        onClose={() => setShowTaskDetail(false)}
        task={selectedTask}
        onEdit={handleEditTask}
      />
      
      {/* タスク編集ダイアログ */}
      <TaskEditDialog 
        open={showTaskEdit}
        onClose={() => setShowTaskEdit(false)}
        task={selectedTask}
        onSave={handleTaskSave}
      />
    </Box>
  );
};

export default GanttChart;