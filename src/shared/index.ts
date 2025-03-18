/**
 * ===== 統合型定義・APIパスガイドライン =====
 * 
 * 【絶対に守るべき原則】
 * 1. フロントエンドとバックエンドで異なる型を作らない
 * 2. 同じデータ構造に対して複数の型を作らない
 * 3. 新しいプロパティは必ずオプショナルとして追加
 * 4. データの形は1箇所でのみ定義し、それを共有する
 * 5. APIパスは必ずこのファイルで一元管理する
 * 6. コード内でAPIパスをハードコードしない
 * 7. パスパラメータを含むエンドポイントは関数として提供する
 * 
 * 【命名規則】
 * - データモデル: [Model]Type または I[Model]
 * - リクエスト: [Model]Request
 * - レスポンス: [Model]Response
 * 
 * 【APIパス構造例】
 * export const API_BASE_PATH = '/api/v1';
 * 
 * export const AUTH = {
 *   LOGIN: `${API_BASE_PATH}/auth/login`,
 *   REGISTER: `${API_BASE_PATH}/auth/register`,
 *   PROFILE: `${API_BASE_PATH}/auth/profile`,
 *   // パスパラメータを含む場合は関数を定義
 *   USER_DETAIL: (userId: string) => `${API_BASE_PATH}/auth/users/${userId}`
 * };
 * 
 * 【変更履歴】
 * - 2025/03/18: 初期モデル・APIパス定義 (Claude)
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
  LOGOUT: `${API_BASE_PATH}/auth/logout`
};

// プロジェクト関連APIパス
export const PROJECTS = {
  LIST: `${API_BASE_PATH}/projects`,
  RECENT: `${API_BASE_PATH}/projects/recent`,
  AT_RISK: `${API_BASE_PATH}/projects/at-risk`,
  DETAIL: (projectId: string) => `${API_BASE_PATH}/projects/${projectId}`,
  UPDATE: (projectId: string) => `${API_BASE_PATH}/projects/${projectId}`,
  DELETE: (projectId: string) => `${API_BASE_PATH}/projects/${projectId}`,
  RELATED: (projectId: string) => `${API_BASE_PATH}/projects/${projectId}/related`,
  PROGRESS: (projectId: string) => `${API_BASE_PATH}/projects/${projectId}/progress`,
  PROGRESS_WEEKLY: (projectId: string) => `${API_BASE_PATH}/projects/${projectId}/progress/weekly`,
  EXPORT_PDF: (projectId: string) => `${API_BASE_PATH}/projects/${projectId}/export/pdf`,
  EXPORT_EXCEL: (projectId: string) => `${API_BASE_PATH}/projects/${projectId}/export/excel`,
  RESOURCES: (projectId: string) => `${API_BASE_PATH}/projects/${projectId}/resources`
};

// タスク関連APIパス
export const TASKS = {
  LIST: (projectId: string) => `${API_BASE_PATH}/projects/${projectId}/tasks`,
  CREATE: (projectId: string) => `${API_BASE_PATH}/projects/${projectId}/tasks`,
  DETAIL: (taskId: string) => `${API_BASE_PATH}/tasks/${taskId}`,
  UPDATE: (taskId: string) => `${API_BASE_PATH}/tasks/${taskId}`,
  UPDATE_STATUS: (taskId: string) => `${API_BASE_PATH}/tasks/${taskId}/status`,
  DELETE: (taskId: string) => `${API_BASE_PATH}/tasks/${taskId}`,
  UPCOMING: `${API_BASE_PATH}/tasks/upcoming`,
  AT_RISK: `${API_BASE_PATH}/tasks/at-risk`
};

// リソース関連APIパス
export const RESOURCES = {
  AVAILABILITY: `${API_BASE_PATH}/resources/availability`,
  CHECK_CONFLICTS: `${API_BASE_PATH}/resources/check-conflicts`
};

// チャット関連APIパス
export const CHAT = {
  SEND: `${API_BASE_PATH}/chat/send`,
  HISTORY: (projectId: string) => `${API_BASE_PATH}/chat/history/${projectId}`,
  GENERATE_TASKS: `${API_BASE_PATH}/tasks/generate`,
  SUGGEST_SOLUTION: `${API_BASE_PATH}/chat/suggest-solution`,
  APPLY_SOLUTION: (projectId: string) => `${API_BASE_PATH}/projects/${projectId}/apply-solution`
};

// 統計関連APIパス
export const STATS = {
  OVERALL: `${API_BASE_PATH}/stats/overall`
};

// ユーザータイプ定義
export interface IUser {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'user';
  profilePicture?: string;
}

// 認証関連型定義
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  invitationCode: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: IUser;
  message?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// プロジェクト関連型定義
export interface IProject {
  id: string;
  title: string;
  description?: string;
  type: 'store' | 'marketing' | 'product' | 'event' | 'company';
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  progress: number; // 0-100
  totalTasks: number;
  completedTasks: number;
  delayedTasks: number;
  isAtRisk: boolean;
  riskFactors?: string[];
  resources?: IResource[];
  relatedProjects?: string[];
}

// タスク関連型定義
export interface ITask {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  progress: number; // 0-100
  status: 'not-started' | 'in-progress' | 'completed' | 'delayed';
  priority: 'high' | 'medium' | 'low';
  isAtRisk: boolean;
  riskDescription?: string;
  requiredResources?: IResource[];
  dependsOn?: string[];
  order?: number;
  warning?: boolean;
  warningText?: string;
}

// リソース関連型定義
export interface IResource {
  id: string;
  name: string;
  type: 'human' | 'equipment' | 'facility' | 'budget';
  capacity: number;
  unit: string;
  availability?: {
    startDate: string;
    endDate: string;
    capacity: number;
  }[];
}

// チャット関連型定義
export interface IChatMessage {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: string;
}

export interface IChatHistory {
  id: string;
  projectId: string;
  messages: IChatMessage[];
}

export interface TaskGenerationRequest {
  projectId: string;
  projectType: string;
  goal: string;
  targetDate: string; // YYYY-MM-DD
  additionalInfo?: string;
}

export interface TaskGenerationResponse {
  tasks: ITask[];
  warnings?: {
    type: string;
    message: string;
    relatedTaskId?: string;
  }[];
}

export interface SolutionSuggestionRequest {
  taskId: string;
  planId: string;
  issue: string;
}

export interface SolutionSuggestionResponse {
  suggestions: {
    id: string;
    description: string;
    impact: string;
    difficulty: 'easy' | 'medium' | 'hard';
  }[];
}

// 統計関連型定義
export interface IProgressStats {
  completed: number;
  inProgress: number;
  notStarted: number;
  totalTasks: number;
}

// レスポンス型定義
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  errors?: Array<{
    field?: string;
    message: string;
  }>;
}

export interface ProjectListResponse {
  plans: IProject[];
}

export interface TaskListResponse {
  tasks: ITask[];
}

export interface StatsResponse {
  stats: IProgressStats;
}