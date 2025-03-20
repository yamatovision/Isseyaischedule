import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { ThemeContext } from '../../contexts/ThemeContext';

// Material-UIコンポーネント
import { 
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  InputBase,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Hidden,
  makeStyles,
  Avatar,
  Tooltip,
  Box
} from '@material-ui/core';
import { alpha } from '@material-ui/core/styles';

// Material-UIアイコン
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import Brightness4Icon from '@material-ui/icons/Brightness4';
import Brightness7Icon from '@material-ui/icons/Brightness7';
import NotificationsIcon from '@material-ui/icons/Notifications';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import SettingsIcon from '@material-ui/icons/Settings';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import PersonIcon from '@material-ui/icons/Person';

// カスタムスタイル
const useStyles = makeStyles((theme) => ({
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    boxShadow: theme.shadows[1],
  },
  toolbar: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
  menuButton: {
    marginRight: theme.spacing(1),
  },
  title: {
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'block',
      marginLeft: theme.spacing(1),
    },
    fontWeight: 600,
    color: theme.palette.primary.main,
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius * 10,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: theme.spacing(3),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(4),
      width: 'auto',
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '30ch',
    },
  },
  grow: {
    flexGrow: 1,
  },
  actionIcons: {
    display: 'flex',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: theme.spacing(1),
  },
  avatar: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    marginLeft: theme.spacing(1),
    cursor: 'pointer',
    backgroundColor: theme.palette.primary.main,
  },
  mobileSearchBar: {
    padding: theme.spacing(1, 2),
    width: '100%',
  },
  profileMenu: {
    minWidth: 200,
  },
  menuHeader: {
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  userName: {
    fontWeight: 500,
  },
  userEmail: {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
  },
  menuIcon: {
    minWidth: 40,
  },
  notificationBadge: {
    top: 4,
    right: 4,
  },
  notificationMenu: {
    width: 320,
    maxWidth: '90vw',
  },
  notificationItem: {
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&:last-child': {
      borderBottom: 'none',
    },
  },
  notificationTime: {
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(0.5),
  },
  notificationHeader: {
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  notificationFooter: {
    padding: theme.spacing(1.5),
    textAlign: 'center',
    borderTop: `1px solid ${theme.palette.divider}`,
  },
  unreadNotification: {
    backgroundColor: alpha(theme.palette.primary.light, 0.05),
  },
  notificationLink: {
    color: theme.palette.primary.main,
    textDecoration: 'none',
    fontWeight: 500,
    '&:hover': {
      textDecoration: 'underline',
    },
  },
}));

/**
 * 共通ヘッダーコンポーネント
 * 
 * アプリケーション全体で使用される共通ヘッダー。
 * ナビゲーション、検索、ユーザーメニュー、テーマ切り替えなどの機能を提供。
 */
const Header = ({ toggleSidebar }) => {
  const classes = useStyles();
  
  // コンテキストからユーザー情報や認証関連機能を取得
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  // テーマコンテキストの利用
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  
  // 検索機能の状態管理
  const [searchTerm, setSearchTerm] = useState('');
  // ユーザーメニューの表示状態
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  // 通知メニューの表示状態
  const [notificationsAnchor, setNotificationsAnchor] = useState(null);
  
  // ダミー通知データ（API実装後に置き換え）
  const notifications = [
    { id: 1, message: '新しいタスクが追加されました', isRead: false, time: '10分前' },
    { id: 2, message: 'プロジェクト「マーケティングキャンペーン」が更新されました', isRead: false, time: '1時間前' },
    { id: 3, message: '明日が期限のタスクがあります', isRead: true, time: '3時間前' }
  ];
  
  // 未読通知の数を計算
  const unreadCount = notifications.filter(notification => !notification.isRead).length;
  
  // ユーザーメニューの表示/非表示を切り替え
  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };
  
  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };
  
  // 通知メニューの表示/非表示を切り替え
  const handleNotificationsOpen = (event) => {
    setNotificationsAnchor(event.currentTarget);
  };
  
  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };
  
  // ログアウト処理
  const handleLogout = async () => {
    handleUserMenuClose();
    await logout();
    // ログアウト後にリダイレクト
    window.location.href = '/login';
  };
  
  // 検索フォームの送信処理
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      console.log('検索キーワード:', searchTerm);
      // ここに検索処理を実装
    }
  };
  
  // ユーザーメニューの表示
  const isUserMenuOpen = Boolean(userMenuAnchor);
  const isNotificationsOpen = Boolean(notificationsAnchor);
  
  return (
    <>
      <AppBar position="fixed" className={classes.appBar} color="default">
        <Toolbar className={classes.toolbar}>
          {/* 左側: ハンバーガーメニューとロゴ */}
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="open drawer"
            onClick={toggleSidebar}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography className={classes.title} variant="h6" noWrap>
            プランナビ
          </Typography>
          
          {/* 中央: 検索バー（デスクトップのみ） */}
          <Hidden xsDown>
            <form onSubmit={handleSearchSubmit} className={classes.search}>
              <div className={classes.searchIcon}>
                <SearchIcon />
              </div>
              <InputBase
                placeholder="プロジェクトやタスクを検索..."
                classes={{
                  root: classes.inputRoot,
                  input: classes.inputInput,
                }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                inputProps={{ 'aria-label': 'search' }}
              />
            </form>
          </Hidden>
          
          <div className={classes.grow} />
          
          {/* 右側: アクションボタン群 */}
          <div className={classes.actionIcons}>
            {/* テーマ切り替えボタン */}
            <Tooltip title={isDarkMode ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}>
              <IconButton
                className={classes.iconButton}
                color="inherit"
                onClick={toggleTheme}
                aria-label={isDarkMode ? 'light mode' : 'dark mode'}
              >
                {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>
            
            {/* 通知ベル */}
            {isAuthenticated && (
              <Tooltip title="通知">
                <IconButton
                  className={classes.iconButton}
                  color="inherit"
                  onClick={handleNotificationsOpen}
                  aria-label="notifications"
                  aria-controls="notifications-menu"
                  aria-haspopup="true"
                >
                  <Badge 
                    badgeContent={unreadCount} 
                    color="secondary"
                    overlap="rectangular"
                    classes={{ badge: classes.notificationBadge }}
                  >
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
            )}
            
            {/* ユーザーアバター */}
            {isAuthenticated ? (
              <Tooltip title="アカウント">
                <Avatar
                  className={classes.avatar}
                  onClick={handleUserMenuOpen}
                  aria-label="account"
                  aria-controls="user-menu"
                  aria-haspopup="true"
                  src={user?.profilePicture}
                >
                  {!user?.profilePicture && (user?.name?.charAt(0) || user?.email?.charAt(0) || 'U')}
                </Avatar>
              </Tooltip>
            ) : (
              <Tooltip title="ログイン">
                <IconButton
                  className={classes.iconButton}
                  color="inherit"
                  component={Link}
                  to="/login"
                  aria-label="login"
                >
                  <AccountCircleIcon />
                </IconButton>
              </Tooltip>
            )}
          </div>
        </Toolbar>
        
        {/* モバイルでのみ表示される検索バー */}
        <Hidden smUp>
          <form onSubmit={handleSearchSubmit} className={classes.mobileSearchBar}>
            <div className={classes.search} style={{ marginLeft: 0, marginRight: 0 }}>
              <div className={classes.searchIcon}>
                <SearchIcon />
              </div>
              <InputBase
                placeholder="検索..."
                classes={{
                  root: classes.inputRoot,
                  input: classes.inputInput,
                }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                inputProps={{ 'aria-label': 'search' }}
              />
            </div>
          </form>
        </Hidden>
      </AppBar>
      
      {/* ユーザーメニュー */}
      <Menu
        id="user-menu"
        anchorEl={userMenuAnchor}
        keepMounted
        open={isUserMenuOpen}
        onClose={handleUserMenuClose}
        getContentAnchorEl={null}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          className: classes.profileMenu,
        }}
      >
        {/* ユーザー情報ヘッダー */}
        {user && [
          <div key="user-header" className={classes.menuHeader}>
            <Typography variant="subtitle1" className={classes.userName}>
              {user.name || 'ユーザー'}
            </Typography>
            <Typography variant="body2" className={classes.userEmail}>
              {user.email}
            </Typography>
          </div>,
          <Divider key="user-divider" />
        ]}
        
        {/* メニュー項目 */}
        <MenuItem component={Link} to="/profile" onClick={handleUserMenuClose}>
          <ListItemIcon className={classes.menuIcon}>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="プロフィール" />
        </MenuItem>
        
        <MenuItem component={Link} to="/settings" onClick={handleUserMenuClose}>
          <ListItemIcon className={classes.menuIcon}>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="設定" />
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleLogout}>
          <ListItemIcon className={classes.menuIcon}>
            <ExitToAppIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="ログアウト" />
        </MenuItem>
      </Menu>
      
      {/* 通知メニュー */}
      <Menu
        id="notifications-menu"
        anchorEl={notificationsAnchor}
        keepMounted
        open={isNotificationsOpen}
        onClose={handleNotificationsClose}
        getContentAnchorEl={null}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          className: classes.notificationMenu,
        }}
      >
        <div className={classes.notificationHeader}>
          <Typography variant="subtitle1" fontWeight="medium">
            通知
          </Typography>
        </div>
        
        {notifications.length === 0 ? (
          <Box p={3} textAlign="center">
            <Typography variant="body2" color="textSecondary">
              通知はありません
            </Typography>
          </Box>
        ) : [
            ...notifications.map((notification) => (
              <MenuItem 
                key={notification.id}
                onClick={handleNotificationsClose}
                className={`${classes.notificationItem} ${!notification.isRead ? classes.unreadNotification : ''}`}
              >
                <div>
                  <Typography variant="body2">
                    {notification.message}
                  </Typography>
                  <Typography variant="caption" className={classes.notificationTime}>
                    {notification.time}
                  </Typography>
                </div>
              </MenuItem>
            )),
            
            <div key="notification-footer" className={classes.notificationFooter}>
              <Link to="/notifications" className={classes.notificationLink} onClick={handleNotificationsClose}>
                すべての通知を見る
              </Link>
            </div>
        ]}
      </Menu>
    </>
  );
};

export default Header;