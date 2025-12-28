import { test, expect } from '../fixtures';

/**
 * ログイン機能のテスト
 * カスタムフィクスチャを使用
 */
test.describe('ログインページ', () => {
  // loginPageフィクスチャを使用（自動で初期化される）
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('ログインページが正しく表示される', async ({ loginPage }) => {
    await loginPage.expectPageVisible();
  });

  test('メールアドレスが空の場合、エラーメッセージが表示される', async ({ loginPage }) => {
    await loginPage.fillPassword('password123');
    await loginPage.clickSubmit();
    await loginPage.expectErrorMessage('メールアドレスを入力してください');
  });

  test('パスワードが空の場合、エラーメッセージが表示される', async ({ loginPage }) => {
    await loginPage.fillEmail('test@example.com');
    await loginPage.clickSubmit();
    await loginPage.expectErrorMessage('パスワードを入力してください');
  });

  test('無効なメールアドレス形式の場合、ブラウザバリデーションが表示される', async ({
    loginPage,
  }) => {
    await loginPage.fillEmail('invalid-email');
    await loginPage.fillPassword('password123');
    await loginPage.clickSubmit();
    await expect(loginPage.emailInput).toHaveAttribute('type', 'email');
  });

  test('パスワードが6文字未満の場合、エラーメッセージが表示される', async ({ loginPage }) => {
    await loginPage.login('test@example.com', '12345');
    await loginPage.expectErrorMessage('パスワードは6文字以上で入力してください');
  });

  test('認証情報が間違っている場合、エラーメッセージが表示される', async ({ loginPage }) => {
    await loginPage.login('wrong@example.com', 'wrongpassword');
    await loginPage.expectErrorMessage('メールアドレスまたはパスワードが正しくありません');
  });

  test('正しい認証情報でログインするとTODOページに遷移する', async ({
    loginPage,
    testUser,
    page,
  }) => {
    // testUserフィクスチャからユーザー情報を取得
    await loginPage.login(testUser.email, testUser.password);
    await loginPage.expectNavigatedToTodos();
    await expect(page.getByRole('heading', { name: 'TODOリスト' })).toBeVisible();
    await expect(page.getByText(`ようこそ、${testUser.name}さん`)).toBeVisible();
  });

  test('ログイン中はボタンが無効化される', async ({ loginPage }) => {
    await loginPage.loginAsTestUser();
    await loginPage.expectLoading();
  });
});
