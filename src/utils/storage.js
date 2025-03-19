/**
 * ストレージユーティリティ
 * 
 * localStorage、sessionStorageのラッパー関数で、
 * 一貫したストレージの使用と、エラーハンドリングを提供します。
 */

// ストレージキーのプレフィックス（名前空間）
const STORAGE_PREFIX = process.env.REACT_APP_STORAGE_PREFIX || 'schedle_';

/**
 * ローカルストレージに値を保存（オブジェクトは自動的にJSON化）
 * @param {string} key - 保存するデータのキー
 * @param {any} value - 保存する値
 * @returns {boolean} 保存が成功したかどうか
 */
export const saveToLocalStorage = (key, value) => {
  try {
    const fullKey = `${STORAGE_PREFIX}${key}`;
    const valueToStore = typeof value === 'object' ? JSON.stringify(value) : value;
    localStorage.setItem(fullKey, valueToStore);
    return true;
  } catch (error) {
    console.error('ローカルストレージへの保存に失敗しました:', error);
    return false;
  }
};

/**
 * ローカルストレージから値を取得（JSON文字列は自動的にパース）
 * @param {string} key - 取得するデータのキー
 * @param {any} defaultValue - 値が見つからない場合のデフォルト値
 * @returns {any} 保存されていた値またはデフォルト値
 */
export const getFromLocalStorage = (key, defaultValue = null) => {
  try {
    const fullKey = `${STORAGE_PREFIX}${key}`;
    const item = localStorage.getItem(fullKey);
    
    if (item === null) {
      return defaultValue;
    }
    
    // JSON形式の場合はパース
    try {
      return JSON.parse(item);
    } catch (e) {
      // パースに失敗した場合は文字列としてそのまま返す
      return item;
    }
  } catch (error) {
    console.error('ローカルストレージからの取得に失敗しました:', error);
    return defaultValue;
  }
};

/**
 * ローカルストレージから項目を削除
 * @param {string} key - 削除するデータのキー
 * @returns {boolean} 削除が成功したかどうか
 */
export const removeFromLocalStorage = (key) => {
  try {
    const fullKey = `${STORAGE_PREFIX}${key}`;
    localStorage.removeItem(fullKey);
    return true;
  } catch (error) {
    console.error('ローカルストレージからの削除に失敗しました:', error);
    return false;
  }
};

/**
 * セッションストレージに値を保存（オブジェクトは自動的にJSON化）
 * @param {string} key - 保存するデータのキー
 * @param {any} value - 保存する値
 * @returns {boolean} 保存が成功したかどうか
 */
export const saveToSessionStorage = (key, value) => {
  try {
    const fullKey = `${STORAGE_PREFIX}${key}`;
    const valueToStore = typeof value === 'object' ? JSON.stringify(value) : value;
    sessionStorage.setItem(fullKey, valueToStore);
    return true;
  } catch (error) {
    console.error('セッションストレージへの保存に失敗しました:', error);
    return false;
  }
};

/**
 * セッションストレージから値を取得（JSON文字列は自動的にパース）
 * @param {string} key - 取得するデータのキー
 * @param {any} defaultValue - 値が見つからない場合のデフォルト値
 * @returns {any} 保存されていた値またはデフォルト値
 */
export const getFromSessionStorage = (key, defaultValue = null) => {
  try {
    const fullKey = `${STORAGE_PREFIX}${key}`;
    const item = sessionStorage.getItem(fullKey);
    
    if (item === null) {
      return defaultValue;
    }
    
    // JSON形式の場合はパース
    try {
      return JSON.parse(item);
    } catch (e) {
      // パースに失敗した場合は文字列としてそのまま返す
      return item;
    }
  } catch (error) {
    console.error('セッションストレージからの取得に失敗しました:', error);
    return defaultValue;
  }
};

/**
 * セッションストレージから項目を削除
 * @param {string} key - 削除するデータのキー
 * @returns {boolean} 削除が成功したかどうか
 */
export const removeFromSessionStorage = (key) => {
  try {
    const fullKey = `${STORAGE_PREFIX}${key}`;
    sessionStorage.removeItem(fullKey);
    return true;
  } catch (error) {
    console.error('セッションストレージからの削除に失敗しました:', error);
    return false;
  }
};

/**
 * ストレージクリーンアップ：特定のプレフィックスを持つすべてのアイテムを削除
 * @param {string} keyPrefix - 削除対象のキープレフィックス
 * @param {string} storageType - 'local' または 'session'
 * @returns {number} 削除されたアイテムの数
 */
export const cleanupStorage = (keyPrefix, storageType = 'local') => {
  try {
    const storage = storageType === 'local' ? localStorage : sessionStorage;
    const fullPrefix = `${STORAGE_PREFIX}${keyPrefix}`;
    const keys = [];
    
    // 削除するキーを見つける
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key.startsWith(fullPrefix)) {
        keys.push(key);
      }
    }
    
    // キーを削除
    keys.forEach(key => storage.removeItem(key));
    
    return keys.length;
  } catch (error) {
    console.error('ストレージのクリーンアップに失敗しました:', error);
    return 0;
  }
};

/**
 * 特定のプレフィックスを持つすべてのローカルストレージアイテムを取得
 * @param {string} keyPrefix - 検索するキープレフィックス
 * @returns {Object} キーと値のマップ
 */
export const getAllLocalStorageItems = (keyPrefix) => {
  try {
    const fullPrefix = `${STORAGE_PREFIX}${keyPrefix}`;
    const result = {};
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(fullPrefix)) {
        const shortKey = key.replace(STORAGE_PREFIX, '');
        const value = getFromLocalStorage(shortKey.replace(STORAGE_PREFIX, ''));
        result[shortKey] = value;
      }
    }
    
    return result;
  } catch (error) {
    console.error('ローカルストレージアイテムの取得に失敗しました:', error);
    return {};
  }
};

/**
 * ストレージの利用可能容量を確認
 * @returns {boolean} ストレージがまだ利用可能かどうか
 */
export const isStorageAvailable = () => {
  try {
    const testKey = `${STORAGE_PREFIX}storage_test`;
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    console.error('ストレージが利用できません:', error);
    return false;
  }
};