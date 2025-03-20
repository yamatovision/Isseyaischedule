import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  LinearProgress,
  Button,
  Box,
  Card,
  CardContent,
  Tabs,
  Tab,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@material-ui/core';

import {
  Person as PersonIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Assignment as AssignmentIcon
} from '@material-ui/icons';

/**
 * リソース割り当て管理コンポーネント
 * 
 * プロジェクトに割り当てられたリソース（人員、予算、設備など）を管理し、
 * リソースの過不足や競合を可視化します。
 */
const ResourceAllocation = ({ resources = [], tasks = [], onAddResource, onEditResource, onRemoveResource }) => {
  // 状態管理
  const [tabValue, setTabValue] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'human',
    role: '',
    availability: 100,
    assignedHours: 0,
    costPerHour: 0
  });
  
  // タブ切り替えハンドラー
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // ダイアログ制御
  const handleOpenDialog = (resource = null) => {
    if (resource) {
      setSelectedResource(resource);
      setFormData({
        name: resource.name,
        type: resource.type,
        role: resource.role,
        availability: resource.availability,
        assignedHours: resource.assignedHours,
        costPerHour: resource.costPerHour || 0
      });
    } else {
      setSelectedResource(null);
      setFormData({
        name: '',
        type: 'human',
        role: '',
        availability: 100,
        assignedHours: 0,
        costPerHour: 0
      });
    }
    setDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };
  
  // フォーム変更ハンドラー
  const handleFormChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };
  
  // リソース保存ハンドラー
  const handleSaveResource = () => {
    if (selectedResource) {
      // 既存リソースの更新
      if (onEditResource) {
        onEditResource(selectedResource.id, formData);
      }
    } else {
      // 新規リソースの追加
      if (onAddResource) {
        onAddResource(formData);
      }
    }
    handleCloseDialog();
  };
  
  // リソース削除ハンドラー
  const handleRemoveResource = (resourceId) => {
    if (onRemoveResource) {
      onRemoveResource(resourceId);
    }
  };
  
  // リソースタイプ別にグループ化
  const humanResources = resources.filter(resource => resource.type === 'human');
  const otherResources = resources.filter(resource => resource.type !== 'human');
  
  // リソース使用率の計算
  const calculateUsage = (resource) => {
    return Math.min(100, Math.round((resource.assignedHours / (resource.availability * 40)) * 100));
  };
  
  // 使用率に基づく色の決定
  const getUsageColor = (usage) => {
    if (usage >= 90) return '#f44336'; // 赤: 過負荷
    if (usage >= 70) return '#ff9800'; // オレンジ: 警告
    return '#4caf50'; // 緑: 正常
  };
  
  // 合計予算の計算
  const calculateTotalBudget = () => {
    return resources.reduce((total, resource) => {
      return total + (resource.assignedHours * (resource.costPerHour || 0));
    }, 0);
  };
  
  // モックデータ
  const mockHumanResources = [
    {
      id: 1,
      name: '山田太郎',
      type: 'human',
      role: 'プロジェクトマネージャー',
      availability: 0.8,
      assignedHours: 25,
      assignments: [
        { taskId: 'task-1', hours: 10, taskName: '要件定義' },
        { taskId: 'task-4', hours: 15, taskName: 'バックエンド開発' }
      ],
      costPerHour: 5000
    },
    {
      id: 2,
      name: '佐藤花子',
      type: 'human',
      role: 'デザイナー',
      availability: 0.5,
      assignedHours: 20,
      assignments: [
        { taskId: 'task-2', hours: 20, taskName: 'デザイン作成' }
      ],
      costPerHour: 4000
    },
    {
      id: 3,
      name: '鈴木一郎',
      type: 'human',
      role: 'エンジニア',
      availability: 1.0,
      assignedHours: 35,
      assignments: [
        { taskId: 'task-3', hours: 35, taskName: 'フロントエンド開発' }
      ],
      costPerHour: 4500
    }
  ];
  
  // 実際のリソースがない場合はモックデータを使用
  const displayHumanResources = humanResources.length > 0 ? humanResources : mockHumanResources;
  
  // 人員タブの内容
  const renderHumanResourcesTab = () => (
    <>
      <Box mb={2} display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          リソース追加
        </Button>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>担当者</TableCell>
              <TableCell>役割</TableCell>
              <TableCell align="center">稼働率</TableCell>
              <TableCell align="center">割当タスク数</TableCell>
              <TableCell align="center">時間単価</TableCell>
              <TableCell align="right">アクション</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayHumanResources.map((resource) => {
              const usage = calculateUsage(resource);
              const usageColor = getUsageColor(usage);
              
              return (
                <TableRow key={resource.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar style={{ marginRight: 8 }}>
                        <PersonIcon />
                      </Avatar>
                      <div>
                        <Typography variant="body1">
                          {resource.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {resource.availability * 100}%稼働
                        </Typography>
                      </div>
                    </Box>
                  </TableCell>
                  <TableCell>{resource.role}</TableCell>
                  <TableCell align="center">
                    <Box width="100%">
                      <Box display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography variant="caption">
                          {usage}%
                        </Typography>
                        {usage >= 90 && (
                          <Tooltip title="過負荷の可能性があります">
                            <WarningIcon fontSize="small" style={{ color: '#f44336' }} />
                          </Tooltip>
                        )}
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={usage} 
                        style={{ 
                          height: 8, 
                          borderRadius: 4,
                          backgroundColor: `${usageColor}20`,
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: usageColor
                          }
                        }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={`${resource.assignments?.length || 0}件`} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    {resource.costPerHour ? `¥${resource.costPerHour.toLocaleString()}/時間` : '-'}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="編集">
                      <IconButton size="small" onClick={() => handleOpenDialog(resource)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="削除">
                      <IconButton size="small" onClick={() => handleRemoveResource(resource.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Typography variant="h6" style={{ marginTop: 24, marginBottom: 16 }}>
        リソース割当詳細
      </Typography>
      
      <Grid container spacing={3}>
        {displayHumanResources.map((resource) => (
          <Grid item xs={12} md={6} lg={4} key={`detail-${resource.id}`}>
            <Card variant="outlined">
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar style={{ marginRight: 8 }}>
                    <PersonIcon />
                  </Avatar>
                  <div>
                    <Typography variant="h6">
                      {resource.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {resource.role}
                    </Typography>
                  </div>
                </Box>
                
                <Typography variant="subtitle2" gutterBottom>
                  割当タスク一覧
                </Typography>
                
                {resource.assignments && resource.assignments.length > 0 ? (
                  <>
                    {resource.assignments.map((assignment, index) => (
                      <Box key={index} mb={1} py={1} borderBottom={index < resource.assignments.length - 1 ? 1 : 0} borderColor="divider">
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2">
                            {assignment.taskName}
                          </Typography>
                          <Chip 
                            label={`${assignment.hours}時間`} 
                            size="small" 
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                    ))}
                    
                    <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">
                        <strong>合計割当時間</strong>
                      </Typography>
                      <Typography variant="body2">
                        <strong>{resource.assignedHours}時間</strong>
                      </Typography>
                    </Box>
                  </>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    割当タスクはありません
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
  
  // 予算タブの内容
  const renderBudgetTab = () => {
    const totalBudget = calculateTotalBudget();
    
    return (
      <>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper style={{ padding: 16 }}>
              <Typography variant="h6" gutterBottom>
                予算サマリー
              </Typography>
              
              <Box my={3}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  人件費総額
                </Typography>
                <Typography variant="h4" color="primary">
                  ¥{totalBudget.toLocaleString()}
                </Typography>
              </Box>
              
              <Box display="flex" alignItems="center">
                <CheckCircleIcon style={{ color: '#4caf50', marginRight: 8 }} />
                <Typography variant="body2">
                  予算内で進行中
                </Typography>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper style={{ padding: 16 }}>
              <Typography variant="h6" gutterBottom>
                コスト内訳
              </Typography>
              
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>項目</TableCell>
                    <TableCell align="right">金額</TableCell>
                    <TableCell align="right">割合</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>人件費</TableCell>
                    <TableCell align="right">¥{totalBudget.toLocaleString()}</TableCell>
                    <TableCell align="right">100%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={2}>
                      <Typography variant="subtitle2">
                        合計
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2">
                        ¥{totalBudget.toLocaleString()}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Paper>
          </Grid>
        </Grid>
      </>
    );
  };
  
  // タスク割当タブの内容
  const renderTaskAssignmentTab = () => (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>タスク名</TableCell>
              <TableCell>ステータス</TableCell>
              <TableCell>必要工数</TableCell>
              <TableCell>担当者</TableCell>
              <TableCell align="right">アクション</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <AssignmentIcon style={{ marginRight: 8, color: '#1976d2' }} />
                    <div>
                      <Typography variant="body1">
                        {task.title}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {new Date(task.startDate).toLocaleDateString('ja-JP')} 〜 {new Date(task.dueDate || task.endDate).toLocaleDateString('ja-JP')}
                      </Typography>
                    </div>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={task.status === 'completed' ? '完了' : 
                          task.status === 'in_progress' ? '進行中' : 
                          task.status === 'not_started' ? '未着手' : '遅延'} 
                    size="small" 
                    style={{
                      backgroundColor: 
                        task.status === 'completed' ? '#c8e6c9' : 
                        task.status === 'in_progress' ? '#bbdefb' : 
                        task.status === 'not_started' ? '#e0e0e0' : '#ffcdd2',
                      color: 
                        task.status === 'completed' ? '#388e3c' : 
                        task.status === 'in_progress' ? '#1976d2' : 
                        task.status === 'not_started' ? '#616161' : '#d32f2f'
                    }}
                  />
                </TableCell>
                <TableCell>
                  {task.estimatedHours ? `${task.estimatedHours}時間` : '未設定'}
                </TableCell>
                <TableCell>
                  {task.assignedTo ? (
                    <Box display="flex" alignItems="center">
                      <Avatar style={{ width: 24, height: 24, marginRight: 8, fontSize: '0.75rem' }}>
                        {task.assignedTo.name.substr(0, 1)}
                      </Avatar>
                      <Typography variant="body2">
                        {task.assignedTo.name}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      未割当
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="right">
                  <Button 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  >
                    割当変更
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );

  return (
    <div>
      <Box mb={3}>
        <Paper square>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="人員" />
            <Tab label="予算" />
            <Tab label="タスク割当" />
          </Tabs>
        </Paper>
      </Box>
      
      {tabValue === 0 && renderHumanResourcesTab()}
      {tabValue === 1 && renderBudgetTab()}
      {tabValue === 2 && renderTaskAssignmentTab()}
      
      {/* リソース追加/編集ダイアログ */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedResource ? 'リソース編集' : 'リソース追加'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="名前"
                variant="outlined"
                fullWidth
                value={formData.name}
                onChange={handleFormChange('name')}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl variant="outlined" fullWidth margin="normal">
                <InputLabel>リソースタイプ</InputLabel>
                <Select
                  value={formData.type}
                  onChange={handleFormChange('type')}
                  label="リソースタイプ"
                >
                  <MenuItem value="human">人員</MenuItem>
                  <MenuItem value="equipment">設備</MenuItem>
                  <MenuItem value="material">資材</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="役割/説明"
                variant="outlined"
                fullWidth
                value={formData.role}
                onChange={handleFormChange('role')}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                label="稼働率 (%)"
                variant="outlined"
                fullWidth
                type="number"
                value={formData.availability}
                onChange={handleFormChange('availability')}
                margin="normal"
                InputProps={{ inputProps: { min: 0, max: 100 } }}
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                label="時間単価 (円)"
                variant="outlined"
                fullWidth
                type="number"
                value={formData.costPerHour}
                onChange={handleFormChange('costPerHour')}
                margin="normal"
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="default">
            キャンセル
          </Button>
          <Button 
            onClick={handleSaveResource} 
            color="primary" 
            variant="contained"
            disabled={!formData.name}
          >
            {selectedResource ? '更新' : '追加'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ResourceAllocation;