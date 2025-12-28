/**
 * 通知設定の例
 *
 * このファイルをコピーして notification.config.ts として使用してください
 * 環境変数または直接URLを設定できます
 */

import type { NotificationConfig } from './types';

// Slack通知の設定例
export const slackConfig: NotificationConfig = {
  type: 'slack',
  webhookUrl: process.env.SLACK_WEBHOOK_URL,
  notifyOn: {
    failure: true, // 失敗時に通知
    success: false, // 成功時は通知しない
    always: false, // 常に通知する場合はtrue
  },
  mentions: {
    onFailure: ['U12345678', 'U87654321'], // 失敗時にメンションするユーザーID
  },
};

// Discord通知の設定例
export const discordConfig: NotificationConfig = {
  type: 'discord',
  webhookUrl: process.env.DISCORD_WEBHOOK_URL,
  notifyOn: {
    failure: true,
    success: true, // 成功時も通知
  },
  mentions: {
    onFailure: ['123456789012345678'], // DiscordユーザーID
  },
};

// Microsoft Teams通知の設定例
export const teamsConfig: NotificationConfig = {
  type: 'teams',
  webhookUrl: process.env.TEAMS_WEBHOOK_URL,
  notifyOn: {
    always: true, // 常に通知
  },
};

// 汎用Webhook通知の設定例
export const webhookConfig: NotificationConfig = {
  type: 'webhook',
  webhookUrl: process.env.WEBHOOK_URL,
  notifyOn: {
    failure: true,
  },
  options: {
    headers: {
      Authorization: `Bearer ${process.env.WEBHOOK_TOKEN}`,
      'X-Custom-Header': 'playwright-test',
    },
  },
};

// コンソール通知の設定例（開発用）
export const consoleConfig: NotificationConfig = {
  type: 'console',
  notifyOn: {
    always: true,
  },
};

/**
 * playwright.config.ts での使用例:
 *
 * ```typescript
 * import { slackConfig } from './tests/notifications/notification.config';
 *
 * export default defineConfig({
 *   reporter: [
 *     ['html'],
 *     ['./tests/notifications', slackConfig],
 *   ],
 * });
 * ```
 *
 * 複数の通知先を設定する場合:
 *
 * ```typescript
 * reporter: [
 *   ['html'],
 *   ['./tests/notifications', slackConfig],
 *   ['./tests/notifications', discordConfig],
 * ],
 * ```
 */
