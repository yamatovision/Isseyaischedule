import { useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

/**
 * 認証機能を扱うカスタムフック
 * 
 * 認証コンテキストの機能を使いやすくラップし、追加の機能も提供します。
 * - ログイン
 * - ログアウト
 * - 新規登録
 * - 認証状態の確認
 * - 認証が必要なページへのリダイレクト処理
 */
const useAuth = () => {
  // 認証コンテキストから状態と関数を取得
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  
  // 未認証時にリダイレクトする関数
  const requireAuth = useCallback((redirectTo = '/login') => {
    if (!auth.isAuthenticated && !auth.loading) {
      console.log('【認証】未認証ユーザーをリダイレクトします', redirectTo);
      navigate(redirectTo, { replace: true });
      return false;
    }
    return true;
  }, [auth.isAuthenticated, auth.loading, navigate]);
  
  // 認証済みのユーザーをリダイレクトする関数（ログインページなどで使用）
  const redirectIfAuthenticated = useCallback((redirectTo = '/dashboard') => {
    if (auth.isAuthenticated && !auth.loading) {
      console.log('【認証】認証済みユーザーをリダイレクトします', redirectTo);
      navigate(redirectTo, { replace: true });
      return true;
    }
    return false;
  }, [auth.isAuthenticated, auth.loading, navigate]);
  
  // ログイン後のリダイレクト処理付きログイン関数
  const loginWithRedirect = useCallback(async (credentials, redirectTo = '/dashboard') => {
    try {
      const result = await auth.login(credentials);
      if (result) {
        console.log('【認証】ログイン成功後にリダイレクトします', redirectTo);
        navigate(redirectTo, { replace: true });
      }
      return result;
    } catch (error) {
      console.error('【認証エラー】ログインに失敗しました', error);
      throw error;
    }
  }, [auth.login, navigate]);
  
  // ログアウト後のリダイレクト処理付きログアウト関数
  const logoutWithRedirect = useCallback(async (redirectTo = '/login') => {
    try {
      await auth.logout();
      console.log('【認証】ログアウト後にリダイレクトします', redirectTo);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      console.error('【認証エラー】ログアウトに失敗しました', error);
      throw error;
    }
  }, [auth.logout, navigate]);
  
  return {
    // 認証コンテキストの状態と関数
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    loading: auth.loading,
    error: auth.error,
    login: auth.login,
    register: auth.register,
    logout: auth.logout,
    
    // 追加の便利関数
    requireAuth,
    redirectIfAuthenticated,
    loginWithRedirect,
    logoutWithRedirect
  };
};

export default useAuth;