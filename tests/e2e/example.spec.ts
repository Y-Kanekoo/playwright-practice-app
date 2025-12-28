import { test, expect } from '@playwright/test';

/**
 * 基本的なページテスト
 */
test.describe('ホームページ', () => {
  test('ページが正しく表示される', async ({ page }) => {
    // ページにアクセス
    await page.goto('/');

    // タイトルを確認
    await expect(page).toHaveTitle(/Vite \+ React \+ TS/);

    // Viteロゴが表示されているか確認
    const viteLogo = page.locator('img[alt="Vite logo"]');
    await expect(viteLogo).toBeVisible();

    // Reactロゴが表示されているか確認
    const reactLogo = page.locator('img[alt="React logo"]');
    await expect(reactLogo).toBeVisible();
  });

  test('カウンターボタンが動作する', async ({ page }) => {
    // ページにアクセス
    await page.goto('/');

    // ボタンを探す
    const button = page.getByRole('button', { name: /count is/i });

    // 初期状態を確認
    await expect(button).toHaveText('count is 0');

    // ボタンをクリック
    await button.click();

    // カウントが増えたことを確認
    await expect(button).toHaveText('count is 1');

    // もう一度クリック
    await button.click();
    await expect(button).toHaveText('count is 2');
  });

  test('リンクが正しく表示される', async ({ page }) => {
    // ページにアクセス
    await page.goto('/');

    // React のドキュメントリンクを確認
    const reactLink = page.getByRole('link', { name: /React/i });
    await expect(reactLink).toBeVisible();
    await expect(reactLink).toHaveAttribute('href', 'https://react.dev');

    // Vite のドキュメントリンクを確認
    const viteLink = page.getByRole('link', { name: /Vite/i });
    await expect(viteLink).toBeVisible();
    await expect(viteLink).toHaveAttribute('href', 'https://vite.dev');
  });
});
