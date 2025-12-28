import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright テスト設定ファイル
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // テストディレクトリ
  testDir: './tests',

  // 並列実行の設定
  fullyParallel: true,

  // CI環境でのみビルドエラーで失敗させる
  forbidOnly: !!process.env.CI,

  // CIでは再試行しない
  retries: process.env.CI ? 2 : 0,

  // 並列ワーカー数
  workers: process.env.CI ? 1 : undefined,

  // レポーター設定
  reporter: 'html',

  // 全てのテストで共通の設定
  use: {
    // ベースURL
    baseURL: 'http://localhost:5173',

    // 失敗時のトレース記録
    trace: 'on-first-retry',

    // スクリーンショット設定
    screenshot: 'only-on-failure',

    // ビデオ設定
    video: 'retain-on-failure',
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
