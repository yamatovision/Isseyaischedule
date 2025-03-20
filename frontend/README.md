# Schedle Frontend

プロジェクト管理を効率化するAIスケジューリングツールのフロントエンドプロジェクト。

## デプロイ設定

- フレームワーク: React (Create React App)
- 言語: JavaScript/TypeScript
- ホスティング: Firebase Hosting

## Firebaseデプロイ手順

1. Firebaseにログイン:
```bash
firebase login
```

2. 初期設定（初回のみ）:
```bash
npm run firebase-init
```

3. ビルドとデプロイ:
```bash
npm run deploy
```

## 環境変数

環境変数は`.env.production`および`.env.development`ファイルで管理されています。

## 開発環境の起動

```bash
npm start
```