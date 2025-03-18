# Chat-to-Gantt 要件定義書

## 1. 機能概要

### 目的と主な機能
- AI対話を通じたタスクリストの抽出と作成
- 抜け漏れ防止のためのストレステスト機能
- タスクリストからガントチャートの自動生成と視覚化
- 計画変更時のリアルタイム更新とリスケジュール機能

### 全体要件との関連性
- 「マイルストーン重視の計画作成」に直接貢献
- 「抜け漏れ防止」機能を対話型で実現
- 「視覚的タイムライン表示」を支援
- 「インテリジェントアラート」を含めた警告システムの実装

### 想定ユーザー
- 経営陣・意思決定者
- プロジェクトマネージャー
- プロジェクトメンバー（閲覧・更新権限あり）

### 主要ユースケース
- 新規プロジェクト計画立案
- 既存プロジェクトのタスク確認と編集
- イレギュラー発生時のリスケジュール対応
- タスクの進捗報告と計画の更新

## 2. UI要素の詳細

### 画面構成要素
- 左側ナビゲーションメニュー
  - ダッシュボード、AIアシスタント、マイプロジェクト、タスク管理へのリンク
- チャット欄（左カラム）
  - AIアシスタントとの対話インターフェース
  - メッセージ履歴表示エリア
  - クイックリプライボタン
  - テキスト入力欄
- ガントチャート欄（右カラム）
  - タイムライン表示（月単位の区切り）
  - タスク一覧と期間表示
  - 優先度別カラーリング
  - 現在日表示
- タスク承認セクション
  - 承認/調整ボタン
  - タスクリスト確認エリア

### 入力フィールドと検証ルール
- チャット入力欄
  - 空白入力防止バリデーション
  - 最大文字数制限（適切な制限の設定）
- タスク編集時の日付入力
  - 日付フォーマット検証
  - 前後関係のロジック検証（開始日が終了日より前である等）
- タスク名と詳細情報
  - 文字数制限と入力必須項目の検証

### ボタンとアクション
- 送信ボタン：チャットメッセージの送信
- クイックリプライボタン：定型回答の選択
- タスク承認ボタン：生成されたタスクリストの承認
- タスク調整ボタン：タスクリストの編集モード切替
- エクスポートボタン：ガントチャートのエクスポート

### レスポンシブ対応の要件
- モバイル表示（～960px）
  - 縦並びレイアウトへの切り替え（チャット→ガントチャート）
  - メニューのハンバーガーアイコン化
  - タッチ操作に最適化された要素サイズと間隔
- タブレット・デスクトップ表示
  - 横並び2カラムレイアウト
  - 固定サイドバーメニュー
  - ドラッグ操作によるガントチャートの調整

### 既存UIコンポーネントの再利用
- Material UIフレームワークの活用
- アイコンは Material Icons を使用
- 共通のカラーパレットとタイポグラフィ
- ダイアログ、トースト通知などの標準コンポーネント

## 3. データ構造と連携

### 扱うデータの種類と形式
- プロジェクト情報
  ```json
  {
    "id": "string",
    "title": "string",
    "description": "string",
    "startDate": "YYYY-MM-DD",
    "targetDate": "YYYY-MM-DD",
    "projectType": "enum(store-opening|product-launch|company-establishment|event-planning)",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
  ```
- タスク情報
  ```json
  {
    "id": "string",
    "projectId": "string",
    "title": "string",
    "description": "string",
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD",
    "priority": "enum(high|medium|low)",
    "status": "enum(not-started|in-progress|completed)",
    "warning": "boolean",
    "warningText": "string",
    "dependencies": ["taskId"],
    "order": "number"
  }
  ```
- チャット履歴
  ```json
  {
    "id": "string",
    "projectId": "string",
    "messages": [
      {
        "sender": "enum(user|ai)",
        "content": "string",
        "timestamp": "timestamp"
      }
    ]
  }
  ```

### 既存データモデルとの関連
- ユーザーモデルとの関連（担当者割り当て）
- プロジェクトモデルの子要素としてのタスクリスト
- プロジェクト設定との関連付け

### データの永続化要件
- チャット履歴の保存と復元
- タスク変更履歴の追跡と保存
- バージョン管理によるリスケジュール履歴の保持
- オフライン操作時のキャッシュと同期

## 4. API・バックエンド連携

### 必要なAPIエンドポイント
- チャット関連
  - `/api/chat/send` - チャットメッセージ送信
  - `/api/chat/history/:projectId` - チャット履歴取得
- タスク関連
  - `/api/tasks/generate` - AIによるタスク生成
  - `/api/tasks/list/:projectId` - タスク一覧取得
  - `/api/tasks/update` - タスク更新
  - `/api/tasks/approve` - タスクリスト承認
- プロジェクト関連
  - `/api/projects/:id` - プロジェクト情報取得
  - `/api/projects/update` - プロジェクト情報更新

### リクエスト/レスポンス形式
- タスク生成リクエスト
  ```json
  {
    "projectId": "string",
    "projectType": "string",
    "goal": "string",
    "targetDate": "YYYY-MM-DD",
    "additionalInfo": "string"
  }
  ```
- タスク生成レスポンス
  ```json
  {
    "tasks": [
      {
        "id": "string",
        "title": "string",
        "description": "string",
        "startDate": "YYYY-MM-DD",
        "endDate": "YYYY-MM-DD",
        "priority": "string",
        "warning": "boolean",
        "warningText": "string"
      }
    ],
    "warnings": [
      {
        "type": "string",
        "message": "string",
        "relatedTaskId": "string"
      }
    ]
  }
  ```

### 必要な環境変数リスト
- `API_BASE_URL` - APIサーバーのベースURL
- `AI_SERVICE_KEY` - AI生成サービスのAPIキー
- `WEBSOCKET_URL` - リアルタイム更新用WebSocketサーバー
- `STORAGE_PREFIX` - ローカルストレージのプレフィックス

## 5. 実装ファイルリスト

### 実装が必要なファイル
- コンポーネント
  - `/src/components/ChatInterface.js` - チャットインターフェース
  - `/src/components/MessageItem.js` - チャットメッセージ表示
  - `/src/components/GanttChart.js` - ガントチャート表示
  - `/src/components/TaskApproval.js` - タスク承認セクション
  - `/src/components/TaskList.js` - タスク一覧表示
- ページ
  - `/src/pages/AIAssistant.js` - AIアシスタントメインページ
- ユーティリティ
  - `/src/utils/dateUtils.js` - 日付操作関数
  - `/src/utils/chatUtils.js` - チャット関連ヘルパー
  - `/src/utils/ganttCalculator.js` - ガントチャート位置計算
- API通信
  - `/src/api/chatService.js` - チャット関連API呼び出し
  - `/src/api/taskService.js` - タスク関連API呼び出し
- スタイル
  - `/src/assets/css/chat.css` - チャット画面スタイル
  - `/src/assets/css/gantt.css` - ガントチャートスタイル

### 各ファイルの役割と責任
- `ChatInterface.js`: チャット入力と表示管理、送信処理
- `GanttChart.js`: タスクのタイムライン表示、日付計算
- `TaskApproval.js`: タスク承認ロジックとUIコントロール
- `AIAssistant.js`: ページレイアウトとコンポーネント統合
- `chatService.js`: AIとの対話処理、メッセージの送受信
- `taskService.js`: タスク生成と更新のAPIリクエスト処理

### 既存コンポーネントの再利用方法
- Material UIコンポーネントの活用
- 共通ナビゲーションコンポーネントの使用
- 共通ダイアログ・通知コンポーネントの活用
- ユーティリティ関数やヘルパーの再利用

## 6. 特記事項とリスク

### セキュリティ要件
- ユーザー認証と権限管理
- API呼び出しの認証トークン使用
- チャット内容の暗号化保存（必要に応じて）

### パフォーマンス要件
- 大量のタスクがある場合のガントチャートのレンダリングパフォーマンス
- リアルタイム更新時の効率的なDOM更新

### 抜け漏れ防止のアプローチ
- AIモデルへの業界知識の組み込み
- 自動ストレステスト機能の実装
- ユーザーの意図理解と確認の繰り返し
- 類似プロジェクト参照によるチェック機能

### 将来対応の考慮点
- より高度なAIモデルへの拡張性
- インポート/エクスポート形式の標準化
- 他プロジェクト管理ツールとの連携
- 多言語対応の拡張性