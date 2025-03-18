# ダッシュボード（Dashboard）要件定義

## 1. 機能概要

### 目的と主な機能
- 複数プロジェクトを横断的に監視・管理するための中央ハブとして機能
- 全プロジェクトの進捗状況を一目で把握できる視覚的な表示
- 直近の期限タスクとリリース遅延リスクの明示によるアラート機能
- 新規プロジェクトの作成入口の提供

### 全体要件との関連性
- 「マイルストーン重視の計画作成」と「視覚的タイムライン表示」の要件を部分的に実現
- 「インテリジェントアラート」機能を段階的に実装する基盤

### 想定ユーザー
- 経営陣・意思決定者
- プロジェクト全体の責任者
- 複数プロジェクトを同時に管理する必要がある管理者

### 主要ユースケース
- ユーザーが複数プロジェクトの現在の進捗状況を効率的に確認する
- 直近のタスクと期限を把握し、優先順位付けする
- リリース遅延などのリスクを早期に発見し対処する
- 新しいプロジェクトを開始する

## 2. UI要素の詳細

### 各画面の構成要素

#### ヘッダー部分
- アプリケーション名「プランナビ」の表示
- 検索機能
- 通知アイコン（未読通知数のバッジ付き）
- ユーザーアバター・メニュー

#### サイドナビゲーション
- ダッシュボード（アクティブ）
- マイプラン
- タスク
- カレンダー
- 設定
- ヘルプ

#### メインコンテンツ
1. **進行中のプラン一覧**
   - カード形式での表示
   - プラン名、期間、進捗率の視覚化
   - タスク完了状況
   - リリース遅延リスクのあるプランの視覚的強調表示（機能追加）

2. **全体の進捗状況**
   - ドーナツチャートでの視覚化
   - 完了・進行中・未開始タスクの比率表示
   - 全タスク数と完了タスク数の表示

3. **直近の期限タスク**
   - 優先度（高/中/低）に基づく視覚的区分
   - タスク名、関連プラン名、期限の表示
   - リリース日遅延リスクがあるタスクの強調表示（機能追加）
   - チャットベースのAI解決提案機能へのリンク（chat-to-gantt機能との連携）（機能追加）

4. **新規プラン作成ボタン**
   - 右下に固定表示される浮動アクションボタン
   - クリックで新規プロジェクト作成画面へ遷移

### 入力フィールドと検証ルール
- 検索フィールド：最低2文字以上の入力が必要
- ユーザー設定：標準的なフォーム検証ルールに従う

### ボタンとアクション
- プランカード：クリックで該当プランの詳細画面へ遷移
- 「詳細」ボタン：該当プランの詳細画面へ遷移
- タスクチェックボックス：クリックでタスク完了/未完了の切り替え
- 通知アイコン：クリックで通知一覧の表示
- ユーザーアバター：クリックでユーザーメニューの表示
- 新規プラン作成ボタン：クリックで新規プロジェクト作成画面へ遷移
- 「解決策を提案」ボタン（新規）：クリックでchat-to-gantt機能の起動

### レスポンシブ対応の要件
- デスクトップビュー（1024px以上）：全ての要素を表示
- タブレットビュー（768px～1023px）：サイドナビを折りたたみ可能に、グリッドレイアウトを調整
- モバイルビュー（767px以下）：
  - サイドナビはハンバーガーメニューに格納
  - カードは1列表示に変更
  - 検索フィールドは省略し、検索アイコンのみ表示

### 既存UIコンポーネントの再利用
- Material UIのコンポーネント（AppBar, Drawer, Card, LinearProgress, Chip等）
- Chart.jsによるグラフ表示

## 3. データ構造と連携

### 扱うデータの種類と形式

#### プランデータ
```json
{
  "id": "string",
  "title": "string",
  "type": "string",
  "startDate": "date",
  "endDate": "date",
  "progress": "number",
  "tasks": "number",
  "completedTasks": "number",
  "isAtRisk": "boolean",
  "riskFactor": "string"
}
```

#### タスクデータ
```json
{
  "id": "string",
  "title": "string",
  "planId": "string",
  "planTitle": "string",
  "dueDate": "date",
  "priority": "string",
  "status": "string",
  "isAtRisk": "boolean",
  "riskDescription": "string"
}
```

#### 進捗状況データ
```json
{
  "completed": "number",
  "inProgress": "number",
  "notStarted": "number",
  "totalTasks": "number"
}
```

### 既存データモデルとの関連
- Planモデルとの連携
- Taskモデルとの連携
- User権限に基づく表示フィルタリング

### データの永続化要件
- 各プロジェクトとタスクのデータはバックエンドで永続化
- ダッシュボード表示設定（フィルター等）はローカルストレージで保持

## 4. API・バックエンド連携

### 必要なAPIエンドポイント

#### プラン関連
- `GET /api/plans` - 進行中のプラン一覧を取得
- `GET /api/plans/recent` - 最近作成/更新されたプラン一覧を取得
- `GET /api/plans/at-risk` - 遅延リスクのあるプラン一覧を取得

#### タスク関連
- `GET /api/tasks/upcoming` - 直近の期限タスク一覧を取得
- `GET /api/tasks/at-risk` - 遅延リスクのあるタスク一覧を取得
- `PATCH /api/tasks/:id/status` - タスクのステータスを更新

#### 進捗状況関連
- `GET /api/stats/overall` - 全体の進捗状況データを取得

#### Chat-to-Gantt連携
- `POST /api/chat/suggest-solution` - 問題に対する解決策の提案を取得
- `POST /api/plans/:id/update-from-suggestion` - 提案に基づいてプランを更新

### リクエスト/レスポンス形式

#### プラン一覧取得（GET /api/plans）
```json
// レスポンス
{
  "plans": [
    {
      "id": "1",
      "title": "新規出店計画",
      "type": "store",
      "startDate": "2023-05-01",
      "endDate": "2023-08-15",
      "progress": 65,
      "tasks": 18,
      "completedTasks": 12,
      "isAtRisk": false
    },
    // ...
  ]
}
```

#### 直近タスク取得（GET /api/tasks/upcoming）
```json
// レスポンス
{
  "tasks": [
    {
      "id": "1",
      "title": "不動産物件の内見",
      "planId": "1",
      "planTitle": "新規出店計画",
      "dueDate": "2023-05-20",
      "priority": "high",
      "status": "pending",
      "isAtRisk": true,
      "riskDescription": "物件情報の入手が遅れており、リリース日に影響する可能性があります"
    },
    // ...
  ]
}
```

#### 解決策提案（POST /api/chat/suggest-solution）
```json
// リクエスト
{
  "taskId": "1",
  "planId": "1",
  "issue": "物件情報の入手遅延"
}

// レスポンス
{
  "suggestions": [
    {
      "id": "sugg_1",
      "description": "不動産仲介業者を追加で1社検討する",
      "impact": "スケジュールを1週間短縮できる可能性があります",
      "difficulty": "medium"
    },
    // ...
  ]
}
```

### 必要な環境変数リスト
- `API_BASE_URL` - バックエンドAPIのベースURL
- `CHAT_API_KEY` - Chat-to-Gantt機能のAPIキー
- `DEFAULT_ITEMS_PER_PAGE` - 一覧表示時のデフォルト表示件数

## 5. 実装ファイルリスト

### 実装が必要な具体的なファイルパス

#### コンポーネント
- `/src/components/dashboard/DashboardHeader.js` - ヘッダー部分
- `/src/components/dashboard/SideNavigation.js` - サイドナビゲーション
- `/src/components/dashboard/PlansList.js` - 進行中のプラン一覧
- `/src/components/dashboard/PlanCard.js` - 個別プランのカード表示
- `/src/components/dashboard/ProgressChart.js` - 進捗状況グラフ
- `/src/components/dashboard/TasksList.js` - 直近の期限タスク一覧
- `/src/components/dashboard/TaskItem.js` - 個別タスク項目
- `/src/components/dashboard/RiskAlert.js` - リスクアラート表示（新規）
- `/src/components/dashboard/ChatSolutionButton.js` - Chat解決策提案ボタン（新規）

#### ページ
- `/src/pages/Dashboard.js` - ダッシュボードページのメインコンポーネント

#### データ/API連携
- `/src/api/plans.js` - プラン関連APIの呼び出し
- `/src/api/tasks.js` - タスク関連APIの呼び出し
- `/src/api/stats.js` - 統計情報APIの呼び出し
- `/src/api/chat.js` - Chat-to-Gantt連携API（新規）

#### スタイル
- `/src/assets/css/dashboard.css` - ダッシュボード専用スタイル

### 各ファイルの役割と責任

#### DashboardHeader.js
- アプリケーション名の表示
- 検索機能の提供
- 通知機能へのアクセス
- ユーザーメニューの表示

#### SideNavigation.js
- ナビゲーションメニューの表示
- 現在のページのハイライト
- レスポンシブ対応（モバイル時の折りたたみ）

#### PlansList.js
- 進行中のプラン一覧の表示
- プランのフィルタリング
- プランカードのリスト管理

#### PlanCard.js
- 個別プランの情報表示
- 進捗バーの表示
- リスク状態の視覚化（新規）
- 詳細画面への遷移機能

#### ProgressChart.js
- Chart.jsを使用した進捗状況の円グラフ表示
- データの視覚化
- ツールチップでの詳細情報表示

#### TasksList.js
- 直近のタスク一覧表示
- 優先度に基づく並び替え
- リスクのあるタスクの強調表示

#### TaskItem.js
- 個別タスクの表示
- 優先度の視覚化
- ステータス更新機能
- Chat-to-Gantt機能との連携（新規）

#### RiskAlert.js
- リスクのあるタスク/プランのアラート表示
- リスク詳細の表示
- Chat-to-Gantt解決策提案機能へのリンク

#### ChatSolutionButton.js
- Chat-to-Gantt機能の起動ボタン
- 問題解決のためのチャットインターフェース表示

### 既存コンポーネントの再利用方法
- Material UIコンポーネントを基本UIとして使用
- Chart.jsを進捗グラフの表示に活用
- 既存のレイアウトコンポーネント（Grid, Card等）を再利用
- 共通コンポーネント（LoadingIndicator, ErrorBoundary等）を必要に応じて使用