import type {
  NotificationProvider,
  TestResultSummary,
  NotificationConfig,
} from '../types';

/**
 * コンソール通知プロバイダー
 *
 * テスト結果をコンソールに出力
 * 開発・デバッグ用
 */
export class ConsoleNotificationProvider implements NotificationProvider {
  name = 'Console';

  async send(
    summary: TestResultSummary,
    _config: NotificationConfig
  ): Promise<void> {
    const isSuccess = summary.status === 'passed';
    const emoji = isSuccess ? '✅' : '❌';
    const statusText = isSuccess ? '成功' : '失敗';

    console.log('\n' + '🔔'.repeat(25));
    console.log('📢 テスト通知');
    console.log('🔔'.repeat(25));

    console.log(`\n${emoji} ステータス: ${statusText}`);
    console.log(`📊 総テスト数: ${summary.total}`);
    console.log(`✅ 成功: ${summary.passed}`);
    console.log(`❌ 失敗: ${summary.failed}`);
    console.log(`⏭️  スキップ: ${summary.skipped}`);
    console.log(`⏱️  実行時間: ${(summary.duration / 1000).toFixed(1)}秒`);
    console.log(
      `📈 成功率: ${((summary.passed / summary.total) * 100).toFixed(1)}%`
    );

    if (summary.failures.length > 0) {
      console.log('\n❌ 失敗したテスト:');
      for (const failure of summary.failures.slice(0, 5)) {
        console.log(`   - ${failure.title}`);
        console.log(`     ファイル: ${failure.file}`);
      }
    }

    console.log(`\n📅 実行日時: ${summary.startTime.toLocaleString('ja-JP')}`);

    if (summary.runUrl) {
      console.log(`🔗 詳細: ${summary.runUrl}`);
    }

    console.log('\n' + '🔔'.repeat(25) + '\n');
  }
}
