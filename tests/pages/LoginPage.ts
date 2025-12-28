import { type Page, type Locator, expect } from '@playwright/test';

/**
 * ログインページのPage Object
 * ログインに関する操作とアサーションをカプセル化
 */
export class LoginPage {
  // ページオブジェクト
  readonly page: Page;

  // ロケーター
  readonly heading: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly hintText: Locator;

  constructor(page: Page) {
    this.page = page;

    // ロケーターの初期化（アクセシビリティ優先）
    this.heading = page.getByRole('heading', { name: 'ログイン' });
    this.emailInput = page.getByLabel('メールアドレス');
    this.passwordInput = page.getByLabel('パスワード');
    this.submitButton = page.getByRole('button', { name: 'ログイン' });
    this.errorMessage = page.getByRole('alert');
    this.hintText = page.getByText('テスト用:');
  }

  /**
   * ログインページに移動
   */
  async goto() {
    await this.page.goto('/');
  }

  /**
   * メールアドレスを入力
   */
  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  /**
   * パスワードを入力
   */
  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  /**
   * ログインボタンをクリック
   */
  async clickSubmit() {
    await this.submitButton.click();
  }

  /**
   * ログイン処理（メール・パスワード入力→送信）
   */
  async login(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickSubmit();
  }

  /**
   * テスト用アカウントでログイン
   */
  async loginAsTestUser() {
    await this.login('test@example.com', 'password123');
  }

  /**
   * 管理者アカウントでログイン
   */
  async loginAsAdmin() {
    await this.login('admin@example.com', 'admin123');
  }

  // === アサーションメソッド ===

  /**
   * ページが正しく表示されていることを確認
   */
  async expectPageVisible() {
    await expect(this.heading).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
    await expect(this.hintText).toBeVisible();
  }

  /**
   * エラーメッセージが表示されていることを確認
   */
  async expectErrorMessage(message: string) {
    await expect(this.errorMessage).toHaveText(message);
  }

  /**
   * ローディング中の状態を確認
   */
  async expectLoading() {
    await expect(
      this.page.getByRole('button', { name: 'ログイン中...' })
    ).toBeVisible();
  }

  /**
   * TODOページに遷移したことを確認
   */
  async expectNavigatedToTodos() {
    await expect(this.page).toHaveURL('/todos');
  }
}
