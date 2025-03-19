# 環境変数リスト

## バックエンド
[x] `PORT` - バックエンドサーバーが使用するポート番号 (例: 8000)
[x] `NODE_ENV` - アプリケーションの実行環境 (development, production, test)
[x] `API_BASE_URL` - APIのベースURL
[x] `MONGODB_URI` - MongoDB接続URI
[x] `JWT_SECRET` - JWTトークン生成・検証用の秘密鍵
[x] `JWT_EXPIRES_IN` - JWTトークンの有効期限 (例: '1d')
[x] `REFRESH_TOKEN_SECRET` - リフレッシュトークン用の秘密鍵
[x] `REFRESH_TOKEN_EXPIRES_IN` - リフレッシュトークンの有効期限 (例: '7d')
[x] `CORS_ORIGIN` - CORSで許可するオリジンURL
[x] `EMAIL_SERVICE` - メール送信サービス (例: 'gmail')
[x] `EMAIL_API_KEY` - メール送信サービスのAPIキー
[x] `EMAIL_FROM` - 送信元メールアドレス
[x] `INVITATION_CODE_EXPIRY` - 招待コードの有効期限（日数）
[x] `CLAUDE_API_KEY` - Claude AIのAPIキー（Chat-to-Gantt機能用）

## フロントエンド
[x] `REACT_APP_API_URL` - バックエンドAPIのURL
[x] `REACT_APP_VERSION` - アプリケーションのバージョン
[x] `REACT_APP_DEFAULT_PROJECT_VIEW` - デフォルトのプロジェクト表示モード (day/week/month)
[x] `REACT_APP_ENABLE_ANALYTICS` - 分析機能の有効/無効設定
[x] `REACT_APP_RESOURCE_CHECK_ENABLED` - リソース競合チェック機能の有効/無効設定
[x] `REACT_APP_RELATED_PROJECTS_MAX` - 表示する関連プロジェクトの最大数
[x] `REACT_APP_AUTH_TOKEN_NAME` - 認証トークンのストレージキー名
[x] `REACT_APP_AUTH_TOKEN_EXPIRY` - 認証トークンの有効期限（秒）
[x] `REACT_APP_AUTH_COOKIE_NAME` - 認証Cookie名
[x] `REACT_APP_STORAGE_PREFIX` - ローカルストレージのプレフィックス
[x] `REACT_APP_WEBSOCKET_URL` - リアルタイム更新用WebSocketサーバーURL

## CI/CD用環境変数
[x] `GITHUB_TOKEN` - GitHub Actions用トークン (GitHub上で自動設定)
[x] `VERCEL_TOKEN` - Vercel用デプロイトークン (Vercelで自動設定)
[x] `VERCEL_ORG_ID` - Vercel組織ID (Vercelで自動設定)
[x] `VERCEL_PROJECT_ID` - Vercelプロジェクト (Vercelで自動設定)
[x] `MONGODB_URI_PRODUCTION` - 本番環境のMongoDB接続URI (Railway環境変数で設定)
[ ] `MONGODB_URI_STAGING` - ステージング環境のMongoDB接続URI (未設定・必要に応じて設定)

## 開発用環境変数
[x] `MOCK_MODE` - APIモックモードの有効化（true/false）
[x] `SLOW_API` - 開発中のAPIレスポンス遅延シミュレーション（ミリ秒）