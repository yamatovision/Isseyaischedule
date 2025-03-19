import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, Button, FormControl, InputLabel, 
  Select, MenuItem, Grid, FormHelperText
} from '@material-ui/core';

/**
 * タスク追加/編集用ダイアログ
 * 
 * 新しいタスクの追加や既存タスクの編集を行うためのダイアログコンポーネント。
 * フォーム入力のバリデーションと送信処理を含みます。
 */
const AddTaskDialog = ({ 
  open, 
  onClose, 
  onSave, 
  task, 
  projectStartDate, 
  projectEndDate 
}) => {
  // エラー状態
  const [errors, setErrors] = useState({});
  
  // フォームデータの初期化
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: projectStartDate,
    dueDate: '',
    priority: 'medium',
    status: 'not_started',
    tags: []
  });
  
  // 編集モードかどうか
  const isEditMode = Boolean(task);
  
  // タスクデータが変更されたらフォームデータを更新
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        startDate: task.startDate || projectStartDate,
        dueDate: task.dueDate || task.endDate || '',
        priority: task.priority || 'medium',
        status: task.status || 'not_started',
        tags: task.tags || []
      });
      setErrors({});
    } else {
      // 新規作成時は初期値をセット
      setFormData({
        title: '',
        description: '',
        startDate: projectStartDate,
        dueDate: '',
        priority: 'medium',
        status: 'not_started',
        tags: []
      });
      setErrors({});
    }
  }, [task, projectStartDate, projectEndDate]);
  
  // 入力変更ハンドラー
  const handleChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
    
    // エラーをクリア
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };
  
  // 保存ハンドラー
  const handleSave = () => {
    // バリデーション
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'タスク名は必須です';
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = '期限日は必須です';
    }
    
    // 開始日と期限日のチェック
    if (formData.startDate && formData.dueDate) {
      const start = new Date(formData.startDate);
      const due = new Date(formData.dueDate);
      
      if (due < start) {
        newErrors.dueDate = '期限日は開始日より後に設定してください';
      }
    }
    
    // プロジェクト期間内かチェック
    if (formData.startDate && projectStartDate) {
      const taskStart = new Date(formData.startDate);
      const projectStart = new Date(projectStartDate);
      
      if (taskStart < projectStart) {
        newErrors.startDate = 'タスクの開始日はプロジェクトの開始日以降に設定してください';
      }
    }
    
    if (formData.dueDate && projectEndDate) {
      const taskDue = new Date(formData.dueDate);
      const projectEnd = new Date(projectEndDate);
      
      if (taskDue > projectEnd) {
        newErrors.dueDate = 'タスクの期限日はプロジェクトの終了日以前に設定してください';
      }
    }
    
    // エラーがあればセットして処理中断
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // タスクデータをフォーマット
    const taskData = {
      ...formData,
      // ステータスが完了の場合は進捗を100%に設定
      progress: formData.status === 'completed' ? 100 : (task?.progress || 0),
      // 完了日時の設定
      completedDate: formData.status === 'completed' ? new Date().toISOString() : null
    };
    
    // 親コンポーネントのハンドラーを呼び出し
    onSave(taskData);
  };
  
  // ダイアログのタイトル
  const dialogTitle = isEditMode ? 'タスクを編集' : '新規タスクを追加';
  
  // 入力日付を日本標準フォーマットに変換
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      aria-labelledby="task-dialog-title"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="task-dialog-title">{dialogTitle}</DialogTitle>
      
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="title"
          label="タスク名"
          type="text"
          fullWidth
          value={formData.title}
          onChange={handleChange('title')}
          error={Boolean(errors.title)}
          helperText={errors.title}
        />
        
        <TextField
          margin="dense"
          id="description"
          label="説明"
          multiline
          rows={3}
          fullWidth
          value={formData.description}
          onChange={handleChange('description')}
        />
        
        <Grid container spacing={2} style={{ marginTop: 8 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              id="startDate"
              label="開始日"
              type="date"
              fullWidth
              value={formatDateForInput(formData.startDate)}
              onChange={handleChange('startDate')}
              InputLabelProps={{ shrink: true }}
              error={Boolean(errors.startDate)}
              helperText={errors.startDate}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              id="dueDate"
              label="期限日"
              type="date"
              fullWidth
              required
              value={formatDateForInput(formData.dueDate)}
              onChange={handleChange('dueDate')}
              InputLabelProps={{ shrink: true }}
              error={Boolean(errors.dueDate)}
              helperText={errors.dueDate}
            />
          </Grid>
        </Grid>
        
        <Grid container spacing={2} style={{ marginTop: 8 }}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="priority-label">優先度</InputLabel>
              <Select
                labelId="priority-label"
                id="priority"
                value={formData.priority}
                onChange={handleChange('priority')}
              >
                <MenuItem value="high">高</MenuItem>
                <MenuItem value="medium">中</MenuItem>
                <MenuItem value="low">低</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="status-label">ステータス</InputLabel>
              <Select
                labelId="status-label"
                id="status"
                value={formData.status}
                onChange={handleChange('status')}
              >
                <MenuItem value="not_started">未着手</MenuItem>
                <MenuItem value="in_progress">進行中</MenuItem>
                <MenuItem value="completed">完了</MenuItem>
              </Select>
              <FormHelperText>
                完了に設定すると、進捗率が100%に設定されます
              </FormHelperText>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="default">
          キャンセル
        </Button>
        <Button onClick={handleSave} color="primary" variant="contained">
          {isEditMode ? '更新' : '追加'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddTaskDialog;