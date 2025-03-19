import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeContext } from '../../contexts/ThemeContext';

// Material-UIコンポーネント
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Button,
  Hidden,
  makeStyles,
  IconButton,
  Box,
  useTheme
} from '@material-ui/core';

// Material-UIアイコン
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import DashboardIcon from '@material-ui/icons/Dashboard';
import AssignmentIcon from '@material-ui/icons/Assignment';
import ChatIcon from '@material-ui/icons/Chat';
import EventIcon from '@material-ui/icons/Event';
import SettingsIcon from '@material-ui/icons/Settings';
import HelpIcon from '@material-ui/icons/Help';
import AddIcon from '@material-ui/icons/Add';
import FolderIcon from '@material-ui/icons/Folder';

// カスタムスタイル
const useStyles = makeStyles((theme) => ({
  drawer: {
    width: 260,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  drawerPaper: {
    width: 260,
    paddingTop: theme.spacing(7),
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    marginBottom: theme.spacing(1),
  },
  title: {
    fontWeight: 600,
    flexGrow: 1,
    color: theme.palette.primary.main,
    paddingLeft: theme.spacing(2),
  },
  closeButton: {
    marginLeft: theme.spacing(2),
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  linkActive: {
    borderLeft: `4px solid ${theme.palette.primary.main}`,
    backgroundColor: theme.palette.action.selected,
  },
  linkNormal: {
    borderLeft: '4px solid transparent',
  },
  listIcon: {
    minWidth: 40,
  },
  nested: {
    paddingLeft: theme.spacing(2),
  },
  divider: {
    margin: theme.spacing(1, 0),
  },
  newProjectButton: {
    margin: theme.spacing(2),
    textTransform: 'none',
  },
}));

/**
 * サイドバーナビゲーションコンポーネント
 * 
 * アプリケーション全体のナビゲーションを提供するサイドバー。
 * - ダッシュボード
 * - プロジェクト管理
 * - タスク管理
 * - チャット機能
 * - 設定
 * などへのリンクを含みます。
 */
const Sidebar = ({ isOpen, onClose }) => {
  const classes = useStyles();
  const theme = useTheme();
  const location = useLocation();
  
  // テーマコンテキストの利用
  const { isDarkMode } = useContext(ThemeContext);
  
  // ナビゲーションアイテムの定義
  const navigationItems = [
    {
      label: 'ダッシュボード',
      path: '/dashboard',
      icon: <DashboardIcon />,
    },
    {
      label: 'チャット作成',
      path: '/chat-to-gantt',
      icon: <ChatIcon />,
    },
  ];
  
  // サブグループのナビゲーションアイテム
  const settingsItems = [
    {
      label: 'アカウント設定',
      path: '/settings',
      icon: <SettingsIcon />,
    },
  ];
  
  // 新規プロジェクト作成画面へ移動
  const handleCreateProject = () => {
    console.log('新規プロジェクト作成画面へ移動');
    window.location.href = '/projects/new';
  };
  
  // ナビゲーション項目のレンダリング
  const renderNavItems = (items) => (
    <List>
      {items.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <ListItem
            key={item.path}
            component={Link}
            to={item.path}
            button
            className={isActive ? classes.linkActive : classes.linkNormal}
            onClick={onClose}
          >
            <ListItemIcon className={classes.listIcon}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        );
      })}
    </List>
  );
  
  // サイドバーの内容
  const sidebarContent = (
    <div>
      <div className={classes.toolbar}>
        <Typography variant="h6" className={classes.title}>
          プランナビ
        </Typography>
        <Hidden mdUp>
          <IconButton
            edge="end"
            className={classes.closeButton}
            color="inherit"
            onClick={onClose}
            aria-label="close drawer"
          >
            <ChevronLeftIcon />
          </IconButton>
        </Hidden>
      </div>
      
      <Divider />
      
      {/* 新規プロジェクトボタンは削除 */}
      
      {/* メインナビゲーション */}
      {renderNavItems(navigationItems)}
      
      <Divider className={classes.divider} />
      
      {/* 設定系ナビゲーション */}
      {renderNavItems(settingsItems)}
    </div>
  );
  
  return (
    <>
      {/* モバイル用サイドバー（ドロワー） */}
      <Hidden mdUp>
        <Drawer
          variant="temporary"
          anchor="left"
          open={isOpen}
          onClose={onClose}
          classes={{
            paper: classes.drawerPaper,
          }}
          ModalProps={{
            keepMounted: true, // モバイルでのパフォーマンス向上のため
          }}
        >
          {sidebarContent}
        </Drawer>
      </Hidden>
      
      {/* デスクトップ用サイドバー（常時表示） */}
      <Hidden smDown>
        <Drawer
          className={classes.drawer}
          variant="permanent"
          classes={{
            paper: classes.drawerPaper,
          }}
        >
          {sidebarContent}
        </Drawer>
      </Hidden>
    </>
  );
};

export default Sidebar;