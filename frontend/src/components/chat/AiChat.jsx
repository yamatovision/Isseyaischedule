/**
 * AIチャットコンポーネント
 * AIチャットとタスク生成機能を管理するコンポーネント
 * 
 * 変更履歴:
 * - 2025/03/19: 初期実装 (Claude)
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Button, Snackbar, 
  Backdrop, CircularProgress, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { 
  sendChatMessage, getChatHistory, generateTasks, 
  getSolutions, applySolution, getProjectTypeOptions 
} from '../../utils/ai';
import { createProjectWithTasks } from '../../api/projectApi';
import ChatInterface from './ChatInterface';
import SolutionDisplay from './SolutionDisplay';

/**
 * AIチャットコンポーネント
 */
const AiChat = ({ onTasksGenerated, projectData }) => {
  // State定義
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const [generatedTasks, setGeneratedTasks] = useState([]);
  const [tasksApproved, setTasksApproved] = useState(false);
  const [showTaskEditor, setShowTaskEditor] = useState(false);
  const [showSolutions, setShowSolutions] = useState(false);
  const [currentIssue, setCurrentIssue] = useState(null);
  const [availableSolutions, setAvailableSolutions] = useState([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [projectName, setProjectName] = useState('');
  
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  // チャット履歴の初期ロード - プロジェクトIDに依存しない実装
  useEffect(() => {
    // プロジェクトが存在する場合のみチャット履歴を読み込む
    if (projectData && projectData.id && projectData.id !== 'new') {
      loadChatHistory();
    } else {
      // プロジェクトなしの場合は空の履歴で初期化
      setMessages([]);
      setIsLoading(false);
    }
  }, [projectData]);
  
  // チャット履歴取得
  const loadChatHistory = async () => {
    try {
      setIsLoading(true);
      if (projectData && projectData.id) {
        const history = await getChatHistory(projectData.id);
        
        if (history && history.messages && history.messages.length > 0) {
          setMessages(history.messages);
        }
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('チャット履歴取得エラー:', error);
      setError('チャット履歴の取得中にエラーが発生しました');
      setIsLoading(false);
    }
  };
  
  // メッセージ送信処理
  const handleSendMessage = async (message) => {
    try {
      // ユーザーメッセージをローカルに追加
      const userMessage = {
        sender: 'user',
        content: message,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prevMessages => [...prevMessages, userMessage]);
      setIsTyping(true);
      
      // デバッグ情報
      console.log(`【AI Chat】メッセージを送信します: "${message}"`);
      console.log(`【AI Chat】認証状態: token=${localStorage.getItem('plannavi_auth_token') ? '存在します' : '存在しません'}`);
      console.log(`【AI Chat】トークン値: ${localStorage.getItem('plannavi_auth_token')?.substring(0, 10)}...`);
      
      // 会話履歴をMessages API形式に変換
      const conversationHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      }))
      // システムメッセージは除外（roleがuserまたはassistantのみ許可）
      .filter(msg => msg.role === 'user' || msg.role === 'assistant');
      
      // AIに送信 - サーバー応答を待つ
      try {
        // 会話履歴を含めてAPIを呼び出し - projectIdは使用しない
        const response = await sendChatMessage(message, null, conversationHistory);
        console.log('【AI Chat】AIレスポンス受信:', response);
        
        if (response) {
          // AIの応答を追加
          let messageContent = response.message || 'すみません、応答を生成できませんでした。';
          
          // 応答の整形処理
          if (messageContent) {
            // 1. 長文の場合は適切に改行を追加（文章の区切りで改行）
            if (!messageContent.includes('\n') && messageContent.length > 100) {
              messageContent = messageContent.replace(/。(?!$)/g, '。\n');
            }
            
            // 2. コードブロックの整形
            // コードブロックとして ```code``` のパターンを検出して、表示用にマークアップ
            messageContent = messageContent.replace(
              /```([^`]+)```/g, 
              (match, codeContent) => {
                // 既に改行がある場合はそのまま返す
                if (codeContent.includes('\n')) {
                  return `\n<code-block>\n${codeContent.trim()}\n</code-block>\n`;
                }
                // 改行がない場合は単一行のコードとして扱う
                return `\n<code-block>\n${codeContent.trim()}\n</code-block>\n`;
              }
            );
          }
          
          const aiMessage = {
            sender: 'ai',
            content: messageContent,
            timestamp: response.timestamp || new Date().toISOString()
          };
          
          setMessages(prevMessages => [...prevMessages, aiMessage]);
        } else {
          throw new Error('AIからの応答が空です');
        }
      } catch (apiError) {
        console.error('【AI Chat】API通信エラー:', apiError);
        
        // エラーの場合はローカルでフォールバック応答を生成
        let errorMessage = 'すみません、サーバーと通信できませんでした。\nしばらくしてからもう一度お試しください。';
        
        const fallbackResponse = {
          content: errorMessage,
          timestamp: new Date().toISOString()
        };
        
        const aiMessage = {
          sender: 'ai',
          content: fallbackResponse.content,
          timestamp: fallbackResponse.timestamp
        };
        
        setMessages(prevMessages => [...prevMessages, aiMessage]);
      }
      
      setIsTyping(false);
      
      // 特定のキーワードに基づくタスク生成処理
      if (
        message.toLowerCase().includes('タスク') && 
        message.toLowerCase().includes('生成') ||
        message.toLowerCase().includes('計画') && 
        message.toLowerCase().includes('作成')
      ) {
        handleTaskGeneration();
      }
      
    } catch (error) {
      console.error('メッセージ送信エラー:', error);
      setError('メッセージの送信中にエラーが発生しました');
      setIsTyping(false);
      
      // エラーメッセージをシステムメッセージとして表示
      const errorMessage = {
        sender: 'system',
        content: 'メッセージの送信中にエラーが発生しました。もう一度お試しください。',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    }
  };
  
  // タスク生成処理
  const handleTaskGeneration = async () => {
    try {
      setIsLoading(true);
      
      // システムメッセージを追加
      const systemMessage = {
        sender: 'system',
        content: 'タスク生成を開始します。しばらくお待ちください...',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prevMessages => [...prevMessages, systemMessage]);
      
      // 会話履歴を整形
      const conversationHistory = messages
        .map(msg => `${msg.sender === 'user' ? 'ユーザー: ' : (msg.sender === 'ai' ? 'AI: ' : 'システム: ')}${msg.content}`)
        .join('\n\n');
      
      console.log('【AI Chat】タスク生成開始');
      
      try {
        // タスク生成APIを呼び出し - 会話履歴のみを送信
        const result = await generateTasks(null, null, {
          conversationHistory
        });
        
        console.log('【AI Chat】タスク生成結果:', result);
        
        if (result && result.tasks) {
          // 生成されたタスクを設定
          setGeneratedTasks(result.tasks || []);
          
          // 生成完了メッセージ
          const completionMessage = {
            sender: 'ai',
            content: `${result.tasks.length}個のタスクを生成しました。内容を確認して承認または調整してください。`,
            timestamp: new Date().toISOString()
          };
          
          setMessages(prevMessages => [...prevMessages, completionMessage]);
        } else {
          throw new Error('タスク生成結果が空です');
        }
      } catch (apiError) {
        console.error('【AI Chat】タスク生成API通信エラー:', apiError);
        
        // エラーの場合は新しいタスクモデルに準拠したモックタスクを生成
        const mockTasks = [
          {
            id: `mock-task-${Date.now()}-1`,
            title: 'サンプルタスク1: 要件定義',
            description: 'プロジェクトの要件を明確にし、ステークホルダーと合意する',
            startDate: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            priority: 'high',
            status: 'not_started',
            tags: ['要件', '企画']
          },
          {
            id: `mock-task-${Date.now()}-2`,
            title: 'サンプルタスク2: プロジェクト計画作成',
            description: 'プロジェクトのスケジュール、リソース、予算を計画する',
            startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            priority: 'medium',
            status: 'not_started',
            tags: ['企画', '計画']
          }
        ];
        
        setGeneratedTasks(mockTasks);
        
        // 開発中のフォールバックメッセージ
        const completionMessage = {
          sender: 'ai',
          content: `APIエラーが発生しましたが、開発用にサンプルタスクを生成しました。開発モードでの動作確認が可能です。`,
          timestamp: new Date().toISOString()
        };
        
        setMessages(prevMessages => [...prevMessages, completionMessage]);
      }
      
      setIsLoading(false);
      
    } catch (error) {
      console.error('タスク生成エラー:', error);
      setError('タスクの生成中にエラーが発生しました');
      setIsLoading(false);
      
      // エラーメッセージをシステムメッセージとして表示
      const errorMessage = {
        sender: 'system',
        content: 'タスクの生成中にエラーが発生しました。もう一度お試しください。',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    }
  };
  
  // タスク承認処理
  const handleTaskApproval = () => {
    // 承認メッセージをユーザーメッセージとして追加
    const approvalMessage = {
      sender: 'user',
      content: 'タスクリストを承認します',
      timestamp: new Date().toISOString()
    };
    
    setMessages(prevMessages => [...prevMessages, approvalMessage]);
    
    // AI確認メッセージ
    const confirmationMessage = {
      sender: 'ai',
      content: 'タスクリストが承認されました。ガントチャートで全体のスケジュールを確認できます。',
      timestamp: new Date().toISOString()
    };
    
    setMessages(prevMessages => [...prevMessages, confirmationMessage]);
    setTasksApproved(true);
    
    // 親コンポーネントに生成したタスクを渡す
    if (onTasksGenerated) {
      onTasksGenerated(generatedTasks);
    }
    
    // タスク表示をクリア
    setGeneratedTasks([]);
  };
  
  // タスク調整処理
  const handleTaskAdjustment = () => {
    // タスク調整メッセージをユーザーメッセージとして追加
    const adjustmentMessage = {
      sender: 'user',
      content: 'タスクリストを調整したいです',
      timestamp: new Date().toISOString()
    };
    
    setMessages(prevMessages => [...prevMessages, adjustmentMessage]);
    setShowTaskEditor(true);
  };
  
  // タスク編集の保存
  const handleTaskEditorSave = (editedTasks) => {
    // 編集後のタスクをセット
    if (onTasksGenerated) {
      onTasksGenerated(editedTasks);
    }
    
    // 調整完了メッセージ
    const completionMessage = {
      sender: 'ai',
      content: 'タスクリストを調整しました。ガントチャートで全体のスケジュールを確認できます。',
      timestamp: new Date().toISOString()
    };
    
    setMessages(prevMessages => [...prevMessages, completionMessage]);
    setTasksApproved(true);
    setShowTaskEditor(false);
    setGeneratedTasks([]);
  };
  
  // 問題に対する解決策を取得
  const handleGetSolutions = async (taskId, issue) => {
    try {
      setIsLoading(true);
      
      const solutions = await getSolutions(taskId, projectData?.id, issue);
      setAvailableSolutions(solutions);
      setCurrentIssue(issue);
      setShowSolutions(true);
      
      setIsLoading(false);
    } catch (error) {
      console.error('解決策取得エラー:', error);
      setError('解決策の取得中にエラーが発生しました');
      setIsLoading(false);
    }
  };
  
  // 解決策適用処理
  const handleApplySolution = async (solution) => {
    try {
      setIsLoading(true);
      
      // 解決策の適用
      const result = await applySolution(
        projectData?.id,
        solution.id,
        generatedTasks[0]._id, // 選択したタスクIDを使用
        {
          status: 'in_progress',
          riskDescription: null,
          isAtRisk: false
        }
      );
      
      // 適用完了メッセージ
      const completionMessage = {
        sender: 'system',
        content: `解決策「${solution.description}」を適用しました。`,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prevMessages => [...prevMessages, completionMessage]);
      setShowSolutions(false);
      setIsLoading(false);
      
    } catch (error) {
      console.error('解決策適用エラー:', error);
      setError('解決策の適用中にエラーが発生しました');
      setIsLoading(false);
    }
  };
  
  // これらの関数は不要になったため削除
  
  // エラーアラートを閉じる
  const handleCloseError = () => {
    setError(null);
  };
  
  // プロジェクトとして保存処理
  const handleSaveAsProject = () => {
    // プロジェクト名の初期値を設定（会話から推測）
    const lastUserMessage = messages
      .filter(m => m.sender === 'user')
      .slice(-1)[0];
    
    let suggestedName = '';
    if (lastUserMessage && lastUserMessage.content) {
      const content = lastUserMessage.content;
      // 文章から名前を抽出する簡易ロジック
      if (content.includes('プロジェクト') || content.includes('計画')) {
        const sentences = content.split(/[。.]/);
        for (const sentence of sentences) {
          if (sentence.includes('プロジェクト') || sentence.includes('計画')) {
            suggestedName = sentence.slice(0, 20) + (sentence.length > 20 ? '...' : '');
            break;
          }
        }
      }
    }
    
    if (!suggestedName && generatedTasks.length > 0) {
      // タスクのタイトルから推測
      suggestedName = generatedTasks[0].title + ' プロジェクト';
    }
    
    setProjectName(suggestedName || '新規プロジェクト');
    setShowSaveDialog(true);
  };
  
  // プロジェクト保存の確定
  const [isSaving, setIsSaving] = useState(false); // 保存中フラグの追加

  const handleConfirmSaveProject = async () => {
    if (isSaving) return; // 既に保存処理中なら何もしない
    
    try {
      setIsSaving(true); // 保存処理開始フラグを立てる
      setIsLoading(true);
      
      // プロジェクト情報を構築（新しいプロジェクトモデルに適合）
      const projectInfo = {
        title: projectName,
        description: messages.find(m => m.sender === 'user')?.content || projectName,
        // typeフィールドを完全に除去
        startDate: new Date().toISOString().split('T')[0],
        endDate: generatedTasks[generatedTasks.length - 1]?.dueDate || 
                generatedTasks[generatedTasks.length - 1]?.endDate || 
                new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'planning' // ProjectSchema定義に従って状態を初期設定
      };
      
      console.log('【保存処理】プロジェクト保存開始:', projectInfo.title);
      
      // プロジェクトとタスクを保存
      const result = await createProjectWithTasks(projectInfo, generatedTasks);
      
      console.log('【保存処理】プロジェクト保存完了:', result.data?.project?.id);
      
      setShowSaveDialog(false);
      setIsLoading(false);
      
      // 保存成功メッセージ
      const successMessage = {
        sender: 'system',
        content: `「${projectName}」プロジェクトが正常に保存されました。`,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prevMessages => [...prevMessages, successMessage]);
      
      // タスク表示をクリア
      setGeneratedTasks([]);
      
      // 成功したら詳細ページに遷移する
      if (result.data && result.data.project && result.data.project.id) {
        // 少し遅延を設けて遷移（メッセージを見せるため）
        setTimeout(() => {
          navigate(`/projects/${result.data.project.id}`);
        }, 1500);
      }
      
    } catch (error) {
      console.error('プロジェクト保存エラー:', error);
      setError('プロジェクトの保存中にエラーが発生しました');
      setIsLoading(false);
      setIsSaving(false); // 保存中フラグをリセット
      setShowSaveDialog(false);
    }
  };

  return (
    <>
      {/* チャットインターフェース */}
      <ChatInterface 
        messages={messages}
        isTyping={isTyping}
        generatedTasks={generatedTasks}
        projectId={projectData?.id}
        onSendMessage={handleSendMessage}
        onTaskApproval={handleTaskApproval}
        onTaskAdjustment={handleTaskAdjustment}
        onGenerateTasks={handleTaskGeneration}
        onSaveAsProject={handleSaveAsProject}
      />
      
      {/* 解決策表示ダイアログ */}
      <SolutionDisplay 
        open={showSolutions}
        onClose={() => setShowSolutions(false)}
        taskIssue={currentIssue}
        solutions={availableSolutions}
        onApplySolution={handleApplySolution}
      />
      
      {/* プロジェクト保存ダイアログ */}
      <Dialog
        open={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>プロジェクトとして保存</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" paragraph>
            生成されたタスクリストを新しいプロジェクトとして保存します。
          </Typography>
          
          <TextField
            label="プロジェクト名"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            fullWidth
            variant="outlined"
            margin="normal"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSaveDialog(false)}>キャンセル</Button>
          <Button 
            onClick={handleConfirmSaveProject} 
            color="primary"
            variant="contained"
            disabled={!projectName.trim() || isSaving || isLoading}
          >
            {isSaving ? '保存中...' : '保存'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* タスク編集ダイアログ */}
      <Dialog
        open={showTaskEditor}
        onClose={() => setShowTaskEditor(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>タスクリストの調整</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" paragraph>
            生成されたタスクリストを確認し、必要に応じて調整してください。
          </Typography>
          
          {/* タスク編集フォーム - シンプルな実装 */}
          {generatedTasks.map((task, index) => (
            <Box key={task._id || task.id} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <TextField
                label="タスク名"
                defaultValue={task.title}
                fullWidth
                variant="outlined"
                size="small"
                sx={{ mb: 1 }}
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="開始日"
                  defaultValue={task.startDate}
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
                <TextField
                  label="終了日"
                  defaultValue={task.dueDate || task.endDate}
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Box>
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTaskEditor(false)}>キャンセル</Button>
          <Button 
            onClick={() => handleTaskEditorSave(generatedTasks)} 
            color="primary"
            variant="contained"
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* ローディング表示 */}
      <Backdrop 
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoading}
      >
        <CircularProgress color="primary" />
      </Backdrop>
      
      {/* エラー表示 */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" variant="filled">
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AiChat;