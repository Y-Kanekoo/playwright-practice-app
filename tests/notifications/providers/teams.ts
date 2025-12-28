import type {
  NotificationProvider,
  TestResultSummary,
  NotificationConfig,
} from '../types';

/**
 * Microsoft Teams通知プロバイダー
 *
 * Teams Incoming Webhooksを使用してテスト結果を通知
 *
 * セットアップ:
 * 1. Teams チャネル → コネクタ → Incoming Webhook
 * 2. Webhook を追加・構成
 * 3. Webhook URL を取得
 * 4. 環境変数 TEAMS_WEBHOOK_URL に設定
 */
export class TeamsNotificationProvider implements NotificationProvider {
  name = 'Microsoft Teams';

  async send(
    summary: TestResultSummary,
    config: NotificationConfig
  ): Promise<void> {
    const webhookUrl = config.webhookUrl || process.env.TEAMS_WEBHOOK_URL;

    if (!webhookUrl) {
      console.warn('⚠️ Teams Webhook URL が設定されていません');
      return;
    }

    const message = this.buildMessage(summary, config);

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        throw new Error(`Teams API error: ${response.status}`);
      }

      console.log('✅ Teams通知を送信しました');
    } catch (error) {
      console.error('❌ Teams通知の送信に失敗:', error);
    }
  }

  private buildMessage(
    summary: TestResultSummary,
    config: NotificationConfig
  ): TeamsAdaptiveCard {
    const isSuccess = summary.status === 'passed';
    const emoji = isSuccess ? '✅' : '❌';
    const statusText = isSuccess ? '成功' : '失敗';
    const themeColor = isSuccess ? '36a64f' : 'dc3545';

    // メンション
    let mentionText = '';
    if (!isSuccess && config.mentions?.onFailure?.length) {
      mentionText = config.mentions.onFailure
        .map((m) => `<at>${m}</at>`)
        .join(' ');
    }

    const facts: TeamsFact[] = [
      { title: '総テスト数', value: `${summary.total}` },
      { title: '成功', value: `${summary.passed} ✅` },
      { title: '失敗', value: `${summary.failed} ❌` },
      { title: '実行時間', value: `${(summary.duration / 1000).toFixed(1)}秒` },
    ];

    if (summary.skipped > 0) {
      facts.push({ title: 'スキップ', value: `${summary.skipped}` });
    }

    const sections: TeamsSection[] = [
      {
        activityTitle: `${emoji} テスト結果: ${statusText}`,
        activitySubtitle: summary.startTime.toLocaleString('ja-JP'),
        facts,
        markdown: true,
      },
    ];

    // 失敗したテストがあれば追加
    if (summary.failures.length > 0) {
      const failureList = summary.failures
        .slice(0, 5)
        .map((f) => `- ${f.title}`)
        .join('\n');

      sections.push({
        activityTitle: '❌ 失敗したテスト',
        text: failureList,
        markdown: true,
      });
    }

    const potentialAction: TeamsPotentialAction[] = [];

    // Run URLがあれば追加
    if (summary.runUrl) {
      potentialAction.push({
        '@type': 'OpenUri',
        name: '詳細を見る',
        targets: [{ os: 'default', uri: summary.runUrl }],
      });
    }

    return {
      '@type': 'MessageCard',
      '@context': 'http://schema.org/extensions',
      themeColor,
      summary: `${emoji} テスト結果: ${statusText}`,
      text: mentionText || undefined,
      sections,
      potentialAction: potentialAction.length > 0 ? potentialAction : undefined,
    };
  }
}

// Teams MessageCard の型定義
interface TeamsAdaptiveCard {
  '@type': 'MessageCard';
  '@context': string;
  themeColor: string;
  summary: string;
  text?: string;
  sections: TeamsSection[];
  potentialAction?: TeamsPotentialAction[];
}

interface TeamsSection {
  activityTitle?: string;
  activitySubtitle?: string;
  text?: string;
  facts?: TeamsFact[];
  markdown?: boolean;
}

interface TeamsFact {
  title: string;
  value: string;
}

interface TeamsPotentialAction {
  '@type': 'OpenUri';
  name: string;
  targets: Array<{ os: string; uri: string }>;
}
