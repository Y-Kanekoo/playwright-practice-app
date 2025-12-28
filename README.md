# Playwright 練習用アプリケーション

Playwright を使ったE2Eテストの学習・練習用アプリケーションです。

## 技術スタック

- **フロントエンド**: React 18 + TypeScript
- **ビルドツール**: Vite
- **E2Eテスト**: Playwright
- **ルーティング**: React Router

## セットアップ

```bash
# 依存関係のインストール
npm install

# Playwrightブラウザのインストール
npx playwright install
```

## 開発

```bash
# 開発サーバー起動
npm run dev
```

http://localhost:5173 でアプリにアクセスできます。

### テストアカウント

| メールアドレス | パスワード | ユーザー名 |
|--------------|-----------|----------|
| test@example.com | password123 | テストユーザー |
| admin@example.com | admin123 | 管理者 |

## テスト

```bash
# 全テスト実行
npx playwright test

# Chromiumのみ
npx playwright test --project=chromium

# UIモードで実行
npx playwright test --ui

# ブラウザ表示あり
npx playwright test --headed

# テストレポート表示
npx playwright show-report
```

## プロジェクト構造

```
playwright-practice-app/
├── src/
│   ├── components/       # UIコンポーネント
│   │   ├── LoginForm.tsx
│   │   ├── TodoList.tsx
│   │   └── TodoItem.tsx
│   ├── pages/            # ページコンポーネント
│   │   ├── LoginPage.tsx
│   │   └── TodoPage.tsx
│   ├── contexts/         # Reactコンテキスト
│   │   └── AuthContext.tsx
│   ├── types/            # 型定義
│   │   └── index.ts
│   ├── App.tsx
│   └── main.tsx
│
├── tests/
│   ├── e2e/              # E2Eテスト
│   │   ├── login.spec.ts
│   │   └── todo.spec.ts
│   └── pages/            # Page Objects
│       ├── LoginPage.ts
│       └── TodoPage.ts
│
└── playwright.config.ts
```

## 機能

### ログインページ (`/`)
- メールアドレス・パスワード入力
- バリデーション（空欄、形式、文字数）
- モック認証

### TODOリストページ (`/todos`)
- タスクの追加・編集・削除
- 完了/未完了の切り替え
- フィルタリング（すべて/未完了/完了済み）
- 完了済みの一括削除
- ログアウト

## 学習ロードマップ

- [x] プロジェクトセットアップ
- [x] 基本的なテストの書き方
- [x] ロケーター戦略
- [x] Page Object Model
- [ ] テストフィクスチャ
- [ ] 複数ブラウザテスト
- [ ] APIモック・インターセプション
- [ ] ビジュアルリグレッションテスト
