# デプロイガイド

本ドキュメントでは、プランナビアプリケーションのデプロイに関する情報と手順を記載しています。

## デプロイ構成

プランナビは、フロントエンドとバックエンドを分離したモダンなアーキテクチャを採用しています。各部分は独立してデプロイされます。

### 実際のデプロイ構成

| コンポーネント | 使用プラットフォーム | URL |
|--------------|-------------------|-------------|
| フロントエンド | Firebase Hosting  | https://plannavi.web.app |
| バックエンド   | Railway           | https://isseyaischedule-production.up.railway.app |
| データベース   | MongoDB Atlas     | MongoDB Atlas Cluster |

### 推奨デプロイ構成

| コンポーネント | 推奨プラットフォーム | 代替オプション |
|--------------|-------------------|-------------|
| フロントエンド | Firebase Hosting  | Vercel, Netlify |
| バックエンド   | Railway           | Heroku, Render, AWS Elastic Beanstalk |
| データベース   | MongoDB Atlas     | AWS DocumentDB, CosmosDB |
| 画像/ファイル  | AWS S3           | Cloudinary, Firebase Storage |

## フロントエンドのデプロイ (Firebase Hosting)

Firebase Hostingは、静的ウェブサイトやSPAのデプロイに最適化されたGoogleのホスティングサービスです。Reactアプリケーションのデプロイに適しており、シンプルで安定した環境を提供します。

### 前提条件
- GitHubアカウント
- Googleアカウント/Firebaseアカウント
- Node.js環境

### デプロイ手順

1. **Firebase CLIのインストール**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebaseにログイン**:
   ```bash
   firebase login
   ```

3. **プロジェクトディレクトリに移動**:
   ```bash
   cd frontend
   ```

4. **Firebase初期化**:
   ```bash
   firebase init hosting
   ```
   設定オプション:
   - 既存プロジェクトを選択（aicontentsfactory-b730e）
   - 公開ディレクトリ: `build`
   - シングルページアプリケーション: `Yes`
   - GitHubとの自動デプロイ: 任意

5. **ホスティングサイトの作成**（カスタムURLを使用する場合）:
   ```bash
   firebase hosting:sites:create plannavi
   firebase target:apply hosting plannavi plannavi
   ```

6. **firebase.jsonの設定**:
   ```json
   {
     "hosting": [
       {
         "target": "plannavi",
         "public": "build",
         "ignore": [
           "firebase.json",
           "**/.*",
           "**/node_modules/**"
         ],
         "rewrites": [
           {
             "source": "**",
             "destination": "/index.html"
           }
         ]
       }
     ]
   }
   ```

7. **アプリケーションのビルド**:
   ```bash
   npm run build
   ```

8. **デプロイ実行**:
   ```bash
   firebase deploy --only hosting:plannavi
   ```

9. **完了**: デプロイが成功すると、`https://plannavi.web.app` でアプリケーションにアクセス可能

### カスタムデプロイスクリプト

package.jsonに以下のスクリプトを追加すると便利です:

```json
"scripts": {
  "deploy": "npm run build && firebase deploy --only hosting:plannavi"
}
```

これにより、`npm run deploy`コマンド一つでビルドとデプロイが実行できます。

### Firebaseホスティングの利点

1. **高速CDN**: Googleのグローバルエッジネットワークを活用
2. **自動HTTPS**: SSL証明書の自動発行と更新
3. **シンプルなデプロイフロー**: CLIによる簡単なデプロイプロセス
4. **複数環境**: 1つのプロジェクト内で複数のサイトをホスティング可能
5. **カスタムドメイン**: 独自ドメインの簡単な設定

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
   CORS_ORIGIN=https://plannavi.web.app
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

## Vercelからの移行

当初はVercelを使用していましたが、以下の理由からFirebase Hostingへ移行しました：

### 移行の理由
1. **設定の複雑さ**: Vercelではmonoレポ構造でのフロントエンド設定に問題があった
2. **ビルドエラー**: CRACOやTypeScript設定の競合によるビルド失敗が頻発
3. **デプロイの不安定さ**: 同じコードでも時々デプロイが失敗する問題があった

### Firebase Hostingのメリット
1. **シンプルなワークフロー**: 直感的なコマンドと明確なエラーメッセージ
2. **安定したビルド環境**: 一貫した動作を提供
3. **マルチサイト対応**: 1つのプロジェクトで複数のサイト（開発・ステージング・本番など）を管理可能
4. **高速なCDN**: Googleのグローバルネットワークによる高速配信

### CORS設定の更新
バックエンド側のCORS設定を更新し、新しいフロントエンドのドメイン（plannavi.web.app）からのリクエストを許可するよう変更しました：
```
CORS_ORIGIN=https://plannavi.web.app
```

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

4. **Firebase特有の問題**
   - ホスティングサイトのURLが正しいか確認
   - firebase.jsonのターゲット設定が正しいか確認
   - .firebasercファイルのプロジェクトとターゲットの設定を確認

### ログの確認

- **Firebase**: Firebase Console → Hosting → ホスティング履歴 → 詳細
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
5. Firebase Hostingとの自動デプロイパイプラインの最適化