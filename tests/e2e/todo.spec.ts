import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { TodoPage } from '../pages/TodoPage';

/**
 * TODOリスト機能のテスト
 * Page Object Modelパターンを使用
 */
test.describe('TODOリスト', () => {
  let loginPage: LoginPage;
  let todoPage: TodoPage;

  // 各テスト前にログインしてTODOページへ移動
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    todoPage = new TodoPage(page);

    await loginPage.goto();
    await loginPage.loginAsTestUser();
    await loginPage.expectNavigatedToTodos();
  });

  test('TODOページが正しく表示される', async () => {
    // ページ要素の確認
    await todoPage.expectPageVisible();
    await todoPage.expectUserName('テストユーザー');
    await expect(todoPage.logoutButton).toBeVisible();

    // 空メッセージ確認
    await todoPage.expectEmptyMessage('タスクがありません。新しいタスクを追加してください。');
  });

  test('新しいTODOを追加できる', async () => {
    const todoText = '買い物に行く';

    // タスクを追加
    await todoPage.addTodo(todoText);

    // タスクが追加されたことを確認
    await todoPage.expectTodoVisible(todoText);
    await todoPage.expectInputCleared();
    await todoPage.expectFilterCount('all', 1);
    await todoPage.expectFilterCount('active', 1);
  });

  test('空のテキストではTODOを追加できない', async () => {
    // 空のまま追加ボタンをクリック
    await todoPage.addButton.click();

    // 空メッセージが表示されたままであることを確認
    await todoPage.expectEmptyMessage();
  });

  test('TODOを完了にできる', async () => {
    const todoText = 'テストタスク';

    // タスクを追加
    await todoPage.addTodo(todoText);

    // 完了にする
    await todoPage.toggleTodo(todoText);

    // 完了状態の確認
    await todoPage.expectTodoCompleted(todoText);
    await todoPage.expectFilterCount('active', 0);
    await todoPage.expectFilterCount('completed', 1);
  });

  test('TODOを削除できる', async () => {
    const todoText = '削除するタスク';

    // タスクを追加
    await todoPage.addTodo(todoText);

    // 削除
    await todoPage.deleteTodo(todoText);

    // タスクが削除されたことを確認
    await todoPage.expectTodoNotVisible(todoText);
    await todoPage.expectEmptyMessage();
  });

  test('フィルターでTODOを絞り込める', async () => {
    // 複数のタスクを追加
    await todoPage.addTodo('タスク1');
    await todoPage.addTodo('タスク2');

    // タスク1を完了にする
    await todoPage.toggleTodo('タスク1');

    // 未完了フィルター
    await todoPage.showActive();
    await todoPage.expectTodoNotVisible('タスク1');
    await todoPage.expectTodoVisible('タスク2');

    // 完了済みフィルター
    await todoPage.showCompleted();
    await todoPage.expectTodoVisible('タスク1');
    await todoPage.expectTodoNotVisible('タスク2');

    // すべてフィルター
    await todoPage.showAll();
    await todoPage.expectTodoVisible('タスク1');
    await todoPage.expectTodoVisible('タスク2');
  });

  test('完了済みを一括削除できる', async () => {
    // 複数のタスクを追加
    await todoPage.addTodo('完了タスク1');
    await todoPage.addTodo('完了タスク2');
    await todoPage.addTodo('未完了タスク');

    // 2つのタスクを完了にする
    await todoPage.toggleTodo('完了タスク1');
    await todoPage.toggleTodo('完了タスク2');

    // 完了済みを削除
    await todoPage.clearCompleted();

    // 完了済みタスクが削除されたことを確認
    await todoPage.expectTodoNotVisible('完了タスク1');
    await todoPage.expectTodoNotVisible('完了タスク2');
    await todoPage.expectTodoVisible('未完了タスク');
  });

  test('ログアウトするとログインページに戻る', async () => {
    // ログアウト
    await todoPage.logout();

    // ログインページに遷移したことを確認
    await todoPage.expectNavigatedToLogin();
    await loginPage.expectPageVisible();
  });
});

test.describe('認証ガード', () => {
  test('未ログイン状態でTODOページにアクセスするとログインページにリダイレクトされる', async ({
    page,
  }) => {
    const todoPage = new TodoPage(page);
    const loginPage = new LoginPage(page);

    // 直接TODOページにアクセス
    await todoPage.goto();

    // ログインページにリダイレクトされることを確認
    await todoPage.expectNavigatedToLogin();
    await loginPage.expectPageVisible();
  });
});
