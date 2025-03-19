import { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import * as planApi from '../api/planApi';
import * as taskApi from '../api/taskApi';

/**
 * 個別プロジェクト詳細に関するカスタムフック
 * 
 * 特定のプロジェクトの詳細情報とタスク一覧を管理します。
 * プロジェクト詳細画面で使用することを想定しています。
 */
const useProject = (projectId) => {
  // 認証コンテキストからトークンとユーザー情報を取得
  const { token, isAuthenticated } = useContext(AuthContext);
  
  // 状態管理
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  /**
   * プロジェクト詳細を取得
   */
  const fetchProject = useCallback(async () => {
    if (!projectId) return;
    
    console.log(`【API連携】プロジェクト詳細取得API（テスト環境）ID: ${projectId}`);
    setLoading(true);
    setError(null);
    
    try {
      // 実際のAPIを呼び出す
      const response = await planApi.getProjectDetails(projectId);
      
      // APIレスポンス構造をログに出力（デバッグ用）
      console.log('【API連携】プロジェクト詳細完全レスポンス:', response);
      console.log('【API連携】プロジェクト詳細レスポンス構造:', response.data);
      
      if (response && response.data && response.data.success === true) {
        console.log('【API連携】プロジェクト詳細取得成功');
        
        // MongoDBのプロジェクトデータをUI向けに正規化
        const projectData = response.data.project;
        
        // _idをidにマッピングするなどの正規化処理
        const normalizedProject = {
          id: projectData._id || projectData.id,
          title: projectData.title,
          description: projectData.description,
          type: projectData.type,
          startDate: projectData.startDate,
          endDate: projectData.endDate,
          progress: projectData.progress || 0,
          status: projectData.status,
          isAtRisk: projectData.isAtRisk || false,
          riskFactors: projectData.riskFactors || [],
          members: projectData.members || [],
        };
        
        setProject(normalizedProject);
      } else {
        throw new Error(response.data.message || 'プロジェクト詳細の取得に失敗しました');
      }
    } catch (err) {
      console.error('【API連携】プロジェクト詳細取得エラー:', err);
      setError(`プロジェクトが見つかりません。検索ID: ${projectId}`);
    } finally {
      setLoading(false);
    }
  }, [projectId]);
  
  /**
   * プロジェクトのタスク一覧を取得
   */
  const fetchTasks = useCallback(async () => {
    if (!projectId) return;
    
    console.log(`【API連携】プロジェクトタスク取得開始: ID ${projectId}`);
    setLoading(true);
    
    try {
      // 実際のAPIを呼び出す
      console.log(`【API連携】タスク取得APIリクエスト`);
      const response = await taskApi.getProjectTasks(projectId);
      console.log(`【API連携】タスク取得APIレスポンス:`, response);
      
      if (response && response.data) {
        // APIレスポンス形式の違いを吸収（様々な形式に対応）
        let tasksArray = [];
        
        // 可能性のあるすべての形式をチェック
        if (Array.isArray(response.data)) {
          // レスポンスが直接配列の場合
          tasksArray = response.data;
        } else if (Array.isArray(response.data.tasks)) {
          // {tasks: [...]} 形式
          tasksArray = response.data.tasks;
        } else if (response.data.data && Array.isArray(response.data.data.tasks)) {
          // {data: {tasks: [...]}} 形式
          tasksArray = response.data.data.tasks;
        } else if (response.data.success === true && Array.isArray(response.data.result)) {
          // {success: true, result: [...]} 形式
          tasksArray = response.data.result;
        } else if (response.data.success === true && response.data.task) {
          // {success: true, task: {...}} 形式（単一タスク）
          tasksArray = [response.data.task];
        }
        
        console.log('【API連携】プロジェクトタスク取得成功:', tasksArray.length, '件', tasksArray);
        
        // タスクデータの存在確認とnull/undefined防止
        if (tasksArray && tasksArray.length > 0) {
          // MongoDBのタスクデータをUI向けに正規化
          const normalizedTasks = tasksArray.map(task => {
            if (!task) return null; // nullチェック
            
            return {
              id: task._id || task.id || '',
              title: task.title || '無題のタスク',
              description: task.description || '',
              startDate: task.startDate || null,
              endDate: task.dueDate || task.endDate || null, // dueDateを優先使用
              priority: task.priority || 'medium',
              status: task.status ? 
                (task.status === 'not_started' ? 'not-started' : task.status) 
                : 'not-started',
              progress: typeof task.progress === 'number' ? task.progress : 0,
              assignedTo: task.assignedTo || [],
              dependencies: Array.isArray(task.dependencies) ? task.dependencies : [],
              warning: !!task.isAtRisk,
              warningText: task.riskDescription || '',
              project: task.projectId || task.project || projectId, // 互換性のためprojectIdも確認
              completedDate: task.completedDate || null
            };
          }).filter(Boolean); // nullエントリを削除
          
          console.log('【API連携】正規化されたタスク:', normalizedTasks.length, '件');
          setTasks(normalizedTasks);
        } else {
          console.log('【API連携】タスクは0件でした');
          setTasks([]);
        }
      } else {
        console.log('【API連携】レスポンスにデータがありません', response);
        setTasks([]);
      }
    } catch (err) {
      console.error('【API連携】プロジェクトタスク取得エラー:', err);
      setError(`タスク一覧の取得に失敗しました。プロジェクトID: ${projectId}`);
      // エラーが発生した場合は空の配列をセット
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);
  
  /**
   * プロジェクトの統計情報を計算（APIコールなし）
   */
  const calculateProjectStats = useCallback(() => {
    if (!projectId) return;
    
    console.log(`【統計情報】プロジェクト統計情報を計算: ID ${projectId}`);
    
    try {
      // タスクとプロジェクトデータから統計情報を直接計算
      // APIコールをせずに既存データから計算することでパフォーマンスを向上
      
      // タスクから統計情報を計算
      const completedTasks = tasks.filter(t => t.status === 'completed').length;
      const inProgressTasks = tasks.filter(t => t.status === 'in-progress' || t.status === 'in_progress').length;
      const notStartedTasks = tasks.filter(t => t.status === 'not-started' || t.status === 'not_started').length;
      const delayedTasks = tasks.filter(t => t.status === 'delayed').length;
      const totalTasks = tasks.length;
      
      // 優先度別のタスク数をカウント
      const highPriorityTasks = tasks.filter(t => t.priority === 'high').length;
      const mediumPriorityTasks = tasks.filter(t => t.priority === 'medium').length;
      const lowPriorityTasks = tasks.filter(t => t.priority === 'low').length;
      
      // 進捗率の計算
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      // 残り日数の計算
      const timeRemaining = project ? calculateRemainingDays(project.endDate) : 0;
      
      const stats = {
        totalTasks,
        completedTasks,
        inProgressTasks,
        notStartedTasks, 
        overdueCount: delayedTasks,
        progress,
        timeRemaining,
        tasksByPriority: {
          high: highPriorityTasks,
          medium: mediumPriorityTasks,
          low: lowPriorityTasks
        }
      };
      
      console.log('【統計情報】計算結果:', stats);
      setStats(stats);
      return stats;
      
    } catch (err) {
      console.error('【統計情報】計算エラー:', err);
      
      // エラー時は空の統計情報を設定
      const emptyStats = {
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        notStartedTasks: 0,
        overdueCount: 0,
        progress: 0,
        timeRemaining: 0,
        tasksByPriority: {
          high: 0,
          medium: 0,
          low: 0
        }
      };
      
      setStats(emptyStats);
      return emptyStats;
    }
  }, [projectId, tasks, project]);
  
  /**
   * 日付文字列から今日までの残り日数を計算
   */
  const calculateRemainingDays = (dateString) => {
    const targetDate = new Date(dateString);
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };
  
  /**
   * 新規タスクを作成
   */
  const createTask = useCallback(async (taskData) => {
    if (!projectId) return null;
    
    console.log(`【API連携】タスク作成開始: プロジェクトID ${projectId}`);
    setLoading(true);
    
    try {
      // 実際のAPIを呼び出す
      const response = await taskApi.createTask(projectId, taskData);
      
      if (response.data.success === true) {
        const newTask = response.data.task;
        console.log('【API連携】タスク作成成功:', newTask.title);
        
        // タスク一覧を更新（APIを呼び出さずにローカル状態を更新）
        setTasks(prevTasks => {
          const updatedTasks = [...prevTasks, newTask];
          return updatedTasks;
        });
        
        // 統計情報を再計算（APIを呼び出さない）
        setTimeout(() => calculateProjectStats(), 0);
        
        return newTask;
      } else {
        throw new Error(response.data.message || 'タスクの作成に失敗しました');
      }
    } catch (err) {
      console.error('【API連携】タスク作成エラー:', err);
      setError('タスクの作成に失敗しました。');
      return null;
    } finally {
      setLoading(false);
    }
  }, [projectId, calculateProjectStats]);
  
  /**
   * タスクを更新
   */
  const updateTask = useCallback(async (taskId, taskData) => {
    console.log(`【API連携】タスク更新開始: ID ${taskId}`);
    setLoading(true);
    
    try {
      // 実際のAPIを呼び出す
      const response = await taskApi.updateTask(taskId, taskData);
      
      if (response.data.success === true) {
        const updatedTask = response.data.task;
        console.log('【API連携】タスク更新成功:', updatedTask.title);
        
        // タスク一覧を更新（APIを呼び出さずにローカル状態を更新）
        setTasks(prevTasks => {
          const updatedTasks = prevTasks.map(task => 
            task.id === taskId ? { ...task, ...updatedTask } : task
          );
          return updatedTasks;
        });
        
        // 統計情報を再計算（APIを呼び出さない）
        setTimeout(() => calculateProjectStats(), 0);
        
        return updatedTask;
      } else {
        throw new Error(response.data.message || 'タスクの更新に失敗しました');
      }
    } catch (err) {
      console.error('【API連携】タスク更新エラー:', err);
      setError('タスクの更新に失敗しました。');
      return null;
    } finally {
      setLoading(false);
    }
  }, [calculateProjectStats]);
  
  /**
   * タスクを削除
   */
  const deleteTask = useCallback(async (taskId) => {
    console.log(`【API連携】タスク削除開始: ID ${taskId}`);
    setLoading(true);
    
    try {
      // 実際のAPIを呼び出す
      const response = await taskApi.deleteTask(taskId);
      
      if (response.data.success === true) {
        console.log('【API連携】タスク削除成功');
        
        // タスク一覧を更新（APIを呼び出さずにローカル状態を更新）
        setTasks(prevTasks => {
          const updatedTasks = prevTasks.filter(task => task.id !== taskId);
          return updatedTasks;
        });
        
        // 統計情報を再計算（APIを呼び出さない）
        setTimeout(() => calculateProjectStats(), 0);
        
        return true;
      } else {
        throw new Error(response.data.message || 'タスクの削除に失敗しました');
      }
    } catch (err) {
      console.error('【API連携】タスク削除エラー:', err);
      setError('タスクの削除に失敗しました。');
      return false;
    } finally {
      setLoading(false);
    }
  }, [calculateProjectStats]);
  
  /**
   * プロジェクト情報を更新
   */
  const updateProject = useCallback(async (projectData) => {
    if (!projectId) return null;
    
    console.log(`【API連携】プロジェクト更新開始: ID ${projectId}`);
    setLoading(true);
    
    try {
      // 実際のAPIを呼び出す
      const response = await planApi.updateProject(projectId, projectData);
      
      if (response.data.success === true) {
        const updatedProject = response.data.project;
        console.log('【API連携】プロジェクト更新成功:', updatedProject.title);
        setProject(updatedProject);
        
        return updatedProject;
      } else {
        throw new Error(response.data.message || 'プロジェクトの更新に失敗しました');
      }
    } catch (err) {
      console.error('【API連携】プロジェクト更新エラー:', err);
      setError('プロジェクトの更新に失敗しました。');
      return null;
    } finally {
      setLoading(false);
    }
  }, [projectId]);
  
  // 初期データ取得 - プロジェクトIDと認証情報が変わったときのみデータをロード
  const dataLoaded = useRef(false);
  const previousProjectId = useRef(null);
  
  useEffect(() => {
    // projectIdが変わるか、初回ロード時のみAPIを呼び出す
    if (projectId && isAuthenticated && (previousProjectId.current !== projectId || !dataLoaded.current)) {
      const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
          console.log('【最適化済み】プロジェクトデータロード開始', projectId);
          
          // プロジェクト取得
          await fetchProject();
          
          // タスク一覧取得
          console.log('【最適化済み】タスク一覧取得開始', projectId);
          await fetchTasks();
          
          // 統計情報は外部APIを呼ばずに計算する
          calculateProjectStats();
          
          // 取得完了フラグと現在のプロジェクトIDを記録
          dataLoaded.current = true;
          previousProjectId.current = projectId;
          console.log('【最適化済み】データ取得完了 - APIコール最適化済み、ID:', projectId);
        } catch (err) {
          console.error('【API連携】データ取得エラー:', err);
          setError(`データの取得に失敗しました: ${err.message}`);
        } finally {
          setLoading(false);
        }
      };
      
      loadData();
    } else {
      // 同じプロジェクトの場合はコンソールにログを出す
      console.log('【最適化済み】同じプロジェクトのため再取得しません:', projectId);
    }
  }, [projectId, isAuthenticated, fetchProject, fetchTasks, calculateProjectStats]);
  
  return {
    project,
    tasks,
    stats,
    loading,
    error,
    fetchProject,
    fetchTasks,
    calculateProjectStats, // fetchProjectStatsをcalculateProjectStatsに置き換え
    createTask,
    updateTask,
    deleteTask,
    updateProject
  };
};

export default useProject;