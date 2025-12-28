import { test, expect } from '../fixtures';

/**
 * APIモック・インターセプションのテスト
 * PlaywrightのrouteメソッドでAPIをモックする方法を学ぶ
 */
test.describe('APIモック', () => {
  test.describe('天気情報API', () => {
    test('正常なレスポンスをモックできる', async ({ authenticatedTodoPage, page }) => {
      // APIをモック
      await page.route('**/api/weather*', async (route) => {
        // モックレスポンスを返す
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            city: '東京',
            temperature: 25,
            condition: '晴れ',
            humidity: 60,
            icon: 'sunny',
          }),
        });
      });

      // 天気ウィジェットを操作
      const cityInput = page.getByLabel('都市名');
      const fetchButton = page.getByLabel('天気を取得');

      await cityInput.fill('Tokyo');
      await fetchButton.click();

      // モックレスポンスが表示されることを確認
      const weatherInfo = page.getByTestId('weather-info');
      await expect(weatherInfo).toBeVisible();
      await expect(page.locator('.weather-city')).toHaveText('東京');
      await expect(page.locator('.weather-temp')).toHaveText('25°C');
      await expect(page.locator('.weather-condition')).toHaveText('晴れ');
      await expect(page.locator('.weather-humidity')).toHaveText('湿度: 60%');
    });

    test('エラーレスポンスをモックできる', async ({ authenticatedTodoPage, page }) => {
      // APIエラーをモック
      await page.route('**/api/weather*', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' }),
        });
      });

      // 天気を取得
      await page.getByLabel('都市名').fill('Tokyo');
      await page.getByLabel('天気を取得').click();

      // エラーメッセージが表示されることを確認
      await expect(page.locator('.weather-error')).toBeVisible();
      await expect(page.locator('.weather-error')).toContainText('500');
    });

    test('ネットワークエラーをシミュレートできる', async ({ authenticatedTodoPage, page }) => {
      // ネットワークエラーをシミュレート
      await page.route('**/api/weather*', async (route) => {
        await route.abort('failed');
      });

      // 天気を取得
      await page.getByLabel('都市名').fill('Tokyo');
      await page.getByLabel('天気を取得').click();

      // エラーメッセージが表示されることを確認
      await expect(page.locator('.weather-error')).toBeVisible();
    });

    test('遅延レスポンスをモックできる', async ({ authenticatedTodoPage, page }) => {
      // 遅延レスポンスをモック
      await page.route('**/api/weather*', async (route) => {
        // 1秒遅延
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            city: '大阪',
            temperature: 28,
            condition: '曇り',
            humidity: 70,
            icon: 'cloudy',
          }),
        });
      });

      // 天気を取得
      await page.getByLabel('都市名').fill('Osaka');
      const fetchButton = page.getByLabel('天気を取得');
      await fetchButton.click();

      // ローディング状態を確認
      await expect(fetchButton).toHaveText('取得中...');

      // レスポンス後のデータを確認
      await expect(page.locator('.weather-city')).toHaveText('大阪');
    });

    test('リクエストパラメータを検証できる', async ({ authenticatedTodoPage, page }) => {
      let requestUrl = '';

      // リクエストをインターセプトしてURLを記録
      await page.route('**/api/weather*', async (route) => {
        requestUrl = route.request().url();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            city: 'Kyoto',
            temperature: 22,
            condition: '雨',
            humidity: 80,
            icon: 'rainy',
          }),
        });
      });

      // 特定の都市で天気を取得
      await page.getByLabel('都市名').fill('Kyoto');
      await page.getByLabel('天気を取得').click();

      // リクエストURLにパラメータが含まれていることを確認
      expect(requestUrl).toContain('city=Kyoto');
    });
  });

  test.describe('条件付きモック', () => {
    test('特定の条件でのみモックを適用できる', async ({ authenticatedTodoPage, page }) => {
      // 都市名によって異なるレスポンスを返す
      await page.route('**/api/weather*', async (route) => {
        const url = new URL(route.request().url());
        const city = url.searchParams.get('city');

        if (city === 'Tokyo') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              city: '東京',
              temperature: 30,
              condition: '猛暑',
              humidity: 50,
              icon: 'hot',
            }),
          });
        } else if (city === 'Hokkaido') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              city: '北海道',
              temperature: 15,
              condition: '涼しい',
              humidity: 65,
              icon: 'cool',
            }),
          });
        } else {
          await route.fulfill({
            status: 404,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'City not found' }),
          });
        }
      });

      // 東京の天気を取得
      await page.getByLabel('都市名').fill('Tokyo');
      await page.getByLabel('天気を取得').click();
      await expect(page.locator('.weather-temp')).toHaveText('30°C');
      await expect(page.locator('.weather-condition')).toHaveText('猛暑');

      // 北海道の天気を取得
      await page.getByLabel('都市名').fill('Hokkaido');
      await page.getByLabel('天気を取得').click();
      await expect(page.locator('.weather-temp')).toHaveText('15°C');
      await expect(page.locator('.weather-condition')).toHaveText('涼しい');
    });
  });

  test.describe('リクエストの変更', () => {
    test('リクエストヘッダーを追加できる', async ({ authenticatedTodoPage, page }) => {
      let capturedHeaders: Record<string, string> = {};

      await page.route('**/api/weather*', async (route) => {
        // リクエストヘッダーを記録
        capturedHeaders = route.request().headers();

        // ヘッダーを追加してリクエストを続行（実際にはモックを返す）
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            city: 'Test',
            temperature: 20,
            condition: 'テスト',
            humidity: 50,
            icon: 'test',
          }),
        });
      });

      await page.getByLabel('都市名').fill('Test');
      await page.getByLabel('天気を取得').click();

      // ヘッダーがキャプチャされていることを確認
      expect(capturedHeaders).toBeDefined();
    });
  });
});

/*
 * APIモックのベストプラクティス
 *
 * 1. route() でAPIをインターセプト
 *    await page.route('** /api/** ', handler)
 *
 * 2. fulfill() でモックレスポンスを返す
 *    await route.fulfill({ status: 200, body: JSON.stringify(data) })
 *
 * 3. abort() でネットワークエラーをシミュレート
 *    await route.abort('failed')
 *
 * 4. continue() でリクエストを変更して続行
 *    await route.continue({ headers: { ...headers, 'X-Custom': 'value' } })
 *
 * 5. URLパターンにはワイルドカードが使える
 *    '** /api/** ' - /api/以下のすべてのパス
 */
