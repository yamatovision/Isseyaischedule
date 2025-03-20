import axios from 'axios';
import { getAuthHeader } from '../utils/auth';
import { AUTH } from '../shared/index.js';

/**
 * 認証API関連の関数群
 * 
 * ログイン、登録、パスワードリセット、プロフィール取得など
 * 認証関連のAPIリクエストを処理する関数を提供します。
 */


// 環境変数またはデフォルト値からAPIのベースURLを取得
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Axiosインスタンスの作成
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // クッキーを常に送受信するように設定
});

// 疑似遅延設定（開発用、ミリ秒）
// 品質管理フェーズでは遅延を0に設定
const API_DELAY = 0;

/**
 * リクエストインターセプターの設定
 * 各リクエスト前に認証ヘッダーを追加
 */
api.interceptors.request.use(
  (config) => {
    // 認証ヘッダーを取得して追加
    const token = localStorage.getItem('plannavi_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (config.url !== AUTH.LOGIN && config.url !== AUTH.REGISTER) {
      // ログインと登録以外の場合は警告（これらのエンドポイントでは認証不要のため警告は不要）
      console.warn('【警告】認証トークンがありません。API呼び出しは失敗する可能性があります。', config.url);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * レスポンスインターセプターの設定
 * エラーハンドリングと認証トークンのリフレッシュ
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // 401エラーかつトークンリフレッシュが未試行の場合
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // リフレッシュトークンが存在するか確認する
      const isLoggedIn = localStorage.getItem('plannavi_auth_token');
      
      // ログイン済みの場合のみリフレッシュを試行
      if (isLoggedIn) {
        try {
          console.log('【API連携】トークンの更新を試行します');
          
          // リフレッシュトークンAPI呼び出し
          // HTTPOnly Cookieに保存されたリフレッシュトークンがリクエストに自動的に含まれる
          const response = await api.post(AUTH.REFRESH_TOKEN, {}, {
            withCredentials: true // Cookieを含めるために必要
          });
          
          if (response.data.success) {
            const { token } = response.data;
              
            // 新しいアクセストークンを保存
            localStorage.setItem('plannavi_auth_token', token);
            
            // 元のリクエストのAuthorizationヘッダーを更新
            originalRequest.headers.Authorization = `Bearer ${token}`;
            
            // 元のリクエストを再試行
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.error('【API連携エラー】トークンのリフレッシュに失敗しました', refreshError);
        }
        
        // リフレッシュに失敗した場合はログイン画面へリダイレクト
        // 現在がログイン画面でない場合のみリダイレクト
        if (!window.location.pathname.includes('/login')) {
          console.log('【API連携】認証エラー：ログインページにリダイレクトします');
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

/**
 * ユーザーログイン
 * @param {Object} credentials - ログイン認証情報
 * @param {string} credentials.email - メールアドレス
 * @param {string} credentials.password - パスワード
 * @param {boolean} credentials.rememberMe - ログイン状態を保持するかどうか
 * @returns {Promise} APIレスポンス
 */
export const login = async (credentials) => {
  console.log('【API連携】ログインAPIを呼び出します');
  
  // 実際のAPI呼び出し（withCredentialsを追加してクッキーを受信）
  try {
    const response = await api.post(AUTH.LOGIN, credentials, {
      withCredentials: true // クッキーを受信するために必要
    });
    return response.data;
  } catch (error) {
    console.error('【API連携エラー】ログインに失敗しました', error);
    throw error;
  }
};

/**
 * ユーザー登録
 * @param {Object} userData - ユーザーの登録情報
 * @param {string} userData.email - メールアドレス
 * @param {string} userData.password - パスワード
 * @param {string} userData.invitationCode - 招待コード
 * @returns {Promise} APIレスポンス
 */
export const register = async (userData) => {
  console.log('【API連携】ユーザー登録APIを呼び出します');
  
  // 実際のAPI呼び出し（withCredentialsを追加してクッキーを受信）
  try {
    const response = await api.post(AUTH.REGISTER, userData, {
      withCredentials: true // クッキーを受信するために必要
    });
    return response.data;
  } catch (error) {
    console.error('【API連携エラー】ユーザー登録に失敗しました', error);
    throw error;
  }
};

/**
 * ログアウト
 * @returns {Promise} APIレスポンス
 */
export const logout = async () => {
  console.log('【API連携】ログアウトAPIを呼び出します');
  
  try {
    const response = await api.post(AUTH.LOGOUT, {}, {
      withCredentials: true // クッキーを送信するために必要
    });
    return response.data;
  } catch (error) {
    console.error('【API連携エラー】ログアウトに失敗しました', error);
    throw error;
  }
};

/**
 * パスワードリセットリクエスト
 * @param {string} email - パスワードをリセットするユーザーのメールアドレス
 * @returns {Promise} APIレスポンス
 */
export const forgotPassword = async (email) => {
  console.log('【API連携】パスワードリセットAPIを呼び出します');
  
  try {
    const response = await api.post(AUTH.FORGOT_PASSWORD, { email });
    return response.data;
  } catch (error) {
    console.error('【API連携エラー】パスワードリセットリクエストに失敗しました', error);
    throw error;
  }
};

/**
 * パスワードリセットの実行
 * @param {string} token - パスワードリセットトークン
 * @param {string} newPassword - 新しいパスワード
 * @returns {Promise} APIレスポンス
 */
export const resetPassword = async (token, newPassword) => {
  console.log('【API連携】パスワード再設定APIを呼び出します');
  
  try {
    const response = await api.post(AUTH.RESET_PASSWORD, { token, newPassword });
    return response.data;
  } catch (error) {
    console.error('【API連携エラー】パスワード再設定に失敗しました', error);
    throw error;
  }
};

/**
 * 招待コードの検証
 * @param {string} code - 検証する招待コード
 * @returns {Promise} APIレスポンス
 */
export const verifyInvitation = async (code) => {
  console.log('【API連携】招待コード検証APIを呼び出します');
  
  try {
    const response = await api.post(AUTH.VERIFY_INVITATION, { code });
    return response.data;
  } catch (error) {
    console.error('【API連携エラー】招待コード検証に失敗しました', error);
    throw error;
  }
};

/**
 * ユーザープロフィールの取得
 * @returns {Promise} APIレスポンス
 */
export const getProfile = async () => {
  console.log('【API連携】プロフィール取得APIを呼び出します');
  
  try {
    const response = await api.get(AUTH.ME);
    return response.data;
  } catch (error) {
    console.error('【API連携エラー】プロフィール取得に失敗しました', error);
    throw error;
  }
};

/**
 * ユーザープロフィールの更新
 * @param {Object} userData - 更新するユーザー情報
 * @returns {Promise} APIレスポンス
 */
export const updateProfile = async (userData) => {
  console.log('【API連携】プロフィール更新APIを呼び出します');
  
  try {
    const response = await api.put(AUTH.UPDATE_PROFILE, userData);
    return response.data;
  } catch (error) {
    console.error('【API連携エラー】プロフィール更新に失敗しました', error);
    throw error;
  }
};

/**
 * パスワード変更
 * @param {Object} passwordData - パスワード変更情報
 * @param {string} passwordData.currentPassword - 現在のパスワード
 * @param {string} passwordData.newPassword - 新しいパスワード
 * @returns {Promise} APIレスポンス
 */
export const changePassword = async (passwordData) => {
  console.log('【API連携】パスワード変更APIを呼び出します');
  
  try {
    const response = await api.put(AUTH.CHANGE_PASSWORD, passwordData);
    return response.data;
  } catch (error) {
    console.error('【API連携エラー】パスワード変更に失敗しました', error);
    throw error;
  }
};

/**
 * アカウント削除
 * @returns {Promise} APIレスポンス
 */
export const deleteAccount = async () => {
  console.log('【API連携】アカウント削除APIを呼び出します');
  
  try {
    const response = await api.delete(AUTH.DELETE_ACCOUNT);
    return response.data;
  } catch (error) {
    console.error('【API連携エラー】アカウント削除に失敗しました', error);
    throw error;
  }
};

// default exportを削除して、named exportのみにする
// 循環参照の問題を解決するために、default exportは使用しない