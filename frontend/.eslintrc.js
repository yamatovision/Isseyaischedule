module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:import/errors",
    "plugin:import/warnings"
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 12,
    sourceType: "module"
  },
  plugins: [
    "react",
    "import"
  ],
  rules: {
    // 拡張子は必須にしない（React標準の動作に合わせる）
    "import/extensions": ["error", "never", {
      "css": "always",
      "svg": "always",
      "json": "always"
    }],
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off"
  },
  settings: {
    react: {
      version: "detect"
    },
    // インポート解決の設定
    "import/resolver": {
      "node": {
        "extensions": [".js", ".jsx"]
      }
    }
  }
}