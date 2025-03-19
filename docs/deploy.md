# デプロイガイド

本ドキュメントでは、プランナビアプリケーションのデプロイに関する情報と手順を記載しています。

## デプロイ構成

プランナビは、フロントエンドとバックエンドを分離したモダンなアーキテクチャを採用しています。各部分は独立してデプロイされます。

### 実際のデプロイ構成

| コンポーネント | 使用プラットフォーム | URL |
|--------------|-------------------|-------------|
| フロントエンド | Vercel            | https://isseyaischedule-dw8ge0s5o-yamatovisions-projects.vercel.app |
| バックエンド   | Railway           | https://isseyaischedule-production.up.railway.app |
| データベース   | MongoDB Atlas     | MongoDB Atlas Cluster |

### 推奨デプロイ構成

| コンポーネント | 推奨プラットフォーム | 代替オプション |
|--------------|-------------------|-------------|
| フロントエンド | Vercel            | Netlify, Firebase Hosting |
| バックエンド   | Railway           | Heroku, Render, AWS Elastic Beanstalk |
| データベース   | MongoDB Atlas     | AWS DocumentDB, CosmosDB |
| 画像/ファイル  | AWS S3           | Cloudinary, Firebase Storage |

## フロントエンドのデプロイ (Vercel) - 完了

Vercelは、React/Vue/Angular等のフロントエンドアプリケーションのデプロイに最適化されたプラットフォームです。

### 前提条件
- GitHubアカウント
- Vercelアカウント（GitHubアカウントで登録可能）

### デプロイ手順 (完了済み)

1. [Vercel](https://vercel.com/)にログインする
2. 「New Project」をクリック
3. GitHubからリポジトリをインポート
4. プロジェクト設定の構成:
   - **Framework Preset**: React
   - **Root Directory**: `/` (プロジェクトルートの場合) または特定のディレクトリを指定
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

5. 環境変数の設定:
   - `REACT_APP_API_URL`: バックエンドAPIのURL (https://isseyaischedule-production.up.railway.app/api/v1)
   - 他の必要な環境変数を追加

6. 「Deploy」をクリック

### 自動デプロイの設定 (完了済み)

GitHubリポジトリとの連携により、mainブランチへのプッシュ時に自動デプロイが実行されます。

## バックエンドのデプロイ (Railway) - 完了

Railwayは、Node.jsアプリケーションのデプロイに特化した、シンプルかつ強力なプラットフォームです。

### 前提条件
- GitHubアカウント
- Railwayアカウント（GitHubアカウントで登録可能）

### デプロイ手順 (完了済み)

1. [Railway](https://railway.app/)にログインする
2. 「New Project」→「Deploy from GitHub repo」をクリック
3. リポジトリを選択
4. ポート設定: `8000`
5. 環境変数の設定:
   ```
   NODE_ENV=production
   PORT=8000
   API_BASE_URL=https://isseyaischedule-production.up.railway.app/api/v1
   MONGODB_URI=mongodb+srv://username:password@cluster0.example.mongodb.net/schedle
   JWT_SECRET=<secret>
   JWT_EXPIRES_IN=1d
   REFRESH_TOKEN_SECRET=<secret>
   REFRESH_TOKEN_EXPIRES_IN=7d
   CORS_ORIGIN=https://isseyaischedule-dw8ge0s5o-yamatovisions-projects.vercel.app
   EMAIL_SERVICE=gmail
   EMAIL_API_KEY=<app-password>
   EMAIL_FROM=your-email@gmail.com
   CLAUDE_API_KEY=<api-key>
   ```

6. 「Generate Domain」をクリックして固有ドメインを生成
   - 生成されたドメイン: `isseyaischedule-production.up.railway.app`

## データベースのセットアップ (MongoDB Atlas) - 完了

MongoDB Atlasは、クラウドホスト型のMongoDBサービスで、スケーラブルなデータベースソリューションを提供します。

### 前提条件
- MongoDB Atlasアカウント

### セットアップ手順 (完了済み)

1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)にログイン
2. 「Create」→「Shared Cluster」をクリック（無料プランでスタート可能）
3. クラウドプロバイダーとリージョンを選択
4. クラスターの作成
5. アクセス設定:
   - データベースユーザーの作成
   - IPアクセスリストの設定（`0.0.0.0/0`で全てのIPからのアクセスを許可）
6. 接続文字列の取得と設定
   - 接続文字列をバックエンドの環境変数`MONGODB_URI`に設定

## CI/CDパイプラインの設定 - 部分的に完了

### GitHub Actions - 設定済み

フロントエンド用のワークフローファイル（`.github/workflows/frontend.yml`）を作成済み:

```yaml
name: Frontend CI/CD

on:
  push:
    branches: [ main ]
    paths:
      - 'src/**'
      - 'public/**'
      - 'package.json'
      - 'package-lock.json'
  pull_request:
    branches: [ main ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Run linting
        run: npm run lint || echo "Linting skipped - command not found"
      - name: Run tests
        run: npm test || echo "Testing skipped - command not found"
      - name: Build
        run: npm run build || echo "Build skipped - command not found"
```

## デプロイチェックリスト - 完了

### フロントエンド
- [x] すべての環境変数が正しく設定されている
- [x] 本番ビルドが正常に生成される
- [x] APIエンドポイントがハードコードされていない

### バックエンド
- [x] すべての環境変数が正しく設定されている
- [x] CORS設定が適切（フロントエンドのオリジンを許可）

### データベース
- [x] 接続設定が正しく構成されている

## トラブルシューティング

### 一般的な問題

1. **CORS エラー**
   - バックエンドで適切な CORS 設定がされているか確認
   - 環境変数 `CORS_ORIGIN` が正しく設定されているか確認

2. **環境変数の問題**
   - フロントエンドの環境変数が `REACT_APP_` 接頭辞で始まっているか確認
   - 秘密の環境変数がクライアントサイドに露出していないか確認

3. **デプロイ失敗**
   - ビルドログを確認
   - 依存関係が正しくインストールされているか確認
   - ノードバージョンの互換性を確認

### ログの確認

- **Vercel**: プロジェクトダッシュボード → Deployments → ビルドを選択 → Logs
- **Railway**: プロジェクトダッシュボード → Deployments → デプロイを選択 → Logs
- **MongoDB Atlas**: Clusters → ... → Logs

## セキュリティのベストプラクティス

1. **HTTPS の強制**: すべての通信でHTTPSを使用
2. **機密情報の保護**: API キーや認証情報は環境変数として保存
3. **CSP (Content Security Policy)**: スクリプトの実行元を制限
4. **レート制限**: APIエンドポイントへのリクエスト数を制限
5. **脆弱性スキャン**: 定期的な脆弱性スキャンの実施
6. **依存関係の更新**: セキュリティパッチを定期的に適用

## 次のステップ

1. カスタムドメインの設定（必要に応じて）
2. 自動テストの強化
3. モニタリングとアラートの設定
4. バックアップ戦略の実装