#!/bin/bash

# Tailwind CSSの依存関係をインストール
npm install -D tailwindcss@latest postcss@latest autoprefixer@latest

# Tailwind CSS設定ファイルを初期化
npx tailwindcss init -p

# TailwindのCSSファイルを生成
npm run build:css

echo "Tailwind CSSのセットアップが完了しました！"