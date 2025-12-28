import { test, expect } from '../fixtures';

/**
 * ビジュアルリグレッションテスト
 * Playwrightの toHaveScreenshot() を使用してUIの見た目を検証
 *
 * 初回実行時:
 *   ベースラインスクリーンショットが自動生成される
 *
 * 2回目以降:
 *   ベースラインと比較し、差分があればテスト失敗
 *
 * ベースライン更新:
 *   npx playwright test --update-snapshots
 */

test.describe('ビジュアルリグレッション', () => {
  test.describe('ログインページ', () => {
    test('初期表示', async ({ loginPage, page }) => {
      await loginPage.goto();

      // ページ全体のスクリーンショット
      await expect(page).toHaveScreenshot('login-page.png');
    });

    test('エラー表示状態', async ({ loginPage, page }) => {
      await loginPage.goto();

      // 無効なログインを試行
      await loginPage.login('invalid@example.com', 'wrongpassword');

      // エラーメッセージが表示された状態
      await expect(page).toHaveScreenshot('login-error.png');
    });

    test('入力フォーカス状態', async ({ loginPage, page }) => {
      await loginPage.goto();

      // メールアドレス入力欄にフォーカス
      await page.getByLabel('メールアドレス').focus();

      // フォーカス状態のスクリーンショット
      await expect(page).toHaveScreenshot('login-focus.png');
    });
  });

  test.describe('TODOページ', () => {
    test('初期表示（空の状態）', async ({ authenticatedTodoPage, page }) => {
      // TODOがない状態
      await expect(page).toHaveScreenshot('todo-empty.png');
    });

    test('TODOがある状態', async ({ authenticatedTodoPage, page }) => {
      // TODOを追加
      await authenticatedTodoPage.addTodo('テストタスク1');
      await authenticatedTodoPage.addTodo('テストタスク2');
      await authenticatedTodoPage.addTodo('テストタスク3');

      await expect(page).toHaveScreenshot('todo-with-items.png');
    });

    test('完了状態のTODO', async ({ authenticatedTodoPage, page }) => {
      await authenticatedTodoPage.addTodo('完了するタスク');
      await authenticatedTodoPage.addTodo('未完了のタスク');

      // 1つ目を完了にする
      await authenticatedTodoPage.toggleTodo('完了するタスク');

      await expect(page).toHaveScreenshot('todo-completed.png');
    });

    test('フィルター適用状態', async ({ authenticatedTodoPage, page }) => {
      await authenticatedTodoPage.addTodo('タスクA');
      await authenticatedTodoPage.addTodo('タスクB');
      await authenticatedTodoPage.toggleTodo('タスクA');

      // 未完了フィルター
      await authenticatedTodoPage.showActive();

      await expect(page).toHaveScreenshot('todo-filter-active.png');
    });
  });

  test.describe('コンポーネント単位', () => {
    test('ログインフォームのみ', async ({ loginPage, page }) => {
      await loginPage.goto();

      // 特定の要素のみスクリーンショット
      const form = page.locator('.login-form');
      await expect(form).toHaveScreenshot('component-login-form.png');
    });

    test('TODOリストのみ', async ({ authenticatedTodoPage, page }) => {
      await authenticatedTodoPage.addTodo('リストアイテム1');
      await authenticatedTodoPage.addTodo('リストアイテム2');

      const todoList = page.locator('.todo-list');
      await expect(todoList).toHaveScreenshot('component-todo-list.png');
    });

    test('天気ウィジェットのみ', async ({ authenticatedTodoPage, page }) => {
      const weatherWidget = page.getByTestId('weather-widget');
      await expect(weatherWidget).toHaveScreenshot('component-weather-widget.png');
    });
  });

  test.describe('レスポンシブ', () => {
    test('モバイルビューポート', async ({ loginPage, page }) => {
      await loginPage.goto();

      // モバイルサイズに変更
      await page.setViewportSize({ width: 375, height: 667 });

      await expect(page).toHaveScreenshot('login-mobile.png');
    });

    test('タブレットビューポート', async ({ loginPage, page }) => {
      await loginPage.goto();

      // タブレットサイズに変更
      await page.setViewportSize({ width: 768, height: 1024 });

      await expect(page).toHaveScreenshot('login-tablet.png');
    });
  });
});

/*
 * ビジュアルリグレッションテストのベストプラクティス
 *
 * 1. 安定した状態でスクリーンショットを取る
 *    - アニメーション完了後
 *    - データ読み込み完了後
 *    - await page.waitForLoadState('networkidle')
 *
 * 2. 動的コンテンツの扱い
 *    - 日付、時刻はモック化
 *    - ランダム要素は固定値に
 *    - mask オプションで特定要素を除外
 *
 * 3. スクリーンショットオプション
 *    await expect(page).toHaveScreenshot('name.png', {
 *      maxDiffPixels: 100,      // 許容する差分ピクセル数
 *      maxDiffPixelRatio: 0.1,  // 許容する差分割合
 *      threshold: 0.2,          // ピクセル比較の閾値
 *      mask: [locator],         // マスクする要素
 *      fullPage: true,          // ページ全体
 *    });
 *
 * 4. ベースライン管理
 *    - Gitでバージョン管理
 *    - CI環境とローカルで同じ結果になるよう注意
 *    - OS/ブラウザごとに別ベースラインが生成される
 */
