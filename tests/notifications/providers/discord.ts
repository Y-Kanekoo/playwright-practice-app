import type {
  NotificationProvider,
  TestResultSummary,
  NotificationConfig,
} from '../types';

/**
 * Discord通知プロバイダー
 *
 * Discord Webhooksを使用してテスト結果を通知
 *
 * セットアップ:
 * 1. Discordサーバーの設定 → 連携サービス → ウェブフック
 * 2. 新しいウェブフックを作成
 * 3. Webhook URL を取得
 * 4. 環境変数 DISCORD_WEBHOOK_URL に設定
 */
export class DiscordNotificationProvider implements NotificationProvider {
  name = 'Discord';

  async send(
    summary: TestResultSummary,
    config: NotificationConfig
  ): Promise<void> {
    const webhookUrl = config.webhookUrl || process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
      console.warn('⚠️ Discord Webhook URL が設定されていません');
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
        throw new Error(`Discord API error: ${response.status}`);
      }

      console.log('✅ Discord通知を送信しました');
    } catch (error) {
      console.error('❌ Discord通知の送信に失敗:', error);
    }
  }

  private buildMessage(
    summary: TestResultSummary,
    config: NotificationConfig
  ): DiscordMessage {
    const isSuccess = summary.status === 'passed';
    const emoji = isSuccess ? '✅' : '❌';
    const color = isSuccess ? 0x36a64f : 0xdc3545; // Discord uses decimal color
    const statusText = isSuccess ? '成功' : '失敗';

    // メンション
    let content = '';
    if (!isSuccess && config.mentions?.onFailure?.length) {
      content = config.mentions.onFailure.map((m) => `<@${m}>`).join(' ');
    }

    const fields: DiscordField[] = [
      {
        name: '📊 総テスト数',
        value: `${summary.total}`,
        inline: true,
      },
      {
        name: '⏱️ 実行時間',
        value: `${(summary.duration / 1000).toFixed(1)}秒`,
        inline: true,
      },
      {
        name: '✅ 成功',
        value: `${summary.passed}`,
        inline: true,
      },
      {
        name: '❌ 失敗',
        value: `${summary.failed}`,
        inline: true,
      },
    ];

    // スキップがあれば追加
    if (summary.skipped > 0) {
      fields.push({
        name: '⏭️ スキップ',
        value: `${summary.skipped}`,
        inline: true,
      });
    }

    // Flakyがあれば追加
    if (summary.flaky > 0) {
      fields.push({
        name: '⚠️ 不安定',
        value: `${summary.flaky}`,
        inline: true,
      });
    }

    // 失敗したテストがあれば追加
    if (summary.failures.length > 0) {
      const failureList = summary.failures
        .slice(0, 5)
        .map((f) => `• ${f.title}`)
        .join('\n');

      fields.push({
        name: '❌ 失敗したテスト',
        value: failureList || 'なし',
        inline: false,
      });
    }

    const embed: DiscordEmbed = {
      title: `${emoji} テスト結果: ${statusText}`,
      description: `**${summary.passed}/${summary.total}** テストが成功しました`,
      color,
      fields,
      timestamp: summary.startTime.toISOString(),
      footer: {
        text: 'Playwright Test Results',
      },
    };

    // Run URLがあれば追加
    if (summary.runUrl) {
      embed.url = summary.runUrl;
    }

    return {
      content: content || undefined,
      embeds: [embed],
    };
  }
}

// Discord Webhook の型定義
interface DiscordMessage {
  content?: string;
  embeds: DiscordEmbed[];
}

interface DiscordEmbed {
  title: string;
  description?: string;
  url?: string;
  color: number;
  fields: DiscordField[];
  timestamp?: string;
  footer?: {
    text: string;
  };
}

interface DiscordField {
  name: string;
  value: string;
  inline?: boolean;
}
