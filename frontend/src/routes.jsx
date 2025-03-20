import React, { useContext } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import ChatToGantt from './pages/ChatToGantt';
import Settings from './pages/Settings';

/**
 * アプリケーションのルーティング設定
 * 
 * 各URLパスに対応するコンポーネントのマッピングと
 * 認証が必要なルートのリダイレクト設定を行います。
 * 
 * 注意: 一部のページコンポーネントはまだ実装されていないため、
 * 随時インポートして置き換えていきます。
 */

// プレースホルダーコンポーネント（実際のページコンポーネント実装時に置き換え）
const PagePlaceholder = ({ title }) => (
  <div className="p-8">
    <h1 className="text-2xl font-bold mb-4">{title}</h1>
    <p>このページはまだ実装されていません。</p>
  </div>
);

// 認証が必要なルートのラッパーコンポーネント
const PrivateRoute = ({ children, AuthenticatedLayout }) => {
  const location = useLocation();
  const { isAuthenticated, loading } = useContext(AuthContext);
  
  // 読み込み中はローディング表示
  if (loading) {
    console.log('【PrivateRoute】認証状態確認中...');
    return (
      <div className="loading-container" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ marginBottom: '20px', fontSize: '24px', fontWeight: 'bold' }}>
          プランナビ
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '5px solid #f3f3f3',
            borderTop: '5px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}></div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    // ログインしていない場合はログインページにリダイレクト
    console.log('【PrivateRoute】未認証のため、ログインページにリダイレクト');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 認証済みの場合は共通レイアウトを適用
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
};

// ログイン済みユーザーのリダイレクト（ログインページなど）
const PublicOnlyRoute = ({ children }) => {
  const location = useLocation();
  const from = location.state?.from || { pathname: '/dashboard' };
  const { isAuthenticated, loading } = useContext(AuthContext);
  
  // 読み込み中はローディング表示
  if (loading) {
    console.log('【PublicOnlyRoute】認証状態確認中...');
    return (
      <div className="loading-container" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ marginBottom: '20px', fontSize: '24px', fontWeight: 'bold' }}>
          プランナビ
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '5px solid #f3f3f3',
            borderTop: '5px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}></div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }
  
  if (isAuthenticated) {
    // すでにログインしている場合はダッシュボードにリダイレクト
    console.log('【PublicOnlyRoute】認証済みのため、リダイレクト先:', from);
    return <Navigate to={from} replace />;
  }

  // 認証不要のページはそのまま表示
  return children;
};

// アプリケーションのルート設定
const AppRoutes = ({ AuthenticatedLayout }) => {
  return (
    <Routes>
      {/* 認証不要のルート */}
      <Route 
        path="/login" 
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        } 
      />
      <Route 
        path="/register" 
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        } 
      />
      <Route 
        path="/forgot-password" 
        element={
          <PublicOnlyRoute>
            <PagePlaceholder title="パスワード再設定" />
          </PublicOnlyRoute>
        } 
      />
      
      {/* 認証が必要なルート */}
      <Route 
        path="/dashboard" 
        element={
          <PrivateRoute AuthenticatedLayout={AuthenticatedLayout}>
            <Dashboard />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/projects" 
        element={
          <PrivateRoute AuthenticatedLayout={AuthenticatedLayout}>
            <Projects />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/projects/new" 
        element={
          <PrivateRoute AuthenticatedLayout={AuthenticatedLayout}>
            <PagePlaceholder title="新規プロジェクト作成" />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/projects/:id" 
        element={
          <PrivateRoute AuthenticatedLayout={AuthenticatedLayout}>
            <ProjectDetail />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/tasks" 
        element={
          <PrivateRoute AuthenticatedLayout={AuthenticatedLayout}>
            <PagePlaceholder title="タスク一覧" />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/chat-to-gantt" 
        element={
          <PrivateRoute AuthenticatedLayout={AuthenticatedLayout}>
            <ChatToGantt />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/chat-to-gantt/:projectId" 
        element={
          <PrivateRoute AuthenticatedLayout={AuthenticatedLayout}>
            <ChatToGantt />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/calendar" 
        element={
          <PrivateRoute AuthenticatedLayout={AuthenticatedLayout}>
            <PagePlaceholder title="カレンダー" />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <PrivateRoute AuthenticatedLayout={AuthenticatedLayout}>
            <Settings />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/help" 
        element={
          <PrivateRoute AuthenticatedLayout={AuthenticatedLayout}>
            <PagePlaceholder title="ヘルプ" />
          </PrivateRoute>
        } 
      />
      
      {/* デフォルトルート */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* 404ページ */}
      <Route path="*" element={<PagePlaceholder title="ページが見つかりません" />} />
    </Routes>
  );
};

export default AppRoutes;