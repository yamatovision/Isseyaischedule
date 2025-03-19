/**
 * Chat-to-Ganttページ
 * AIチャットを使用したプロジェクト計画作成機能
 * 
 * 変更履歴:
 * - 2025/03/19: 初期実装 (Claude)
 * - 2025/03/19: ガントチャートをモーダル表示に変更 (Claude)
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Paper, Container, Snackbar, 
  Button, CircularProgress, Breadcrumbs, Link,
  Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Tooltip
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import HomeIcon from '@material-ui/icons/Home';
import ChatIcon from '@material-ui/icons/Chat';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import TimelineIcon from '@material-ui/icons/Timeline';
import CloseIcon from '@material-ui/icons/Close';
import FullscreenIcon from '@material-ui/icons/Fullscreen';

import AiChat from '../components/chat/AiChat';
import GanttChart from '../components/project/GanttChart';
import '../assets/css/chat.css';

/**
 * Chat-to-Ganttページコンポーネント
 * チャットインターフェースとガントチャート表示を統合
 */
const ChatToGantt = () => {
  // パラメータとナビゲーション
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  // ステート
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showGanttModal, setShowGanttModal] = useState(false);
  const [fullscreenMode, setFullscreenMode] = useState(false);
  
  // プロジェクト情報のロード
  useEffect(() => {
    if (projectId) {
      loadProjectData();
    } else {
      // プロジェクトなしモード - 仮のプロジェクトIDは使用しない
      setProject(null); // プロジェクトをnullに設定
      setIsLoading(false);
    }
  }, [projectId]);
  
  // プロジェクトデータのロード関数
  const loadProjectData = async () => {
    try {
      setIsLoading(true);
      
      // TODO: 実際のAPIから取得する
      // モックデータを使用
      const mockProject = {
        id: projectId,
        title: 'プロジェクトサンプル',
        description: 'AIを使った計画作成のサンプルプロジェクト',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setProject(mockProject);
      setIsLoading(false);
    } catch (error) {
      console.error('プロジェクトデータ取得エラー:', error);
      setError('プロジェクトの読み込み中にエラーが発生しました');
      setIsLoading(false);
    }
  };
  
  // AIによって生成されたタスクの処理
  const handleTasksGenerated = (generatedTasks) => {
    setTasks(generatedTasks);
    // タスクが生成されたらガントチャートモーダルを自動表示
    if (generatedTasks.length > 0) {
      setShowGanttModal(true);
    }
  };
  
  // タスク更新処理
  const handleTaskUpdate = (updatedTask) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      )
    );
  };
  
  // エラーアラート閉じる
  const handleCloseError = () => {
    setError(null);
  };
  
  // ホーム画面へ移動
  const navigateToHome = () => {
    navigate('/dashboard');
  };
  
  // ガントチャートのモーダル表示切り替え
  const toggleGanttModal = () => {
    setShowGanttModal(!showGanttModal);
  };
  
  // フルスクリーンモード切り替え
  const toggleFullscreen = () => {
    setFullscreenMode(!fullscreenMode);
  };
  
  if (isLoading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          height: 'calc(100vh - 64px)'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
      {/* パンくずリスト */}
      <Box sx={{ px: 3, py: 2, bgcolor: 'background.paper' }}>
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="ナビゲーション"
        >
          <Link 
            color="inherit" 
            href="/dashboard"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            ホーム
          </Link>
          <Link 
            color="inherit"
            href="/projects"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            プロジェクト
          </Link>
          <Typography color="textPrimary" sx={{ display: 'flex', alignItems: 'center' }}>
            <ChatIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            AIプランナー
          </Typography>
        </Breadcrumbs>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
          <Typography variant="h5">
            {project?.title || 'プロジェクト計画'}
          </Typography>
          
          {tasks.length > 0 && (
            <Tooltip title="プロジェクトタイムラインを表示">
              <Button
                variant="outlined"
                color="primary"
                startIcon={<TimelineIcon />}
                onClick={toggleGanttModal}
                size="small"
              >
                タイムライン表示
              </Button>
            </Tooltip>
          )}
        </Box>
      </Box>
      
      {/* メインコンテンツ - チャットのみ表示 */}
      <Box className="chat-container-fullwidth">
        {/* AIチャット */}
        <AiChat 
          onTasksGenerated={handleTasksGenerated} 
          projectData={project}
        />
      </Box>
      
      {/* ガントチャートモーダル */}
      <Dialog
        open={showGanttModal}
        onClose={toggleGanttModal}
        maxWidth="xl"
        fullWidth
        fullScreen={fullscreenMode}
        className="gantt-modal"
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">プロジェクトタイムライン</Typography>
            <Box>
              <Tooltip title={fullscreenMode ? "通常表示" : "全画面表示"}>
                <IconButton size="small" onClick={toggleFullscreen}>
                  <FullscreenIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="閉じる">
                <IconButton size="small" onClick={toggleGanttModal}>
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          {/* ガントチャート */}
          <GanttChart 
            tasks={tasks}
            projectStartDate={new Date(project?.startDate)}
            projectEndDate={new Date(project?.endDate)}
            onTaskUpdate={handleTaskUpdate}
          />
        </DialogContent>
        
        <DialogActions>
          <Button onClick={toggleGanttModal} color="primary">
            閉じる
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* エラー表示 */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
      >
        <Alert onClose={handleCloseError} severity="error" variant="filled">
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ChatToGantt;