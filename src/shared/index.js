/**
 * 共通型定義・APIパス
 * 
 * フロントエンドとバックエンドで共有される定義を含むファイル
 * データモデルやAPIエンドポイントパスを一元管理します
 */

// APIパス定義
export const API_BASE_PATH = '/api/v1';

// 認証関連APIパス
export const AUTH = {
  LOGIN: `${API_BASE_PATH}/auth/login`,
  REGISTER: `${API_BASE_PATH}/auth/register`,
  FORGOT_PASSWORD: `${API_BASE_PATH}/auth/forgot-password`,
  RESET_PASSWORD: `${API_BASE_PATH}/auth/reset-password`,
  VERIFY_INVITATION: `${API_BASE_PATH}/auth/verify-invitation`,
  ME: `${API_BASE_PATH}/auth/me`,
  LOGOUT: `${API_BASE_PATH}/auth/logout`,
  REFRESH_TOKEN: `${API_BASE_PATH}/auth/refresh-token`,
  UPDATE_PROFILE: `${API_BASE_PATH}/auth/profile`,
  CHANGE_PASSWORD: `${API_BASE_PATH}/auth/change-password`,
  DELETE_ACCOUNT: `${API_BASE_PATH}/auth/delete-account`
};

// プロジェクト関連APIパス
export const PROJECTS = {
  LIST: `${API_BASE_PATH}/projects`,
  ACTIVE: `${API_BASE_PATH}/projects/active`, // アクティブなプロジェクト一覧（タスク統計情報を含む）
  RECENT: `${API_BASE_PATH}/projects/recent`,
  AT_RISK: `${API_BASE_PATH}/projects/at-risk`,
  DETAIL: (projectId) => `${API_BASE_PATH}/projects/${projectId}`,
  UPDATE: (projectId) => `${API_BASE_PATH}/projects/${projectId}`,
  DELETE: (projectId) => `${API_BASE_PATH}/projects/${projectId}`,
  RELATED: (projectId) => `${API_BASE_PATH}/projects/${projectId}/related`,
  PROGRESS: (projectId) => `${API_BASE_PATH}/projects/${projectId}/progress`,
  PROGRESS_WEEKLY: (projectId) => `${API_BASE_PATH}/projects/${projectId}/progress/weekly`,
  EXPORT_PDF: (projectId) => `${API_BASE_PATH}/projects/${projectId}/export/pdf`,
  EXPORT_EXCEL: (projectId) => `${API_BASE_PATH}/projects/${projectId}/export/excel`,
  RESOURCES: (projectId) => `${API_BASE_PATH}/projects/${projectId}/resources`
};

// タスク関連APIパス
export const TASKS = {
  LIST: (projectId) => `${API_BASE_PATH}/tasks/project/${projectId}`,
  CREATE: (projectId) => `${API_BASE_PATH}/tasks`,
  DETAIL: (taskId) => `${API_BASE_PATH}/tasks/${taskId}`,
  UPDATE: (taskId) => `${API_BASE_PATH}/tasks/${taskId}`,
  UPDATE_STATUS: (taskId) => `${API_BASE_PATH}/tasks/${taskId}/status`,
  DELETE: (taskId) => `${API_BASE_PATH}/tasks/${taskId}`,
  UPCOMING: `${API_BASE_PATH}/tasks/upcoming`,
  AT_RISK: `${API_BASE_PATH}/tasks/at-risk`,
  GENERATE_TASKS: `${API_BASE_PATH}/tasks/generate`
};

// リソース関連APIパス
export const RESOURCES = {
  AVAILABILITY: `${API_BASE_PATH}/resources/availability`,
  CHECK_CONFLICTS: `${API_BASE_PATH}/resources/check-conflicts`
};

// チャット関連APIパス
export const CHAT = {
  SEND: `${API_BASE_PATH}/chat/send`,
  HISTORY: (projectId) => `${API_BASE_PATH}/chat/history/${projectId}`,
  GENERATE_TASKS: `${API_BASE_PATH}/chat/tasks/generate`,
  SUGGEST_SOLUTION: `${API_BASE_PATH}/chat/suggest-solution`,
  APPLY_SOLUTION: (projectId) => `${API_BASE_PATH}/projects/${projectId}/apply-solution`
};

// 統計関連APIパス
export const STATS = {
  OVERALL: `${API_BASE_PATH}/stats/overall`
};

// ユーザータイプ定義
export const UserRoles = {
  ADMIN: 'admin',
  USER: 'user'
};

// プロジェクト関連の列挙型
export const ProjectStatus = {
  NOT_STARTED: 'not-started',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  DELAYED: 'delayed',
  CANCELLED: 'cancelled'
};

export const ProjectTypes = {
  STORE: 'store',
  MARKETING: 'marketing',
  PRODUCT: 'product',
  EVENT: 'event',
  COMPANY: 'company'
};

// タスク関連の列挙型
export const TaskStatus = {
  NOT_STARTED: 'not-started',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  DELAYED: 'delayed'
};

export const TaskPriority = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

// リソース関連の列挙型
export const ResourceTypes = {
  HUMAN: 'human',
  EQUIPMENT: 'equipment',
  FACILITY: 'facility',
  BUDGET: 'budget'
};