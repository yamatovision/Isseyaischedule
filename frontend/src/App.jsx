import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider as CustomThemeProvider } from './contexts/ThemeContext';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@material-ui/core/styles';
import { CssBaseline } from '@material-ui/core';
import { blue, grey } from '@material-ui/core/colors';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import ErrorBoundary from './components/common/ErrorBoundary';
import AppRoutes from './routes';

// デバッグログの有効化
console.log('【アプリケーション】起動します');

// レイアウトコンポーネント - 認証済みページ用
const AuthenticatedLayout = ({ children }) => {
  console.log('【レイアウト】AuthenticatedLayoutがレンダリングされました');
  
  // サイドバーの開閉状態を管理
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // MUIテーマの使用
  const theme = createTheme();
  
  // ウィンドウのリサイズを監視し、モバイル表示時にサイドバーを自動的に閉じる
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // サイドバーの開閉を切り替える
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh',
      overflow: 'hidden'
    }}>
      {/* サイドバー */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        flexGrow: 1,
        overflow: 'hidden'
      }}>
        {/* ヘッダー */}
        <Header toggleSidebar={toggleSidebar} />
        
        {/* メインコンテンツ */}
        <main style={{
          flexGrow: 1,
          padding: theme.spacing(3),
          paddingTop: theme.spacing(10),
          overflowY: 'auto',
          overflowX: 'hidden'
        }}>
          {children}
        </main>
      </div>
    </div>
  );
};

/**
 * アプリケーションのルートコンポーネント
 * 
 * アプリケーション全体のレイアウトを定義し、
 * 共通のプロバイダーやコンポーネントを提供します。
 */
const AppContent = () => {
  return <AppRoutes AuthenticatedLayout={AuthenticatedLayout} />;
};

// MUIのテーマ設定
const createAppTheme = (isDarkMode) => {
  return createTheme({
    palette: {
      type: isDarkMode ? 'dark' : 'light',
      primary: blue,
      secondary: {
        main: '#f50057',
      },
      background: {
        default: isDarkMode ? '#121212' : '#f5f5f5',
        paper: isDarkMode ? '#1e1e1e' : '#ffffff',
      },
    },
    typography: {
      fontFamily: [
        'Roboto',
        'Hiragino Sans',
        'Meiryo',
        'sans-serif',
      ].join(','),
    },
    overrides: {
      MuiCard: {
        root: {
          borderRadius: 8,
        },
      },
      MuiButton: {
        root: {
          borderRadius: 6,
          textTransform: 'none',
        },
      },
    },
  });
};

// プロバイダーを含むルートコンポーネント
const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // テーマの切り替え関数
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };
  
  // MUIテーマの生成
  const muiTheme = createAppTheme(isDarkMode);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <CustomThemeProvider value={{ isDarkMode, toggleTheme }}>
          <MuiThemeProvider theme={muiTheme}>
            <CssBaseline />
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          </MuiThemeProvider>
        </CustomThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;