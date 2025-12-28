import { test, expect } from '@playwright/test';

/**
 * TODOリスト機能のテスト
 */
test.describe('TODOリスト', () => {
  // 各テスト前にログインしてTODOページへ移動
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('メールアドレス').fill('test@example.com');
    await page.getByLabel('パスワード').fill('password123');
    await page.getByRole('button', { name: 'ログイン' }).click();
    await expect(page).toHaveURL('/todos');
  });

  test('TODOページが正しく表示される', async ({ page }) => {
    // ヘッダー確認
    await expect(page.getByRole('heading', { name: 'TODOリスト' })).toBeVisible();
    await expect(page.getByText('ようこそ、テストユーザーさん')).toBeVisible();
    await expect(page.getByRole('button', { name: 'ログアウト' })).toBeVisible();

    // 入力フォーム確認
    await expect(page.getByLabel('新しいタスク')).toBeVisible();
    await expect(page.getByRole('button', { name: '追加' })).toBeVisible();

    // フィルターボタン確認
    await expect(page.getByRole('button', { name: /すべて/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /未完了/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /完了済み/ })).toBeVisible();

    // 空メッセージ確認
    await expect(page.getByText('タスクがありません')).toBeVisible();
  });

  test('新しいTODOを追加できる', async ({ page }) => {
    const todoText = '買い物に行く';

    // タスクを入力して追加
    await page.getByLabel('新しいタスク').fill(todoText);
    await page.getByRole('button', { name: '追加' }).click();

    // タスクが追加されたことを確認
    await expect(page.getByText(todoText)).toBeVisible();

    // 入力欄がクリアされたことを確認
    await expect(page.getByLabel('新しいタスク')).toHaveValue('');

    // フィルターのカウントが更新されたことを確認
    await expect(page.getByRole('button', { name: 'すべて (1)' })).toBeVisible();
    await expect(page.getByRole('button', { name: '未完了 (1)' })).toBeVisible();
  });

  test('空のテキストではTODOを追加できない', async ({ page }) => {
    // 空のまま追加ボタンをクリック
    await page.getByRole('button', { name: '追加' }).click();

    // 空メッセージが表示されたままであることを確認
    await expect(page.getByText('タスクがありません')).toBeVisible();
  });

  test('TODOを完了にできる', async ({ page }) => {
    const todoText = 'テストタスク';

    // タスクを追加
    await page.getByLabel('新しいタスク').fill(todoText);
    await page.getByRole('button', { name: '追加' }).click();

    // チェックボックスをクリックして完了にする
    await page.getByRole('checkbox', { name: `${todoText}を完了にする` }).click();

    // 完了状態になったことを確認
    await expect(page.getByRole('checkbox', { name: `${todoText}を未完了にする` })).toBeChecked();

    // フィルターのカウントが更新されたことを確認
    await expect(page.getByRole('button', { name: '未完了 (0)' })).toBeVisible();
    await expect(page.getByRole('button', { name: '完了済み (1)' })).toBeVisible();
  });

  test('TODOを削除できる', async ({ page }) => {
    const todoText = '削除するタスク';

    // タスクを追加
    await page.getByLabel('新しいタスク').fill(todoText);
    await page.getByRole('button', { name: '追加' }).click();

    // 削除ボタンをクリック
    await page.getByRole('button', { name: `${todoText}を削除` }).click();

    // タスクが削除されたことを確認
    await expect(page.getByText(todoText)).not.toBeVisible();
    await expect(page.getByText('タスクがありません')).toBeVisible();
  });

  test('フィルターでTODOを絞り込める', async ({ page }) => {
    // 複数のタスクを追加
    await page.getByLabel('新しいタスク').fill('タスク1');
    await page.getByRole('button', { name: '追加' }).click();
    await page.getByLabel('新しいタスク').fill('タスク2');
    await page.getByRole('button', { name: '追加' }).click();

    // タスク1を完了にする
    await page.getByRole('checkbox', { name: 'タスク1を完了にする' }).click();

    // 未完了フィルターをクリック
    await page.getByRole('button', { name: /未完了/ }).click();
    await expect(page.getByText('タスク1')).not.toBeVisible();
    await expect(page.getByText('タスク2')).toBeVisible();

    // 完了済みフィルターをクリック（「完了済みを削除」ボタンと区別するため完全一致）
    await page.getByRole('button', { name: '完了済み (1)' }).click();
    await expect(page.getByText('タスク1')).toBeVisible();
    await expect(page.getByText('タスク2')).not.toBeVisible();

    // すべてフィルターをクリック
    await page.getByRole('button', { name: /すべて/ }).click();
    await expect(page.getByText('タスク1')).toBeVisible();
    await expect(page.getByText('タスク2')).toBeVisible();
  });

  test('完了済みを一括削除できる', async ({ page }) => {
    // 複数のタスクを追加
    await page.getByLabel('新しいタスク').fill('完了タスク1');
    await page.getByRole('button', { name: '追加' }).click();
    await page.getByLabel('新しいタスク').fill('完了タスク2');
    await page.getByRole('button', { name: '追加' }).click();
    await page.getByLabel('新しいタスク').fill('未完了タスク');
    await page.getByRole('button', { name: '追加' }).click();

    // 2つのタスクを完了にする
    await page.getByRole('checkbox', { name: '完了タスク1を完了にする' }).click();
    await page.getByRole('checkbox', { name: '完了タスク2を完了にする' }).click();

    // 完了済みを削除ボタンをクリック
    await page.getByRole('button', { name: '完了済みを削除 (2)' }).click();

    // 完了済みタスクが削除されたことを確認
    await expect(page.getByText('完了タスク1')).not.toBeVisible();
    await expect(page.getByText('完了タスク2')).not.toBeVisible();
    await expect(page.getByText('未完了タスク')).toBeVisible();
  });

  test('ログアウトするとログインページに戻る', async ({ page }) => {
    // ログアウトボタンをクリック
    await page.getByRole('button', { name: 'ログアウト' }).click();

    // ログインページに遷移したことを確認
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'ログイン' })).toBeVisible();
  });
});

test.describe('認証ガード', () => {
  test('未ログイン状態でTODOページにアクセスするとログインページにリダイレクトされる', async ({
    page,
  }) => {
    // 直接TODOページにアクセス
    await page.goto('/todos');

    // ログインページにリダイレクトされることを確認
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'ログイン' })).toBeVisible();
  });
});
