import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright テスト設定ファイル
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // テストディレクトリ
  testDir: './tests',

  // 並列実行の設定
  // true: テストファイル内のテストも並列実行
  // false: ファイル単位でのみ並列実行
  fullyParallel: true,

  // CI環境でのみ .only を禁止
  forbidOnly: !!process.env.CI,

  // リトライ回数（CI環境では2回再試行）
  retries: process.env.CI ? 2 : 0,

  // 並列ワーカー数
  // ローカル: undefined（自動検出、通常はCPUコア数の半分）
  // CI: 2（リソース制限のため）
  workers: process.env.CI ? 2 : undefined,

  // テストタイムアウト（ミリ秒）
  timeout: 30000,

  // expect のタイムアウト
  expect: {
    timeout: 5000,
  },

  // レポーター設定
  // CI環境: GitHub Actions用 + HTML
  // ローカル: HTML のみ
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['html', { open: 'on-failure' }]],

  // 全てのテストで共通の設定
  use: {
    // ベースURL
    baseURL: 'http://localhost:5173',

    // 失敗時のトレース記録（デバッグに有用）
    trace: 'on-first-retry',

    // スクリーンショット設定
    screenshot: 'only-on-failure',

    // ビデオ設定（失敗時のみ保存）
    video: 'retain-on-failure',

    // アクションのタイムアウト
    actionTimeout: 10000,

    // ナビゲーションのタイムアウト
    navigationTimeout: 15000,
  },

  // テストプロジェクト（ブラウザ別）
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // モバイルブラウザ
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // 開発サーバー設定
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
