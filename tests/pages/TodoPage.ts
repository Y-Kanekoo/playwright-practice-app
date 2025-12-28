import { type Page, type Locator, expect } from '@playwright/test';

/**
 * TODOリストページのPage Object
 * TODO操作に関するアクションとアサーションをカプセル化
 */
export class TodoPage {
  // ページオブジェクト
  readonly page: Page;

  // ヘッダー要素
  readonly heading: Locator;
  readonly userInfo: Locator;
  readonly logoutButton: Locator;

  // フォーム要素
  readonly newTodoInput: Locator;
  readonly addButton: Locator;

  // フィルターボタン
  readonly filterAll: Locator;
  readonly filterActive: Locator;
  readonly filterCompleted: Locator;

  // リスト要素
  readonly todoList: Locator;
  readonly emptyMessage: Locator;
  readonly clearCompletedButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // ヘッダー
    this.heading = page.getByRole('heading', { name: 'TODOリスト' });
    this.userInfo = page.locator('.user-info');
    this.logoutButton = page.getByRole('button', { name: 'ログアウト' });

    // フォーム
    this.newTodoInput = page.getByLabel('新しいタスク');
    this.addButton = page.getByRole('button', { name: '追加' });

    // フィルター（正規表現で部分一致）
    this.filterAll = page.getByRole('button', { name: /^すべて/ });
    this.filterActive = page.getByRole('button', { name: /^未完了/ });
    this.filterCompleted = page.locator('.filter-buttons button', { hasText: /^完了済み \(/ });

    // リスト
    this.todoList = page.getByRole('list', { name: 'タスク一覧' });
    this.emptyMessage = page.locator('.empty-message');
    this.clearCompletedButton = page.getByRole('button', { name: /完了済みを削除/ });
  }

  /**
   * TODOページに直接移動（認証が必要）
   */
  async goto() {
    await this.page.goto('/todos');
  }

  // === TODO操作メソッド ===

  /**
   * 新しいTODOを追加
   */
  async addTodo(text: string) {
    await this.newTodoInput.fill(text);
    await this.addButton.click();
  }

  /**
   * 指定したTODOのチェックボックスを取得
   */
  getCheckbox(todoText: string) {
    return this.page.getByRole('checkbox', { name: new RegExp(`${todoText}を(完了|未完了)にする`) });
  }

  /**
   * TODOの完了状態を切り替え
   */
  async toggleTodo(todoText: string) {
    await this.getCheckbox(todoText).click();
  }

  /**
   * TODOを削除
   */
  async deleteTodo(todoText: string) {
    await this.page.getByRole('button', { name: `${todoText}を削除` }).click();
  }

  /**
   * TODOを編集（promptダイアログ対応）
   */
  async editTodo(oldText: string, newText: string) {
    // ダイアログハンドラを設定
    this.page.once('dialog', async (dialog) => {
      await dialog.accept(newText);
    });
    await this.page.getByRole('button', { name: `${oldText}を編集` }).click();
  }

  // === フィルター操作 ===

  /**
   * 「すべて」フィルターを選択
   */
  async showAll() {
    await this.filterAll.click();
  }

  /**
   * 「未完了」フィルターを選択
   */
  async showActive() {
    await this.filterActive.click();
  }

  /**
   * 「完了済み」フィルターを選択
   */
  async showCompleted() {
    await this.filterCompleted.click();
  }

  /**
   * 完了済みを一括削除
   */
  async clearCompleted() {
    await this.clearCompletedButton.click();
  }

  // === その他の操作 ===

  /**
   * ログアウト
   */
  async logout() {
    await this.logoutButton.click();
  }

  /**
   * ユーザー名を取得
   */
  async getUserName(): Promise<string> {
    const text = await this.userInfo.textContent();
    const match = text?.match(/ようこそ、(.+)さん/);
    return match ? match[1] : '';
  }

  // === アサーションメソッド ===

  /**
   * ページが正しく表示されていることを確認
   */
  async expectPageVisible() {
    await expect(this.heading).toBeVisible();
    await expect(this.newTodoInput).toBeVisible();
    await expect(this.addButton).toBeVisible();
    await expect(this.filterAll).toBeVisible();
    await expect(this.filterActive).toBeVisible();
    await expect(this.filterCompleted).toBeVisible();
  }

  /**
   * ユーザー名が表示されていることを確認
   */
  async expectUserName(name: string) {
    await expect(this.page.getByText(`ようこそ、${name}さん`)).toBeVisible();
  }

  /**
   * TODOが表示されていることを確認
   */
  async expectTodoVisible(text: string) {
    await expect(this.page.getByText(text)).toBeVisible();
  }

  /**
   * TODOが表示されていないことを確認
   */
  async expectTodoNotVisible(text: string) {
    await expect(this.page.getByText(text)).not.toBeVisible();
  }

  /**
   * TODOが完了状態であることを確認
   */
  async expectTodoCompleted(text: string) {
    await expect(this.getCheckbox(text)).toBeChecked();
  }

  /**
   * TODOが未完了状態であることを確認
   */
  async expectTodoActive(text: string) {
    await expect(this.getCheckbox(text)).not.toBeChecked();
  }

  /**
   * 空メッセージが表示されていることを確認
   */
  async expectEmptyMessage(message?: string) {
    await expect(this.emptyMessage).toBeVisible();
    if (message) {
      await expect(this.emptyMessage).toHaveText(message);
    }
  }

  /**
   * フィルターのカウントを確認
   */
  async expectFilterCount(filter: 'all' | 'active' | 'completed', count: number) {
    const filterButton = {
      all: this.filterAll,
      active: this.filterActive,
      completed: this.filterCompleted,
    }[filter];
    await expect(filterButton).toHaveText(new RegExp(`\\(${count}\\)`));
  }

  /**
   * 入力欄がクリアされていることを確認
   */
  async expectInputCleared() {
    await expect(this.newTodoInput).toHaveValue('');
  }

  /**
   * ログインページに遷移したことを確認
   */
  async expectNavigatedToLogin() {
    await expect(this.page).toHaveURL('/');
  }
}
