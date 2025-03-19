import axios from 'axios';
import { getAuthHeader } from '../utils/auth';
import { CHAT } from '../shared/index';

/**
 * Chat-to-Gantt 関連API
 * 
 * AIチャットによるプロジェクト計画支援、タスク生成、問題解決提案など
 * チャットインターフェイス関連のAPIリクエストを処理する関数群。
 */

// 環境変数またはデフォルト値からAPIのベースURLを取得
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Axiosインスタンスの作成
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // クッキーを常に送受信するように設定
});

// モックモードの設定（開発用）
// モックモードを無効化し、実際のAPIを使用
const MOCK_MODE = false;
// 疑似遅延設定（開発用、ミリ秒）
const API_DELAY = 0;

/**
 * APIレスポンスのモック遅延処理
 * @param {Object} mockResponse - モックレスポンス
 * @returns {Promise} 遅延後のレスポンスを返すPromise
 */
const mockDelay = (mockResponse) => {
  return new Promise(resolve => {
    setTimeout(() => resolve(mockResponse), API_DELAY || 1000);
  });
};

/**
 * リクエストインターセプターの設定
 * 各リクエスト前に認証ヘッダーを追加
 */
api.interceptors.request.use(
  (config) => {
    // 認証ヘッダーを取得して追加
    const token = localStorage.getItem('plannavi_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('【警告】認証トークンがありません。API呼び出しは失敗する可能性があります。');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// モック用のチャット履歴データ
const mockChatHistories = {
  'plan-001': {
    id: 'chat-001',
    projectId: 'plan-001',
    messages: [
      {
        id: 'msg-001',
        sender: 'user',
        content: '新規出店計画の主要なマイルストーンを教えてください',
        timestamp: '2025-04-05T10:30:00Z'
      },
      {
        id: 'msg-002',
        sender: 'ai',
        content: '新規出店計画の主要なマイルストーンとしては以下が考えられます：\n\n1. 出店場所の選定と契約\n2. 店舗レイアウト設計\n3. 必要な許認可取得\n4. 内装工事の実施\n5. 設備・備品の発注と設置\n6. スタッフの採用と教育\n7. 開店前の最終確認\n8. グランドオープン\n\nこれらのマイルストーンをタスクとして追加しますか？',
        timestamp: '2025-04-05T10:30:30Z'
      },
      {
        id: 'msg-003',
        sender: 'user',
        content: 'はい、追加してください。また、飲食店営業許可の取得にかかる期間はどれくらいですか？',
        timestamp: '2025-04-05T10:31:15Z'
      },
      {
        id: 'msg-004',
        sender: 'ai',
        content: '飲食店営業許可の取得期間は、自治体によって異なりますが、一般的には申請から取得までに約2〜4週間程度かかります。ただし、以下の点に注意が必要です：\n\n1. 事前相談：申請前に保健所への事前相談が必要で、これに1〜2週間\n2. 書類準備：必要書類の準備に1〜2週間\n3. 申請後の現地検査：申請後に保健所の現地検査があり、これを経て許可が下りる\n\n実際の工程を考えると、余裕を持って2ヶ月前から手続きを始めることをお勧めします。\n\nマイルストーンをタスクとして追加しました。スケジュールに「飲食店営業許可申請」タスクを追加し、2ヶ月の期間を確保しています。',
        timestamp: '2025-04-05T10:32:00Z'
      }
    ]
  },
  'plan-003': {
    id: 'chat-002',
    projectId: 'plan-003',
    messages: [
      {
        id: 'msg-005',
        sender: 'user',
        content: 'プロトタイプ開発が遅れています。何か対策はありますか？',
        timestamp: '2025-04-10T15:20:00Z'
      },
      {
        id: 'msg-006',
        sender: 'ai',
        content: 'プロトタイプ開発の遅延に対して、以下の対策が考えられます：\n\n1. スコープの見直し：初期プロトタイプの機能を最小限に絞り込む\n2. リソースの追加：一時的に追加の開発リソースを確保する\n3. 並行作業の検討：テスト計画など、依存しない作業を先行して進める\n4. タイムラインの調整：後続タスクのスケジュールを調整する\n\nどの対策を検討されますか？詳細なプランを提案することも可能です。',
        timestamp: '2025-04-10T15:20:45Z'
      },
      {
        id: 'msg-007',
        sender: 'user',
        content: 'スコープの見直しとタイムラインの調整について、具体的な提案をお願いします。',
        timestamp: '2025-04-10T15:22:10Z'
      },
      {
        id: 'msg-008',
        sender: 'ai',
        content: '**スコープ見直しとタイムライン調整の提案**\n\n**1. スコープ見直し**\n- コア機能のみに絞ったMVP（最小実行製品）アプローチを採用\n- 初期プロトタイプから以下の機能を除外：詳細なレポート機能、高度なカスタマイズ機能\n- UI/UXは簡素化し、後のイテレーションで改善\n\n**2. タイムライン調整**\n- プロトタイプ完成を2週間延長（5月29日まで）\n- ユーザーテスト期間を2週間から1週間に短縮\n- テストケースを優先順位付けし、重要な機能のテストに集中\n- 開発・テストを部分的に並行して実施\n\n**具体的なスケジュール変更**：\n- プロトタイプ開発：〜5月29日（+2週間）\n- ユーザーテスト：5月30日〜6月5日（-1週間）\n- 後続のタスクを1週間後ろにずらす\n\nこの案を適用しますか？適用する場合、スケジュールとタスク内容を更新します。',
        timestamp: '2025-04-10T15:23:30Z'
      }
    ]
  }
};

/**
 * メッセージを送信
 * @param {Object} messageData - メッセージデータ
 * @returns {Promise} AI応答メッセージ
 */
export const sendMessage = async (messageData) => {
  console.log('【API連携】チャットメッセージを送信します');
  
  if (MOCK_MODE) {
    console.log('【API連携（モック）】モックモードでチャットメッセージを処理します');
    
    // モックレスポンスの作成
    const { projectId, message } = messageData;
    
    // 事前定義されたレスポンスパターン
    const responsePatterns = [
      {
        keywords: ['遅延', '遅れ', '期限', 'リスク'],
        response: 'プロジェクトの遅延リスクを検出しました。以下の対策が考えられます：\n\n1. クリティカルパスの見直し\n2. 優先度の低いタスクの後回し\n3. 追加リソースの確保\n\n具体的な対策を提案しますか？'
      },
      {
        keywords: ['タスク', '作成', '追加', 'ステップ'],
        response: 'プロジェクトに必要なタスクを分析しました。主要なマイルストーンとして以下の追加を提案します：\n\n1. 要件定義フェーズ\n2. 設計・計画フェーズ\n3. 実装フェーズ\n4. テスト・検証フェーズ\n5. リリース準備フェーズ\n\nこれらのマイルストーンを基に詳細なタスクを生成しますか？'
      },
      {
        keywords: ['予算', 'コスト', '費用'],
        response: 'プロジェクトの予算計画について、以下の重要ポイントを検討することをお勧めします：\n\n1. 人件費：プロジェクト期間中の必要人員とコスト\n2. 設備・備品費：必要な物理的リソース\n3. ソフトウェア・ライセンス費用\n4. 予備費：想定外の事態に対する10〜15%の予備費\n\n詳細な予算計画を立案するためのタスクを追加しますか？'
      },
      {
        keywords: ['リソース', '人員', 'スタッフ'],
        response: 'プロジェクトに必要なリソースを分析しました。以下のリソース配分を推奨します：\n\n1. プロジェクトマネージャー：1名（フルタイム）\n2. 開発者：3名（フルタイム）\n3. デザイナー：1名（パートタイム）\n4. QAテスター：2名（テストフェーズで必要）\n\nこれらのリソース要件をプロジェクト計画に反映しますか？'
      }
    ];
    
    // メッセージの内容に基づいてレスポンスを選択
    let responseContent = '申し訳ありませんが、その質問に対する具体的な回答を生成できません。プロジェクト計画、タスク管理、リスク分析に関する質問をお願いします。';
    
    for (const pattern of responsePatterns) {
      if (pattern.keywords.some(keyword => message.toLowerCase().includes(keyword))) {
        responseContent = pattern.response;
        break;
      }
    }
    
    // チャット履歴が存在しなければ作成
    if (!mockChatHistories[projectId]) {
      mockChatHistories[projectId] = {
        id: `chat-${Object.keys(mockChatHistories).length + 1}`,
        projectId,
        messages: []
      };
    }
    
    // ユーザーメッセージとAIレスポンスをチャット履歴に追加
    const timestamp = new Date().toISOString();
    const userMessageId = `msg-${Math.floor(Math.random() * 10000)}`;
    const aiMessageId = `msg-${Math.floor(Math.random() * 10000)}`;
    
    mockChatHistories[projectId].messages.push({
      id: userMessageId,
      sender: 'user',
      content: message,
      timestamp
    });
    
    mockChatHistories[projectId].messages.push({
      id: aiMessageId,
      sender: 'ai',
      content: responseContent,
      timestamp: new Date(new Date(timestamp).getTime() + 1000).toISOString()
    });
    
    return mockDelay({
      data: {
        status: 'success',
        data: {
          message: {
            id: aiMessageId,
            sender: 'ai',
            content: responseContent,
            timestamp: new Date(new Date(timestamp).getTime() + 1000).toISOString()
          }
        }
      }
    });
  }
  
  // 実際のAPI呼び出し
  try {
    const response = await api.post(CHAT.SEND, messageData);
    return response.data;
  } catch (error) {
    console.error('【API連携エラー】チャットメッセージの送信に失敗しました', error);
    throw error;
  }
};

/**
 * チャット履歴を取得
 * @param {string} projectId - プロジェクトID
 * @returns {Promise} チャット履歴
 */
export const getChatHistory = async (projectId) => {
  console.log(`【API連携】プロジェクト(ID:${projectId})のチャット履歴を取得します`);
  
  if (MOCK_MODE) {
    console.log('【API連携（モック）】モックモードでチャット履歴を返します');
    
    const chatHistory = mockChatHistories[projectId] || {
      id: `chat-new-${projectId}`,
      projectId,
      messages: []
    };
    
    return mockDelay({
      data: {
        status: 'success',
        data: chatHistory
      }
    });
  }
  
  // 実際のAPI呼び出し
  try {
    const response = await api.get(CHAT.HISTORY(projectId));
    return response.data;
  } catch (error) {
    console.error('【API連携エラー】チャット履歴の取得に失敗しました', error);
    throw error;
  }
};

/**
 * 解決策の提案を取得
 * @param {Object} issueData - 問題データ
 * @returns {Promise} 解決策の提案
 */
export const getSolutionSuggestions = async (issueData) => {
  console.log('【API連携】解決策の提案を取得します');
  
  if (MOCK_MODE) {
    console.log('【API連携（モック）】モックモードで解決策提案を返します');
    
    // 問題の種類によって異なる解決策を提案
    let suggestions = [];
    
    if (issueData.issue.toLowerCase().includes('遅延') || issueData.issue.toLowerCase().includes('遅れ')) {
      suggestions = [
        {
          id: 'sol-001',
          description: 'スコープの縮小: 初期リリースに必要な機能のみに集中し、他の機能は後続フェーズに延期する',
          impact: 'タイムラインを2週間短縮可能、ただし初期機能が限定される',
          difficulty: 'medium'
        },
        {
          id: 'sol-002',
          description: 'リソースの追加: 開発チームに一時的に人員を追加し、開発速度を向上させる',
          impact: 'タイムラインを維持しつつ全機能を実装可能、ただしコスト増加',
          difficulty: 'hard'
        },
        {
          id: 'sol-003',
          description: 'タイムラインの調整: 全体のプロジェクトスケジュールを見直し、クリティカルパスを最適化する',
          impact: '全体のプロジェクト完了が2週間延長されるが、品質への影響なし',
          difficulty: 'medium'
        }
      ];
    } else if (issueData.issue.toLowerCase().includes('品質') || issueData.issue.toLowerCase().includes('バグ')) {
      suggestions = [
        {
          id: 'sol-004',
          description: 'テスト強化: テストケースを追加し、QAリソースを増やして品質問題に対処する',
          impact: '品質の向上、ただしタイムラインが1週間延長',
          difficulty: 'medium'
        },
        {
          id: 'sol-005',
          description: 'コードレビュープロセスの強化: 追加のレビューステップを導入し、バグの早期発見を促進',
          impact: '将来的なバグの減少、短期的な開発速度の低下',
          difficulty: 'easy'
        },
        {
          id: 'sol-006',
          description: '自動テストの拡充: 単体テストと統合テストのカバレッジを向上させる',
          impact: '長期的な品質向上、初期の実装コスト増加',
          difficulty: 'hard'
        }
      ];
    } else if (issueData.issue.toLowerCase().includes('リソース') || issueData.issue.toLowerCase().includes('人員')) {
      suggestions = [
        {
          id: 'sol-007',
          description: '外部リソースの活用: 一部のタスクを外部委託し、内部チームをクリティカルなタスクに集中させる',
          impact: 'リソース制約の緩和、ただし調整コストの増加',
          difficulty: 'medium'
        },
        {
          id: 'sol-008',
          description: 'タスクの優先順位付け: リソースを最重要タスクに集中し、他のタスクを延期',
          impact: 'クリティカルな機能の確実な納品、一部機能の延期',
          difficulty: 'easy'
        },
        {
          id: 'sol-009',
          description: 'クロストレーニング: チームメンバーがスキルセットを共有し、リソースの柔軟性を向上',
          impact: '長期的なチーム能力の向上、短期的な生産性低下',
          difficulty: 'hard'
        }
      ];
    } else {
      // 汎用的な解決策
      suggestions = [
        {
          id: 'sol-010',
          description: 'リスク評価の実施: 潜在的な問題を特定し、予防的な対策を講じる',
          impact: '将来的な問題の回避、追加の計画作業が必要',
          difficulty: 'medium'
        },
        {
          id: 'sol-011',
          description: 'コミュニケーション強化: ステークホルダーとの定期的なレビューミーティングを増やす',
          impact: '期待値の調整と早期フィードバックの確保',
          difficulty: 'easy'
        },
        {
          id: 'sol-012',
          description: 'アジャイル手法の導入: スクラムやカンバンなどの手法を取り入れ、適応性を向上',
          impact: '変化への対応力強化、プロセス変更による一時的な混乱',
          difficulty: 'medium'
        }
      ];
    }
    
    return mockDelay({
      data: {
        status: 'success',
        data: {
          suggestions
        }
      }
    });
  }
  
  // 実際のAPI呼び出し
  try {
    const response = await api.post(CHAT.SUGGEST_SOLUTION, issueData);
    return response.data;
  } catch (error) {
    console.error('【API連携エラー】解決策提案の取得に失敗しました', error);
    throw error;
  }
};

/**
 * 解決策を適用
 * @param {string} projectId - プロジェクトID
 * @param {Object} solutionData - 適用する解決策データ
 * @returns {Promise} 適用結果
 */
export const applySolution = async (projectId, solutionData) => {
  console.log(`【API連携】プロジェクト(ID:${projectId})に解決策を適用します`);
  
  if (MOCK_MODE) {
    console.log('【API連携（モック）】モックモードで解決策適用を処理します');
    
    return mockDelay({
      data: {
        status: 'success',
        data: {
          appliedChanges: {
            tasksAdded: 2,
            tasksUpdated: 3,
            timelineAdjusted: true
          }
        },
        message: '解決策が正常に適用されました'
      }
    });
  }
  
  // 実際のAPI呼び出し
  try {
    const response = await api.post(CHAT.APPLY_SOLUTION(projectId), solutionData);
    return response.data;
  } catch (error) {
    console.error('【API連携エラー】解決策の適用に失敗しました', error);
    throw error;
  }
};

// default exportを削除して、named exportのみにする
// 循環参照の問題を解決するために、default exportは使用しない