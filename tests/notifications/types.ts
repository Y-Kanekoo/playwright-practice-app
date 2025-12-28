/**
 * 通知システムの型定義
 */

// テスト結果サマリー
export interface TestResultSummary {
  // 実行情報
  startTime: Date;
  endTime: Date;
  duration: number;

  // 結果
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  flaky: number;

  // 詳細
  status: 'passed' | 'failed' | 'timedout' | 'interrupted';
  projectName?: string;
  runUrl?: string;

  // 失敗したテスト
  failures: FailedTest[];
}

export interface FailedTest {
  title: string;
  file: string;
  error: string;
  duration: number;
}

// 通知設定
export interface NotificationConfig {
  // 通知先の種類
  type: 'slack' | 'discord' | 'teams' | 'webhook' | 'console';

  // Webhook URL
  webhookUrl?: string;

  // 通知条件
  notifyOn?: {
    success?: boolean; // 成功時に通知
    failure?: boolean; // 失敗時に通知
    always?: boolean; // 常に通知
  };

  // メンション設定
  mentions?: {
    onFailure?: string[]; // 失敗時にメンションするユーザー/グループ
  };

  // カスタム設定
  options?: Record<string, unknown>;
}

// 通知プロバイダーのインターフェース
export interface NotificationProvider {
  name: string;
  send(summary: TestResultSummary, config: NotificationConfig): Promise<void>;
}
