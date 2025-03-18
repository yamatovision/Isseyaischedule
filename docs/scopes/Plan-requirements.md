# Plan画面要件定義

## 1. 機能概要

### 目的と主な機能
Plan画面は、単一プロジェクトの詳細な管理と進捗追跡のための中核画面です。プロジェクトのタイムライン表示、タスク管理、進捗の可視化を通じて、ユーザーがプロジェクトの全体像を把握し、効率的に管理できることを目的としています。

### 全体要件との関連性
- マイルストーン重視の計画表示
- タイムラインの可視化
- タスクの進捗管理と表示
- ダッシュボードとの連携（直近タスクおよびアラート情報の共有）
- Chat-to-Gantt機能との統合（問題発生時の解決策提案）

### 想定ユーザー
- プロジェクト管理者
- 経営陣・意思決定者
- プロジェクトメンバー

### 主要ユースケース
1. プロジェクトの全体進捗を素早く確認する
2. タスクの進捗状況を更新する
3. タイムラインを閲覧し、今後のスケジュールを把握する
4. 特定タスクの詳細を確認・編集する
5. 新規タスクを追加する
6. 遅延リスクが発生した際に、Chat-to-Gantt機能を使って解決策を提案してもらう
7. 他のプロジェクトの関連タスクや日程を参照し、リソース競合をチェックする

## 2. UI要素の詳細

### 各画面の構成要素

#### ヘッダー部分
- プロジェクトタイトル表示
- エクスポートボタン
- 共有ボタン
- オプションメニュー

#### 進捗サマリー
- 全体進捗率表示
- 完了タスク数
- 残りタスク数
- 遅延タスク数
- リスクアラート表示（遅延可能性の警告）
- 解決策提案ボタン（chat-to-gantt機能へのリンク）

#### タブナビゲーション
- タイムラインタブ
- タスクタブ
- 進捗タブ
- リソースタブ（新規：他プロジェクトとの関連表示）
- 設定タブ

#### タイムライン表示
- ガントチャート形式のタスク表示
- 表示期間切替（日別/週別/月別）
- フィルター機能
- 今日へジャンプ機能
- 他プロジェクトのタスク表示オプション（オーバーレイ表示）
- リソース競合警告表示

#### タスク一覧
- タスク完了チェックボックス
- タスク優先度表示
- タスク期限表示
- タスク進捗率表示
- タスク状態表示（未着手/進行中/完了/遅延）

#### 進捗情報
- タスク進捗状況円グラフ
- 優先度別タスク数バーグラフ
- 週次進捗トレンドライングラフ

#### 設定画面
- 基本設定（プラン名/説明/期間）
- エクスポート機能
- リソース設定（人員/予算/設備など）
- 関連プロジェクト設定（影響を受ける/与えるプロジェクトの指定）

### 入力フィールドと検証ルール

#### タスク追加ダイアログ
- タスク名：必須、最大50文字
- 説明：任意、最大200文字
- 開始日：必須、プロジェクト期間内であること
- 期限日：必須、開始日以降かつプロジェクト期間内であること
- 優先度：必須、高/中/低から選択

#### プロジェクト設定
- プラン名：必須、最大50文字
- 説明：任意、最大300文字
- 開始日：必須
- 終了日：必須、開始日より後であること
- 必要リソース：任意、リソースタイプと量を指定
- 関連プロジェクト：任意、既存プロジェクトから選択

### ボタンとアクション
- 新規タスク追加：画面右下のFloating Action Button
- タスク編集：各タスク右側のメニューから
- プロジェクト編集：ヘッダー部分の編集ボタン
- エクスポート：PDFまたはExcelフォーマットでのエクスポート
- タスク完了トグル：チェックボックスによる完了/未完了の切り替え
- 解決策提案：リスクが検出された際に表示される「解決策を提案」ボタン
- リソース競合チェック：新規タスク作成/編集時に「リソース競合をチェック」ボタン
- 関連プロジェクト表示：「他のプロジェクトを表示」トグルスイッチ

### レスポンシブ対応の要件
- モバイル表示時はサイドナビゲーションが非表示になり、ハンバーガーメニューから表示
- モバイル表示時はガントチャートが横スクロール可能になる
- 画面幅に応じてグラフのレイアウトが調整される

### 既存UIコンポーネントの再利用
- Material UIコンポーネント
- Chart.jsグラフコンポーネント
- 共通ヘッダー/フッターコンポーネント

## 3. データ構造と連携

### 扱うデータの種類と形式

#### プロジェクトデータ
```javascript
{
  id: Number,
  title: String,
  description: String,
  startDate: String (YYYY-MM-DD),
  endDate: String (YYYY-MM-DD),
  progress: Number (0-100),
  totalTasks: Number,
  completedTasks: Number,
  delayedTasks: Number,
  isAtRisk: Boolean,
  riskFactors: Array, // 遅延リスク要因のリスト
  resources: Array, // リソース情報
  relatedProjects: Array // 関連プロジェクトID
}
```

#### タスクデータ
```javascript
{
  id: Number,
  projectId: Number,
  title: String,
  description: String,
  startDate: String (YYYY-MM-DD),
  endDate: String (YYYY-MM-DD),
  progress: Number (0-100),
  status: String (enum: 'not-started', 'in-progress', 'completed', 'delayed'),
  priority: String (enum: 'high', 'medium', 'low'),
  isAtRisk: Boolean,
  riskDescription: String,
  requiredResources: Array, // 必要なリソース情報
  dependsOn: Array // 依存するタスクID
}
```

### 既存データモデルとの関連
- プロジェクトモデルは全体要件定義の「プロジェクト詳細画面」で定義されたデータモデルを使用
- タスクモデルはマイルストーン管理画面で定義されたマイルストーンモデルと連携
- ダッシュボードのプロジェクト概要データと双方向連携
- Chat-to-Ganttのデータモデルと連携（解決策提案機能）
- 他プロジェクトのリソースデータと連携（リソース競合検出）

### データの永続化要件
- ユーザーアクションによるタスク状態変更時に即時保存
- プロジェクト進捗情報のリアルタイム更新
- 各タスクの履歴データの保存（変更履歴）

## 4. API・バックエンド連携

### 必要なAPIエンドポイント

#### プロジェクト関連
- `GET /api/projects/:projectId` - プロジェクト詳細取得
- `PUT /api/projects/:projectId` - プロジェクト情報更新
- `DELETE /api/projects/:projectId` - プロジェクト削除
- `GET /api/projects/:projectId/related` - 関連プロジェクト一覧取得
- `PUT /api/projects/:projectId/related` - 関連プロジェクト情報更新

#### タスク関連
- `GET /api/projects/:projectId/tasks` - プロジェクトのタスク一覧取得
- `POST /api/projects/:projectId/tasks` - 新規タスク作成
- `GET /api/tasks/:taskId` - タスク詳細取得
- `PUT /api/tasks/:taskId` - タスク更新
- `PATCH /api/tasks/:taskId/status` - タスク状態のみ更新
- `DELETE /api/tasks/:taskId` - タスク削除

#### 進捗関連
- `GET /api/projects/:projectId/progress` - プロジェクト進捗情報取得
- `GET /api/projects/:projectId/progress/weekly` - 週次進捗データ取得

#### エクスポート関連
- `GET /api/projects/:projectId/export/pdf` - PDF形式でのエクスポート
- `GET /api/projects/:projectId/export/excel` - Excel形式でのエクスポート

#### リソース関連
- `GET /api/resources/availability` - リソース空き状況取得
- `GET /api/projects/:projectId/resources` - プロジェクトのリソース割り当て取得
- `PUT /api/projects/:projectId/resources` - プロジェクトのリソース割り当て更新
- `POST /api/resources/check-conflicts` - リソース競合チェック

#### Chat-to-Gantt連携
- `POST /api/chat/suggest-solution` - 問題に対する解決策の提案を取得
- `POST /api/projects/:projectId/apply-solution` - 提案された解決策を適用

### リクエスト/レスポンス形式

#### タスク一覧取得
```
GET /api/projects/:projectId/tasks

Response:
{
  "status": "success",
  "data": {
    "tasks": [
      {
        "id": 1,
        "title": "市場調査",
        "startDate": "2023-05-01",
        "endDate": "2023-05-15",
        "progress": 100,
        "status": "completed",
        "priority": "high"
      },
      // 他のタスク
    ]
  }
}
```

#### タスク更新
```
PUT /api/tasks/:taskId

Request:
{
  "title": "Updated task title",
  "startDate": "2023-05-02",
  "endDate": "2023-05-16",
  "progress": 50,
  "status": "in-progress",
  "priority": "medium"
}

Response:
{
  "status": "success",
  "data": {
    "task": {
      "id": 1,
      "title": "Updated task title",
      "startDate": "2023-05-02",
      "endDate": "2023-05-16",
      "progress": 50,
      "status": "in-progress",
      "priority": "medium"
    }
  }
}
```

### 必要な環境変数リスト
- `API_BASE_URL` - バックエンドAPIのベースURL
- `DEFAULT_PROJECT_VIEW` - デフォルトのプロジェクト表示モード（day/week/month）
- `ENABLE_ANALYTICS` - 分析機能の有効/無効設定
- `CHAT_API_URL` - Chat-to-Gantt機能のAPIエンドポイント
- `CHAT_API_KEY` - Chat-to-Gantt機能のAPIキー
- `RESOURCE_CHECK_ENABLED` - リソース競合チェック機能の有効/無効設定
- `RELATED_PROJECTS_MAX` - 表示する関連プロジェクトの最大数

## 5. 実装ファイルリスト

### フロントエンド
- `/src/pages/PlanDetail.jsx` - Plan画面のメインコンポーネント
- `/src/components/plan/TaskList.jsx` - タスク一覧コンポーネント
- `/src/components/plan/GanttChart.jsx` - ガントチャートコンポーネント
- `/src/components/plan/ProgressSummary.jsx` - 進捗サマリーコンポーネント
- `/src/components/plan/ProgressCharts.jsx` - 進捗グラフコンポーネント
- `/src/components/plan/AddTaskDialog.jsx` - タスク追加ダイアログ
- `/src/components/plan/TaskItem.jsx` - 個別タスクアイテムコンポーネント
- `/src/components/plan/PlanSettings.jsx` - プロジェクト設定コンポーネント
- `/src/components/plan/ResourceView.jsx` - リソース表示コンポーネント（新規）
- `/src/components/plan/RelatedProjects.jsx` - 関連プロジェクト表示コンポーネント（新規）
- `/src/components/plan/ResourceConflictChecker.jsx` - リソース競合チェッカー（新規）
- `/src/components/plan/ChatSolutionDialog.jsx` - 解決策提案ダイアログ（新規）
- `/src/components/plan/RiskAlertBanner.jsx` - リスクアラートバナー（新規）

### バックエンド
- `/src/api/controllers/projectController.js` - プロジェクト関連APIハンドラ
- `/src/api/controllers/taskController.js` - タスク関連APIハンドラ
- `/src/api/controllers/resourceController.js` - リソース関連APIハンドラ（新規）
- `/src/api/controllers/chatController.js` - Chat-to-Gantt連携APIハンドラ（新規）
- `/src/api/routes/projectRoutes.js` - プロジェクトAPIルート定義
- `/src/api/routes/taskRoutes.js` - タスクAPIルート定義
- `/src/api/routes/resourceRoutes.js` - リソースAPIルート定義（新規）
- `/src/api/routes/chatRoutes.js` - Chat-to-Gantt連携APIルート定義（新規）
- `/src/api/services/exportService.js` - エクスポート機能実装
- `/src/api/services/resourceService.js` - リソース管理サービス（新規）
- `/src/api/services/chatService.js` - Chat-to-Gantt連携サービス（新規）

### スタイル
- `/src/assets/css/plan.css` - Plan画面専用スタイル

### ユーティリティ
- `/src/utils/dateUtils.js` - 日付操作ユーティリティ
- `/src/utils/taskUtils.js` - タスク処理ユーティリティ
- `/src/utils/chartUtils.js` - グラフ描画ユーティリティ
- `/src/utils/resourceUtils.js` - リソース計算ユーティリティ（新規）
- `/src/utils/chatUtils.js` - Chat-to-Gantt連携ユーティリティ（新規）
- `/src/utils/projectRelationUtils.js` - プロジェクト間関連処理ユーティリティ（新規）

### 既存コンポーネントの再利用方法
- 共通ヘッダー/フッターコンポーネントの再利用
- 共通スタイルシートとテーマの適用
- 共通のエラー処理とローディング表示コンポーネントの使用
- ダッシュボードのリスクアラートコンポーネントの再利用
- Chat-to-Ganttの解決策提案インターフェースの再利用
- 共通のプロジェクト選択コンポーネントの活用