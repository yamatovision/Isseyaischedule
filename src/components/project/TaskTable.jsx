import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Checkbox, 
  IconButton, 
  Chip, 
  LinearProgress,
  Typography,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  TextField,
  InputAdornment
} from '@material-ui/core';

import { 
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon
} from '@material-ui/icons';

/**
 * タスク一覧表示コンポーネント
 * 
 * プロジェクト内のタスクを一覧表示し、フィルタリングや並び替え、
 * 基本的なタスク操作（完了マーク・編集・削除）を提供します。
 * 
 * MongoDB由来のタスクデータに対応するため、フィールド名の違いを内部で吸収する正規化処理付き
 */
const TaskTable = ({ tasks = [], onTaskUpdate, onTaskDelete, onTaskToggle }) => {
  // MongoDB由来のタスクデータをUI表示に適したフォーマットに正規化
  const normalizedTasks = tasks.map(task => ({
    id: task._id || task.id,
    title: task.title,
    description: task.description,
    startDate: task.startDate || task.start_date,
    endDate: task.dueDate || task.end_date || task.endDate,
    priority: task.priority || 'medium',
    status: task.status || 'not_started',
    progress: task.progress || 0,
    assignedTo: task.assignedTo,
    warning: task.isAtRisk || task.warning || false,
    warningText: task.riskDescription || task.warningText
  }));
  
  // 状態管理
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedTask, setSelectedTask] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  
  // メニュー管理
  const handleMenuOpen = (event, task) => {
    setAnchorEl(event.currentTarget);
    setSelectedTask(task);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTask(null);
  };
  
  // タスク編集ハンドラー
  const handleEdit = () => {
    if (selectedTask && onTaskUpdate) {
      onTaskUpdate(selectedTask.id);
    }
    handleMenuClose();
  };
  
  // タスク削除ハンドラー
  const handleDelete = () => {
    if (selectedTask && onTaskDelete) {
      onTaskDelete(selectedTask.id);
    }
    handleMenuClose();
  };
  
  // タスク完了トグルハンドラー
  const handleTaskToggle = (task) => {
    if (onTaskToggle) {
      // 完了 → 進行中 または 未着手・進行中・その他 → 完了
      const isCompleted = task.status === 'completed';
      let newStatus;
      
      if (isCompleted) {
        // 完了から進行中へ
        newStatus = 'in_progress';
      } else {
        // その他から完了へ
        newStatus = 'completed';
      }
      
      const newProgress = isCompleted ? 50 : 100;
      onTaskToggle(task.id, newStatus, newProgress);
    }
  };
  
  // 検索フィルター
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  
  // ステータスフィルター
  const handleStatusFilterChange = (status) => {
    setFilterStatus(status);
  };
  
  // ソート設定
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };
  
  // タスクフィルタリング
  const filteredTasks = normalizedTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });
  
  // タスクソート
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'priority':
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        aValue = priorityOrder[a.priority] || 999;
        bValue = priorityOrder[b.priority] || 999;
        break;
      case 'status':
        const statusOrder = { 
          'in_progress': 0, 
          'in-progress': 0, 
          'not_started': 1, 
          'not-started': 1, 
          'completed': 2, 
          'delayed': 3 
        };
        aValue = statusOrder[a.status] || 999;
        bValue = statusOrder[b.status] || 999;
        break;
      case 'dueDate':
      default:
        aValue = new Date(a.endDate || '9999-12-31');
        bValue = new Date(b.endDate || '9999-12-31');
        break;
    }
    
    const compareResult = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    return sortDirection === 'asc' ? compareResult : -compareResult;
  });
  
  // ステータスに応じたChipの色を設定
  const getStatusChipProps = (status) => {
    switch (status) {
      case 'not_started':
      case 'not-started':
        return { label: '未着手', color: 'default', variant: 'outlined' };
      case 'in_progress':
      case 'in-progress':
        return { label: '進行中', color: 'primary', variant: 'outlined' };
      case 'completed':
        return { label: '完了', color: 'secondary', style: { backgroundColor: '#c8e6c9', color: '#388e3c' } };
      case 'delayed':
        return { label: '遅延', style: { backgroundColor: '#ffcdd2', color: '#d32f2f' } };
      default:
        return { label: status, color: 'default', variant: 'outlined' };
    }
  };
  
  // 優先度に応じた色を設定
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#f44336';
      case 'medium':
        return '#ff9800';
      case 'low':
        return '#4caf50';
      default:
        return '#9e9e9e';
    }
  };
  
  return (
    <div>
      {/* 検索・フィルターコントロール */}
      <div style={{ display: 'flex', marginBottom: 16, alignItems: 'center' }}>
        <TextField
          placeholder="タスクを検索"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
          style={{ marginRight: 16, width: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            )
          }}
        />
        
        <Tooltip title="ステータスでフィルター">
          <IconButton 
            aria-label="filter" 
            size="small" 
            style={{ marginRight: 8 }}
            onClick={() => {/* フィルターメニューを開く */}}
          >
            <FilterListIcon />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="並び替え">
          <IconButton 
            aria-label="sort" 
            size="small"
            onClick={() => {/* ソートメニューを開く */}}
          >
            <SortIcon />
          </IconButton>
        </Tooltip>
        
        <div style={{ marginLeft: 'auto' }}>
          <Chip 
            label={`全${tasks.length}件 / 表示${sortedTasks.length}件`} 
            variant="outlined" 
            size="small" 
          />
        </div>
      </div>
      
      {/* タスク一覧テーブル */}
      <TableContainer component={Paper}>
        <Table aria-label="task table">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox"></TableCell>
              <TableCell 
                style={{ width: 8 }} 
                align="center" 
                title="優先度"
              ></TableCell>
              <TableCell 
                style={{ cursor: 'pointer' }} 
                onClick={() => handleSort('title')}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  タスク名
                  {sortBy === 'title' && (
                    <span className="material-icons" style={{ fontSize: 16, marginLeft: 4 }}>
                      {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell 
                align="center" 
                style={{ cursor: 'pointer', width: 120 }} 
                onClick={() => handleSort('status')}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  ステータス
                  {sortBy === 'status' && (
                    <span className="material-icons" style={{ fontSize: 16, marginLeft: 4 }}>
                      {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell 
                align="center" 
                style={{ cursor: 'pointer', width: 100 }} 
                onClick={() => handleSort('dueDate')}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  期限
                  {sortBy === 'dueDate' && (
                    <span className="material-icons" style={{ fontSize: 16, marginLeft: 4 }}>
                      {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell align="center" style={{ width: 120 }}>進捗</TableCell>
              <TableCell align="center" style={{ width: 48 }}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedTasks.length > 0 ? (
              sortedTasks.map((task) => {
                const statusChipProps = getStatusChipProps(task.status);
                const priorityColor = getPriorityColor(task.priority);
                const isCompleted = task.status === 'completed';
                
                return (
                  <TableRow key={task.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isCompleted}
                        onChange={() => handleTaskToggle(task)}
                        color="primary"
                      />
                    </TableCell>
                    <TableCell padding="none" align="center">
                      <div 
                        style={{ 
                          width: 4, 
                          height: 36, 
                          backgroundColor: priorityColor,
                          borderRadius: 2,
                          margin: '0 auto'
                        }} 
                        title={`優先度: ${task.priority}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1">{task.title}</Typography>
                      {task.assignedTo && (
                        <Typography variant="caption" color="textSecondary">
                          担当: {task.assignedTo.name}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Chip {...statusChipProps} size="small" />
                    </TableCell>
                    <TableCell align="center">
                      {task.dueDate || task.endDate ? (
                        new Date(task.dueDate || task.endDate).toLocaleDateString('ja-JP', {
                          month: 'short',
                          day: 'numeric'
                        })
                      ) : '-'}
                    </TableCell>
                    <TableCell align="center">
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {/* タスクの進捗バーの代わりにステータスに応じた表示 */}
                        <LinearProgress 
                          variant="determinate" 
                          value={task.status === 'completed' ? 100 : (task.status === 'in_progress' || task.status === 'in-progress' ? 50 : 0)} 
                          style={{ 
                            flexGrow: 1, 
                            marginRight: 8,
                            height: 8,
                            borderRadius: 4
                          }}
                        />
                        <Typography variant="caption">
                          {task.status === 'completed' ? '100%' : (task.status === 'in_progress' || task.status === 'in-progress' ? '50%' : '0%')}
                        </Typography>
                      </div>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        aria-label="more" 
                        size="small"
                        onClick={(event) => handleMenuOpen(event, task)}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center" style={{ padding: 24 }}>
                  <Typography variant="body1" color="textSecondary">
                    表示するタスクがありません
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* タスク操作メニュー */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="編集" />
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="削除" />
        </MenuItem>
      </Menu>
    </div>
  );
};

export default TaskTable;