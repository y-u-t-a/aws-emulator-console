# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

AWS S3 エミュレーター（Floci）向けのコンソール UI アプリケーション。Nuxt 4 + Vue 3 のフルスタック構成で、ローカルの S3 エミュレーターを操作するための Web UI を提供する。

## コマンド

```bash
# 依存関係インストール
npm install

# 開発サーバー起動（localhost:3000）
npm run dev

# Floci（S3 エミュレーター）起動（localhost:4566）
docker compose up -d

# Lint
npm run lint

# 型チェック
npm run typecheck

# プロダクションビルド
npm run build

# プロダクションプレビュー
npm run preview
```

テストフレームワークは未設定。CI は lint と typecheck のみ実行する。

## アーキテクチャ

### ディレクトリ構成の役割

| ディレクトリ | 役割 |
|---|---|
| [app/](app/) | フロントエンド（Vue コンポーネント、ページ） |
| [server/](server/) | バックエンド（Nuxt サーバールート、API） |
| [shared/](shared/) | クライアント・サーバー共通の型定義 |

### フロントエンド（`app/`）

- [app/pages/](app/pages/) に Vue ファイルを置くとファイルベースルーティングとして自動登録される（Typed Pages 有効）
- [app/app.config.ts](app/app.config.ts) でテーマカラーを設定（primary: orange, neutral: slate）
- Nuxt UI コンポーネント（`<UHeader>`, `<UApp>` 等）を使用

### バックエンド（`server/`）

- [server/api/](server/api/) のファイルが `/api/*` エンドポイントとして公開される
  - ファイル名の規則: `<name>.<method>.ts`（例: `buckets.get.ts` → `GET /api/s3/buckets`）
- [server/utils/aws-sdk-client.ts](server/utils/aws-sdk-client.ts) に S3Client のシングルトンインスタンスがある
  - エンドポイント: `http://localhost:4566`（Floci エミュレーター）
  - リージョン: `us-east-1`、ダミー認証情報を使用
- [server/utils/s3.ts](server/utils/s3.ts) に S3 操作のユーティリティ関数群（一覧取得、アップロード、削除など）

### 共通型定義（`shared/`）

- [shared/model/s3.ts](shared/model/s3.ts) に `S3Bucket`, `S3Object` 等の型を定義
- フロントエンドからは `#shared` エイリアスでインポートする（`import type { S3Bucket } from '#shared/model/s3'`）

### 外部サービス

- **Floci**: S3 互換のローカルエミュレーター。[compose.yml](compose.yml) で管理し、`data/` ディレクトリにデータを永続化する
- アプリは `localhost:4566` を固定エンドポイントとして使用するため、開発時は必ず Docker で Floci を起動する
