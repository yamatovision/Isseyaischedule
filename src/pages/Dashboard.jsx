import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../contexts/ThemeContext';
import usePlans from '../hooks/usePlans';

// Material-UIコンポーネント
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader, 
  CardActions, 
  Button, 
  CircularProgress,
  Box,
  Paper,
  Divider,
  IconButton,
  LinearProgress,
  Fab,
  makeStyles,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  Avatar,
  Menu,
  MenuItem
} from '@material-ui/core';

// Material-UIアイコン
import AddIcon from '@material-ui/icons/Add';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import StoreIcon from '@material-ui/icons/Storefront';
import MarketingIcon from '@material-ui/icons/TrendingUp';
import ProductIcon from '@material-ui/icons/Category';
import DocumentIcon from '@material-ui/icons/Description';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import AssignmentIcon from '@material-ui/icons/Assignment';
import PieChartIcon from '@material-ui/icons/PieChart';
import NotificationsIcon from '@material-ui/icons/Notifications';
import ChatIcon from '@material-ui/icons/Chat';
import DeleteIcon from '@material-ui/icons/Delete';

// カスタムスタイル
const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  header: {
    marginBottom: theme.spacing(4),
  },
  title: {
    fontWeight: 600,
  },
  subtitle: {
    color: theme.palette.text.secondary,
  },
  cardGrid: {
    marginTop: theme.spacing(2),
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: theme.shadows[6],
    },
  },
  cardHeader: {
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(2),
  },
  cardContent: {
    flexGrow: 1,
    padding: theme.spacing(2),
  },
  cardActions: {
    padding: theme.spacing(2),
    justifyContent: 'space-between',
  },
  progressBar: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    height: 8,
    borderRadius: 4,
  },
  progressBarContainer: {
    marginBottom: theme.spacing(2),
  },
  planTypeIcon: {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
  },
  taskChip: {
    backgroundColor: theme.palette.action.hover,
  },
  detailButton: {
    display: 'flex',
    alignItems: 'center',
    color: theme.palette.primary.main,
  },
  fab: {
    position: 'fixed',
    bottom: theme.spacing(3),
    right: theme.spacing(3),
  },
  emptyStateIcon: {
    fontSize: 60,
    color: theme.palette.primary.light,
    marginBottom: theme.spacing(2),
    opacity: 0.8,
  },
  emptyStateCard: {
    padding: theme.spacing(5),
    textAlign: 'center',
  },
  emptyStateText: {
    maxWidth: 500,
    margin: '0 auto',
    marginBottom: theme.spacing(3),
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 300,
  },
  errorCard: {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.dark,
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
  },
  statsCard: {
    height: '100%',
  },
  taskList: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
  taskItem: {
    borderLeft: `4px solid ${theme.palette.grey[300]}`,
    '&.high-priority': {
      borderLeft: `4px solid ${theme.palette.error.main}`,
    },
    '&.medium-priority': {
      borderLeft: `4px solid ${theme.palette.warning.main}`,
    },
    '&.low-priority': {
      borderLeft: `4px solid ${theme.palette.success.main}`,
    },
  },
  taskItemCompleted: {
    textDecoration: 'line-through',
    color: theme.palette.text.disabled,
  },
  sectionTitle: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(2),
  },
  chartContainer: {
    height: 280,
    padding: theme.spacing(2),
  },
  activityItem: {
    padding: theme.spacing(1.5),
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&:last-child': {
      borderBottom: 'none',
    },
  },
  activityHeader: {
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  activityTime: {
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
  },
}));

/**
 * ダッシュボードページ
 * 
 * ユーザーのプロジェクト一覧、進捗状況の概要、直近のタスクを表示するページ。
 * アプリケーションのメインページとして機能します。
 */
const Dashboard = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  
  // テーマコンテキストの利用
  const { isDarkMode } = useContext(ThemeContext);
  
  // プランフックの使用
  const { 
    plans, 
    setPlans,
    loading, 
    error, 
    fetchPlans, 
    fetchStats, 
    fetchUpcomingTasks,
    toggleTaskCompletion,
    deleteProject
  } = usePlans();
  
  // 統計データの状態管理
  const [stats, setStats] = useState({
    completed: 0,
    inProgress: 0,
    notStarted: 0,
    totalTasks: 0
  });
  
  // タスクリストの状態管理
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  
  // データの読み込み状態
  const [isLoading, setIsLoading] = useState(true);
  
  // エラーメッセージの状態管理
  const [errorMessage, setErrorMessage] = useState('');
  
  // メニュー関連の状態管理
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  
  // コンポーネントのマウント時にデータを取得
  useEffect(() => {
    console.log('【ダッシュボード】コンポーネントがマウントされました');
    
    const loadDashboardData = async () => {
      console.log('【ダッシュボード】データの読み込みを開始します');
      setIsLoading(true);
      setErrorMessage('');
      
      try {
        console.log('【ダッシュボード】APIからデータを取得します');
        
        // 統計情報を取得
        const statsResult = await fetchStats();
        if (statsResult && statsResult.data && statsResult.data.stats) {
          console.log('【ダッシュボード】統計情報を取得しました:', statsResult.data.stats);
          setStats(statsResult.data.stats);
        } else {
          console.log('【ダッシュボード】統計情報の取得に失敗しました、デフォルト値を使用します');
          setStats({
            completed: 0,
            inProgress: 0,
            notStarted: 0,
            totalTasks: 0
          });
        }
        
        // 直近のタスク取得
        const tasksResult = await fetchUpcomingTasks();
        if (tasksResult && tasksResult.data && tasksResult.data.tasks) {
          console.log('【ダッシュボード】タスク情報を取得しました:', tasksResult.data.tasks.length, '件');
          setUpcomingTasks(tasksResult.data.tasks);
        } else {
          console.log('【ダッシュボード】タスク情報の取得に失敗しました、空の配列を使用します');
          setUpcomingTasks([]);
        }
        
        // プラン一覧を取得 (既存のfetchPlans関数を使用)
        const plansResult = await fetchPlans();
        if (plansResult && plansResult.length > 0) {
          console.log('【ダッシュボード】プラン情報を取得しました:', plansResult.length, '件');
        }
        
        console.log('【ダッシュボード】APIデータのロードが完了しました');
      } catch (err) {
        console.error('【ダッシュボード】データの取得中にエラーが発生しました:', err);
        setErrorMessage('データの読み込み中にエラーが発生しました。再度お試しください。');
        
        // エラー時はデフォルト値を設定
        setStats({
          completed: 0,
          inProgress: 0,
          notStarted: 0,
          totalTasks: 0
        });
        setUpcomingTasks([]);
      } finally {
        console.log('【ダッシュボード】ローディング状態を解除します');
        setIsLoading(false);
      }
    };
    
    loadDashboardData();
    
    // クリーンアップ関数
    return () => {
      console.log('【ダッシュボード】コンポーネントがアンマウントされました');
    };
  }, [/* 依存配列を空にして初回のみ実行 */]);
  
  // プランの詳細ページへ遷移
  const handlePlanClick = (planId) => {
    console.log(`プランID: ${planId} の詳細ページへ移動`);
    // React Routerのnavigateを使用してリダイレクト
    navigate(`/projects/${planId}`);
  };
  
  // タスクの完了状態を切り替え
  const handleTaskToggle = async (taskId) => {
    const result = await toggleTaskCompletion(taskId);
    
    if (result?.success) {
      // タスクリストを更新
      setUpcomingTasks(upcomingTasks.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      ));
    }
  };
  
  // メニューを閉じる
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPlan(null);
  };
  
  // プロジェクト削除処理
  const handleDeleteProject = async () => {
    if (!selectedPlan) return;
    
    try {
      console.log(`プロジェクト削除: ${selectedPlan.id}`);
      const result = await deleteProject(selectedPlan.id);
      
      if (result.success) {
        console.log('プロジェクト削除成功');
      } else {
        setErrorMessage(result.error || 'プロジェクトの削除に失敗しました');
      }
      
      handleMenuClose();
    } catch (err) {
      console.error('プロジェクト削除エラー:', err);
      setErrorMessage('プロジェクトの削除に失敗しました');
    }
  };
  
  // プランタイプに応じたアイコンを取得
  const getPlanTypeIcon = (type) => {
    switch(type) {
      case 'store':
        return <StoreIcon className={classes.planTypeIcon} />;
      case 'marketing':
        return <MarketingIcon className={classes.planTypeIcon} />;
      case 'product':
        return <ProductIcon className={classes.planTypeIcon} />;
      default:
        return <DocumentIcon className={classes.planTypeIcon} />;
    }
  };
  
  // 日付をフォーマット
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ja-JP', options);
  };
  
  // 進捗状況に応じた色を取得
  const getProgressColor = (progress) => {
    if (progress < 30) return 'secondary';
    if (progress < 70) return 'primary';
    return 'primary';
  };
  
  // タスクの優先度に応じたクラス名を取得
  const getPriorityClass = (priority) => {
    switch(priority) {
      case 'high':
        return 'high-priority';
      case 'medium':
        return 'medium-priority';
      case 'low':
        return 'low-priority';
      default:
        return '';
    }
  };
  
  // 統計情報を表示するカード
  const StatsCard = () => (
    <Card className={classes.statsCard}>
      <CardHeader
        className={classes.cardHeader}
        title={
          <Box display="flex" alignItems="center">
            <PieChartIcon className={classes.planTypeIcon} />
            <Typography variant="h6">統計情報</Typography>
          </Box>
        }
      />
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box mb={2}>
              <Typography variant="body2" gutterBottom>タスク進捗状況</Typography>
              <Box display="flex" justifyContent="space-between" mb={0.5}>
                <Typography variant="body2">完了</Typography>
                <Typography variant="body2">{stats.completed}/{stats.totalTasks}</Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={stats.totalTasks > 0 ? (stats.completed / stats.totalTasks) * 100 : 0} 
                color="primary"
                className={classes.progressBar}
              />
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="h4" align="center" color="primary">
              {stats.completed}
            </Typography>
            <Typography variant="body2" align="center" color="textSecondary">
              完了
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="h4" align="center" style={{ color: '#f59e0b' }}>
              {stats.inProgress}
            </Typography>
            <Typography variant="body2" align="center" color="textSecondary">
              進行中
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="h4" align="center" color="textSecondary">
              {stats.notStarted}
            </Typography>
            <Typography variant="body2" align="center" color="textSecondary">
              未着手
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
  
  // アクティビティ履歴は削除
  
  return (
    <div className={classes.root}>
      <Container maxWidth="lg">
        <div className={classes.header}>
          <Typography variant="h4" component="h1" className={classes.title}>
            ダッシュボード
          </Typography>
          <Typography variant="subtitle1" className={classes.subtitle}>
            プロジェクトとタスクの進捗状況を確認できます
          </Typography>
        </div>
        
        {/* エラーメッセージ表示 */}
        {errorMessage && (
          <Paper className={classes.errorCard} elevation={0}>
            <Typography>{errorMessage}</Typography>
          </Paper>
        )}
        
        {/* ローディング表示 */}
        {isLoading ? (
          <div className={classes.loadingContainer}>
            <CircularProgress />
          </div>
        ) : (
          <Grid container spacing={3}>
            {/* 左側: プロジェクト一覧と直近タスク */}
            <Grid item xs={12} md={8}>
              <Typography variant="h5" className={classes.sectionTitle}>
                進行中のプラン
              </Typography>
              
              {plans.length === 0 ? (
                <Card className={classes.emptyStateCard}>
                  <ChatIcon className={classes.emptyStateIcon} />
                  <Typography variant="h5" gutterBottom>
                    まだプロジェクトがありません
                  </Typography>
                  <Typography 
                    variant="body1" 
                    color="textSecondary" 
                    className={classes.emptyStateText}
                    paragraph
                  >
                    AIチャットでプロジェクト計画を立て、タスクを作成しましょう。
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<ChatIcon />}
                    onClick={() => navigate('/chat-to-gantt')}
                  >
                    チャットでプロジェクト計画を立てる
                  </Button>
                </Card>
              ) : (
                <Grid container spacing={3}>
                  {plans.map(plan => (
                    <Grid item xs={12} sm={6} key={plan.id}>
                      <Card className={classes.card} onClick={() => handlePlanClick(plan.id)}>
                        <CardHeader
                          className={classes.cardHeader}
                          title={
                            <Box display="flex" alignItems="center">
                              {getPlanTypeIcon(plan.type)}
                              <Typography variant="h6">{plan.title}</Typography>
                            </Box>
                          }
                          subheader={`${formatDate(plan.startDate)} - ${formatDate(plan.endDate)}`}
                          action={
                            <IconButton 
                              aria-label="設定"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPlan(plan);
                                setAnchorEl(e.currentTarget);
                              }}
                            >
                              <MoreVertIcon />
                            </IconButton>
                          }
                        />
                        <CardContent className={classes.cardContent}>
                          <Box className={classes.progressBarContainer}>
                            <Box display="flex" justifyContent="space-between">
                              <Typography variant="body2">進捗状況</Typography>
                              <Typography variant="body2">{plan.progress}%</Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={plan.progress}
                              color={getProgressColor(plan.progress)}
                              className={classes.progressBar}
                            />
                          </Box>
                        </CardContent>
                        <Divider />
                        <CardActions className={classes.cardActions}>
                          <Chip 
                            label={`タスク: ${plan.completedTasks || 0}/${plan.tasks || 0}`} 
                            size="small"
                            className={classes.taskChip}
                          />
                          <Button 
                            size="small" 
                            className={classes.detailButton}
                            endIcon={<ChevronRightIcon />}
                          >
                            詳細
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
              
              {/* 直近のタスク */}
              <Typography variant="h5" className={classes.sectionTitle}>
                直近の期限タスク
              </Typography>
              
              {upcomingTasks.length === 0 ? (
                <Card className={classes.emptyStateCard}>
                  <AssignmentIcon className={classes.emptyStateIcon} />
                  <Typography variant="h5" gutterBottom>
                    直近のタスクはありません
                  </Typography>
                  <Typography 
                    variant="body1" 
                    color="textSecondary" 
                    className={classes.emptyStateText}
                  >
                    プロジェクトにタスクを追加すると、ここに表示されます。
                  </Typography>
                </Card>
              ) : (
                <Card>
                  <List className={classes.taskList}>
                    {upcomingTasks.map(task => {
                      const labelId = `task-checkbox-${task.id}`;
                      return (
                        <ListItem
                          key={task.id}
                          dense
                          button
                          className={`${classes.taskItem} ${getPriorityClass(task.priority)}`}
                        >
                          <ListItemIcon>
                            <Checkbox
                              edge="start"
                              checked={task.completed}
                              onChange={() => handleTaskToggle(task.id)}
                              tabIndex={-1}
                              disableRipple
                              inputProps={{ 'aria-labelledby': labelId }}
                              color="primary"
                            />
                          </ListItemIcon>
                          <ListItemText
                            id={labelId}
                            primary={
                              <Typography 
                                variant="body1"
                                className={task.completed ? classes.taskItemCompleted : ''}
                              >
                                {task.title}
                              </Typography>
                            }
                            secondary={
                              <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="caption" color="textSecondary">
                                  {task.project}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  期限: {formatDate(task.dueDate)}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                </Card>
              )}
            </Grid>
            
            {/* 右側: 統計情報 */}
            <Grid item xs={12} md={4}>
              <Grid container spacing={3} direction="column">
                <Grid item>
                  <StatsCard />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        )}
      </Container>
      
      {/* 新規プロジェクト作成ボタン（FAB） */}
      <Fab
        color="primary"
        aria-label="チャットでプロジェクト計画を立てる"
        className={classes.fab}
        onClick={() => navigate('/chat-to-gantt')}
      >
        <ChatIcon />
      </Fab>
      
      {/* プロジェクトアクションメニュー */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          handleMenuClose();
          if (selectedPlan) navigate(`/projects/${selectedPlan.id}`);
        }}>
          <ListItemIcon>
            <ChevronRightIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="詳細を表示" />
        </MenuItem>
        <MenuItem onClick={handleDeleteProject}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="削除" />
        </MenuItem>
      </Menu>
      
      {/* 確認ダイアログ */}
    </div>
  );
};

export default Dashboard;