import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from '@playwright/test/reporter';
import type {
  NotificationConfig,
  NotificationProvider,
  TestResultSummary,
  FailedTest,
} from './types';
import {
  SlackNotificationProvider,
  DiscordNotificationProvider,
  TeamsNotificationProvider,
  WebhookNotificationProvider,
  ConsoleNotificationProvider,
} from './providers';

export type { NotificationConfig, TestResultSummary } from './types';

/**
 * 通知レポーター
 *
 * テスト完了時に設定された通知先に結果を送信
 *
 * 使用方法:
 * ```typescript
 * // playwright.config.ts
 * reporter: [
 *   ['./tests/notifications', {
 *     type: 'slack',
 *     webhookUrl: process.env.SLACK_WEBHOOK_URL,
 *     notifyOn: { failure: true },
 *     mentions: { onFailure: ['U12345678'] }
 *   }]
 * ]
 * ```
 */
class NotificationReporter implements Reporter {
  private config: NotificationConfig;
  private provider: NotificationProvider;
  private startTime: Date;
  private failures: FailedTest[] = [];
  private testCount = { total: 0, passed: 0, failed: 0, skipped: 0, flaky: 0 };

  constructor(config: NotificationConfig) {
    this.config = {
      notifyOn: { failure: true, always: false, success: false },
      ...config,
    };
    this.provider = this.getProvider(config.type);
    this.startTime = new Date();
  }

  private getProvider(type: NotificationConfig['type']): NotificationProvider {
    switch (type) {
      case 'slack':
        return new SlackNotificationProvider();
      case 'discord':
        return new DiscordNotificationProvider();
      case 'teams':
        return new TeamsNotificationProvider();
      case 'webhook':
        return new WebhookNotificationProvider();
      case 'console':
      default:
        return new ConsoleNotificationProvider();
    }
  }

  onBegin(_config: FullConfig, _suite: Suite) {
    this.startTime = new Date();
  }

  onTestEnd(test: TestCase, result: TestResult) {
    this.testCount.total++;

    switch (result.status) {
      case 'passed':
        this.testCount.passed++;
        if (result.retry > 0) {
          this.testCount.flaky++;
        }
        break;
      case 'failed':
      case 'timedOut':
        this.testCount.failed++;
        this.failures.push({
          title: test.title,
          file: test.location.file,
          error: result.error?.message || 'Unknown error',
          duration: result.duration,
        });
        break;
      case 'skipped':
        this.testCount.skipped++;
        break;
    }
  }

  async onEnd(result: FullResult) {
    const endTime = new Date();
    const duration = endTime.getTime() - this.startTime.getTime();

    const summary: TestResultSummary = {
      startTime: this.startTime,
      endTime,
      duration,
      ...this.testCount,
      status: result.status,
      failures: this.failures,
      runUrl: process.env.GITHUB_SERVER_URL
        ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
        : undefined,
    };

    // 通知条件をチェック
    const shouldNotify = this.shouldNotify(result.status);

    if (shouldNotify) {
      await this.provider.send(summary, this.config);
    }
  }

  private shouldNotify(
    status: 'passed' | 'failed' | 'timedout' | 'interrupted'
  ): boolean {
    const { notifyOn } = this.config;

    if (notifyOn?.always) {
      return true;
    }

    if (notifyOn?.success && status === 'passed') {
      return true;
    }

    if (notifyOn?.failure && status !== 'passed') {
      return true;
    }

    return false;
  }
}

export default NotificationReporter;
