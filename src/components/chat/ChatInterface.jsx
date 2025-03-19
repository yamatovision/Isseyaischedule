/**
 * チャットインターフェースコンポーネント
 * AIとの対話インターフェースを提供するコンポーネント
 * 
 * 変更履歴:
 * - 2025/03/19: 初期実装 (Claude)
 * - 2025/03/19: フルスクリーン対応 (Claude)
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, Typography, IconButton, InputBase, Button, 
  Avatar, CircularProgress, Tooltip 
} from '@material-ui/core';
import SendIcon from '@material-ui/icons/Send';
import AndroidIcon from '@material-ui/icons/Android';
import PersonIcon from '@material-ui/icons/Person';
import InfoIcon from '@material-ui/icons/Info';
import WarningIcon from '@material-ui/icons/Warning';
import PlaylistAddIcon from '@material-ui/icons/PlaylistAdd';
import { formatDate } from '../../utils/gantt';
import { getTemplateMessage } from '../../utils/ai';

// チャットメッセージタイプ定義
const MESSAGE_TYPES = {
  USER: 'user',
  AI: 'ai',
  SYSTEM: 'system'
};

/**
 * メッセージコンポーネント
 * 個別のチャットメッセージを表示
 */
const MessageItem = ({ message, isLastMessage }) => {
  const { sender, content, timestamp } = message;
  const isUser = sender === MESSAGE_TYPES.USER;
  const isSystem = sender === MESSAGE_TYPES.SYSTEM;
  
  // 時刻を整形
  const formattedTime = timestamp ? new Date(timestamp).toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit'
  }) : '';
  
  return (
    <Box 
      className={`message ${sender}`} 
      sx={{ 
        scrollMarginBottom: isLastMessage ? '100px' : '0px',
        animation: isLastMessage ? 'fadeIn 0.3s ease-in-out' : 'none'
      }}
    >
      {!isSystem && (
        <Avatar className="avatar">
          {isUser ? <PersonIcon /> : <AndroidIcon />}
        </Avatar>
      )}
      <Box className="message-content">
        <Typography 
          variant="body1" 
          component="div" 
          className="message-text"
          sx={{ 
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}
        >
          {content.split('<code-block>').map((segment, index) => {
            if (index === 0) {
              // 最初のセグメントはコードブロックではない
              return (
                <React.Fragment key={`text-${index}`}>
                  {segment.split('\n').map((line, i) => (
                    <React.Fragment key={`line-${index}-${i}`}>
                      {line}
                      {i < segment.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </React.Fragment>
              );
            }
            
            // コードブロックと後続テキストに分割
            const parts = segment.split('</code-block>');
            const codeContent = parts[0];
            const textContent = parts[1] || '';
            
            return (
              <React.Fragment key={`segment-${index}`}>
                {/* コードブロック */}
                <pre className="message-code-block">
                  <code>{codeContent}</code>
                </pre>
                
                {/* 後続テキスト */}
                {textContent && (
                  <React.Fragment>
                    {textContent.split('\n').map((line, i) => (
                      <React.Fragment key={`line-${index}-${i}`}>
                        {line}
                        {i < textContent.split('\n').length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </React.Fragment>
                )}
              </React.Fragment>
            );
          })}
        </Typography>
        {timestamp && (
          <Typography variant="caption" className="message-timestamp">
            {formattedTime}
          </Typography>
        )}
      </Box>
    </Box>
  );
};


/**
 * タスク承認セクションコンポーネント
 * 生成されたタスクの承認/調整UI
 */
const TaskApprovalSection = ({ tasks, onApprove, onAdjust, onSaveAsProject }) => {
  if (!tasks || tasks.length === 0) return null;
  
  return (
    <Box className="task-approval-section">
      <Typography variant="subtitle1" className="task-approval-title">
        生成されたタスク計画を確認
      </Typography>
      
      <Typography variant="body2">
        以下のタスクリストを確認し、プロジェクトとして保存、承認、または調整を選択してください。
      </Typography>
      
      <Box className="task-list-preview">
        {tasks.slice(0, 5).map((task) => (
          <Box key={task._id || task.id} className="task-item">
            <Box 
              className={`task-item-priority ${task.priority}`}
              sx={{ backgroundColor: task.priority === 'high' ? '#f44336' : 
                task.priority === 'medium' ? '#ff9800' : '#4caf50' }}
            />
            <Box className="task-item-details">
              <Box className="task-item-title">
                {task.title}
                {(task.warning || task.isAtRisk) && (
                  <Tooltip title={task.warningText || task.riskDescription || "潜在的なリスクがあります"}>
                    <WarningIcon 
                      fontSize="small" 
                      color="warning" 
                      sx={{ marginLeft: 1, fontSize: 16 }} 
                    />
                  </Tooltip>
                )}
              </Box>
              <Typography variant="caption" className="task-item-dates">
                {formatDate(task.startDate)} 〜 {formatDate(task.dueDate || task.endDate)}
              </Typography>
            </Box>
          </Box>
        ))}
        
        {tasks.length > 5 && (
          <Typography variant="caption" color="textSecondary" sx={{ padding: 1, display: 'block' }}>
            他 {tasks.length - 5} 件のタスク
          </Typography>
        )}
      </Box>
      
      <Box className="task-approval-buttons">
        <Button variant="outlined" color="primary" onClick={onAdjust}>
          タスクを調整する
        </Button>
        <Button variant="contained" color="primary" onClick={onApprove}>
          このまま承認する
        </Button>
        <Button 
          variant="contained" 
          color="secondary" 
          onClick={onSaveAsProject}
          sx={{ ml: 1 }}
        >
          プロジェクトとして保存
        </Button>
      </Box>
    </Box>
  );
};

/**
 * タイピングインジケーターコンポーネント
 * AIが入力中であることを示すアニメーション
 */
const TypingIndicator = () => (
  <Box className="message ai">
    <Avatar className="avatar">
      <AndroidIcon />
    </Avatar>
    <Box className="typing-indicator">
      <Box className="typing-dot"></Box>
      <Box className="typing-dot"></Box>
      <Box className="typing-dot"></Box>
    </Box>
  </Box>
);

/**
 * メインのチャットインターフェースコンポーネント
 */
const ChatInterface = ({ 
  messages = [], 
  isTyping = false, 
  generatedTasks = [], 
  projectId,
  onSendMessage, 
  onTaskApproval, 
  onTaskAdjustment,
  onGenerateTasks,
  onSaveAsProject
}) => {
  // State定義
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // 自動スクロール効果
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // 入力エリアの高さ自動調整
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);
  
  // メッセージ送信ハンドラー
  const handleSendMessage = () => {
    if (input.trim() === '') return;
    onSendMessage(input);
    setInput('');
    // 入力エリアの高さをリセット
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  };
  
  
  // キー入力ハンドラー
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  return (
    <Box className="chat-column">
      {/* チャットヘッダー */}
      <Box className="chat-header">
        <AndroidIcon className="chat-icon" />
        <Typography variant="h6">AIアシスタント</Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Tooltip title="タスクを自動生成します">
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<PlaylistAddIcon />}
            onClick={onGenerateTasks}
            disabled={isTyping}
            sx={{ mr: 1 }}
          >
            タスクを生成
          </Button>
        </Tooltip>
        <Tooltip title="AIアシスタントにプロジェクトについて質問したり、計画の立案を依頼できます。">
          <IconButton size="small" color="primary">
            <InfoIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* チャットメッセージエリア */}
      <Box className="chat-messages">
        {/* メッセージがない場合の初期メッセージ */}
        {messages.length === 0 && (
          <MessageItem 
            message={{
              sender: MESSAGE_TYPES.AI,
              content: getTemplateMessage('welcome'),
              timestamp: new Date().toISOString()
            }}
            isLastMessage={true}
          />
        )}
        
        {/* メッセージリスト */}
        {messages.map((message, index) => (
          <MessageItem 
            key={index} 
            message={message} 
            isLastMessage={index === messages.length - 1}
          />
        ))}
        
        {/* タイピングインジケーター */}
        {isTyping && <TypingIndicator />}
        
        {/* タスク承認セクション */}
        {generatedTasks.length > 0 && (
          <TaskApprovalSection 
            tasks={generatedTasks}
            onApprove={onTaskApproval}
            onAdjust={onTaskAdjustment}
            onSaveAsProject={onSaveAsProject}
          />
        )}
        
        
        {/* スクロール位置参照用 */}
        <Box ref={messagesEndRef} />
      </Box>
      
      {/* チャット入力エリア */}
      <Box className="chat-input-container">
        <InputBase
          multiline
          inputRef={inputRef}
          className="chat-input"
          placeholder="メッセージを入力..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isTyping}
          endAdornment={
            isTyping && (
              <CircularProgress
                size={20}
                sx={{ marginRight: 1, color: 'grey.500' }}
              />
            )
          }
        />
        <IconButton
          className="send-button"
          color="primary"
          onClick={handleSendMessage}
          disabled={input.trim() === '' || isTyping}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default ChatInterface;