# CURRENT_STATUSTEMPLATE

このプロジェクトは複数のAIがプロジェクト完遂のために統一性のある綺麗な重複のないシンプルかつ美しいコードアーキテクチャーで堅牢性と拡張性の高いアプリケーション開発を行えることを目的にCURRENT_STATUSに基づいて実装管理を行っています。

CURRENT_STATUSTEMPLATEはこのCURRENT_STATUSを更新していくための手順書です。
このプロジェクトはCURRENT_STATUSの記述ルールをパースしてプロジェクトスコープに反映させてユーザーに開発進捗を知らせることになりますので、パースルールから外れないように下記の形式を必ず守って記述更新をしてください。

## パースルール

ScopeManagerPanelはCURRENT_STATUS.mdの内容を以下のルールでパースして表示します：

1. **スコープの検出**:
   - 「### 完了済みスコープ」セクションから `- [x] スコープ名 (進捗率: 100%)` 形式のスコープを検出
   - 「### 進行中スコープ」セクションから `- [ ] スコープ名 (進捗率: N%)` 形式のスコープを検出
   - 「### 未着手スコープ」セクションから `- [ ] スコープ名 (進捗率: 0%)` 形式のスコープを検出

2. **スコープ詳細の検出**:
   - 「## スコープ：スコープ名」形式のセクションからそのスコープの詳細情報を検出
   - スコープIDは「**スコープID**: scope-XXXXXXXXXX」形式で記述
   - 進捗率は「**進捗率**: N%」形式で記述
   - ステータスは「**ステータス**: 完了/進行中/未着手」形式で記述

3. **ファイルリストの検出**:
   - 「### 実装ファイル」セクション内の項目をファイルリストとして検出
   - `- [x] ファイルパス` は完了したファイル
   - `- [ ] ファイルパス` は未完了のファイルとして認識

4. **進捗率の計算**:
   - 各スコープの進捗率はファイルリストの完了状態から自動計算される
   - 明示的に記載された進捗率も認識される

5. **参考資料の検出**:
   - 「### 参考資料」セクションから関連する参考資料のリストを検出

これらのルールに従わない記述や形式はパースエラーを引き起こす可能性があります。

<具体例>

# プロジェクト名 - 実装状況 (YYYY/MM/DD更新)

## 全体進捗サマリー
- 完成予定ファイル数: 82
- 作成済みファイル数: 41
- 進捗率: 50%
- 最終更新日: 2025/03/12

## スコープ状況

### 完了済みスコープ
- [x] スコープ名1 (進捗率: 100%)
- [x] スコープ名2 (進捗率: 100%)

### 進行中スコープ
- [ ] スコープ名3 (進捗率: 50%)

### 未着手スコープ
- [ ] スコープ名4 (進捗率: 0%)
- [ ] スコープ名5 (進捗率: 0%)

## 最終的なディレクトリ構造(予測)
```
project-root/
└── [ディレクトリ構造]
```

## 現在のディレクトリ構造
```
project-root/
└── [ディレクトリ構造]
```

## スコープ：スコープ名1
**スコープID**: scope-1742338278476
**進捗率**: 100%
**ステータス**: 完了

### 実装ファイル
- [x] src/ui/auth/AuthStatusBar.ts
- [x] src/services/AuthEventBus.ts
- [x] src/core/auth/authCommands.ts
- [x] src/ui/promptLibrary/PromptLibraryPanel.ts
- [x] src/ui/promptLibrary/PromptEditor.ts

### 参考資料
- 要件定義書: docs/requirements.md
- スコープ仕様書: docs/scopes/scope-name1.md
- API仕様: docs/api.md

## スコープ：スコープ名2
**スコープID**: scope-1742338278477
**進捗率**: 100%
**ステータス**: 完了

### 実装ファイル
- [x] src/ui/dashboard/DashboardPanel.ts
- [x] src/services/DashboardService.ts
- [x] src/core/dashboard/dashboardCommands.ts

### 参考資料
- 要件定義書: docs/requirements.md
- スコープ仕様書: docs/scopes/scope-name2.md

## スコープ：スコープ名3
**スコープID**: scope-1742338278478
**進捗率**: 50%
**ステータス**: 進行中

### 実装ファイル
- [x] src/ui/settings/SettingsPanel.ts
- [x] src/services/SettingsService.ts
- [ ] src/core/settings/settingsCommands.ts
- [ ] src/ui/settings/ThemeSettings.ts
- [ ] src/ui/settings/AccountSettings.ts

### 参考資料
- 要件定義書: docs/requirements.md
- スコープ仕様書: docs/scopes/scope-name3.md

## スコープ：スコープ名4
**スコープID**: scope-1742338278479
**進捗率**: 0%
**ステータス**: 未着手

### 実装ファイル
- [ ] src/ui/analytics/AnalyticsPanel.ts
- [ ] src/services/AnalyticsService.ts
- [ ] src/core/analytics/analyticsCommands.ts

### 参考資料
- 要件定義書: docs/requirements.md
- スコープ仕様書: docs/scopes/scope-name4.md

## 引継ぎ情報

### 現在のスコープ: スコープ名3
**スコープID**: scope-1742338278478  
**説明**: スコープの簡潔な説明文
**含まれる機能**:
1. 機能1の説明
2. 機能2の説明
3. 機能3の説明

**依存するスコープ**:
- スコープ名1
- スコープ名2

## 次回実装予定

### 次のスコープ: スコープ名4
**スコープID**: scope-1742338278479  
**説明**: 次のスコープの簡潔な説明文
**含まれる機能**:
1. 機能1の説明
2. 機能2の説明

**依存するスコープ**:
- スコープ名1
- スコープ名2
- スコープ名3
</具体例>