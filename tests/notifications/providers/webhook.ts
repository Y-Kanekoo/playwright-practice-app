import type {
  NotificationProvider,
  TestResultSummary,
  NotificationConfig,
} from '../types';

/**
 * 汎用Webhook通知プロバイダー
 *
 * 任意のWebhookエンドポイントにJSON形式でテスト結果を送信
 * カスタムの通知システムとの連携に使用
 *
 * セットアップ:
 * 1. 受信用のWebhookエンドポイントを用意
 * 2. 環境変数 WEBHOOK_URL に設定
 */
export class WebhookNotificationProvider implements NotificationProvider {
  name = 'Webhook';

  async send(
    summary: TestResultSummary,
    config: NotificationConfig
  ): Promise<void> {
    const webhookUrl = config.webhookUrl || process.env.WEBHOOK_URL;

    if (!webhookUrl) {
      console.warn('⚠️ Webhook URL が設定されていません');
      return;
    }

    const payload = this.buildPayload(summary);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // カスタムヘッダーがあれば追加
    if (config.options?.headers) {
      Object.assign(headers, config.options.headers);
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Webhook error: ${response.status}`);
      }

      console.log('✅ Webhook通知を送信しました');
    } catch (error) {
      console.error('❌ Webhook通知の送信に失敗:', error);
    }
  }

  private buildPayload(summary: TestResultSummary): WebhookPayload {
    return {
      event: 'test_completed',
      timestamp: new Date().toISOString(),
      status: summary.status,
      summary: {
        total: summary.total,
        passed: summary.passed,
        failed: summary.failed,
        skipped: summary.skipped,
        flaky: summary.flaky,
        duration: summary.duration,
        successRate: (summary.passed / summary.total) * 100,
      },
      execution: {
        startTime: summary.startTime.toISOString(),
        endTime: summary.endTime.toISOString(),
        projectName: summary.projectName,
        runUrl: summary.runUrl,
      },
      failures: summary.failures.map((f) => ({
        title: f.title,
        file: f.file,
        error: f.error,
        duration: f.duration,
      })),
    };
  }
}

interface WebhookPayload {
  event: string;
  timestamp: string;
  status: string;
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    flaky: number;
    duration: number;
    successRate: number;
  };
  execution: {
    startTime: string;
    endTime: string;
    projectName?: string;
    runUrl?: string;
  };
  failures: Array<{
    title: string;
    file: string;
    error: string;
    duration: number;
  }>;
}
