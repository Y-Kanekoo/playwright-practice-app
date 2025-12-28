# Playwright 練習用アプリケーション

Playwright を使ったE2Eテストの学習・練習用アプリケーションです。

## 技術スタック

- **フロントエンド**: React 18 + TypeScript
- **ビルドツール**: Vite
- **E2Eテスト**: Playwright
- **ルーティング**: React Router
- **CI/CD**: GitHub Actions

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
│   │   ├── TodoItem.tsx
│   │   └── WeatherWidget.tsx
│   ├── pages/            # ページコンポーネント
│   │   ├── LoginPage.tsx
│   │   └── TodoPage.tsx
│   ├── contexts/         # Reactコンテキスト
│   │   └── AuthContext.tsx
│   ├── types/            # 型定義
│   │   ├── index.ts
│   │   └── api.ts
│   ├── services/         # APIサービス
│   │   └── api.ts
│   ├── App.tsx
│   └── main.tsx
│
├── tests/
│   ├── e2e/              # E2Eテスト
│   │   ├── login.spec.ts
│   │   ├── todo.spec.ts
│   │   ├── api-mock.spec.ts
│   │   ├── visual.spec.ts
│   │   └── visual.spec.ts-snapshots/  # ベースライン画像
│   ├── fixtures/         # テストフィクスチャ
│   │   └── index.ts
│   └── pages/            # Page Objects
│       ├── LoginPage.ts
│       └── TodoPage.ts
│
├── .github/
│   └── workflows/
│       └── playwright.yml  # GitHub Actions設定
│
└── playwright.config.ts
```

## CI/CD

GitHub Actionsでテストを自動実行します。

### トリガー
- `main` ブランチへのpush
- `main` ブランチへのPull Request

### ワークフロー内容
1. Node.js 20 のセットアップ
2. 依存関係のインストール
3. Playwrightブラウザのインストール
4. 全テスト実行
5. テストレポートをArtifactとして保存（30日間）

### Artifactの確認方法
1. GitHubリポジトリの「Actions」タブを開く
2. 該当のワークフロー実行を選択
3. 「Artifacts」セクションから `playwright-report` をダウンロード

## ビジュアルリグレッションテスト

スクリーンショット比較でUIの意図しない変更を検出します。

### コマンド

```bash
# ベースライン生成・更新
npx playwright test tests/e2e/visual.spec.ts --update-snapshots

# 比較テスト実行
npx playwright test tests/e2e/visual.spec.ts
```

### テスト対象
- ログインページ（初期表示、エラー状態、フォーカス状態）
- TODOページ（空、アイテムあり、完了状態、フィルター適用）
- コンポーネント単位（フォーム、リスト、ウィジェット）
- レスポンシブ（モバイル、タブレット）

### ベースライン管理
- スナップショットは `tests/e2e/visual.spec.ts-snapshots/` に保存
- OS/ブラウザごとに別ファイル（例: `login-page-chromium-darwin.png`）
- Gitでバージョン管理推奨

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

### 天気ウィジェット
- 都市名で天気情報を取得（APIモック用）
- 気温・天気・湿度を表示
- ローディング状態・エラー表示

## 学習ロードマップ

- [x] プロジェクトセットアップ
- [x] 基本的なテストの書き方
- [x] ロケーター戦略
- [x] Page Object Model
- [x] テストフィクスチャ
- [x] 複数ブラウザテスト（Chromium, Firefox, WebKit, Mobile）
- [x] APIモック・インターセプション
- [x] CI/CD連携（GitHub Actions）
- [x] ビジュアルリグレッションテスト
- [ ] 並列実行とテスト分離
