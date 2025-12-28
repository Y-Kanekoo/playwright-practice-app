import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';

/**
 * カスタムJSONサマリーレポーター
 *
 * テスト結果をJSON形式で出力し、CI/CDパイプラインや
 * 外部ツールとの連携を容易にする
 */

interface TestSummary {
  // 実行情報
  startTime: string;
  endTime: string;
  duration: number;

  // 結果サマリー
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  flaky: number;

  // プロジェクト別
  projects: Record<
    string,
    {
      total: number;
      passed: number;
      failed: number;
    }
  >;

  // 失敗したテスト
  failures: Array<{
    title: string;
    file: string;
    project: string;
    error: string;
    duration: number;
  }>;

  // 遅いテスト（上位5件）
  slowTests: Array<{
    title: string;
    file: string;
    duration: number;
  }>;
}

class JsonSummaryReporter implements Reporter {
  private summary: TestSummary;
  private startTime: Date;
  private allTests: Array<{ test: TestCase; result: TestResult }> = [];

  constructor() {
    this.startTime = new Date();
    this.summary = {
      startTime: this.startTime.toISOString(),
      endTime: '',
      duration: 0,
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      flaky: 0,
      projects: {},
      failures: [],
      slowTests: [],
    };
  }

  onBegin(config: FullConfig, suite: Suite) {
    console.log(`\n📊 テスト開始: ${suite.allTests().length} テスト\n`);
  }

  onTestEnd(test: TestCase, result: TestResult) {
    this.allTests.push({ test, result });

    const projectName = test.parent.project()?.name || 'default';

    // プロジェクト別カウント初期化
    if (!this.summary.projects[projectName]) {
      this.summary.projects[projectName] = {
        total: 0,
        passed: 0,
        failed: 0,
      };
    }

    this.summary.total++;
    this.summary.projects[projectName].total++;

    // ステータス別カウント
    switch (result.status) {
      case 'passed':
        this.summary.passed++;
        this.summary.projects[projectName].passed++;
        break;
      case 'failed':
      case 'timedOut':
        this.summary.failed++;
        this.summary.projects[projectName].failed++;
        this.summary.failures.push({
          title: test.title,
          file: test.location.file,
          project: projectName,
          error: result.error?.message || 'Unknown error',
          duration: result.duration,
        });
        break;
      case 'skipped':
        this.summary.skipped++;
        break;
    }

    // Flakyテスト（リトライで成功）
    if (result.status === 'passed' && result.retry > 0) {
      this.summary.flaky++;
    }
  }

  onEnd(result: FullResult) {
    const endTime = new Date();
    this.summary.endTime = endTime.toISOString();
    this.summary.duration = endTime.getTime() - this.startTime.getTime();

    // 遅いテストTop 5を抽出
    this.summary.slowTests = this.allTests
      .filter((t) => t.result.status === 'passed')
      .sort((a, b) => b.result.duration - a.result.duration)
      .slice(0, 5)
      .map((t) => ({
        title: t.test.title,
        file: t.test.location.file,
        duration: t.result.duration,
      }));

    // JSONファイルに出力
    const outputDir = 'test-results';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'test-summary.json');
    fs.writeFileSync(outputPath, JSON.stringify(this.summary, null, 2));

    // コンソールにサマリー出力
    this.printSummary();

    console.log(`\n📄 詳細レポート: ${outputPath}\n`);
  }

  private printSummary() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 テスト結果サマリー');
    console.log('='.repeat(50));

    console.log(`\n⏱️  実行時間: ${(this.summary.duration / 1000).toFixed(2)}秒`);
    console.log(`📝 総テスト数: ${this.summary.total}`);
    console.log(`✅ 成功: ${this.summary.passed}`);
    console.log(`❌ 失敗: ${this.summary.failed}`);
    console.log(`⏭️  スキップ: ${this.summary.skipped}`);
    if (this.summary.flaky > 0) {
      console.log(`⚠️  不安定: ${this.summary.flaky}`);
    }

    // プロジェクト別
    console.log('\n📁 プロジェクト別:');
    for (const [name, stats] of Object.entries(this.summary.projects)) {
      const status = stats.failed > 0 ? '❌' : '✅';
      console.log(
        `   ${status} ${name}: ${stats.passed}/${stats.total} 成功`
      );
    }

    // 失敗したテスト
    if (this.summary.failures.length > 0) {
      console.log('\n❌ 失敗したテスト:');
      for (const failure of this.summary.failures) {
        console.log(`   - ${failure.title}`);
        console.log(`     ${failure.error.split('\n')[0]}`);
      }
    }

    // 遅いテスト
    if (this.summary.slowTests.length > 0) {
      console.log('\n🐢 遅いテスト (Top 5):');
      for (const slow of this.summary.slowTests) {
        console.log(`   - ${slow.title} (${(slow.duration / 1000).toFixed(2)}秒)`);
      }
    }

    console.log('\n' + '='.repeat(50));
  }
}

export default JsonSummaryReporter;
