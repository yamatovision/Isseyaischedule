import React, { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
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
  Chip
} from '@material-ui/core';

// Material-UIアイコン
import AddIcon from '@material-ui/icons/Add';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import StoreIcon from '@material-ui/icons/Storefront';
import MarketingIcon from '@material-ui/icons/TrendingUp';
import ProductIcon from '@material-ui/icons/Category';
import DocumentIcon from '@material-ui/icons/Description';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

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
}));

/**
 * プロジェクト一覧ページ
 * 
 * ユーザーのプロジェクト一覧を表示するページ。
 * プロジェクトの詳細、進捗状況などを表示します。
 */
const Projects = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  
  // テーマコンテキストの利用
  const { isDarkMode } = useContext(ThemeContext);
  
  // プランフックの使用
  const { 
    plans, 
    loading, 
    error, 
    fetchPlans
  } = usePlans();
  
  // データの読み込み状態
  const [isLoading, setIsLoading] = useState(true);
  
  // エラーメッセージの状態管理
  const [errorMessage, setErrorMessage] = useState('');
  
  // プランデータが変更されたときに表示を更新
  useEffect(() => {
    console.log('【Projects】plans状態が更新されました:', plans);
    setIsLoading(false);
  }, [plans]);
  
  // プランの詳細ページへ遷移
  const handlePlanClick = (planId) => {
    console.log(`プランID: ${planId} の詳細ページへ移動`);
    // React Routerのnavigateを使用
    navigate(`/projects/${planId}`);
  };
  
  // 新規プロジェクト作成画面へ移動
  const handleCreateProject = () => {
    console.log('新規プロジェクト作成画面へ移動');
    navigate('/projects/new');
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
  
  return (
    <div className={classes.root}>
      <Container maxWidth="lg">
        <div className={classes.header}>
          <Typography variant="h4" component="h1" className={classes.title}>
            プロジェクト一覧
          </Typography>
          <Typography variant="subtitle1" className={classes.subtitle}>
            すべてのプロジェクトを管理できます
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
          <>
            {/* プロジェクト一覧 */}
            {plans.length === 0 ? (
              <Card className={classes.emptyStateCard}>
                <DocumentIcon className={classes.emptyStateIcon} />
                <Typography variant="h5" gutterBottom>
                  まだプロジェクトがありません
                </Typography>
                <Typography 
                  variant="body1" 
                  color="textSecondary" 
                  className={classes.emptyStateText}
                  paragraph
                >
                  新しいプロジェクトを作成して、タスクを整理し、プロジェクトの進捗を管理しましょう。
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleCreateProject}
                >
                  新規プロジェクトを作成
                </Button>
              </Card>
            ) : (
              <Grid container spacing={3} className={classes.cardGrid}>
                {plans.map(plan => (
                  <Grid item xs={12} sm={6} md={4} key={plan.id}>
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
                          <IconButton aria-label="設定">
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
                          label={`タスク: ${plan.completedTasks}/${plan.tasks}`} 
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
          </>
        )}
      </Container>
      
      {/* 新規プロジェクト作成ボタン（FAB） */}
      <Fab
        color="primary"
        aria-label="新規プロジェクトを作成"
        className={classes.fab}
        onClick={handleCreateProject}
      >
        <AddIcon />
      </Fab>
    </div>
  );
};

export default Projects;