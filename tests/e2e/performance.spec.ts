import { test, expect } from '../fixtures';

/**
 * パフォーマンステスト
 *
 * Web Vitals やページ読み込み時間を測定し、
 * パフォーマンスの回帰を検出する
 */

test.describe('パフォーマンステスト', () => {
  test.describe('ページ読み込み時間', () => {
    test('ログインページの読み込みが2秒以内', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const loadTime = Date.now() - startTime;

      console.log(`ログインページ読み込み時間: ${loadTime}ms`);

      // 2秒以内に読み込み完了
      expect(loadTime).toBeLessThan(2000);
    });

    test('TODOページの読み込みが2秒以内', async ({ authenticatedTodoPage, page }) => {
      // 認証済みでTODOページにアクセス
      const startTime = Date.now();

      await page.reload();
      await page.waitForLoadState('networkidle');

      const loadTime = Date.now() - startTime;

      console.log(`TODOページ読み込み時間: ${loadTime}ms`);

      expect(loadTime).toBeLessThan(2000);
    });
  });

  test.describe('Navigation Timing API', () => {
    test('ページのパフォーマンスメトリクスを取得', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Navigation Timing APIからメトリクスを取得
      const metrics = await page.evaluate(() => {
        const timing = performance.getEntriesByType(
          'navigation'
        )[0] as PerformanceNavigationTiming;

        return {
          // DNS解決時間
          dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
          // TCP接続時間
          tcpConnection: timing.connectEnd - timing.connectStart,
          // リクエスト〜レスポンス開始
          ttfb: timing.responseStart - timing.requestStart,
          // レスポンス受信時間
          responseTime: timing.responseEnd - timing.responseStart,
          // DOM解析時間
          domParsing: timing.domContentLoadedEventEnd - timing.responseEnd,
          // ページ読み込み完了時間
          loadComplete: timing.loadEventEnd - timing.startTime,
        };
      });

      console.log('📊 パフォーマンスメトリクス:');
      console.log(`   DNS解決: ${metrics.dnsLookup.toFixed(2)}ms`);
      console.log(`   TCP接続: ${metrics.tcpConnection.toFixed(2)}ms`);
      console.log(`   TTFB: ${metrics.ttfb.toFixed(2)}ms`);
      console.log(`   レスポンス: ${metrics.responseTime.toFixed(2)}ms`);
      console.log(`   DOM解析: ${metrics.domParsing.toFixed(2)}ms`);
      console.log(`   読み込み完了: ${metrics.loadComplete.toFixed(2)}ms`);

      // 基本的なしきい値チェック
      expect(metrics.ttfb).toBeLessThan(500); // TTFB 500ms以内
      expect(metrics.loadComplete).toBeLessThan(3000); // 読み込み完了 3秒以内
    });
  });

  test.describe('Web Vitals', () => {
    test('Largest Contentful Paint (LCP) を測定', async ({ page }) => {
      await page.goto('/');

      // LCPを測定（PerformanceObserverを使用）
      const lcp = await page.evaluate(() => {
        return new Promise<number>((resolve) => {
          // LCPのエントリを観測
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            resolve(lastEntry.startTime);
          });

          observer.observe({ type: 'largest-contentful-paint', buffered: true });

          // タイムアウト（LCPが発生しない場合）
          setTimeout(() => resolve(0), 5000);
        });
      });

      console.log(`LCP: ${lcp.toFixed(2)}ms`);

      // LCPは2.5秒以内が良好
      expect(lcp).toBeLessThan(2500);
    });

    test('First Contentful Paint (FCP) を測定', async ({ page }) => {
      await page.goto('/');

      const fcp = await page.evaluate(() => {
        const entries = performance.getEntriesByName('first-contentful-paint');
        return entries.length > 0 ? entries[0].startTime : 0;
      });

      console.log(`FCP: ${fcp.toFixed(2)}ms`);

      // FCPは1.8秒以内が良好
      expect(fcp).toBeLessThan(1800);
    });

    test('Cumulative Layout Shift (CLS) を測定', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // ページ操作後にCLSを測定
      const cls = await page.evaluate(() => {
        return new Promise<number>((resolve) => {
          let clsValue = 0;

          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              // @ts-expect-error hadRecentInput is not typed
              if (!entry.hadRecentInput) {
                // @ts-expect-error value is not typed
                clsValue += entry.value;
              }
            }
          });

          observer.observe({ type: 'layout-shift', buffered: true });

          // 少し待ってから結果を返す
          setTimeout(() => {
            observer.disconnect();
            resolve(clsValue);
          }, 1000);
        });
      });

      console.log(`CLS: ${cls.toFixed(4)}`);

      // CLSは0.1以内が良好
      expect(cls).toBeLessThan(0.1);
    });
  });

  test.describe('リソース読み込み', () => {
    test('リソースの読み込み時間を確認', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const resources = await page.evaluate(() => {
        const entries = performance.getEntriesByType(
          'resource'
        ) as PerformanceResourceTiming[];

        return entries
          .map((entry) => ({
            name: entry.name.split('/').pop() || entry.name,
            type: entry.initiatorType,
            duration: entry.duration,
            size: entry.transferSize,
          }))
          .sort((a, b) => b.duration - a.duration)
          .slice(0, 10);
      });

      console.log('📦 遅いリソース (Top 10):');
      for (const res of resources) {
        console.log(
          `   ${res.name} (${res.type}): ${res.duration.toFixed(2)}ms, ${(res.size / 1024).toFixed(2)}KB`
        );
      }

      // 各リソースの読み込みが1秒以内
      for (const res of resources) {
        expect(res.duration).toBeLessThan(1000);
      }
    });
  });

  test.describe('インタラクション性能', () => {
    test('ボタンクリックの応答時間', async ({ loginPage, page }) => {
      await loginPage.goto();

      // 入力
      await page.getByLabel('メールアドレス').fill('test@example.com');
      await page.getByLabel('パスワード').fill('password123');

      // クリック〜画面遷移の時間を測定
      const startTime = Date.now();

      await page.getByRole('button', { name: 'ログイン' }).click();
      await page.waitForURL('/todos');

      const responseTime = Date.now() - startTime;

      console.log(`ログイン応答時間: ${responseTime}ms`);

      // 1秒以内に遷移
      expect(responseTime).toBeLessThan(1000);
    });

    test('TODO追加の応答時間', async ({ authenticatedTodoPage, page }) => {
      const input = page.getByPlaceholder('新しいタスクを入力');
      const addButton = page.getByRole('button', { name: '追加' });

      await input.fill('パフォーマンステスト用タスク');

      const startTime = Date.now();

      await addButton.click();

      // TODOが表示されるまで待機
      await expect(page.getByText('パフォーマンステスト用タスク')).toBeVisible();

      const responseTime = Date.now() - startTime;

      console.log(`TODO追加応答時間: ${responseTime}ms`);

      // 500ms以内に追加完了
      expect(responseTime).toBeLessThan(500);
    });
  });
});

/*
 * パフォーマンステストのベストプラクティス
 *
 * 1. Web Vitals を測定
 *    - LCP (Largest Contentful Paint): 2.5秒以内
 *    - FCP (First Contentful Paint): 1.8秒以内
 *    - CLS (Cumulative Layout Shift): 0.1以内
 *    - FID (First Input Delay): 100ms以内
 *
 * 2. Navigation Timing API を活用
 *    - TTFB, DOM解析時間, 読み込み完了時間
 *
 * 3. リソース読み込みの最適化
 *    - 大きなリソースの特定
 *    - 読み込み時間の監視
 *
 * 4. しきい値の設定
 *    - 環境に応じた適切な値を設定
 *    - CI環境では余裕を持った値に
 */
