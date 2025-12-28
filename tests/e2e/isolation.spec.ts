import { test, expect } from '../fixtures';

/**
 * テスト分離（Test Isolation）のデモ
 *
 * Playwrightでは各テストは独立したブラウザコンテキストで実行される
 * これにより、テスト間の状態汚染を防ぐ
 */

test.describe('テスト分離の基本', () => {
  test.describe('独立したブラウザコンテキスト', () => {
    test('テスト1: TODOを追加してもテスト2には影響しない', async ({
      authenticatedTodoPage,
      page,
    }) => {
      // このテストでTODOを追加
      await authenticatedTodoPage.addTodo('テスト1で追加したTODO');
      await expect(page.getByText('テスト1で追加したTODO')).toBeVisible();
    });

    test('テスト2: 新しいコンテキストなのでTODOは空', async ({
      authenticatedTodoPage,
      page,
    }) => {
      // テスト1で追加したTODOは見えない（別コンテキスト）
      await expect(page.getByText('テスト1で追加したTODO')).not.toBeVisible();

      // 空のリストメッセージが表示される
      await expect(page.getByText('タスクがありません')).toBeVisible();
    });
  });

  test.describe('ストレージの分離', () => {
    test('テスト1: localStorageにデータを保存', async ({ page }) => {
      await page.goto('/');

      // localStorageにデータを保存
      await page.evaluate(() => {
        localStorage.setItem('testData', 'value-from-test1');
      });

      const value = await page.evaluate(() => localStorage.getItem('testData'));
      expect(value).toBe('value-from-test1');
    });

    test('テスト2: 別コンテキストなのでlocalStorageは空', async ({ page }) => {
      await page.goto('/');

      // テスト1で保存したデータは見えない
      const value = await page.evaluate(() => localStorage.getItem('testData'));
      expect(value).toBeNull();
    });
  });

  test.describe('Cookieの分離', () => {
    test('テスト1: Cookieを設定', async ({ page, context }) => {
      await page.goto('/');

      // Cookieを設定
      await context.addCookies([
        {
          name: 'testCookie',
          value: 'cookie-from-test1',
          domain: 'localhost',
          path: '/',
        },
      ]);

      const cookies = await context.cookies();
      expect(cookies.find((c) => c.name === 'testCookie')?.value).toBe(
        'cookie-from-test1'
      );
    });

    test('テスト2: 別コンテキストなのでCookieは空', async ({ context }) => {
      const cookies = await context.cookies();
      expect(cookies.find((c) => c.name === 'testCookie')).toBeUndefined();
    });
  });
});

test.describe('並列実行のデモ', () => {
  // これらのテストは並列で実行される
  // 各テストは独立しているため、順序に依存しない

  test('並列テスト1', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.expectPageVisible();
  });

  test('並列テスト2', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.expectPageVisible();
  });

  test('並列テスト3', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.expectPageVisible();
  });

  test('並列テスト4', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.expectPageVisible();
  });
});

test.describe('順序付きテスト', () => {
  // test.describe.serial を使うと順序を保証できる
  // ただし、テスト分離は維持される

  test.describe.serial('順序が重要な場合', () => {
    test('ステップ1: 最初に実行', async ({ loginPage }) => {
      await loginPage.goto();
      await expect(loginPage.page).toHaveURL('/');
    });

    test('ステップ2: ステップ1の後に実行', async ({ loginPage }) => {
      await loginPage.goto();
      await loginPage.loginAsTestUser();
    });

    test('ステップ3: ステップ2の後に実行', async ({ authenticatedTodoPage }) => {
      await authenticatedTodoPage.addTodo('順序テスト');
    });
  });
});

test.describe('フックによるセットアップ', () => {
  // beforeEach: 各テスト前に実行
  test.beforeEach(async ({ page }) => {
    // 共通のセットアップ
    await page.goto('/');
  });

  test('フック後のテスト1', async ({ page }) => {
    // beforeEach で / に遷移済み
    await expect(page).toHaveURL('/');
  });

  test('フック後のテスト2', async ({ page }) => {
    // 各テストで新しいコンテキストが作られるが、
    // beforeEach は毎回実行される
    await expect(page).toHaveURL('/');
  });
});

test.describe('ワーカー間での状態共有', () => {
  // 注意: ワーカー間では状態を共有できない
  // 共有が必要な場合は外部ストレージ（DB、ファイル）を使う

  test('ワーカー情報の確認', async ({ page }, testInfo) => {
    await page.goto('/');

    // テスト情報を確認
    console.log(`テスト名: ${testInfo.title}`);
    console.log(`並列インデックス: ${testInfo.parallelIndex}`);
    console.log(`ワーカーインデックス: ${testInfo.workerIndex}`);
    console.log(`リトライ回数: ${testInfo.retry}`);

    expect(testInfo.parallelIndex).toBeGreaterThanOrEqual(0);
  });
});

/*
 * テスト分離のベストプラクティス
 *
 * 1. 各テストは独立させる
 *    - 他のテストの結果に依存しない
 *    - 実行順序に依存しない
 *
 * 2. 共有状態を避ける
 *    - グローバル変数を使わない
 *    - ファイルやDBへの書き込みは注意
 *
 * 3. セットアップはフィクスチャで
 *    - beforeEach/afterEach より fixtures を推奨
 *    - 再利用性が高い
 *
 * 4. 順序が必要な場合
 *    - test.describe.serial() を使用
 *    - ただし並列実行の利点が失われる
 *
 * 5. 並列実行の制御
 *    - fullyParallel: true  → 全テスト並列
 *    - fullyParallel: false → ファイル単位で並列
 *    - test.describe.configure({ mode: 'serial' })
 */
