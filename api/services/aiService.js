/**
 * AI サービス
 * Chat-to-Gantt機能のためのAI連携サービス
 * 
 * 変更履歴:
 * - 2025/03/19: 初期実装 (Claude)
 * - 2025/03/19: タスク生成をClaudeに合わせて修正
 */

const axios = require('axios');
require('dotenv').config();

// タスク生成のデフォルトテンプレート（プロジェクトタイプ別）
const defaultTaskTemplates = {
  'store-opening': [
    {
      title: '市場調査と競合分析',
      description: 'エリアの競合店舗、客層、需要予測などの調査',
      priority: 'high',
      warningText: '十分な市場調査をしないと立地選定で判断ミスが発生するリスクがあります。'
    },
    {
      title: '物件選定と契約',
      description: '出店場所の選定、内見、賃貸契約の締結',
      priority: 'high',
      warningText: '繁華街の物件は競争が激しいため、早めに動き出す必要があります。契約から工事開始まで通常2週間程度かかります。'
    },
    {
      title: '店舗デザインと内装プラン作成',
      description: '店舗コンセプトに合わせた内装デザインと設備計画',
      priority: 'medium'
    },
    {
      title: '各種許認可申請',
      description: '飲食店営業許可、酒類提供免許などの申請',
      priority: 'high',
      warningText: '飲食店営業許可は申請から取得まで通常1ヶ月程度かかります。'
    },
    {
      title: '内装工事',
      description: '内装工事、設備設置、看板設置など',
      priority: 'high'
    },
    {
      title: 'スタッフ募集と採用',
      description: '求人掲載、面接、採用手続き',
      priority: 'medium'
    },
    {
      title: 'スタッフ研修',
      description: 'サービスマニュアルの作成、調理研修、接客研修',
      priority: 'medium'
    },
    {
      title: 'プレオープン準備と実施',
      description: '招待客向けのプレオープンイベント実施',
      priority: 'low'
    },
    {
      title: 'グランドオープン',
      description: '一般営業開始とオープニングイベント',
      priority: 'high'
    }
  ],
  'product-launch': [
    {
      title: '市場調査と競合分析',
      description: '競合製品の調査、市場ニーズの分析、ターゲット顧客の特定',
      priority: 'high',
    },
    {
      title: '製品コンセプト策定',
      description: '製品の基本コンセプト、USP、ポジショニングの決定',
      priority: 'high'
    },
    {
      title: '仕様書作成',
      description: '製品の詳細仕様、機能要件、技術要件の文書化',
      priority: 'high'
    },
    {
      title: 'プロトタイプ開発',
      description: '初期プロトタイプの設計と製作',
      priority: 'medium'
    },
    {
      title: 'ユーザーテスト',
      description: 'プロトタイプのユーザビリティテスト実施と改善点の特定',
      priority: 'medium',
      warningText: 'テスト参加者の募集に時間がかかる場合があります。早めに計画してください。'
    },
    {
      title: '製品開発',
      description: '製品の本格的な開発、エンジニアリング作業の実施',
      priority: 'high'
    },
    {
      title: '品質テスト',
      description: '品質保証テスト、バグ修正、パフォーマンステスト',
      priority: 'high',
      warningText: 'テスト工程は予想以上に時間がかかることがあります。十分な期間を確保してください。'
    },
    {
      title: '製造準備',
      description: '製造パートナーの選定、生産ラインの準備',
      priority: 'medium'
    },
    {
      title: 'マーケティング戦略策定',
      description: 'ブランディング、プロモーション計画、販売戦略の策定',
      priority: 'medium'
    },
    {
      title: '販売チャネル準備',
      description: '小売店、オンラインストア、代理店などの準備',
      priority: 'medium'
    },
    {
      title: '製品発表イベント',
      description: '製品発表会、プレスリリース、デモンストレーションの実施',
      priority: 'high'
    },
    {
      title: '製品リリース',
      description: '一般販売開始、初期顧客サポート体制構築',
      priority: 'high'
    }
  ],
  'event-planning': [
    {
      title: 'イベントコンセプト策定',
      description: 'イベントの目的、テーマ、規模、ターゲット層の決定',
      priority: 'high'
    },
    {
      title: '予算策定',
      description: '予算計画の作成と承認取得',
      priority: 'high'
    },
    {
      title: '会場選定と予約',
      description: 'イベント会場の選定、訪問、契約締結',
      priority: 'high',
      warningText: '人気会場は予約が埋まりやすいため、できるだけ早く確保してください。'
    },
    {
      title: 'イベントスケジュール作成',
      description: 'プログラム、タイムライン、出演者のスケジュール調整',
      priority: 'medium'
    },
    {
      title: '出演者・スピーカー手配',
      description: '出演者との交渉、契約、要件調整',
      priority: 'high',
      warningText: '著名な出演者は3〜6ヶ月前に予約が必要な場合があります。'
    },
    {
      title: 'ベンダー選定と契約',
      description: 'ケータリング、音響、照明、装飾などのベンダー選定',
      priority: 'medium'
    },
    {
      title: 'マーケティング計画策定',
      description: 'プロモーション戦略、広告、SNS計画の策定',
      priority: 'medium'
    },
    {
      title: '集客活動',
      description: 'チケット販売、招待状送付、参加登録の管理',
      priority: 'high'
    },
    {
      title: 'ロジスティクス計画',
      description: '交通、宿泊、物流、設営スケジュールの計画',
      priority: 'medium'
    },
    {
      title: '当日運営チーム編成',
      description: 'スタッフの役割分担、研修、シフト計画',
      priority: 'medium'
    },
    {
      title: 'リハーサル',
      description: '主要部分のリハーサル、技術確認、タイムライン検証',
      priority: 'high'
    },
    {
      title: 'イベント実施',
      description: 'イベント当日の運営と管理',
      priority: 'high'
    },
    {
      title: 'イベント評価と報告',
      description: 'フィードバック収集、成果分析、報告書作成',
      priority: 'low'
    }
  ],
  'company-establishment': [
    {
      title: 'ビジネスプラン策定',
      description: '事業計画、収支計画、マーケット分析の作成',
      priority: 'high'
    },
    {
      title: '会社形態の決定',
      description: '法人形態（株式会社、合同会社等）の選択と検討',
      priority: 'high'
    },
    {
      title: '出資者・パートナー確定',
      description: '株主構成、役員構成、出資比率の決定',
      priority: 'high'
    },
    {
      title: '会社名・ロゴ決定',
      description: '社名の決定、商標調査、ロゴデザイン作成',
      priority: 'medium'
    },
    {
      title: '定款作成',
      description: '会社の基本規則となる定款の作成',
      priority: 'high',
      warningText: '定款認証には公証人役場での手続きが必要です。事前予約を推奨します。'
    },
    {
      title: '資本金準備',
      description: '資本金の準備、出資者からの入金確認',
      priority: 'high'
    },
    {
      title: '法人登記申請',
      description: '法務局への登記申請書類の準備と提出',
      priority: 'high',
      warningText: '書類不備があると再申請が必要になり、時間がかかります。'
    },
    {
      title: '税務署等への届出',
      description: '税務署、労働基準監督署、年金事務所等への各種届出',
      priority: 'high'
    },
    {
      title: '銀行口座開設',
      description: '法人口座の開設手続き',
      priority: 'high',
      warningText: '銀行によっては審査に時間がかかることがあります。'
    },
    {
      title: 'オフィス契約',
      description: 'オフィススペースの選定、契約、内装工事',
      priority: 'medium'
    },
    {
      title: 'ウェブサイト・名刺作成',
      description: '企業サイト構築、ドメイン取得、名刺デザイン・印刷',
      priority: 'medium'
    },
    {
      title: '採用活動',
      description: '求人広告掲載、面接、雇用契約締結',
      priority: 'medium'
    },
    {
      title: '営業開始準備',
      description: '業務フロー確立、初期顧客開拓、サービス準備',
      priority: 'high'
    },
    {
      title: '事業開始',
      description: '正式な事業開始、プレスリリース配信',
      priority: 'high'
    }
  ]
};

/**
 * 会話履歴からタスクリストを生成する
 * @param {string} conversationHistory 会話履歴
 * @returns {Promise<Array>} 生成されたタスクリスト
 */
const generateTasksFromConversation = async (conversationHistory) => {
  console.log('【API連携】会話履歴からのタスク生成開始');
  
  try {
    // APIキーの設定
    const apiKey = process.env.CLAUDE_API_KEY;
    
    if (!apiKey) {
      console.warn('【API連携】Claude APIキーが設定されていません。テンプレートにフォールバックします。');
      return generateBasicTemplateTaskList();
    }
    
    // 現在の日付情報を取得
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0]; // YYYY-MM-DD形式
    
    // 一週間後の日付
    const oneWeekLater = new Date(today);
    oneWeekLater.setDate(today.getDate() + 7);
    const formattedOneWeekLater = oneWeekLater.toISOString().split('T')[0];
    
    // 一ヶ月後の日付
    const oneMonthLater = new Date(today);
    oneMonthLater.setMonth(today.getMonth() + 1);
    const formattedOneMonthLater = oneMonthLater.toISOString().split('T')[0];
    
    // Claude APIへのリクエスト
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-7-sonnet-20250219',
        max_tokens: 2000,
        system: `あなたはプロジェクト計画を構造化されたタスクリストに変換する専門AIです。

## 入力
ユーザーとAIのやり取りから、プロジェクト計画やタスクリストが含まれるテキストが提供されます。

## 出力
以下の厳密なJSON形式でタスクリストを返してください：
{
  "tasks": [
    {
      "title": "タスク名（100文字以内）",
      "description": "タスクの詳細説明（省略可）",
      "startDate": "YYYY-MM-DD形式の開始日",
      "endDate": "YYYY-MM-DD形式の終了日",
      "priority": "low/medium/high",
      "warning": false,
      "warningText": null
    },
    // 他のタスク...
  ]
}

## 処理ルール
1. 提供されたテキストから明確なタスクを特定してください
2. 日付は必ず「YYYY-MM-DD」形式にしてください
3. 日付範囲が示されている場合は適切に開始日と終了日に分割してください
4. 優先度が明示されていない場合は「medium」としてください
5. リスクや危険性が示唆されている場合のみwarning=trueとし、説明を追加してください
6. プロジェクトの開始日は今日(${formattedToday})、終了日はデフォルトで1ヶ月後(${formattedOneMonthLater})としてください
7. 今日は${formattedToday}です。相対的な日付表現（「明日」「来週」など）があれば、この日付を基準に変換してください

レスポンスは上記のJSON形式のみとし、余分な説明や会話は含めないでください。`,
        messages: [
          {
            role: 'user',
            content: `以下の会話内容に基づいて、タスクリストを構造化された形式に変換してください：

${conversationHistory}

※JSONフォーマットのタスクリストのみを返してください。`
          }
        ],
        temperature: 0.7
      },
      {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('【API連携】Claude API呼び出し成功');
    
    // Claude 3.7 Sonnetの応答からテキスト部分を抽出
    const aiContent = response.data.content[0].text;
    
    // JSON部分を抽出
    const jsonMatch = aiContent.match(/```json\n([\s\S]*?)\n```/) || 
                      aiContent.match(/```\n([\s\S]*?)\n```/) || 
                      [null, aiContent];
    
    const jsonContent = jsonMatch[1];
    
    try {
      const parsedData = JSON.parse(jsonContent);
      
      // タスクの形式を標準化
      return parsedData.tasks.map((task, index) => ({
        title: task.title,
        description: task.description,
        startDate: task.startDate,
        endDate: task.endDate,
        priority: task.priority || 'medium',
        status: 'not-started',
        order: index,
        warning: !!task.warningText,
        warningText: task.warningText || undefined
      }));
      
    } catch (jsonError) {
      console.error('AI出力のJSONパースエラー:', jsonError);
      console.log('パース失敗したJSONコンテンツ:', jsonContent);
      return generateBasicTemplateTaskList();
    }
    
  } catch (error) {
    console.error('Claude APIエラー:', error.response?.data || error.message);
    // エラー時は基本テンプレートにフォールバック
    return generateBasicTemplateTaskList();
  }
};

/**
 * 基本的なテンプレートタスクリストを生成（フォールバック用）
 * @returns {Array} 基本的なタスクリスト
 */
const generateBasicTemplateTaskList = () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  
  return [
    {
      title: "プロジェクト計画策定",
      description: "プロジェクトの目標、スコープ、期限を明確にする",
      startDate: today.toISOString().split('T')[0],
      endDate: tomorrow.toISOString().split('T')[0],
      priority: "high",
      status: "not-started",
      order: 0
    },
    {
      title: "要件定義",
      description: "詳細な要件を収集し、ドキュメント化する",
      startDate: tomorrow.toISOString().split('T')[0],
      endDate: nextWeek.toISOString().split('T')[0],
      priority: "high",
      status: "not-started",
      order: 1
    },
    {
      title: "リソース確保",
      description: "必要な人員、予算、ツールを確保する",
      startDate: tomorrow.toISOString().split('T')[0],
      endDate: nextWeek.toISOString().split('T')[0],
      priority: "medium",
      status: "not-started",
      order: 2
    }
  ];
};

/**
 * AIを使用してタスクリストを生成する（後方互換性用）
 * @param {Object} project プロジェクト情報
 * @param {Object} chatData チャットからの追加情報
 * @returns {Promise<Array>} 生成されたタスクリスト
 */
const generateTasks = async (project, chatData) => {
  console.log('【API連携】旧メソッド経由でのタスク生成リクエスト - 新メソッドにリダイレクト');
  
  // 旧関数から新関数へリダイレクト
  const conversationText = chatData.additionalInfo || '';
  return generateTasksFromConversation(conversationText);
};

/**
 * 自然言語の会話内容から構造化タスクリストを生成する
 * @param {Object} project プロジェクト情報
 * @param {Object} chatData チャットからの追加情報
 * @returns {Promise<Array>} 生成されたタスクリスト
 */
const convertChatToStructuredTasks = async (project, chatData) => {
  try {
    console.log('【API連携】Claude APIを呼び出し中...');
    
    // APIキーの設定
    const apiKey = process.env.CLAUDE_API_KEY;
    
    if (!apiKey) {
      console.warn('【API連携】Claude APIキーが設定されていません。テンプレートにフォールバックします。');
      return generateTasksFromTemplate(project);
    }
    
    // プロジェクト情報の準備
    // プロジェクトタイプをAI用の詳細タイプに変換
    let projectTypeForAI;
    switch (project.type) {
      case 'store':
        projectTypeForAI = 'store-opening';
        break;
      case 'product':
        projectTypeForAI = 'product-launch';
        break;
      case 'marketing':
        projectTypeForAI = 'marketing';
        break;
      case 'project':
      case 'other':
      default:
        // プロジェクトの内容から推測
        const titleLower = project.title ? project.title.toLowerCase() : '';
        const descLower = project.description ? project.description.toLowerCase() : '';
        
        if (titleLower.includes('店舗') || titleLower.includes('オープン') || descLower.includes('店舗') || descLower.includes('オープン')) {
          projectTypeForAI = 'store-opening';
        } else if (titleLower.includes('製品') || titleLower.includes('プロダクト') || titleLower.includes('発売') || 
                 descLower.includes('製品') || descLower.includes('プロダクト') || descLower.includes('発売')) {
          projectTypeForAI = 'product-launch';
        } else if (titleLower.includes('イベント') || descLower.includes('イベント')) {
          projectTypeForAI = 'event-planning';
        } else if (titleLower.includes('会社') || titleLower.includes('設立') || 
                 descLower.includes('会社') || descLower.includes('設立')) {
          projectTypeForAI = 'company-establishment';
        } else {
          projectTypeForAI = 'project-planning';
        }
        break;
    }
    
    // プロジェクトの日付を安全に処理
    let projectStartDate, projectEndDate;
    
    try {
      // 開始日の処理
      const startDate = new Date(project.startDate);
      if (isNaN(startDate.getTime())) {
        console.log('無効な開始日を検出しました。現在日付を使用します。');
        const today = new Date();
        projectStartDate = today.toISOString().split('T')[0];
      } else {
        projectStartDate = startDate.toISOString().split('T')[0];
      }
      
      // 終了日の処理
      const endDate = new Date(project.endDate);
      if (isNaN(endDate.getTime())) {
        console.log('無効な終了日を検出しました。開始日の30日後を使用します。');
        const defaultEndDate = new Date(new Date(projectStartDate).getTime() + 30 * 24 * 60 * 60 * 1000);
        projectEndDate = defaultEndDate.toISOString().split('T')[0];
      } else {
        projectEndDate = endDate.toISOString().split('T')[0];
      }
    } catch (error) {
      console.log('日付処理エラー:', error);
      const today = new Date();
      projectStartDate = today.toISOString().split('T')[0];
      const defaultEndDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
      projectEndDate = defaultEndDate.toISOString().split('T')[0];
    }
    
    // プロジェクト期間を計算
    const startDate = new Date(projectStartDate);
    const endDate = new Date(projectEndDate);
    const projectDuration = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    // 現在の日付情報を取得
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0]; // YYYY-MM-DD形式
    
    // チャット履歴を取得
    let conversationContent = chatData.additionalInfo || '';
    
    // プロジェクトIDが有効な場合はチャット履歴を取得
    if (project._id && project._id !== 'new') {
      try {
        // ChatHistoryモデルをインポート
        const ChatHistory = require('../models/ChatHistory');
        
        // ChatHistoryから会話履歴を取得
        const historyDoc = await ChatHistory.findOne({ projectId: project._id });
        
        if (historyDoc && historyDoc.messages && historyDoc.messages.length > 0) {
          // 会話履歴を文字列に変換
          const chatHistory = historyDoc.messages.map(msg => 
            `${msg.sender === 'user' ? 'ユーザー' : 'アシスタント'}: ${msg.content}`
          ).join('\n\n');
          
          console.log(`【API連携】チャット履歴 ${historyDoc.messages.length}件を取得しました`);
          
          // 会話履歴を追加情報と結合
          conversationContent = `${chatHistory}\n\n${conversationContent}`;
          
          // トークン数を抑えるため長すぎる場合は最新の会話を優先
          if (conversationContent.length > 15000) {
            conversationContent = conversationContent.slice(-15000);
            console.log('会話履歴が長すぎるため、最新部分のみを使用します');
          }
        }
      } catch (historyError) {
        console.error('会話履歴取得エラー:', historyError);
        // 履歴取得エラーの場合は元のadditionalInfoだけで続行
      }
    }
    
    // Claude APIへのリクエスト - タスク変換用
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-7-sonnet-20250219',
        max_tokens: 2000,
        system: `あなたはプロジェクト計画を構造化されたタスクリストに変換する専門AIです。

## 入力
ユーザーとAIのやり取りから、プロジェクト計画やタスクリストが含まれるテキストが提供されます。

## 出力
以下の厳密なJSON形式でタスクリストを返してください：
{
  "tasks": [
    {
      "title": "タスク名（100文字以内）",
      "description": "タスクの詳細説明（省略可）",
      "startDate": "YYYY-MM-DD形式の開始日",
      "endDate": "YYYY-MM-DD形式の終了日",
      "priority": "low/medium/high",
      "warning": false,
      "warningText": null
    },
    // 他のタスク...
  ]
}

## 処理ルール
1. 提供されたテキストから明確なタスクを特定してください
2. 日付は必ず「YYYY-MM-DD」形式にしてください
3. 日付範囲が示されている場合は適切に開始日と終了日に分割してください
4. 優先度が明示されていない場合は「medium」としてください
5. リスクや危険性が示唆されている場合のみwarning=trueとし、説明を追加してください
6. プロジェクトの開始日(${projectStartDate})から終了日(${projectEndDate})の間に収まるようにタスクを調整してください
7. 今日は${formattedToday}です。相対的な日付表現（「明日」「来週」など）があれば、この日付を基準に変換してください

レスポンスは上記のJSON形式のみとし、余分な説明や会話は含めないでください。`,
        messages: [
          {
            role: 'user',
            content: `以下のプロジェクト情報とやり取りに基づいて、タスクリストを構造化された形式に変換してください：

プロジェクト名: ${project.title}
プロジェクトタイプ: ${projectTypeForAI}
期間: ${projectStartDate} から ${projectEndDate} (${projectDuration}日間)
目標: ${chatData.goal || 'プロジェクトを期限内に完了する'}

ユーザーとのやり取り内容:
${conversationContent}

※JSONフォーマットのタスクリストのみを返してください。`
          }
        ],
        temperature: 0.7
      },
      {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('【API連携】Claude API呼び出し成功');
    
    // Claude 3.7 Sonnetの応答からテキスト部分を抽出
    const aiContent = response.data.content[0].text;
    
    // JSON部分を抽出
    const jsonMatch = aiContent.match(/```json\n([\s\S]*?)\n```/) || 
                      aiContent.match(/```\n([\s\S]*?)\n```/) || 
                      [null, aiContent];
    
    const jsonContent = jsonMatch[1];
    
    try {
      const parsedData = JSON.parse(jsonContent);
      
      // タスクの形式を標準化
      return parsedData.tasks.map((task, index) => ({
        title: task.title,
        description: task.description,
        startDate: task.startDate,
        endDate: task.endDate,
        priority: task.priority || 'medium',
        status: 'not-started',
        order: index,
        warning: !!task.warningText,
        warningText: task.warningText || undefined
      }));
      
    } catch (jsonError) {
      console.error('AI出力のJSONパースエラー:', jsonError);
      console.log('パース失敗したJSONコンテンツ:', jsonContent);
      return generateTasksFromTemplate(project);
    }
    
  } catch (error) {
    console.error('Claude APIエラー:', error.response?.data || error.message);
    // エラー時はテンプレートにフォールバック
    return generateTasksFromTemplate(project);
  }
};

/**
 * テンプレートからタスクリストを生成する
 * @param {Object} project プロジェクト情報
 * @returns {Array} 生成されたタスクリスト
 */
const generateTasksFromTemplate = (project) => {
  console.log('【API連携】テンプレートからタスク生成');
  
  // プロジェクトタイプに基づいてテンプレート選択
  let aiTemplateType;
  
  // DBに保存されているプロジェクトタイプをテンプレート用のタイプに変換
  switch (project.type) {
    case 'store':
      aiTemplateType = 'store-opening';
      break;
    case 'product':
      aiTemplateType = 'product-launch';
      break;
    case 'marketing':
      aiTemplateType = 'marketing';
      // マーケティング用テンプレートがなければイベント計画を使用
      if (!defaultTaskTemplates['marketing']) {
        aiTemplateType = 'event-planning';
      }
      break;
    case 'project':
    case 'other':
    default:
      // プロジェクトの内容から最適なテンプレートを選択
      const titleLower = project.title ? project.title.toLowerCase() : '';
      const descLower = project.description ? project.description.toLowerCase() : '';
      
      if (titleLower.includes('店舗') || titleLower.includes('オープン') || 
          descLower.includes('店舗') || descLower.includes('オープン')) {
        aiTemplateType = 'store-opening';
      } else if (titleLower.includes('製品') || titleLower.includes('プロダクト') || 
               descLower.includes('製品') || descLower.includes('プロダクト')) {
        aiTemplateType = 'product-launch';
      } else if (titleLower.includes('イベント') || descLower.includes('イベント')) {
        aiTemplateType = 'event-planning';
      } else {
        // デフォルトはイベント計画テンプレート
        aiTemplateType = 'event-planning';
      }
      break;
  }
  
  console.log(`【API連携】テンプレートタイプ選択: ${aiTemplateType}`);
  
  // 選択したテンプレートタイプが存在しない場合はフォールバック
  const template = defaultTaskTemplates[aiTemplateType] || defaultTaskTemplates['store-opening'];
  
  // プロジェクト期間を計算
  const startDate = new Date(project.startDate);
  const endDate = new Date(project.endDate);
  const projectDurationDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
  
  // 各タスクの日数を計算（プロジェクト全体の期間に対する割合）
  const totalTaskWeight = template.length * 2; // 単純な重み付け
  
  // 現在の日付を開始日として設定
  let currentDate = new Date(startDate);
  
  // テンプレートからタスクリストを生成
  return template.map((task, index) => {
    // タスクの所要日数を計算（優先度に応じて調整）
    let taskDurationDays;
    switch (task.priority) {
      case 'high':
        taskDurationDays = Math.max(3, Math.floor(projectDurationDays / totalTaskWeight * 2));
        break;
      case 'medium':
        taskDurationDays = Math.max(2, Math.floor(projectDurationDays / totalTaskWeight * 3));
        break;
      case 'low':
        taskDurationDays = Math.max(1, Math.floor(projectDurationDays / totalTaskWeight * 1.5));
        break;
      default:
        taskDurationDays = Math.max(2, Math.floor(projectDurationDays / totalTaskWeight * 2));
    }
    
    // タスクの開始日と終了日を設定
    const taskStartDate = new Date(currentDate);
    const taskEndDate = new Date(currentDate);
    taskEndDate.setDate(taskEndDate.getDate() + taskDurationDays);
    
    // 次のタスクの開始日を設定（一部タスクは並行して実行可能と仮定）
    if (index < template.length - 1) {
      if (task.priority === 'high') {
        // 高優先度タスクは完全に終了してから次のタスクを開始
        currentDate = new Date(taskEndDate);
      } else {
        // 中・低優先度タスクは30%重複して次のタスクを開始可能
        const overlapDays = Math.floor(taskDurationDays * 0.3);
        currentDate.setDate(currentDate.getDate() + taskDurationDays - overlapDays);
      }
    }
    
    // 返却用タスクオブジェクトを作成
    return {
      title: task.title,
      description: task.description,
      startDate: taskStartDate.toISOString().split('T')[0], // YYYY-MM-DD形式
      endDate: taskEndDate.toISOString().split('T')[0], // YYYY-MM-DD形式
      priority: task.priority,
      status: 'not-started',
      order: index,
      warning: !!task.warningText,
      warningText: task.warningText
    };
  });
};

/**
 * チャットメッセージを処理してAIレスポンスを取得する
 * @param {string} message ユーザーメッセージ
 * @param {string} projectId プロジェクトID
 * @param {Array} conversation オプションの会話履歴配列
 * @returns {Promise<Object>} AIからのレスポンス
 */
const processChatMessage = async (message, projectId, conversation = null) => {
  console.log(`【API連携】チャットメッセージ処理: プロジェクト ${projectId}`);
  
  try {
    // デバッグ情報
    console.log('【AI設定確認】USE_AI_MODEL:', process.env.USE_AI_MODEL, 'API_KEY長さ:', process.env.CLAUDE_API_KEY ? process.env.CLAUDE_API_KEY.length : 0);
    
    // AIモデル使用の場合
    if (process.env.USE_AI_MODEL === 'true') {
      console.log('【AI設定】Claude modelを使用します');
      
      // 会話履歴がクライアントから提供された場合はそれを使用
      if (conversation && Array.isArray(conversation) && conversation.length > 0) {
        return await processChatWithAI(message, projectId, conversation);
      } else {
        return await processChatWithAI(message, projectId);
      }
    } 
    // 簡易レスポンスのフォールバック
    else {
      console.log('【AI設定】シンプルレスポンスにフォールバックします');
      return generateSimpleChatResponse(message, projectId);
    }
  } catch (error) {
    console.error('チャットメッセージ処理エラー:', error);
    return {
      content: 'チャット処理中にエラーが発生しました。しばらくしてからもう一度お試しください。',
      suggestions: []
    };
  }
};

/**
 * AIモデルを使用してチャットメッセージを処理する
 * @param {string} message ユーザーメッセージ
 * @param {string} projectId プロジェクトID
 * @param {Array} clientConversation クライアントからの会話履歴配列
 * @returns {Promise<Object>} AIからのレスポンス
 */
const processChatWithAI = async (message, projectId, clientConversation = null) => {
  try {
    console.log('【API連携】Claude APIを呼び出し中...');
    
    // APIキーの設定
    const apiKey = process.env.CLAUDE_API_KEY;
    
    if (!apiKey) {
      console.warn('【API連携】Claude APIキーが設定されていません。簡易レスポンスにフォールバックします。');
      return generateSimpleChatResponse(message, projectId);
    }
    
    // 会話履歴を準備
    let chatHistory = [];
    
    // クライアントから提供された会話履歴がある場合はそれを使用
    if (clientConversation && Array.isArray(clientConversation) && clientConversation.length > 0) {
      chatHistory = [...clientConversation];
      console.log(`【API連携】クライアントから提供された会話履歴 ${chatHistory.length}件 を使用します`);
    }
    // そうでない場合はDBから会話履歴を取得（新規プロジェクトの場合は空の配列）
    else if (projectId && projectId !== 'new') {
      try {
        // ChatHistoryモデルをインポート
        const ChatHistory = require('../models/ChatHistory');
        
        // ChatHistoryから会話履歴を取得
        const historyDoc = await ChatHistory.findOne({ projectId });
        
        if (historyDoc && historyDoc.messages && historyDoc.messages.length > 0) {
          // 会話履歴を整形してAnthropicのMessages APIフォーマットに変換
          chatHistory = historyDoc.messages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.content
          }));
          
          // システムメッセージは除外（roleがuserまたはassistantのみ許可）
          chatHistory = chatHistory.filter(msg => msg.role === 'user' || msg.role === 'assistant');
          
          console.log(`【API連携】DBから ${chatHistory.length}件の過去メッセージを取得しました`);
        }
      } catch (historyError) {
        console.error('会話履歴取得エラー:', historyError);
        // 履歴取得エラーの場合は空の配列で続行
        chatHistory = [];
      }
    }
    
    // クライアントから提供された会話履歴に現在のメッセージが含まれていない場合は追加
    const hasCurrentMessage = chatHistory.some(msg => 
      msg.role === 'user' && msg.content === message
    );
    
    if (!hasCurrentMessage) {
      // 現在のメッセージを追加
      chatHistory.push({
        role: 'user',
        content: message
      });
    }
    
    // トークン数制限のため、会話履歴が長すぎる場合は最新の10件程度に制限
    if (chatHistory.length > 10) {
      chatHistory = chatHistory.slice(-10);
      console.log(`【API連携】会話履歴が長いため、最新の${chatHistory.length}件に制限します`);
    }
    
    // 現在の日付情報を取得
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD形式
    const japaneseDate = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
    
    // Claude APIへのリクエスト（会話履歴を含む）
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-7-sonnet-20250219',
        max_tokens: 1000,
        system: `あなたはプロジェクト計画のアシスタントです。ユーザーのプロジェクト管理をサポートします。
        計画、スケジューリング、リスク管理についての質問に答え、実用的なアドバイスを提供してください。
        回答は簡潔かつ具体的にし、必要に応じて次のステップも提案してください。
        
        重要な情報：
        - 今日の日付: ${formattedDate} (${japaneseDate})
        - ユーザーが「今日」「明日」「来週」「今月末」などの相対的な日付表現を使った場合は、上記の今日の日付を基準に計算してください。
        - 日付はYYYY-MM-DD形式で回答に含めてください。`,
        messages: chatHistory,
        temperature: 0.7
      },
      {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('【API連携】Claude API呼び出し成功');
    
    // Claude 3.7 Sonnetの応答形式に対応
    // content配列からテキスト部分を抽出
    const aiContent = response.data.content[0].text;
    
    return {
      content: aiContent
    };
    
  } catch (error) {
    console.error('Claude APIエラー:', error.response?.data || error.message);
    // エラー時は簡易レスポンスにフォールバック
    return generateSimpleChatResponse(message, projectId);
  }
};

/**
 * 簡易的なチャットレスポンスを生成する
 * @param {string} message ユーザーメッセージ
 * @param {string} projectId プロジェクトID
 * @returns {Object} 生成されたレスポンス
 */
const generateSimpleChatResponse = (message, projectId) => {
  console.log('【API連携】簡易チャットレスポンス生成');
  
  let response = '';
  
  // メッセージの内容に基づいて簡易的な応答を生成
  if (message.toLowerCase().includes('こんにちは') || message.toLowerCase().includes('はじめまして')) {
    response = 'こんにちは！プロジェクトナビゲーターへようこそ。どのようなプロジェクトをお手伝いしましょうか？';
  }
  else if (message.toLowerCase().includes('新しい') && (message.toLowerCase().includes('プロジェクト') || message.toLowerCase().includes('計画'))) {
    response = '新しいプロジェクトを作成しましょう。どのような種類のプロジェクトをお考えですか？';
  }
  else if (message.toLowerCase().includes('店舗') || message.toLowerCase().includes('出店')) {
    response = '新店舗の出店計画ですね。以下のような情報をお聞かせいただけると、より具体的な計画を立てられます：\n\n・目標オープン日\n・出店エリア\n・予算規模\n・店舗のコンセプト';
  }
  else if (message.toLowerCase().includes('タスク') && message.toLowerCase().includes('生成')) {
    response = 'タスクリストを生成するには、以下の情報が必要です：\n\n・プロジェクトの種類\n・目標完了日\n・主要なマイルストーン\n\nこれらの情報を教えていただけますか？';
  }
  else if (message.toLowerCase().includes('リスク') || message.toLowerCase().includes('問題')) {
    response = 'プロジェクトにおけるリスク管理は重要です。どのような懸念事項がありますか？具体的にお聞かせいただければ、対策を提案できます。';
  }
  else if (message.toLowerCase().includes('ありがとう')) {
    response = 'お役に立てて嬉しいです。他にご質問やお手伝いが必要なことがあれば、お気軽にお聞きください。';
  }
  else {
    response = 'ご質問ありがとうございます。もう少し具体的に教えていただけると、より適切なサポートができます。どのような情報をお求めですか？';
  }
  
  return {
    content: response
  };
};

/**
 * AIを使用して解決策を提案する
 * @param {Object} issue 問題の詳細情報
 * @returns {Promise<Array>} 提案された解決策のリスト
 */
const suggestSolutions = async (issue) => {
  console.log('【API連携】問題解決提案開始');
  
  try {
    // AIモデル使用の場合
    if (process.env.USE_AI_MODEL === 'true') {
      return await suggestSolutionsWithAI(issue);
    } 
    // テンプレートベースのフォールバック
    else {
      return generateTemplateSolutions(issue);
    }
  } catch (error) {
    console.error('解決策提案エラー:', error);
    throw new Error('解決策の提案中にエラーが発生しました');
  }
};

/**
 * ClaudeモデルAPIを使用して解決策を提案する
 * @param {Object} issue 問題の詳細情報
 * @returns {Promise<Array>} 提案された解決策のリスト
 */
const suggestSolutionsWithAI = async (issue) => {
  try {
    console.log('【API連携】Claude APIを呼び出し中...');
    
    // APIキーの設定
    const apiKey = process.env.CLAUDE_API_KEY;
    
    if (!apiKey) {
      console.warn('Claude APIキーが設定されていません。テンプレートにフォールバックします。');
      return generateTemplateSolutions(issue);
    }
    
    // Claude APIへのリクエスト
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-7-sonnet-20250219',
        max_tokens: 1000,
        system: `あなはプロジェクト管理の専門家です。プロジェクト実行中に発生した問題に対して、実践的で効果的な解決策を提案してください。
        解決策は具体的で実行可能なものとし、それぞれの解決策について以下の情報を含めてください：
        - 解決策の詳細な説明
        - 実施した場合の影響
        - 難易度（easy/medium/hard）
        
        解決策は3〜5個提案し、JSONフォーマットで出力してください。`,
        messages: [
          {
            role: 'user',
            content: `プロジェクトID: ${issue.planId}
            タスクID: ${issue.taskId}
            問題: ${issue.issue}
            
            この問題に対する効果的な解決策を提案してください。以下のJSON形式で出力してください:
            
            {
              "suggestions": [
                {
                  "id": "1",
                  "description": "解決策の説明",
                  "impact": "影響の説明",
                  "difficulty": "medium"
                },
                ...
              ]
            }`
          }
        ],
        temperature: 0.7
      },
      {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('【API連携】Claude API呼び出し成功');
    
    // Claude 3.7 Sonnetの応答からテキスト部分を抽出
    const aiContent = response.data.content[0].text;
    
    // JSON部分を抽出
    const jsonMatch = aiContent.match(/```json\n([\s\S]*?)\n```/) || 
                      aiContent.match(/```\n([\s\S]*?)\n```/) || 
                      [null, aiContent];
    
    const jsonContent = jsonMatch[1];
    
    try {
      const parsedData = JSON.parse(jsonContent);
      
      // 解決策の形式を標準化
      return parsedData.suggestions || parsedData;
      
    } catch (jsonError) {
      console.error('AI出力のJSONパースエラー:', jsonError);
      console.log('パース失敗したJSONコンテンツ:', jsonContent);
      return generateTemplateSolutions(issue);
    }
    
  } catch (error) {
    console.error('Claude APIエラー:', error.response?.data || error.message);
    // エラー時はテンプレートにフォールバック
    return generateTemplateSolutions(issue);
  }
};

/**
 * テンプレートから解決策を生成する
 * @param {Object} issue 問題の詳細情報
 * @returns {Array} 生成された解決策のリスト
 */
const generateTemplateSolutions = (issue) => {
  console.log('【API連携】テンプレートから解決策生成');
  
  // 問題の種類に基づいて解決策を提案
  const issueText = issue.issue.toLowerCase();
  
  if (issueText.includes('遅延') || issueText.includes('スケジュール') || issueText.includes('期限')) {
    return [
      {
        id: '1',
        description: 'タスクを細分化して並行作業を増やす',
        impact: 'タスクを小さな単位に分割し、チームメンバー間で並行して作業することで全体の所要時間を短縮できます。',
        difficulty: 'medium'
      },
      {
        id: '2',
        description: '追加リソースの投入',
        impact: '一時的に人員やリソースを増強することで、作業スピードを高めることができます。ただし、コスト増加の可能性があります。',
        difficulty: 'hard'
      },
      {
        id: '3',
        description: 'スコープの見直しと優先順位の再設定',
        impact: '必須機能と後回しにできる機能を区別し、重要度に応じたタスクの再優先順位付けを行います。',
        difficulty: 'easy'
      }
    ];
  }
  else if (issueText.includes('予算') || issueText.includes('コスト') || issueText.includes('費用')) {
    return [
      {
        id: '1',
        description: '代替サプライヤーの検討',
        impact: '複数のサプライヤーから見積もりを取り、より低コストのオプションを探します。品質とのバランスに注意が必要です。',
        difficulty: 'medium'
      },
      {
        id: '2',
        description: 'プロジェクトスコープの縮小',
        impact: '必須でない機能や要素を削減し、コアとなる価値提供に集中します。将来のフェーズに一部の機能を延期することも検討できます。',
        difficulty: 'medium'
      },
      {
        id: '3',
        description: '社内リソースの活用',
        impact: '外部委託していた作業を社内リソースで代替することでコスト削減を図ります。ただし、内部リソースの負荷増加に注意が必要です。',
        difficulty: 'easy'
      }
    ];
  }
  else if (issueText.includes('人材') || issueText.includes('スタッフ') || issueText.includes('採用')) {
    return [
      {
        id: '1',
        description: '採用チャネルの多様化',
        impact: '従来の採用経路に加えて、ソーシャルメディア、業界特化型プラットフォーム、紹介プログラムなど複数の採用経路を活用します。',
        difficulty: 'medium'
      },
      {
        id: '2',
        description: '短期契約やフリーランスの活用',
        impact: '正社員採用に時間がかかる場合、一時的にフリーランスや契約社員を活用してギャップを埋めます。',
        difficulty: 'easy'
      },
      {
        id: '3',
        description: 'タスクの外部委託',
        impact: '専門的なタスクを外部の業者やコンサルタントに委託することで、内部人材の不足を補います。',
        difficulty: 'medium'
      }
    ];
  }
  else if (issueText.includes('品質') || issueText.includes('不具合') || issueText.includes('バグ')) {
    return [
      {
        id: '1',
        description: '品質管理プロセスの強化',
        impact: 'レビュー、テスト、検証のプロセスを強化し、問題の早期発見と修正を促進します。',
        difficulty: 'medium'
      },
      {
        id: '2',
        description: '専門家によるレビュー',
        impact: '該当分野の専門家に外部レビューを依頼し、品質向上のための客観的なフィードバックを得ます。',
        difficulty: 'hard'
      },
      {
        id: '3',
        description: 'パイロットテストの実施',
        impact: '本番環境に近い条件で限定的なパイロットテストを実施し、実際の使用条件での品質を検証します。',
        difficulty: 'medium'
      }
    ];
  }
  else {
    // デフォルトの解決策
    return [
      {
        id: '1',
        description: 'ステークホルダーとの再調整',
        impact: '現状と課題をステークホルダーと共有し、期待値と現実のギャップを埋めるための再調整を行います。',
        difficulty: 'medium'
      },
      {
        id: '2',
        description: 'リスク対応策の見直し',
        impact: '既存のリスク対応策を見直し、より効果的な対策を検討します。事前に代替プランを用意しておくことで、問題発生時の対応を迅速化できます。',
        difficulty: 'medium'
      },
      {
        id: '3',
        description: '定期的な進捗確認の強化',
        impact: '進捗確認の頻度を上げ、問題の早期発見と対応を促進します。短いフィードバックサイクルによって、小さな問題が大きな障害に発展するのを防ぎます。',
        difficulty: 'easy'
      }
    ];
  }
};

module.exports = {
  generateTasks,
  generateTasksFromConversation,
  processChatMessage,
  suggestSolutions
};