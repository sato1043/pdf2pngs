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

  describe('export', () => {
    it('Todoがない場合はマークダウンで空を表示する', () => {
      const { stdout, exitCode } = runCli('export');
      expect(exitCode).toBe(0);
      expect(stdout).toContain('# Todo List');
      expect(stdout).toContain('> 完了率: 0% (0/0)');
      expect(stdout).toContain('_Todoはありません_');
    });

    it('Todoをマークダウン形式でエクスポートする', { timeout: 10000 }, () => {
      runCli('add タスク1');
      runCli('add タスク2');
      runCli('done 1');
      const { stdout, exitCode } = runCli('export');
      expect(exitCode).toBe(0);
      expect(stdout).toContain('# Todo List');
      expect(stdout).toContain('> 完了率: 50% (1/2)');
      expect(stdout).toContain('- [x] タスク1');
      expect(stdout).toContain('- [ ] タスク2');
    });
  });

  describe('search', () => {
    it('キーワードなしでエラーになる', () => {
      const { stdout, exitCode } = runCli('search');
      expect(exitCode).toBe(1);
      expect(stdout).toContain('検索キーワードを指定してください');
    });

    it('タイトルで検索できる', { timeout: 10000 }, () => {
      runCli('add 買い物に行く');
      runCli('add メールを送る');
      runCli('add 買い物リスト作成');
      const { stdout, exitCode } = runCli('search 買い物');
      expect(exitCode).toBe(0);
      expect(stdout).toContain('検索結果 (2件)');
      expect(stdout).toContain('買い物に行く');
      expect(stdout).toContain('買い物リスト作成');
      expect(stdout).not.toContain('メールを送る');
    });

    it('大文字小文字を区別しない', { timeout: 10000 }, () => {
      runCli('add Hello World');
      runCli('add goodbye');
      const { stdout, exitCode } = runCli('search hello');
      expect(exitCode).toBe(0);
      expect(stdout).toContain('検索結果 (1件)');
      expect(stdout).toContain('Hello World');
    });

    it('一致しない場合はメッセージを表示する', () => {
      runCli('add タスク1');
      const { stdout, exitCode } = runCli('search 存在しない');
      expect(exitCode).toBe(0);
      expect(stdout).toContain('"存在しない" に一致するTodoはありません');
    });

    it('タグでも検索できる', { timeout: 10000 }, () => {
      runCli('add タスク1');
      runCli('add タスク2');
      runCli('tag set 1 仕事');
      const { stdout, exitCode } = runCli('search 仕事');
      expect(exitCode).toBe(0);
      expect(stdout).toContain('検索結果 (1件)');
      expect(stdout).toContain('タスク1');
      expect(stdout).toContain('[仕事]');
    });
  });

  describe('tag', () => {
    it('サブコマンドなしでエラーになる', () => {
      const { stdout, exitCode } = runCli('tag');
      expect(exitCode).toBe(1);
      expect(stdout).toContain('tagサブコマンドを指定してください');
    });

    describe('tag list', () => {
      it('タグがない場合はメッセージを表示する', () => {
        const { stdout, exitCode } = runCli('tag list');
        expect(exitCode).toBe(0);
        expect(stdout).toContain('タグはありません');
      });

      it('タグ一覧を表示する', { timeout: 10000 }, () => {
        runCli('tag add 仕事');
        runCli('tag add プライベート');
        const { stdout, exitCode } = runCli('tag list');
        expect(exitCode).toBe(0);
        expect(stdout).toContain('タグ一覧:');
        expect(stdout).toContain('仕事');
        expect(stdout).toContain('プライベート');
      });
    });

    describe('tag add', () => {
      it('タグを作成できる', () => {
        const { stdout, exitCode } = runCli('tag add 仕事');
        expect(exitCode).toBe(0);
        expect(stdout).toContain('タグを作成しました: 仕事');
      });

      it('タグ名なしでエラーになる', () => {
        const { stdout, exitCode } = runCli('tag add');
        expect(exitCode).toBe(1);
        expect(stdout).toContain('タグ名を指定してください');
      });

      it('既存のタグ名でエラーになる', () => {
        runCli('tag add 仕事');
        const { stdout, exitCode } = runCli('tag add 仕事');
        expect(exitCode).toBe(1);
        expect(stdout).toContain('既に存在します');
      });
    });

    describe('tag delete', () => {
      it('タグを削除できる', () => {
        runCli('tag add 仕事');
        const { stdout, exitCode } = runCli('tag delete 仕事');
        expect(exitCode).toBe(0);
        expect(stdout).toContain('タグを削除しました: 仕事');
      });

      it('存在しないタグでエラーになる', () => {
        const { stdout, exitCode } = runCli('tag delete 存在しない');
        expect(exitCode).toBe(1);
        expect(stdout).toContain('存在しません');
      });
    });

    describe('tag set', () => {
      it('Todoにタグを設定できる', { timeout: 10000 }, () => {
        runCli('add タスク1');
        const { stdout, exitCode } = runCli('tag set 1 仕事');
        expect(exitCode).toBe(0);
        expect(stdout).toContain('タグを設定しました: 仕事 → タスク1');
      });

      it('複数タグをカンマ区切りで設定できる', { timeout: 10000 }, () => {
        runCli('add タスク1');
        const { stdout, exitCode } = runCli('tag set 1 仕事,緊急');
        expect(exitCode).toBe(0);
        expect(stdout).toContain('タグを設定しました: 仕事, 緊急 → タスク1');
      });

      it('番号なしでエラーになる', () => {
        const { stdout, exitCode } = runCli('tag set');
        expect(exitCode).toBe(1);
        expect(stdout).toContain('有効な番号を指定してください');
      });
    });

    describe('tag unset', () => {
      it('Todoからタグを解除できる', { timeout: 10000 }, () => {
        runCli('add タスク1');
        runCli('tag set 1 仕事');
        const { stdout, exitCode } = runCli('tag unset 1 仕事');
        expect(exitCode).toBe(0);
        expect(stdout).toContain('タグを解除しました: 仕事 ← タスク1');
      });
    });

    describe('tag show', () => {
      it('タグでTodoを絞り込める', { timeout: 10000 }, () => {
        runCli('add タスク1');
        runCli('add タスク2');
        runCli('tag set 1 仕事');
        const { stdout, exitCode } = runCli('tag show 仕事');
        expect(exitCode).toBe(0);
        expect(stdout).toContain('タグ "仕事" のTodo (1件)');
        expect(stdout).toContain('タスク1');
        expect(stdout).not.toContain('タスク2');
      });

      it('存在しないタグでエラーになる', () => {
        const { stdout, exitCode } = runCli('tag show 存在しない');
        expect(exitCode).toBe(1);
        expect(stdout).toContain('存在しません');
      });
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
