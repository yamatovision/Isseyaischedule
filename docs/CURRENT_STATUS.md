# プランナビ - 実装状況 (2025/03/19更新)

## スコープ状況

### 完了済みスコープ
- [x] 初期環境構築 (100%)

### 進行中スコープ
- [ ] 基盤構築 (10%)

### 未着手スコープ
- [ ] 認証システム (0%)
- [ ] ダッシュボード画面 (0%)
- [ ] プロジェクト詳細画面 (0%)
- [ ] Chat-to-Gantt画面 (0%)
- [ ] 設定画面 (0%)

## 完成系のディレクトリ構造
```
project-root/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── assets/
│       └── images/
├── src/
│   ├── api/
│   │   ├── authApi.js
│   │   ├── planApi.js
│   │   ├── taskApi.js
│   │   └── chatApi.js
│   ├── assets/
│   │   ├── css/
│   │   │   ├── reset.css
│   │   │   ├── global.css
│   │   │   └── variables.css
│   │   └── images/
│   │       └── logo.svg
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── ErrorBoundary.jsx
│   │   ├── auth/
│   │   │   ├── LoginForm.jsx
│   │   │   └── RegisterForm.jsx
│   │   ├── dashboard/
│   │   │   ├── PlanCard.jsx
│   │   │   ├── ProgressSummary.jsx
│   │   │   └── TaskList.jsx
│   │   ├── plan/
│   │   │   ├── GanttChart.jsx
│   │   │   ├── TaskItem.jsx
│   │   │   └── ProgressCharts.jsx
│   │   └── chat/
│   │       ├── ChatInterface.jsx
│   │       ├── MessageItem.jsx
│   │       └── TaskApproval.jsx
│   ├── contexts/
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── usePlans.js
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── PlanDetail.jsx
│   │   ├── ChatToGantt.jsx
│   │   └── Settings.jsx
│   ├── utils/
│   │   ├── auth.js
│   │   ├── date.js
│   │   ├── storage.js
│   │   └── chart.js
│   ├── shared/
│   │   └── index.ts
│   ├── App.jsx
│   ├── index.jsx
│   └── routes.jsx
├── .env
├── package.json
└── README.md
```

## 現在のディレクトリ構造
```
project-root/
├── docs/
│   ├── CURRENT_STATUS.md
│   ├── requirements.md
│   └── scopes/
│       ├── Login-requirements.md
│       ├── Plan-requirements.md
│       ├── chat-to-gantt-requirements.md
│       └── dashboard-requirements.md
├── mockups/
│   ├── Login.html
│   ├── Plan.html
│   ├── Setting.html
│   ├── chat-to-gantt.html
│   └── dashboard.html
└── src/
    ├── api/
    ├── assets/
    │   ├── css/
    │   └── images/
    ├── components/
    ├── pages/
    └── utils/
```

## 初期環境構築
- [x] プロジェクトフォルダ構造の作成
- [x] 要件定義ドキュメントの整理
- [x] モックアップの作成と検証

## 基盤構築
- [ ] src/shared/index.ts
- [ ] src/contexts/AuthContext.jsx
- [ ] src/contexts/ThemeContext.jsx
- [ ] src/utils/auth.js
- [ ] src/utils/date.js
- [ ] src/utils/storage.js
- [ ] src/utils/chart.js
- [ ] src/components/common/Header.jsx
- [ ] src/components/common/Sidebar.jsx
- [ ] src/components/common/LoadingSpinner.jsx
- [ ] src/components/common/ErrorBoundary.jsx
- [ ] src/api/authApi.js
- [ ] src/api/planApi.js
- [ ] src/api/taskApi.js
- [ ] src/api/chatApi.js
- [ ] src/App.jsx
- [ ] src/index.jsx
- [ ] src/routes.jsx

## 認証システム
- [ ] src/pages/Login.jsx
- [ ] src/components/auth/LoginForm.jsx
- [ ] src/components/auth/RegisterForm.jsx
- [ ] src/hooks/useAuth.js
- [ ] src/assets/css/login.css

## ダッシュボード画面
- [ ] src/pages/Dashboard.jsx
- [ ] src/components/dashboard/PlanCard.jsx
- [ ] src/components/dashboard/ProgressSummary.jsx
- [ ] src/components/dashboard/TaskList.jsx
- [ ] src/hooks/usePlans.js
- [ ] src/assets/css/dashboard.css

## プロジェクト詳細画面
- [ ] src/pages/PlanDetail.jsx
- [ ] src/components/plan/GanttChart.jsx
- [ ] src/components/plan/TaskItem.jsx
- [ ] src/components/plan/ProgressCharts.jsx
- [ ] src/assets/css/plan.css

## Chat-to-Gantt画面
- [ ] src/pages/ChatToGantt.jsx
- [ ] src/components/chat/ChatInterface.jsx
- [ ] src/components/chat/MessageItem.jsx
- [ ] src/components/chat/TaskApproval.jsx
- [ ] src/assets/css/chat.css

## 設定画面
- [ ] src/pages/Settings.jsx
- [ ] src/components/settings/ProfileForm.jsx
- [ ] src/components/settings/NotificationSettings.jsx
- [ ] src/components/settings/ExportSettings.jsx
- [ ] src/assets/css/settings.css