/**
 * チャットコントローラー
 * Chat-to-Gantt機能でのAIチャットとタスク生成を処理
 * 
 * 変更履歴:
 * - 2025/03/19: 初期実装 (Claude)
 */

const mongoose = require('mongoose');
const aiService = require('../services/aiService');
const Project = require('../models/Project');
const Task = require('../models/Task');
const ChatHistory = require('../models/ChatHistory');

/**
 * チャットメッセージを送信し、AIからの応答を取得する
 * @param {Object} req - リクエストオブジェクト
 * @param {Object} res - レスポンスオブジェクト
 */
const sendMessage = async (req, res) => {
  console.log('【API連携】チャットメッセージリクエスト受信');
  
  try {
    const { projectId, message, conversation } = req.body;
    const userId = req.user.id;
    
    if (!message || message.trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'メッセージは必須です'
      });
    }
    
    // プロジェクトIDが指定されている場合、プロジェクトが存在するか確認
    // ただし、"new" の場合は特別に処理（新規プロジェクト作成中の場合）
    if (projectId && projectId !== 'new') {
      try {
        const project = await Project.findById(projectId);
        if (!project) {
          return res.status(404).json({
            status: 'error',
            message: '指定されたプロジェクトが見つかりません'
          });
        }
      } catch (error) {
        // CastErrorの場合は無効なIDフォーマットとして処理
        if (error instanceof mongoose.Error.CastError) {
          return res.status(400).json({
            status: 'error',
            message: '無効なプロジェクトIDです'
          });
        }
        throw error;
      }
    }
    
    // AIからの応答を取得（クライアントから会話履歴が提供された場合はそれを使用）
    let aiResponse;
    if (conversation && Array.isArray(conversation) && conversation.length > 0) {
      console.log(`【API連携】クライアントから会話履歴 ${conversation.length}件 を受信`);
      aiResponse = await aiService.processChatMessage(message, projectId, conversation);
    } else {
      aiResponse = await aiService.processChatMessage(message, projectId);
    }
    
    // チャット履歴に保存
    let chatHistory;
    // "new"プロジェクトの場合はチャット履歴を保存しない
    if (projectId && projectId !== 'new') {
      chatHistory = await ChatHistory.findOne({ projectId });
      
      if (!chatHistory) {
        chatHistory = new ChatHistory({
          projectId,
          messages: []
        });
      }
      
      // ユーザーメッセージを追加
      chatHistory.messages.push({
        sender: 'user',
        content: message,
        timestamp: new Date()
      });
      
      // AIレスポンスを追加
      chatHistory.messages.push({
        sender: 'ai',
        content: aiResponse.content,
        timestamp: new Date()
      });
      
      await chatHistory.save();
    }
    
    // レスポンスを返す
    return res.status(200).json({
      status: 'success',
      data: {
        message: aiResponse.content,
        suggestions: aiResponse.suggestions,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('チャットメッセージ処理エラー:', error);
    return res.status(500).json({
      status: 'error',
      message: 'チャットメッセージの処理中にエラーが発生しました',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * 指定されたプロジェクトのチャット履歴を取得する
 * @param {Object} req - リクエストオブジェクト
 * @param {Object} res - レスポンスオブジェクト
 */
const getChatHistory = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;
    
    // プロジェクトが存在するか確認
    try {
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({
          status: 'error',
          message: '指定されたプロジェクトが見つかりません'
        });
      }
    } catch (error) {
      // CastErrorの場合は無効なIDフォーマットとして処理
      if (error instanceof mongoose.Error.CastError) {
        return res.status(400).json({
          status: 'error',
          message: '無効なプロジェクトIDです'
        });
      }
      throw error;
    }
    
    // チャット履歴を取得
    const chatHistory = await ChatHistory.findOne({ projectId });
    
    if (!chatHistory) {
      return res.status(200).json({
        status: 'success',
        data: {
          projectId,
          messages: []
        }
      });
    }
    
    return res.status(200).json({
      status: 'success',
      data: chatHistory
    });
    
  } catch (error) {
    console.error('チャット履歴取得エラー:', error);
    return res.status(500).json({
      status: 'error',
      message: 'チャット履歴の取得中にエラーが発生しました',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * タスクの自動生成を行う
 * @param {Object} req - リクエストオブジェクト
 * @param {Object} res - レスポンスオブジェクト
 */
const generateTasks = async (req, res) => {
  console.log('【API連携】タスク生成リクエスト受信');
  
  try {
    const { conversationHistory } = req.body;
    const userId = req.user.id;
    
    // 必須パラメータの確認
    if (!conversationHistory) {
      return res.status(400).json({
        status: 'error',
        message: '会話履歴は必須です'
      });
    }
    
    // AIを使用してタスクを生成（会話履歴のみを使用）
    const generatedTasks = await aiService.generateTasksFromConversation(conversationHistory);
    
    // 生成されたタスクを返す（DB保存はしない）
    const formattedTasks = generatedTasks.map(taskData => ({
      title: taskData.title,
      description: taskData.description,
      startDate: taskData.startDate || new Date(),
      dueDate: taskData.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'not_started',
      priority: taskData.priority || 'medium',
      _id: new mongoose.Types.ObjectId().toString()
    }));
    
    // 警告メッセージを収集
    const warnings = generatedTasks
      .filter(task => task.warning)
      .map(task => ({
        type: 'task-warning',
        message: task.warningText || '潜在的なリスクがあります',
        relatedTaskId: formattedTasks.find(st => st.title === task.title)?._id
      }));
    
    return res.status(201).json({
      status: 'success',
      data: {
        tasks: formattedTasks,
        warnings
      }
    });
    
  } catch (error) {
    console.error('タスク生成エラー:', error);
    return res.status(500).json({
      status: 'error',
      message: 'タスクの生成中にエラーが発生しました',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * AIを使用して解決策を提案する
 * @param {Object} req - リクエストオブジェクト
 * @param {Object} res - レスポンスオブジェクト
 */
const suggestSolution = async (req, res) => {
  try {
    const { taskId, planId, issue } = req.body;
    const userId = req.user.id;
    
    // 必須パラメータの確認
    if (!taskId || !planId || !issue) {
      return res.status(400).json({
        status: 'error',
        message: 'タスクID、プランID、および問題の説明は必須です'
      });
    }
    
    // タスクとプロジェクトが存在するか確認
    let task, project;
    
    try {
      task = await Task.findById(taskId);
      if (!task) {
        return res.status(404).json({
          status: 'error',
          message: '指定されたタスクが見つかりません'
        });
      }
    } catch (error) {
      // CastErrorの場合は無効なIDフォーマットとして処理
      if (error instanceof mongoose.Error.CastError) {
        return res.status(400).json({
          status: 'error',
          message: '無効なタスクIDです'
        });
      }
      throw error;
    }
    
    try {
      project = await Project.findById(planId);
      if (!project) {
        return res.status(404).json({
          status: 'error',
          message: '指定されたプロジェクトが見つかりません'
        });
      }
    } catch (error) {
      // CastErrorの場合は無効なIDフォーマットとして処理
      if (error instanceof mongoose.Error.CastError) {
        return res.status(400).json({
          status: 'error',
          message: '無効なプロジェクトIDです'
        });
      }
      throw error;
    }
    
    // AIを使用して解決策を提案
    const suggestions = await aiService.suggestSolutions({ taskId, planId, issue });
    
    return res.status(200).json({
      status: 'success',
      data: {
        suggestions
      }
    });
    
  } catch (error) {
    console.error('解決策提案エラー:', error);
    return res.status(500).json({
      status: 'error',
      message: '解決策の提案中にエラーが発生しました',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * 提案された解決策を適用する
 * @param {Object} req - リクエストオブジェクト
 * @param {Object} res - レスポンスオブジェクト
 */
const applySolution = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { solutionId, taskId, adjustments } = req.body;
    const userId = req.user.id;
    
    // 必須パラメータの確認
    if (!solutionId || !taskId || !adjustments) {
      return res.status(400).json({
        status: 'error',
        message: '解決策ID、タスクID、および調整内容は必須です'
      });
    }
    
    // プロジェクトとタスクが存在するか確認
    let project, task;
    
    try {
      project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({
          status: 'error',
          message: '指定されたプロジェクトが見つかりません'
        });
      }
    } catch (error) {
      // CastErrorの場合は無効なIDフォーマットとして処理
      if (error instanceof mongoose.Error.CastError) {
        return res.status(400).json({
          status: 'error',
          message: '無効なプロジェクトIDです'
        });
      }
      throw error;
    }
    
    try {
      task = await Task.findById(taskId);
      if (!task) {
        return res.status(404).json({
          status: 'error',
          message: '指定されたタスクが見つかりません'
        });
      }
    } catch (error) {
      // CastErrorの場合は無効なIDフォーマットとして処理
      if (error instanceof mongoose.Error.CastError) {
        return res.status(400).json({
          status: 'error',
          message: '無効なタスクIDです'
        });
      }
      throw error;
    }
    
    // タスクを更新
    if (adjustments.title) task.title = adjustments.title;
    if (adjustments.description) task.description = adjustments.description;
    if (adjustments.startDate) task.startDate = adjustments.startDate;
    if (adjustments.endDate) task.dueDate = adjustments.endDate;
    if (adjustments.priority) task.priority = adjustments.priority;
    if (adjustments.status) task.status = adjustments.status;
    
    // タスクが解決されたことを示すフラグを設定
    task.isAtRisk = false;
    task.riskDescription = null;
    
    await task.save();
    
    // 新しいタスクを追加（必要な場合）
    let newTasks = [];
    if (adjustments.addTasks && Array.isArray(adjustments.addTasks)) {
      for (const newTaskData of adjustments.addTasks) {
        try {
          const newTask = new Task({
            projectId: projectId,
            title: newTaskData.title,
            description: newTaskData.description,
            startDate: newTaskData.startDate || new Date(),
            dueDate: newTaskData.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            status: 'not_started',
            priority: newTaskData.priority || 'medium',
            createdBy: userId
          });
          
          await newTask.save();
          newTasks.push(newTask);
        } catch (error) {
          console.error(`解決策の新規タスク作成エラー: ${newTaskData.title}`, error);
          // エラーがあっても続行
          newTasks.push({
            title: newTaskData.title,
            description: newTaskData.description,
            _id: new mongoose.Types.ObjectId(),
            error: true,
            errorMessage: error.message
          });
        }
      }
    }
    
    // 解決策適用の記録をチャット履歴に追加
    const chatHistory = await ChatHistory.findOne({ projectId });
    
    if (chatHistory) {
      chatHistory.messages.push({
        sender: 'system',
        content: `タスク「${task.title}」に解決策が適用されました。`,
        timestamp: new Date()
      });
      
      await chatHistory.save();
    }
    
    return res.status(200).json({
      status: 'success',
      data: {
        updatedTask: task,
        newTasks
      }
    });
    
  } catch (error) {
    console.error('解決策適用エラー:', error);
    return res.status(500).json({
      status: 'error',
      message: '解決策の適用中にエラーが発生しました',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


module.exports = {
  sendMessage,
  getChatHistory,
  generateTasks,
  suggestSolution,
  applySolution
};