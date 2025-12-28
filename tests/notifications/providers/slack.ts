import type {
  NotificationProvider,
  TestResultSummary,
  NotificationConfig,
} from '../types';

/**
 * Slack通知プロバイダー
 *
 * Slack Incoming Webhooksを使用してテスト結果を通知
 *
 * セットアップ:
 * 1. Slack App を作成: https://api.slack.com/apps
 * 2. Incoming Webhooks を有効化
 * 3. Webhook URL を取得
 * 4. 環境変数 SLACK_WEBHOOK_URL に設定
 */
export class SlackNotificationProvider implements NotificationProvider {
  name = 'Slack';

  async send(
    summary: TestResultSummary,
    config: NotificationConfig
  ): Promise<void> {
    const webhookUrl = config.webhookUrl || process.env.SLACK_WEBHOOK_URL;

    if (!webhookUrl) {
      console.warn('⚠️ Slack Webhook URL が設定されていません');
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
        throw new Error(`Slack API error: ${response.status}`);
      }

      console.log('✅ Slack通知を送信しました');
    } catch (error) {
      console.error('❌ Slack通知の送信に失敗:', error);
    }
  }

  private buildMessage(
    summary: TestResultSummary,
    config: NotificationConfig
  ): SlackMessage {
    const isSuccess = summary.status === 'passed';
    const emoji = isSuccess ? '✅' : '❌';
    const color = isSuccess ? '#36a64f' : '#dc3545';
    const statusText = isSuccess ? '成功' : '失敗';

    // メンション
    let mentionText = '';
    if (!isSuccess && config.mentions?.onFailure?.length) {
      mentionText =
        config.mentions.onFailure.map((m) => `<@${m}>`).join(' ') + '\n';
    }

    const blocks: SlackBlock[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${emoji} テスト結果: ${statusText}`,
          emoji: true,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*総テスト数:*\n${summary.total}`,
          },
          {
            type: 'mrkdwn',
            text: `*実行時間:*\n${(summary.duration / 1000).toFixed(1)}秒`,
          },
          {
            type: 'mrkdwn',
            text: `*成功:*\n${summary.passed} ✅`,
          },
          {
            type: 'mrkdwn',
            text: `*失敗:*\n${summary.failed} ❌`,
          },
        ],
      },
    ];

    // 失敗したテストがあれば追加
    if (summary.failures.length > 0) {
      const failureList = summary.failures
        .slice(0, 5)
        .map((f) => `• ${f.title}`)
        .join('\n');

      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*失敗したテスト:*\n${failureList}`,
        },
      });
    }

    // Run URLがあれば追加
    if (summary.runUrl) {
      blocks.push({
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: '詳細を見る',
              emoji: true,
            },
            url: summary.runUrl,
          },
        ],
      });
    }

    // 日時
    blocks.push({
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `実行日時: ${summary.startTime.toLocaleString('ja-JP')}`,
        },
      ],
    });

    return {
      text: `${mentionText}${emoji} テスト結果: ${statusText} (${summary.passed}/${summary.total})`,
      blocks,
      attachments: [
        {
          color,
          blocks: [],
        },
      ],
    };
  }
}

// Slack Block Kit の型定義
interface SlackMessage {
  text: string;
  blocks: SlackBlock[];
  attachments?: Array<{ color: string; blocks: SlackBlock[] }>;
}

interface SlackBlock {
  type: 'header' | 'section' | 'context' | 'divider' | 'actions';
  text?: {
    type: 'plain_text' | 'mrkdwn';
    text: string;
    emoji?: boolean;
  };
  fields?: Array<{
    type: 'plain_text' | 'mrkdwn';
    text: string;
  }>;
  elements?: Array<{
    type: 'mrkdwn' | 'button';
    text?: string | { type: string; text: string; emoji?: boolean };
    url?: string;
  }>;
}
