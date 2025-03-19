/**
 * 解決策表示コンポーネント
 * AIが提案した解決策を表示するコンポーネント
 * 
 * 変更履歴:
 * - 2025/03/19: 初期実装 (Claude)
 */

import React from 'react';
import { 
  Box, Typography, Paper, Chip, Button, Divider, 
  List, ListItem, ListItemText, ListItemIcon, 
  Dialog, DialogTitle, DialogContent, DialogActions 
} from '@material-ui/core';
import InfoIcon from '@material-ui/icons/Info';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import WarningIcon from '@material-ui/icons/Warning';
import BuildIcon from '@material-ui/icons/Build';
import TimerIcon from '@material-ui/icons/Timer';

/**
 * 解決策表示コンポーネント
 */
const SolutionDisplay = ({ 
  open, 
  onClose, 
  taskIssue, 
  solutions, 
  onApplySolution 
}) => {
  if (!solutions || solutions.length === 0) {
    return null;
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      PaperProps={{ 
        sx: { width: '100%', maxWidth: 700 } 
      }}
    >
      <DialogTitle sx={{ bgcolor: '#f5f5f5', py: 2 }}>
        タスクの問題に対する解決策
      </DialogTitle>
      
      <DialogContent>
        {/* 問題の説明 */}
        <Box sx={{ my: 2, p: 2, bgcolor: '#fff3e0', borderRadius: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
            <WarningIcon color="warning" sx={{ mr: 1, mt: 0.2 }} />
            <Typography variant="subtitle1" fontWeight="medium">
              問題の内容
            </Typography>
          </Box>
          <Typography variant="body2">{taskIssue}</Typography>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {/* 解決策リスト */}
        <Typography variant="subtitle1" gutterBottom>
          提案された解決策:
        </Typography>
        
        <List>
          {solutions.map((solution, index) => (
            <Paper 
              key={solution.id || index}
              elevation={1}
              sx={{ 
                mb: 2, 
                p: 2, 
                border: '1px solid #e0e0e0',
                borderLeft: `4px solid ${
                  solution.difficulty === 'easy' ? '#4caf50' :
                  solution.difficulty === 'hard' ? '#f44336' : '#ff9800'
                }`
              }}
            >
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                {solution.description}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                {solution.impact}
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Chip 
                  icon={<BuildIcon />} 
                  label={`難易度: ${
                    solution.difficulty === 'easy' ? '低' :
                    solution.difficulty === 'hard' ? '高' : '中'
                  }`}
                  color={
                    solution.difficulty === 'easy' ? 'success' :
                    solution.difficulty === 'hard' ? 'error' : 'warning'
                  }
                  size="small"
                  variant="outlined"
                />
                
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="small"
                  onClick={() => onApplySolution(solution)}
                >
                  適用する
                </Button>
              </Box>
            </Paper>
          ))}
        </List>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="primary">
          閉じる
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SolutionDisplay;