import { test, expect, sampleTodos } from '../fixtures';

/**
 * TODOリスト機能のテスト
 * authenticatedTodoPageフィクスチャを使用（自動でログイン済み）
 */
test.describe('TODOリスト', () => {
  // authenticatedTodoPageを使用すると、テスト開始時に既にログイン済み
  test('TODOページが正しく表示される', async ({ authenticatedTodoPage }) => {
    await authenticatedTodoPage.expectPageVisible();
    await authenticatedTodoPage.expectUserName('テストユーザー');
    await expect(authenticatedTodoPage.logoutButton).toBeVisible();
    await authenticatedTodoPage.expectEmptyMessage(
      'タスクがありません。新しいタスクを追加してください。'
    );
  });

  test('新しいTODOを追加できる', async ({ authenticatedTodoPage }) => {
    // sampleTodosフィクスチャからテストデータを使用
    await authenticatedTodoPage.addTodo(sampleTodos.shopping);

    await authenticatedTodoPage.expectTodoVisible(sampleTodos.shopping);
    await authenticatedTodoPage.expectInputCleared();
    await authenticatedTodoPage.expectFilterCount('all', 1);
    await authenticatedTodoPage.expectFilterCount('active', 1);
  });

  test('空のテキストではTODOを追加できない', async ({ authenticatedTodoPage }) => {
    await authenticatedTodoPage.addButton.click();
    await authenticatedTodoPage.expectEmptyMessage();
  });

  test('TODOを完了にできる', async ({ authenticatedTodoPage }) => {
    const todoText = sampleTodos.cleaning;

    await authenticatedTodoPage.addTodo(todoText);
    await authenticatedTodoPage.toggleTodo(todoText);

    await authenticatedTodoPage.expectTodoCompleted(todoText);
    await authenticatedTodoPage.expectFilterCount('active', 0);
    await authenticatedTodoPage.expectFilterCount('completed', 1);
  });

  test('TODOを削除できる', async ({ authenticatedTodoPage }) => {
    const todoText = sampleTodos.cooking;

    await authenticatedTodoPage.addTodo(todoText);
    await authenticatedTodoPage.deleteTodo(todoText);

    await authenticatedTodoPage.expectTodoNotVisible(todoText);
    await authenticatedTodoPage.expectEmptyMessage();
  });

  test('フィルターでTODOを絞り込める', async ({ authenticatedTodoPage }) => {
    // 複数のタスクを追加
    await authenticatedTodoPage.addTodo('タスク1');
    await authenticatedTodoPage.addTodo('タスク2');
    await authenticatedTodoPage.toggleTodo('タスク1');

    // 未完了フィルター
    await authenticatedTodoPage.showActive();
    await authenticatedTodoPage.expectTodoNotVisible('タスク1');
    await authenticatedTodoPage.expectTodoVisible('タスク2');

    // 完了済みフィルター
    await authenticatedTodoPage.showCompleted();
    await authenticatedTodoPage.expectTodoVisible('タスク1');
    await authenticatedTodoPage.expectTodoNotVisible('タスク2');

    // すべてフィルター
    await authenticatedTodoPage.showAll();
    await authenticatedTodoPage.expectTodoVisible('タスク1');
    await authenticatedTodoPage.expectTodoVisible('タスク2');
  });

  test('完了済みを一括削除できる', async ({ authenticatedTodoPage }) => {
    // 複数のタスクを追加
    await authenticatedTodoPage.addTodo('完了タスク1');
    await authenticatedTodoPage.addTodo('完了タスク2');
    await authenticatedTodoPage.addTodo('未完了タスク');

    // 2つのタスクを完了にする
    await authenticatedTodoPage.toggleTodo('完了タスク1');
    await authenticatedTodoPage.toggleTodo('完了タスク2');
    await authenticatedTodoPage.clearCompleted();

    await authenticatedTodoPage.expectTodoNotVisible('完了タスク1');
    await authenticatedTodoPage.expectTodoNotVisible('完了タスク2');
    await authenticatedTodoPage.expectTodoVisible('未完了タスク');
  });

  test('ログアウトするとログインページに戻る', async ({
    authenticatedTodoPage,
    loginPage,
  }) => {
    await authenticatedTodoPage.logout();
    await authenticatedTodoPage.expectNavigatedToLogin();
    await loginPage.expectPageVisible();
  });
});

test.describe('認証ガード', () => {
  test('未ログイン状態でTODOページにアクセスするとログインページにリダイレクトされる', async ({
    todoPage,
    loginPage,
  }) => {
    // todoPageフィクスチャは認証なし
    await todoPage.goto();
    await todoPage.expectNavigatedToLogin();
    await loginPage.expectPageVisible();
  });
});
