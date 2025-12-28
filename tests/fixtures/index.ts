import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { TodoPage } from '../pages/TodoPage';

/**
 * テストで使用するユーザー情報の型
 */
export interface TestUser {
  email: string;
  password: string;
  name: string;
}

/**
 * テストデータ
 */
export const testUsers = {
  standard: {
    email: 'test@example.com',
    password: 'password123',
    name: 'テストユーザー',
  },
  admin: {
    email: 'admin@example.com',
    password: 'admin123',
    name: '管理者',
  },
} as const;

/**
 * サンプルTODOデータ
 */
export const sampleTodos = {
  shopping: '買い物に行く',
  cleaning: '部屋を掃除する',
  cooking: '夕食を作る',
  exercise: '運動する',
  reading: '本を読む',
} as const;

/**
 * カスタムフィクスチャの型定義
 */
type CustomFixtures = {
  // Page Objects
  loginPage: LoginPage;
  todoPage: TodoPage;

  // 認証済みTODOページ（ログイン済み状態で開始）
  authenticatedTodoPage: TodoPage;

  // テストデータ
  testUser: TestUser;
};

/**
 * カスタムフィクスチャを拡張したテスト
 */
export const test = base.extend<CustomFixtures>({
  // LoginPage フィクスチャ
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  // TodoPage フィクスチャ
  todoPage: async ({ page }, use) => {
    const todoPage = new TodoPage(page);
    await use(todoPage);
  },

  // 認証済みTODOページフィクスチャ
  // テスト前に自動でログインしてTODOページに遷移
  authenticatedTodoPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    const todoPage = new TodoPage(page);

    // ログイン処理
    await loginPage.goto();
    await loginPage.loginAsTestUser();
    await expect(page).toHaveURL('/todos');

    // テストにTodoPageを提供
    await use(todoPage);

    // ティアダウン（必要に応じてクリーンアップ）
    // 例: ログアウト処理など
  },

  // テストユーザーデータ
  testUser: async ({}, use) => {
    await use(testUsers.standard);
  },
});

// expectもエクスポート
export { expect };
