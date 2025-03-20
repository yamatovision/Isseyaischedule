import React, { createContext, useState, useEffect } from 'react';

/**
 * テーマコンテキスト
 * 
 * アプリケーション全体でのテーマ設定（ライト/ダークモード）を管理するためのコンテキスト
 */
export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // ローカルストレージからテーマ設定を取得（なければ'light'をデフォルトに）
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  };

  const [theme, setTheme] = useState(getInitialTheme);
  const [loading, setLoading] = useState(true);

  // テーマ変更時にローカルストレージと<body>クラスを更新
  useEffect(() => {
    localStorage.setItem('theme', theme);
    
    // ドキュメントのbodyにテーマクラスを適用
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
    
    setLoading(false);
  }, [theme]);

  // テーマ切り替え関数
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // 特定のテーマに設定する関数
  const setSpecificTheme = (newTheme) => {
    if (newTheme === 'light' || newTheme === 'dark') {
      setTheme(newTheme);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        loading,
        toggleTheme,
        setTheme: setSpecificTheme,
        isDarkMode: theme === 'dark'
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;