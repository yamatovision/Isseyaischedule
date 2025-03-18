# デプロイガイド

本ドキュメントでは、プランナビアプリケーションのデプロイに関する情報と手順を記載しています。

## デプロイ構成

プランナビは、フロントエンドとバックエンドを分離したモダンなアーキテクチャを採用しています。各部分は独立してデプロイされます。

### 推奨デプロイ構成

| コンポーネント | 推奨プラットフォーム | 代替オプション |
|--------------|-------------------|-------------|
| フロントエンド | Vercel            | Netlify, Firebase Hosting |
| バックエンド   | Railway           | Heroku, Render, AWS Elastic Beanstalk |
| データベース   | MongoDB Atlas     | AWS DocumentDB, CosmosDB |
| 画像/ファイル  | AWS S3           | Cloudinary, Firebase Storage |

## フロントエンドのデプロイ (Vercel)

Vercelは、React/Vue/Angular等のフロントエンドアプリケーションのデプロイに最適化されたプラットフォームです。

### 前提条件
- GitHubアカウント
- Vercelアカウント（GitHubアカウントで登録可能）

### デプロイ手順

1. [Vercel](https://vercel.com/)にログインする
2. 「New Project」をクリック
3. GitHubからリポジトリをインポート
4. プロジェクト設定の構成:
   - **Framework Preset**: React
   - **Root Directory**: `/` (プロジェクトルートの場合) または特定のディレクトリを指定
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

5. 環境変数の設定:
   - `REACT_APP_API_URL`: バックエンドAPIのURL (例: `https://api.your-app-name.com`)
   - 他の必要な環境変数を追加

6. 「Deploy」をクリック

### 自動デプロイの設定

1. GitHubリポジトリの「Settings」タブに移動
2. 「Webhooks」セクションでVercelのWebhookが自動的に設定されていることを確認
3. これにより、mainブランチへのプッシュ時に自動デプロイが実行されます

## バックエンドのデプロイ (Railway)

Railwayは、Node.jsアプリケーションのデプロイに特化した、シンプルかつ強力なプラットフォームです。

### 前提条件
- GitHubアカウント
- Railwayアカウント（GitHubアカウントで登録可能）

### デプロイ手順

1. [Railway](https://railway.app/)にログインする
2. 「New Project」→「Deploy from GitHub repo」をクリック
3. リポジトリを選択
4. 環境変数の設定:
   - `NODE_ENV`: `production`
   - `PORT`: `8080` (Railwayは自動的にポートを割り当てますが、アプリは環境変数のPORTを使用する必要があります)
   - `MONGODB_URI`: MongoDB接続文字列
   - `JWT_SECRET`: JWTトークン用のシークレットキー
   - `CORS_ORIGIN`: フロントエンドのURL (例: `https://your-app-name.vercel.app`)
   - その他の必要な環境変数

5. 「Deploy」をクリック

### ドメイン設定

1. デプロイされたプロジェクトを選択
2. 「Settings」→「Domains」セクションへ移動
3. カスタムドメインを追加するか、Railway提供のサブドメインを使用

## データベースのセットアップ (MongoDB Atlas)

MongoDB Atlasは、クラウドホスト型のMongoDBサービスで、スケーラブルなデータベースソリューションを提供します。

### 前提条件
- MongoDB Atlasアカウント

### セットアップ手順

1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)にログイン
2. 「Create」→「Shared Cluster」をクリック（無料プランでスタート可能）
3. クラウドプロバイダーとリージョンを選択（ユーザーの地理的な位置に近いリージョンを選択）
4. クラスターの作成（作成には5〜10分かかります）
5. アクセス設定:
   - データベースユーザーの作成
   - IPアクセスリストの設定（`0.0.0.0/0`で全てのIPからのアクセスを許可、またはアプリケーションのIPのみを許可）
6. 接続文字列の取得:
   - 「Connect」→「Connect your application」を選択
   - 接続文字列をコピーし、バックエンドの環境変数`MONGODB_URI`に設定

## CI/CDパイプラインの設定

### GitHub Actions

以下は、GitHub Actionsを使用したCI/CDパイプラインの基本設定例です。

1. リポジトリ内に`.github/workflows`ディレクトリを作成
2. フロントエンド用のワークフローファイル（例: `frontend.yml`）を作成:

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
        run: npm run lint
      - name: Run tests
        run: npm test
      - name: Build
        run: npm run build

  deploy:
    needs: build-and-test
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

3. バックエンド用のワークフローファイル（例: `backend.yml`）を作成:

```yaml
name: Backend CI/CD

on:
  push:
    branches: [ main ]
    paths:
      - 'api/**'
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
          cache: 'npm'
      - name: Install dependencies
        run: cd api && npm ci
      - name: Run linting
        run: cd api && npm run lint
      - name: Run tests
        run: cd api && npm test
        env:
          MONGODB_URI: ${{ secrets.MONGODB_URI_TEST }}
          JWT_SECRET: ${{ secrets.JWT_SECRET_TEST }}

  # Railway自体がGitHubと統合され、自動デプロイを行うため、
  # 通常はここに追加のデプロイステップは必要ありません
```

4. GitHubのリポジトリ設定で必要なシークレットを追加:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
   - `MONGODB_URI_TEST`
   - `JWT_SECRET_TEST`

## デプロイチェックリスト

デプロイ前に以下の項目を確認してください：

### フロントエンド
- [ ] すべての環境変数が正しく設定されている
- [ ] 本番ビルドが正常に生成される (`npm run build`)
- [ ] ルーティングが正しく設定されている（特にSPA形式の場合）
- [ ] APIエンドポイントがハードコードされていない
- [ ] パフォーマンス最適化（コード分割、画像最適化など）

### バックエンド
- [ ] すべての環境変数が正しく設定されている
- [ ] CORS設定が適切（フロントエンドのオリジンを許可）
- [ ] エラーハンドリングが適切に実装されている
- [ ] ログ出力が設定されている
- [ ] セキュリティベストプラクティスが実装されている
- [ ] パフォーマンス対策（キャッシュ、コネクションプールなど）

### データベース
- [ ] インデックスが適切に設定されている
- [ ] バックアップ戦略が検討されている
- [ ] 初期データがセットアップされている（必要な場合）

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

## 本番環境でのモニタリング

### 推奨ツール

- **アプリケーションパフォーマンス**: New Relic, Datadog
- **エラートラッキング**: Sentry
- **ログ管理**: Logtail, Papertrail
- **アップタイムモニタリング**: UptimeRobot, StatusCake

## ステージング環境の設定

本番環境と同様の構成で、以下の違いを設定します：

1. 別のデプロイブランチを使用（例: `staging`）
2. 別の環境変数セットを使用（例: `REACT_APP_API_URL_STAGING`）
3. 別のデータベースインスタンスを使用

この方法により、本番環境に影響を与えずに新機能をテストできます。

## バックアップと復元手順

### MongoDB Atlasでのバックアップ

1. MongoDB Atlasダッシュボードにログイン
2. クラスターを選択 → Backup
3. 「Take Snapshot」をクリック
4. スナップショットの名前と説明を入力
5. 「Take Snapshot」をクリック

### バックアップからの復元

1. Backupページに移動
2. 復元したいスナップショットを選択
3. 「Restore」をクリック
4. 復元オプションを選択（新しいクラスターへの復元など）
5. 「Restore」をクリック

## セキュリティのベストプラクティス

1. **HTTPS の強制**: すべての通信でHTTPSを使用
2. **機密情報の保護**: API キーや認証情報は環境変数として保存
3. **CSP (Content Security Policy)**: スクリプトの実行元を制限
4. **レート制限**: APIエンドポイントへのリクエスト数を制限
5. **脆弱性スキャン**: 定期的な脆弱性スキャンの実施
6. **依存関係の更新**: セキュリティパッチを定期的に適用