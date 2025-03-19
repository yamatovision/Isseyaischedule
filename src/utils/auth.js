/**
 * 認証関連ユーティリティ
 * 
 * JWT認証トークンの管理（保存、取得、削除）と
 * 認証ヘッダーの生成などを行うユーティリティ関数群
 */

// 環境変数からトークン名を取得するか、デフォルト値を使用
const TOKEN_KEY = process.env.REACT_APP_AUTH_TOKEN_NAME || 'auth_token';
const STORAGE_PREFIX = process.env.REACT_APP_STORAGE_PREFIX || 'plannavi_';
const FULL_TOKEN_KEY = `${STORAGE_PREFIX}${TOKEN_KEY}`;

/**
 * ローカルストレージからトークンを取得
 * @returns {string|null} 保存されているトークン、またはnull
 */
export const getToken = () => {
  return localStorage.getItem(FULL_TOKEN_KEY);
};

/**
 * トークンをローカルストレージに保存
 * @param {string} token - 保存するJWTトークン
 */
export const setToken = (token) => {
  localStorage.setItem(FULL_TOKEN_KEY, token);
  console.log('【認証情報】トークンを保存しました');
};

/**
 * ローカルストレージからトークンを削除
 */
export const removeToken = () => {
  localStorage.removeItem(FULL_TOKEN_KEY);
  console.log('【認証情報】トークンを削除しました');
};

/**
 * Authorization ヘッダーを生成
 * @returns {Object} Authorizationヘッダーを含むオブジェクト
 */
export const getAuthHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * トークンの有効性を確認（期限切れチェック）
 * @returns {boolean} トークンが有効な場合はtrue、それ以外はfalse
 */
export const isTokenValid = () => {
  const token = getToken();
  if (!token) return false;
  
  try {
    // トークンが標準的なJWT形式かチェック
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('【認証警告】不正な形式のJWTトークンです');
      return false;
    }
    
    // トークンのペイロード部分をデコード
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = atob(base64);
    const payload = JSON.parse(jsonPayload);
    
    // 有効期限を確認（期限切れの場合はfalse）
    // 有効期限に10分のバッファーを追加して更新への対応時間を確保
    return (payload.exp * 1000) > (Date.now() - 10 * 60 * 1000);
  } catch (e) {
    console.error('【認証エラー】トークンの検証に失敗しました', e);
    return false;
  }
};

/**
 * ユーザーが認証済みかどうかを確認
 * @returns {boolean} 認証済みの場合はtrue、それ以外はfalse
 */
export const isAuthenticated = () => {
  return getToken() !== null && isTokenValid();
};

/**
 * ユーザーがログイン中かどうかをリアルタイムで監視
 * @param {Function} callback - 認証状態変更時に実行されるコールバック関数
 * @returns {Function} イベントリスナーをクリーンアップする関数
 */
export const watchAuthState = (callback) => {
  // ストレージ変更イベントのリスナー
  const handleStorageChange = (event) => {
    if (event.key === FULL_TOKEN_KEY) {
      callback(event.newValue !== null);
    }
  };
  
  // イベントリスナーを追加
  window.addEventListener('storage', handleStorageChange);
  
  // クリーンアップ関数を返す
  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
};

/**
 * 認証情報をセッションストレージに一時的に保存（ページリロード用）
 * @param {Object} authState - 保存する認証状態
 */
export const saveAuthStateForReload = (authState) => {
  sessionStorage.setItem(`${STORAGE_PREFIX}auth_state`, JSON.stringify(authState));
};

/**
 * セッションストレージから認証情報を取得し、クリア
 * @returns {Object|null} 保存されていた認証状態、またはnull
 */
export const getAndClearSavedAuthState = () => {
  const savedState = sessionStorage.getItem(`${STORAGE_PREFIX}auth_state`);
  if (savedState) {
    sessionStorage.removeItem(`${STORAGE_PREFIX}auth_state`);
    return JSON.parse(savedState);
  }
  return null;
};