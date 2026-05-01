# AWS Emulator Console

AWS S3 エミュレーター [Floci](https://github.com/floci) 向けのコンソール UI アプリケーション。Nuxt 4 + Vue 3 で構築されており、ローカルで稼働する S3 エミュレーターをブラウザから操作できる。

## 技術スタック

- [Nuxt 4](https://nuxt.com/) + [Vue 3](https://vuejs.org/)
- [Nuxt UI](https://ui.nuxt.com/)
- [Tailwind CSS](https://tailwindcss.com/)

## セットアップ

依存関係をインストールする。

```bash
npm install
```

S3 エミュレーター（Floci）を起動する。`localhost:4566` で待ち受ける。

```bash
docker compose up -d
```

## 開発サーバー

`http://localhost:3000` で開発サーバーを起動する。

```bash
npm run dev
```

## その他のコマンド

```bash
# Lint
npm run lint

# 型チェック
npm run typecheck

# プロダクションビルド
npm run build

# プロダクションプレビュー
npm run preview
```

## ディレクトリ構成

| ディレクトリ | 役割 |
|---|---|
| [app/](app/) | フロントエンド（Vue コンポーネント、ページ） |
| [server/](server/) | バックエンド（Nuxt サーバールート、API） |
| [shared/](shared/) | クライアント・サーバー共通の型定義 |
