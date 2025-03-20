import React, { useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../contexts/ThemeContext';
import useProject from '../hooks/useProject';

// Material-UIコンポーネント
import { 
  Container, 
  Grid, 
  Typography, 
  Paper, 
  Tabs, 
  Tab, 
  Box, 
  Button, 
  IconButton, 
  CircularProgress,
  Chip,
  Divider,
  makeStyles
} from '@material-ui/core';

// タスク表示コンポーネント
import GanttChart from '../components/project/GanttChart';

// Material-UIアイコン
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import ShareIcon from '@material-ui/icons/Share';
import GetAppIcon from '@material-ui/icons/GetApp';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import PeopleIcon from '@material-ui/icons/People';
import AssignmentIcon from '@material-ui/icons/Assignment';
import SettingsIcon from '@material-ui/icons/Settings';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';

// プロジェクト詳細コンポーネント
import TaskTable from '../components/project/TaskTable';
import ProgressChart from '../components/project/ProgressChart';
import ResourceAllocation from '../components/project/ResourceAllocation';

// スタイル
import '../assets/css/plan.css';

// カスタムスタイル
const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(3),
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    '& > *': {
      marginLeft: theme.spacing(1),
    },
  },
  title: {
    fontWeight: 600,
  },
  tabsContainer: {
    marginBottom: theme.spacing(3),
  },
  tabPanel: {
    marginTop: theme.spacing(2),
  },
  paper: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  summaryBox: {
    marginBottom: theme.spacing(3),
  },
  progressInfo: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
  },
  progressText: {
    marginLeft: theme.spacing(2),
  },
  progressCircle: {
    position: 'relative',
    display: 'inline-flex',
  },
  circleText: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskStatusChips: {
    display: 'flex',
    marginTop: theme.spacing(2),
    '& > *': {
      marginRight: theme.spacing(1),
    },
  },
  riskAlert: {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.dark,
    padding: theme.spacing(2),
    marginBottom: theme.spacing(3),
    display: 'flex',
    alignItems: 'center',
  },
  riskIcon: {
    marginRight: theme.spacing(1),
    color: theme.palette.error.main,
  },
  solutionButton: {
    marginLeft: 'auto',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 300,
  },
  addButton: {
    position: 'fixed',
    bottom: theme.spacing(3),
    right: theme.spacing(3),
  },
  infoItem: {
    marginBottom: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
  },
  errorContainer: {
    padding: theme.spacing(3),
    textAlign: 'center',
  }
}));

// タブパネルコンポーネント
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={0}>{children}</Box>}
    </div>
  );
}

/**
 * プロジェクト詳細ページ
 * 
 * プロジェクトの詳細情報、タスク一覧、進捗情報、リソース配分を表示するページ。
 * プロジェクト管理の中核となるページです。
 * 
 * 最適化メモ:
 * - APIリクエストの最適化のため、重複したデータ取得を削減
 * - タスク操作後の明示的なデータ再取得を排除し、ローカル状態のみを更新
 * - 統計情報はAPIを呼び出さずにフロントエンドで計算
 * - 冗長な実装（components/project/ProjectDetail.jsx）を削除して統合
 */
const ProjectDetail = () => {
  const classes = useStyles();
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useContext(ThemeContext);
  
  // URLのIDパラメータからプロジェクトIDを取得
  const projectId = id;
  console.log(`【デバッグ】URLプロジェクトID: ${projectId}`);
  
  // useProjectフックを使用してプロジェクト詳細データを取得
  const { 
    project, 
    tasks, 
    stats,
    loading,
    error,
    updateProject,
    createTask,
    updateTask,
    deleteTask,
    calculateProjectStats
  } = useProject(projectId);
  
  // 状態管理
  const [tabValue, setTabValue] = useState(0);
  
  // タブ変更ハンドラー
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // 戻るボタンのハンドラー
  const handleBack = () => {
    navigate('/dashboard');
  };
  
  // プロジェクト編集ボタンのハンドラー
  const handleEdit = () => {
    console.log('プロジェクト編集');
    // 編集モーダルを表示する処理をここに追加
  };
  
  // 新規タスク追加ボタンのハンドラー
  const handleAddTask = () => {
    console.log('新規タスク追加');
    // タスク追加モーダルを表示する処理をここに追加
  };
  
  // タスク操作ハンドラー
  const handleTaskUpdate = async (taskId, taskData) => {
    console.log(`タスク更新: ${taskId}`, taskData);
    await updateTask(taskId, taskData);
  };
  
  const handleTaskDelete = async (taskId) => {
    console.log(`タスク削除: ${taskId}`);
    await deleteTask(taskId);
  };
  
  const handleTaskToggle = async (taskId, status, progress) => {
    console.log(`タスク完了切替: ${taskId}`, status, progress);
    // タスクの状態を更新
    await updateTask(taskId, { status, progress });
    // 明示的なAPI再取得は不要 - updateTask内で状態更新とcalculateProjectStatsを呼び出している
  };
  
  // ローディング中の表示
  if (loading) {
    return (
      <div className={classes.loadingContainer}>
        <CircularProgress />
      </div>
    );
  }
  
  // エラー発生時の表示
  if (error) {
    // データのロード再試行
    const handleRetry = async () => {
      try {
        setLoading(true);
        // プロジェクト取得とタスク一覧取得を再試行
        await fetchProject();
        await fetchTasks();
        calculateProjectStats();
        setError(null);
      } catch (err) {
        console.error('再試行中にエラーが発生しました:', err);
      } finally {
        setLoading(false);
      }
    };

    return (
      <Container className={classes.root}>
        <Paper className={classes.errorContainer}>
          <Typography variant="h6" color="error" gutterBottom>
            {error}
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            プロジェクトIDが正しいか確認してください。ID: {id}
          </Typography>
          <Box display="flex" justifyContent="space-between">
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleBack}
            >
              ダッシュボードに戻る
            </Button>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={handleRetry}
            >
              再試行
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }
  
  // プロジェクトが見つからない場合の表示
  if (!project) {
    // データのロード再試行
    const handleRetry = async () => {
      try {
        setLoading(true);
        // プロジェクト取得とタスク一覧取得を再試行
        await fetchProject();
        await fetchTasks();
        calculateProjectStats();
      } catch (err) {
        console.error('再試行中にエラーが発生しました:', err);
      } finally {
        setLoading(false);
      }
    };

    return (
      <Container className={classes.root}>
        <Paper className={classes.errorContainer}>
          <Typography variant="h6" gutterBottom>
            プロジェクトが見つかりません
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            プロジェクトIDが正しいか確認してください。ID: {id}
          </Typography>
          <Box display="flex" justifyContent="space-between">
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleBack}
            >
              ダッシュボードに戻る
            </Button>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={handleRetry}
            >
              再試行
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }
  
  return (
    <div className={classes.root}>
      <Container maxWidth="lg">
        {/* ヘッダー部分 */}
        <div className={classes.header}>
          <div>
            <Typography variant="h4" component="h1" className={classes.title}>
              {project.title}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {project.type}・{new Date(project.startDate).toLocaleDateString('ja-JP')} 〜 {new Date(project.endDate).toLocaleDateString('ja-JP')}
            </Typography>
          </div>
          <div className={classes.headerActions}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<ShareIcon />}
            >
              共有
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<GetAppIcon />}
            >
              エクスポート
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              onClick={handleEdit}
            >
              編集
            </Button>
            <IconButton>
              <MoreVertIcon />
            </IconButton>
          </div>
        </div>
        
        {/* リスクアラート（該当する場合のみ表示） */}
        {project.isAtRisk && (
          <Paper className={classes.riskAlert} elevation={0}>
            <ErrorOutlineIcon className={classes.riskIcon} />
            <div>
              <Typography variant="subtitle1" component="h3">
                <strong>このプロジェクトはリスクが検出されています</strong>
              </Typography>
              <Typography variant="body2">
                {project.riskFactors && project.riskFactors.join('、')}
              </Typography>
            </div>
            <Button 
              variant="contained" 
              color="primary" 
              className={classes.solutionButton}
            >
              解決策を提案
            </Button>
          </Paper>
        )}
        
        {/* 概要情報 */}
        <Grid container spacing={3} className={classes.summaryBox}>
          <Grid item xs={12} md={8}>
            <Paper className={classes.paper}>
              <Typography variant="h6" gutterBottom>
                プロジェクト概要
              </Typography>
              <Typography variant="body1" paragraph>
                {project.description}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <div className={classes.infoItem}>
                    <CalendarTodayIcon fontSize="small" className={classes.infoIcon} />
                    <Typography variant="body2">
                      期間: {new Date(project.startDate).toLocaleDateString('ja-JP')} 〜 {new Date(project.endDate).toLocaleDateString('ja-JP')}
                    </Typography>
                  </div>
                  <div className={classes.infoItem}>
                    <PeopleIcon fontSize="small" className={classes.infoIcon} />
                    <Typography variant="body2">
                      メンバー: {project.members ? project.members.length : 0}名
                    </Typography>
                  </div>
                </Grid>
                <Grid item xs={12} md={6}>
                  <div className={classes.infoItem}>
                    <AssignmentIcon fontSize="small" className={classes.infoIcon} />
                    <Typography variant="body2">
                      タスク: 全{stats?.totalTasks || 0}件
                    </Typography>
                  </div>
                  <div className={classes.infoItem}>
                    <CalendarTodayIcon fontSize="small" className={classes.infoIcon} />
                    <Typography variant="body2">
                      残り日数: {stats?.timeRemaining || 0}日
                    </Typography>
                  </div>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper className={classes.paper}>
              <Typography variant="h6" gutterBottom>
                進捗状況
              </Typography>
              <div className={classes.progressInfo}>
                <div className={classes.progressCircle}>
                  <CircularProgress
                    variant="determinate"
                    value={project.progress}
                    size={60}
                    thickness={4}
                    color="primary"
                  />
                  <div className={classes.circleText}>
                    <Typography variant="body2" component="div">
                      {`${project.progress}%`}
                    </Typography>
                  </div>
                </div>
                <div className={classes.progressText}>
                  <Typography variant="body1">
                    {stats?.completedTasks || 0}/{stats?.totalTasks || 0} タスク完了
                  </Typography>
                </div>
              </div>
              
              <Divider />
              
              <div className={classes.taskStatusChips}>
                <Chip 
                  label={`完了: ${stats?.completedTasks || 0}`} 
                  size="small" 
                  color="primary"
                />
                <Chip 
                  label={`進行中: ${stats?.inProgressTasks || 0}`} 
                  size="small" 
                  color="secondary"
                />
                <Chip 
                  label={`未着手: ${stats?.notStartedTasks || 0}`} 
                  size="small"
                />
              </div>
            </Paper>
          </Grid>
        </Grid>
        
        {/* タブナビゲーション */}
        <Paper className={classes.tabsContainer}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="タイムライン" />
            <Tab label="タスク" />
            <Tab label="進捗" />
            {/* リソースとプロジェクト設定は未完成のため一時的に非表示 */}
            {/* <Tab label="リソース" /> */}
            {/* <Tab label="設定" /> */}
          </Tabs>
        </Paper>
        
        {/* タブパネル */}
        <div className={classes.tabPanel}>
          <TabPanel value={tabValue} index={0}>
            {project && (
              <GanttChart 
                tasks={tasks}
                projectStartDate={project.startDate}
                projectEndDate={project.endDate}
                onTaskUpdate={handleTaskUpdate}
              />
            )}
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <TaskTable 
              tasks={tasks}
              onTaskUpdate={handleTaskUpdate}
              onTaskDelete={handleTaskDelete}
              onTaskToggle={handleTaskToggle}
            />
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <ProgressChart 
              stats={stats}
              weeklyProgress={tasks && tasks.length > 0 ? [
                { weekLabel: '第1週', actualProgress: project.progress > 20 ? 20 : project.progress, plannedProgress: 20 },
                { weekLabel: '第2週', actualProgress: project.progress > 40 ? 40 : project.progress, plannedProgress: 40 },
                { weekLabel: '第3週', actualProgress: project.progress > 60 ? 60 : project.progress, plannedProgress: 60 },
                { weekLabel: '第4週', actualProgress: project.progress > 80 ? 80 : project.progress, plannedProgress: 80 },
                { weekLabel: '第5週', actualProgress: project.progress, plannedProgress: 100 }
              ] : []}
            />
          </TabPanel>
          
          {/* リソースと設定のタブパネルを非表示
          <TabPanel value={tabValue} index={3}>
            <ResourceAllocation 
              tasks={tasks}
              onAddResource={(resource) => console.log('リソース追加:', resource)}
              onEditResource={(id, resource) => console.log(`リソース編集 ${id}:`, resource)}
              onRemoveResource={(id) => console.log(`リソース削除: ${id}`)}
            />
          </TabPanel>
          
          <TabPanel value={tabValue} index={4}>
            <Typography variant="body1">
              プロジェクト設定はまだ実装されていません。
            </Typography>
          </TabPanel>
          */}
        </div>
      </Container>
      
      {/* 新規タスク追加ボタン */}
      <Button
        className={classes.addButton}
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={handleAddTask}
      >
        新規タスク
      </Button>
    </div>
  );
};

export default ProjectDetail;