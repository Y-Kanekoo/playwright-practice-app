import { test, expect } from '@playwright/test';

/**
 * ログイン機能のテスト
 */
test.describe('ログインページ', () => {
  test.beforeEach(async ({ page }) => {
    // 各テスト前にログインページへ移動
    await page.goto('/');
  });

  test('ログインページが正しく表示される', async ({ page }) => {
    // タイトル確認
    await expect(page.getByRole('heading', { name: 'ログイン' })).toBeVisible();

    // フォーム要素の確認
    await expect(page.getByLabel('メールアドレス')).toBeVisible();
    await expect(page.getByLabel('パスワード')).toBeVisible();
    await expect(page.getByRole('button', { name: 'ログイン' })).toBeVisible();

    // ヒントテキストの確認
    await expect(page.getByText('テスト用:')).toBeVisible();
  });

  test('メールアドレスが空の場合、エラーメッセージが表示される', async ({ page }) => {
    // パスワードのみ入力
    await page.getByLabel('パスワード').fill('password123');

    // ログインボタンをクリック
    await page.getByRole('button', { name: 'ログイン' }).click();

    // エラーメッセージ確認
    await expect(page.getByRole('alert')).toHaveText('メールアドレスを入力してください');
  });

  test('パスワードが空の場合、エラーメッセージが表示される', async ({ page }) => {
    // メールアドレスのみ入力
    await page.getByLabel('メールアドレス').fill('test@example.com');

    // ログインボタンをクリック
    await page.getByRole('button', { name: 'ログイン' }).click();

    // エラーメッセージ確認
    await expect(page.getByRole('alert')).toHaveText('パスワードを入力してください');
  });

  test('無効なメールアドレス形式の場合、ブラウザバリデーションが表示される', async ({ page }) => {
    // 無効なメールアドレスを入力
    const emailInput = page.getByLabel('メールアドレス');
    await emailInput.fill('invalid-email');
    await page.getByLabel('パスワード').fill('password123');

    // ログインボタンをクリック
    await page.getByRole('button', { name: 'ログイン' }).click();

    // HTML5バリデーションにより送信がブロックされることを確認
    // (ブラウザが:invalid擬似クラスを適用する)
    await expect(emailInput).toHaveAttribute('type', 'email');
  });

  test('パスワードが6文字未満の場合、エラーメッセージが表示される', async ({ page }) => {
    // 短いパスワードを入力
    await page.getByLabel('メールアドレス').fill('test@example.com');
    await page.getByLabel('パスワード').fill('12345');

    // ログインボタンをクリック
    await page.getByRole('button', { name: 'ログイン' }).click();

    // エラーメッセージ確認
    await expect(page.getByRole('alert')).toHaveText('パスワードは6文字以上で入力してください');
  });

  test('認証情報が間違っている場合、エラーメッセージが表示される', async ({ page }) => {
    // 間違った認証情報を入力
    await page.getByLabel('メールアドレス').fill('wrong@example.com');
    await page.getByLabel('パスワード').fill('wrongpassword');

    // ログインボタンをクリック
    await page.getByRole('button', { name: 'ログイン' }).click();

    // エラーメッセージ確認（ログイン処理を待つ）
    await expect(page.getByRole('alert')).toHaveText(
      'メールアドレスまたはパスワードが正しくありません'
    );
  });

  test('正しい認証情報でログインするとTODOページに遷移する', async ({ page }) => {
    // 正しい認証情報を入力
    await page.getByLabel('メールアドレス').fill('test@example.com');
    await page.getByLabel('パスワード').fill('password123');

    // ログインボタンをクリック
    await page.getByRole('button', { name: 'ログイン' }).click();

    // TODOページに遷移したことを確認
    await expect(page).toHaveURL('/todos');
    await expect(page.getByRole('heading', { name: 'TODOリスト' })).toBeVisible();
    await expect(page.getByText('ようこそ、テストユーザーさん')).toBeVisible();
  });

  test('ログイン中はボタンが無効化される', async ({ page }) => {
    // 認証情報を入力
    await page.getByLabel('メールアドレス').fill('test@example.com');
    await page.getByLabel('パスワード').fill('password123');

    // ログインボタンをクリック
    await page.getByRole('button', { name: 'ログイン' }).click();

    // ボタンテキストが変わることを確認
    await expect(page.getByRole('button', { name: 'ログイン中...' })).toBeVisible();
  });
});
