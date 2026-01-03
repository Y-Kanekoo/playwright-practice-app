# Playwright 練習用アプリケーション

[![Playwright Tests](https://github.com/Y-Kanekoo/playwright-practice-app/actions/workflows/playwright.yml/badge.svg)](https://github.com/Y-Kanekoo/playwright-practice-app/actions/workflows/playwright.yml)

Playwright を使ったE2Eテストの学習・練習用アプリケーションです。

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フロントエンド | React 18 + TypeScript |
| ビルドツール | Vite |
| E2Eテスト | Playwright |
| ルーティング | React Router |
| CI/CD | GitHub Actions |
| アクセシビリティ | axe-core |

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
│   │   ├── visual.spec.ts-snapshots/  # ベースライン画像
│   │   ├── isolation.spec.ts
│   │   ├── performance.spec.ts
│   │   └── accessibility.spec.ts
│   ├── reporters/         # カスタムレポーター
│   │   ├── json-summary.ts
│   │   └── markdown.ts
│   ├── notifications/     # 通知システム
│   │   ├── providers/     # 通知プロバイダー
│   │   │   ├── slack.ts
│   │   │   ├── discord.ts
│   │   │   ├── teams.ts
│   │   │   └── webhook.ts
│   │   └── index.ts
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

## 並列実行とテスト分離

Playwrightはデフォルトで並列実行とテスト分離をサポートしています。

### 並列実行設定

```typescript
// playwright.config.ts
export default defineConfig({
  fullyParallel: true,        // テストファイル内も並列
  workers: process.env.CI ? 2 : undefined,  // ワーカー数
});
```

### テスト分離
- 各テストは独立したブラウザコンテキストで実行
- localStorage、Cookie、セッションは共有されない
- テスト間の状態汚染を防止

### 順序制御（必要な場合）

```typescript
// 順序を保証したい場合
test.describe.serial('順序が重要なテスト', () => {
  test('ステップ1', async () => { /* ... */ });
  test('ステップ2', async () => { /* ... */ });
});
```

### コマンド

```bash
# 並列実行（デフォルト）
npx playwright test

# ワーカー数を指定
npx playwright test --workers=4

# 単一ワーカーで実行
npx playwright test --workers=1
```

## カスタムレポート

独自のレポーターでテスト結果を出力します。

### 出力ファイル
- `test-results/test-summary.json` - JSON形式のサマリー
- `test-results/test-report.md` - Markdown形式のレポート

### 含まれる情報
- 実行時間、成功/失敗数
- プロジェクト別結果
- 失敗したテストの詳細
- 遅いテストTop 5

## パフォーマンステスト

Web Vitals やページ読み込み時間を測定します。

### 測定項目
- **LCP** (Largest Contentful Paint): 2.5秒以内
- **FCP** (First Contentful Paint): 1.8秒以内
- **CLS** (Cumulative Layout Shift): 0.1以内
- **TTFB** (Time to First Byte): 500ms以内

### コマンド

```bash
npx playwright test tests/e2e/performance.spec.ts
```

## アクセシビリティテスト

axe-core を使用してWCAG 2.1準拠をチェックします。

### チェック項目
- WCAG 2.1 Level A/AA準拠
- キーボードナビゲーション
- スクリーンリーダー対応（ARIAラベル）
- コントラスト比
- フォーカス表示

### コマンド

```bash
# アクセシビリティテストのみ実行
npx playwright test tests/e2e/accessibility.spec.ts
```

## テスト結果通知

テスト完了時に各種サービスに通知を送信できます。

### 対応サービス

| サービス | 環境変数 | 説明 |
|---------|---------|------|
| Slack | `SLACK_WEBHOOK_URL` | Incoming Webhooks |
| Discord | `DISCORD_WEBHOOK_URL` | Webhooks |
| Microsoft Teams | `TEAMS_WEBHOOK_URL` | Incoming Webhook |
| 汎用Webhook | `WEBHOOK_URL` | JSON形式で送信 |
| Console | - | 開発用 |

### 設定方法

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [
    ['html'],
    ['./tests/notifications', {
      type: 'slack',  // 'slack' | 'discord' | 'teams' | 'webhook' | 'console'
      webhookUrl: process.env.SLACK_WEBHOOK_URL,
      notifyOn: {
        failure: true,   // 失敗時に通知
        success: false,  // 成功時は通知しない
        always: false,   // 常に通知
      },
      mentions: {
        onFailure: ['U12345678'],  // 失敗時にメンション
      },
    }],
  ],
});
```

### 複数の通知先

```typescript
reporter: [
  ['./tests/notifications', { type: 'slack', webhookUrl: '...' }],
  ['./tests/notifications', { type: 'discord', webhookUrl: '...' }],
],
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

### 天気ウィジェット
- 都市名で天気情報を取得（APIモック用）
- 気温・天気・湿度を表示
- ローディング状態・エラー表示

## テストサマリー

| テストファイル | テスト数 | 内容 |
|--------------|---------|------|
| login.spec.ts | 8 | ログイン機能 |
| todo.spec.ts | 9 | TODOリスト機能 |
| api-mock.spec.ts | 7 | APIモック |
| visual.spec.ts | 12 | ビジュアルリグレッション |
| isolation.spec.ts | 16 | テスト分離 |
| performance.spec.ts | 9 | パフォーマンス |
| accessibility.spec.ts | 13 | アクセシビリティ |
| **合計** | **74** | - |

## 学習ロードマップ（全完了）

### Phase 1: 基礎
- [x] プロジェクトセットアップ
- [x] 基本的なテストの書き方
- [x] ロケーター戦略

### Phase 2: 実践
- [x] Page Object Model
- [x] テストフィクスチャ
- [x] 複数ブラウザテスト（Chromium, Firefox, WebKit, Mobile）

### Phase 3: 応用
- [x] APIモック・インターセプション
- [x] CI/CD連携（GitHub Actions）
- [x] ビジュアルリグレッションテスト
- [x] 並列実行とテスト分離

### Phase 4: 発展
- [x] カスタムレポート作成
- [x] パフォーマンステスト
- [x] アクセシビリティテスト
- [x] テスト結果通知（Slack/Discord/Teams/Webhook）
