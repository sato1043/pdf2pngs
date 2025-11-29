import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { execSync } from 'node:child_process';
import { unlinkSync, existsSync } from 'node:fs';

const TEST_DB = 'test-cli.db';
const CLI_CMD = `npx tsx src/index.ts`;

function runCli(args: string): { stdout: string; exitCode: number } {
  try {
    const stdout = execSync(`${CLI_CMD} ${args}`, {
      encoding: 'utf-8',
      env: { ...process.env, TODO_DB: TEST_DB },
    });
    return { stdout, exitCode: 0 };
  } catch (error) {
    const e = error as { stdout?: string; stderr?: string; status?: number };
    return {
      stdout: (e.stdout || '') + (e.stderr || ''),
      exitCode: e.status || 1,
    };
  }
}

function cleanupDb(): void {
  if (existsSync(TEST_DB)) {
    unlinkSync(TEST_DB);
  }
}

describe('CLI', () => {
  beforeEach(() => {
    cleanupDb();
  });

  afterAll(() => {
    cleanupDb();
  });

  describe('usage', () => {
    it('引数なしでUsageを表示する', () => {
      const { stdout, exitCode } = runCli('');
      expect(exitCode).toBe(1);
      expect(stdout).toContain('Usage:');
    });

    it('不明なコマンドでエラーを表示する', () => {
      const { stdout, exitCode } = runCli('unknown');
      expect(exitCode).toBe(1);
      expect(stdout).toContain('不明なコマンド');
    });
  });

  describe('add', () => {
    it('Todoを追加できる', () => {
      const { stdout, exitCode } = runCli('add 買い物に行く');
      expect(exitCode).toBe(0);
      expect(stdout).toContain('追加しました: 買い物に行く');
    });

    it('タイトルなしでエラーになる', () => {
      const { stdout, exitCode } = runCli('add');
      expect(exitCode).toBe(1);
      expect(stdout).toContain('タイトルを指定してください');
    });

    it('スペースを含むタイトルを追加できる', () => {
      const { stdout, exitCode } = runCli('add 牛乳を 買う');
      expect(exitCode).toBe(0);
      expect(stdout).toContain('追加しました: 牛乳を 買う');
    });
  });

  describe('list', () => {
    it('空のリストでメッセージを表示する', () => {
      const { stdout, exitCode } = runCli('list');
      expect(exitCode).toBe(0);
      expect(stdout).toContain('Todoはありません');
    });

    it('追加したTodoを一覧表示できる', () => {
      runCli('add タスク1');
      runCli('add タスク2');
      const { stdout, exitCode } = runCli('list');
      expect(exitCode).toBe(0);
      expect(stdout).toContain('Todo一覧:');
      expect(stdout).toContain('1.');
      expect(stdout).toContain('タスク1');
      expect(stdout).toContain('2.');
      expect(stdout).toContain('タスク2');
    });
  });

  describe('done', () => {
    it('Todoを完了にできる', () => {
      runCli('add テスト');
      const { stdout, exitCode } = runCli('done 1');
      expect(exitCode).toBe(0);
      expect(stdout).toContain('完了にしました: テスト');
    });

    it('完了状態がリストに反映される', () => {
      runCli('add テスト');
      runCli('done 1');
      const { stdout } = runCli('list');
      expect(stdout).toContain('[✓]');
    });

    it('番号なしでエラーになる', () => {
      const { stdout, exitCode } = runCli('done');
      expect(exitCode).toBe(1);
      expect(stdout).toContain('有効な番号を指定してください');
    });

    it('存在しない番号でエラーになる', () => {
      const { stdout, exitCode } = runCli('done 99');
      expect(exitCode).toBe(1);
      expect(stdout).toContain('存在しません');
    });
  });

  describe('delete', () => {
    it('Todoを削除できる', () => {
      runCli('add テスト');
      const { stdout, exitCode } = runCli('delete 1');
      expect(exitCode).toBe(0);
      expect(stdout).toContain('削除しました: テスト');
    });

    it('削除後はリストから消える', () => {
      runCli('add タスク1');
      runCli('add タスク2');
      runCli('delete 1');
      const { stdout } = runCli('list');
      expect(stdout).not.toContain('タスク1');
      expect(stdout).toContain('タスク2');
    });

    it('番号なしでエラーになる', () => {
      const { stdout, exitCode } = runCli('delete');
      expect(exitCode).toBe(1);
      expect(stdout).toContain('有効な番号を指定してください');
    });

    it('存在しない番号でエラーになる', () => {
      const { stdout, exitCode } = runCli('delete 99');
      expect(exitCode).toBe(1);
      expect(stdout).toContain('存在しません');
    });
  });

  describe('status', () => {
    it('Todoがない場合は0件を表示する', () => {
      const { stdout, exitCode } = runCli('status');
      expect(exitCode).toBe(0);
      expect(stdout).toContain('統計:');
      expect(stdout).toContain('総数:     0');
      expect(stdout).toContain('完了:     0');
      expect(stdout).toContain('未完了:   0');
      expect(stdout).toContain('完了率:   0%');
    });

    it('Todoの統計を表示する', () => {
      runCli('add タスク1');
      runCli('add タスク2');
      runCli('add タスク3');
      const { stdout, exitCode } = runCli('status');
      expect(exitCode).toBe(0);
      expect(stdout).toContain('総数:     3');
      expect(stdout).toContain('完了:     0');
      expect(stdout).toContain('未完了:   3');
      expect(stdout).toContain('完了率:   0%');
    });

    it('完了率を正しく計算する', { timeout: 10000 }, () => {
      runCli('add タスク1');
      runCli('add タスク2');
      runCli('add タスク3');
      runCli('add タスク4');
      runCli('done 1');
      runCli('done 2');
      const { stdout, exitCode } = runCli('status');
      expect(exitCode).toBe(0);
      expect(stdout).toContain('総数:     4');
      expect(stdout).toContain('完了:     2');
      expect(stdout).toContain('未完了:   2');
      expect(stdout).toContain('完了率:   50%');
    });

    it('すべて完了で100%を表示する', () => {
      runCli('add タスク1');
      runCli('add タスク2');
      runCli('done 1');
      runCli('done 2');
      const { stdout, exitCode } = runCli('status');
      expect(exitCode).toBe(0);
      expect(stdout).toContain('完了率:   100%');
    });
  });

  describe('統合シナリオ', () => {
    it('追加→完了→削除の一連の操作ができる', { timeout: 30000 }, () => {
      // 追加
      runCli('add 買い物');
      runCli('add 掃除');

      // リスト確認
      let result = runCli('list');
      expect(result.stdout).toContain('買い物');
      expect(result.stdout).toContain('掃除');

      // 完了
      runCli('done 1');
      result = runCli('list');
      expect(result.stdout).toMatch(/1\.\s*\[✓\].*買い物/);
      expect(result.stdout).toMatch(/2\.\s*\[ \].*掃除/);

      // 削除
      runCli('delete 1');
      result = runCli('list');
      expect(result.stdout).not.toContain('買い物');
      expect(result.stdout).toContain('掃除');
      expect(result.stdout).toContain('1.');
    });
  });
});
