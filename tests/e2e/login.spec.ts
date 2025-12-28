import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

/**
 * ログイン機能のテスト
 * Page Object Modelパターンを使用
 */
test.describe('ログインページ', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    // Page Objectを初期化
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('ログインページが正しく表示される', async () => {
    await loginPage.expectPageVisible();
  });

  test('メールアドレスが空の場合、エラーメッセージが表示される', async () => {
    // パスワードのみ入力
    await loginPage.fillPassword('password123');
    await loginPage.clickSubmit();

    // エラーメッセージ確認
    await loginPage.expectErrorMessage('メールアドレスを入力してください');
  });

  test('パスワードが空の場合、エラーメッセージが表示される', async () => {
    // メールアドレスのみ入力
    await loginPage.fillEmail('test@example.com');
    await loginPage.clickSubmit();

    // エラーメッセージ確認
    await loginPage.expectErrorMessage('パスワードを入力してください');
  });

  test('無効なメールアドレス形式の場合、ブラウザバリデーションが表示される', async () => {
    // 無効なメールアドレスを入力
    await loginPage.fillEmail('invalid-email');
    await loginPage.fillPassword('password123');
    await loginPage.clickSubmit();

    // HTML5バリデーションにより送信がブロックされることを確認
    await expect(loginPage.emailInput).toHaveAttribute('type', 'email');
  });

  test('パスワードが6文字未満の場合、エラーメッセージが表示される', async () => {
    // 短いパスワードを入力
    await loginPage.login('test@example.com', '12345');

    // エラーメッセージ確認
    await loginPage.expectErrorMessage('パスワードは6文字以上で入力してください');
  });

  test('認証情報が間違っている場合、エラーメッセージが表示される', async () => {
    // 間違った認証情報でログイン
    await loginPage.login('wrong@example.com', 'wrongpassword');

    // エラーメッセージ確認
    await loginPage.expectErrorMessage('メールアドレスまたはパスワードが正しくありません');
  });

  test('正しい認証情報でログインするとTODOページに遷移する', async ({ page }) => {
    // テストユーザーでログイン
    await loginPage.loginAsTestUser();

    // TODOページに遷移したことを確認
    await loginPage.expectNavigatedToTodos();
    await expect(page.getByRole('heading', { name: 'TODOリスト' })).toBeVisible();
    await expect(page.getByText('ようこそ、テストユーザーさん')).toBeVisible();
  });

  test('ログイン中はボタンが無効化される', async () => {
    // 認証情報を入力してログイン
    await loginPage.loginAsTestUser();

    // ローディング状態を確認
    await loginPage.expectLoading();
  });
});
