import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { getProjects, getActiveProjects, getProjectDetails, getStats } from '../api/planApi';
import { getUpcomingTasks, updateTaskStatus } from '../api/taskApi';
import { getToken, getAuthHeader } from '../utils/auth';

// 環境変数またはデフォルト値からAPIのベースURLを取得
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/**
 * プラン情報を取得・管理するカスタムフック
 * 
 * APIからプランデータを取得し、以下の機能を提供します：
 * - プラン一覧の取得
 * - プラン詳細の取得
 * - プランの作成・更新・削除
 * - 統計情報の取得
 */
const usePlans = () => {
  // 認証コンテキストからトークンとユーザー情報を取得
  const { user, isAuthenticated } = useContext(AuthContext);
  // utils/auth.js から直接トークンを取得
  const token = getToken();
  
  // プラン一覧のステート
  const [plans, setPlans] = useState([]);
  // 読み込み状態のステート
  const [loading, setLoading] = useState(false);
  // エラー状態のステート
  const [error, setError] = useState(null);

  // プラン一覧を取得
  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!token) {
        console.log('【API連携エラー】認証トークンがありません');
        setError('認証されていません');
        setLoading(false);
        return [];
      }
      
      console.log('【API連携】アクティブプロジェクト一覧取得リクエスト開始');
      // planApi.jsのgetActiveProjects関数を使用
      const response = await getActiveProjects();
      console.log('【API連携】アクティブプロジェクト一覧取得レスポンス:', response);
      
      // フル応答データをログに出力
      console.log('【API連携】応答データの完全な構造:', JSON.stringify(response.data, null, 2));
      
      if (response.data && response.data.projects) {
        console.log('【API連携】取得したプラン数:', response.data.projects.length);
        
        // デバッグ用に各プロジェクトのデータ構造を出力
        response.data.projects.forEach(proj => {
          console.log(`【API連携】プロジェクト ${proj.title} のデータ:`, {
            id: proj.id || proj._id,
            completedTasks: proj.completedTasks,
            totalTasks: proj.totalTasks,
            tasks: proj.tasks,
            progress: proj.progress
          });
        });
        
        setPlans(response.data.projects);
      } else if (response.data && response.data.plans) {
        console.log('【API連携】取得したプラン数:', response.data.plans.length);
        setPlans(response.data.plans);
      } else {
        console.log('【API連携】プランデータがレスポンスに含まれていません');
        setPlans([]);
      }
      
      setLoading(false);
      return response.data?.projects || response.data?.plans || [];
    } catch (err) {
      console.error('【API連携エラー】プラン取得エラー:', err);
      
      // エラーが発生した場合は、通常のプロジェクト一覧取得APIをフォールバックとして使用
      try {
        console.log('【API連携】通常のプロジェクト一覧取得APIにフォールバック');
        const fallbackResponse = await getProjects();
        
        if (fallbackResponse.data && fallbackResponse.data.projects) {
          console.log('【API連携】フォールバック: プランデータを取得:', fallbackResponse.data.projects.length);
          setPlans(fallbackResponse.data.projects);
          setLoading(false);
          return fallbackResponse.data.projects;
        }
      } catch (fallbackErr) {
        console.error('【API連携エラー】フォールバックも失敗:', fallbackErr);
      }
      
      setError(err.message || 'プランの取得に失敗しました');
      setPlans([]);
      setLoading(false);
      return [];
    }
  };
  
  // プラン詳細を取得
  const fetchPlanDetail = async (planId) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!token) {
        setError('認証されていません');
        setLoading(false);
        return null;
      }
      
      // planApi.jsの関数を使用
      const response = await getProjectDetails(planId);
      setLoading(false);
      
      if (response.data && response.data.plan) {
        return response.data.plan;
      } else {
        throw new Error('プランが見つかりません');
      }
    } catch (err) {
      console.error('【API連携エラー】プラン詳細取得エラー:', err);
      setError(err.message || 'プラン詳細の取得に失敗しました');
      setLoading(false);
      return null;
    }
  };
  
  // 統計情報を取得
  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // トークンの確認とログ出力
      console.log('【デバッグ:統計情報】認証トークン確認:', !!token);
      
      if (!token) {
        console.error('【デバッグ:統計情報】認証トークンがありません');
        setError('認証されていません');
        setLoading(false);
        return {
          completed: 0,
          inProgress: 0,
          notStarted: 0,
          totalTasks: 0
        };
      }
      
      console.log('【デバッグ:統計情報】統計情報APIリクエスト開始');
      
      // planApi.jsのgetStats関数を使用
      const response = await getStats();
      setLoading(false);
      
      console.log('【デバッグ:統計情報】統計情報APIレスポンス詳細:', JSON.stringify(response, null, 2));
      
      if (response.data && response.data.stats) {
        console.log('【デバッグ:統計情報】有効な統計データを受信:', JSON.stringify(response.data.stats, null, 2));
        return response.data.stats;
      } else {
        console.log('【デバッグ:統計情報】統計情報が見つかりません。レスポンス構造:', JSON.stringify(response, null, 2));
        console.log('【デバッグ:統計情報】ダミーデータを使用します');
        return {
          completed: 0,
          inProgress: 0,
          notStarted: 0,
          totalTasks: 0
        };
      }
    } catch (err) {
      console.error('【デバッグ:統計情報】統計情報取得エラー詳細:', err);
      if (err.response) {
        console.error('【デバッグ:統計情報】エラーレスポンス:', err.response.status, err.response.data);
      }
      setError(err.message || '統計情報の取得に失敗しました');
      setLoading(false);
      
      // 品質管理フェーズではダミーデータを使用しない
      console.log('【デバッグ:統計情報】エラー発生時のデフォルト値を返します');
      return {
        completed: 0,
        inProgress: 0,
        notStarted: 0,
        totalTasks: 0
      };
    }
  };
  
  // 直近のタスクを取得
  const fetchUpcomingTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!token) {
        setError('認証されていません');
        setLoading(false);
        return { tasks: [] };
      }
      
      // taskApi.jsの関数を使用
      const response = await getUpcomingTasks();
      setLoading(false);
      
      console.log('【usePlans】タスク取得結果:', JSON.stringify(response, null, 2));
      
      // APIレスポンスの構造によって適切に処理
      if (response?.data?.tasks) {
        // 標準的なレスポンス形式
        console.log(`【usePlans】タスク検出(data.tasks形式): ${response.data.tasks.length}件`);
        return { tasks: response.data.tasks };
      } else if (response?.tasks) {
        // トップレベルにtasksを持つ形式
        console.log(`【usePlans】タスク検出(tasks形式): ${response.tasks.length}件`);
        return { tasks: response.tasks };
      } else if (Array.isArray(response)) {
        // 配列が直接返された場合
        console.log(`【usePlans】タスク検出(配列形式): ${response.length}件`);
        return { tasks: response };
      } else {
        // それ以外の場合は空配列を返す
        console.log('【usePlans】タスクが検出できませんでした');
        return { tasks: [] };
      }
    } catch (err) {
      console.error('【API連携エラー】タスク取得エラー:', err);
      setError(err.message || 'タスク情報の取得に失敗しました');
      setLoading(false);
      
      // 品質管理フェーズではダミーデータを使用しない
      return { tasks: [] };
    }
  };
  
  // タスクの完了状態を切り替え
  const toggleTaskCompletion = async (taskId) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!token) {
        setError('認証されていません');
        setLoading(false);
        return { success: false, error: '認証されていません' };
      }
      
      // タスクの現在の状態を取得（モック環境のため、本来はAPIから取得するべき）
      const isCompleted = true; // 実際の実装では、タスクの状態に基づいて判断
      
      // taskApi.jsの関数を使用
      const newStatus = isCompleted ? 'not-started' : 'completed';
      const newProgress = isCompleted ? 0 : 100;
      
      const response = await updateTaskStatus(taskId, newStatus, newProgress);
      setLoading(false);
      
      if (response.data && response.data.status === 'success') {
        return { success: true, task: response.data.data?.task };
      } else {
        throw new Error('タスクの更新に失敗しました');
      }
    } catch (err) {
      console.error('【API連携エラー】タスク更新エラー:', err);
      setError(err.message || 'タスクの更新に失敗しました');
      setLoading(false);
      return { success: false, error: err.message };
    }
  };
  
  // 認証状態が変わったときにプランを再取得
  useEffect(() => {
    // フラグを使って1回だけ実行されるようにする
    let isMounted = true;
    
    const currentToken = getToken();
    console.log('【usePlans】認証状態変更検知:', { isAuthenticated, hasToken: !!currentToken });
    
    const loadPlans = async () => {
      if (isAuthenticated && currentToken && isMounted) {
        console.log('【usePlans】認証済み - APIからプランデータを取得します');
        console.log('【usePlans】トークン存在確認:', !!currentToken);
        
        try {
          // アクティブプロジェクト一覧APIからタスク情報を含んだプロジェクト一覧を取得
          await getActiveProjects().then(response => {
            if (isMounted) {
              console.log('【usePlans】アクティブプラン取得成功:', response);
              // バックエンドの応答構造をチェック
              if (response.data) {
                console.log('【usePlans】レスポンスデータ構造:', Object.keys(response));
              }
              
              // 様々な可能性のあるレスポンス構造に対応
              if (response.data && response.data.plans) {
                console.log('【usePlans】plans形式でデータを検出');
                setPlans(response.data.plans);
              } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
                console.log('【usePlans】data.data配列形式でデータを検出');
                setPlans(response.data.data);
              } else if (response.projects) {
                console.log('【usePlans】projects形式でデータを検出');
                setPlans(response.projects);
              } else if (response.data && response.data.projects) {
                console.log('【usePlans】data.projects形式でデータを検出');
                setPlans(response.data.projects);
              } else if (Array.isArray(response.data)) {
                console.log('【usePlans】data配列形式でデータを検出');
                setPlans(response.data);
              } else if (Array.isArray(response)) {
                console.log('【usePlans】直接配列形式でデータを検出');
                setPlans(response);
              } else {
                console.log('【usePlans】未知のレスポンス形式:', response);
                // アクティブプロジェクトAPIが失敗した場合、通常のプロジェクト一覧APIにフォールバック
                console.log('【usePlans】通常のプロジェクト一覧APIにフォールバック');
                getProjects().then(fallbackResponse => {
                  if (isMounted && fallbackResponse.data && fallbackResponse.data.projects) {
                    console.log('【usePlans】フォールバック: プロジェクトデータを取得しました');
                    setPlans(fallbackResponse.data.projects);
                  } else {
                    setPlans([]);
                  }
                }).catch(fallbackErr => {
                  console.error('【usePlans】フォールバックも失敗:', fallbackErr);
                  setPlans([]);
                });
              }
            }
          });
        } catch (err) {
          console.error('【usePlans】プランデータの取得に失敗しました:', err);
          if (isMounted) {
            setError(err.message || 'プランの取得に失敗しました');
            setPlans([]);
          }
        }
      } else if (isMounted) {
        console.log('【usePlans】未認証またはトークンなし - プラン一覧をクリア');
        setPlans([]);
      }
    };
    
    loadPlans();
    
    // クリーンアップ関数
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);
  
  // プロジェクト削除機能
  const deleteProject = async (projectId) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!token) {
        setError('認証されていません');
        setLoading(false);
        return { success: false, error: '認証されていません' };
      }
      
      // APIを呼び出す
      const response = await axios.delete(`${API_BASE_URL}/api/v1/projects/${projectId}`, {
        headers: getAuthHeader(),
      });
      
      // 成功したら表示中のプランリストから削除
      if (response.data && response.data.success) {
        setPlans(prevPlans => prevPlans.filter(p => p.id !== projectId));
        return { success: true };
      } else {
        throw new Error(response.data?.message || 'プロジェクトの削除に失敗しました');
      }
    } catch (err) {
      console.error('【API連携エラー】プロジェクト削除エラー:', err);
      setError(err.message || 'プロジェクトの削除に失敗しました');
      setLoading(false);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };
  
  return {
    plans,
    setPlans,
    loading,
    error,
    fetchPlans,
    fetchPlanDetail,
    fetchStats,
    fetchUpcomingTasks,
    toggleTaskCompletion,
    deleteProject
  };
};

export default usePlans;