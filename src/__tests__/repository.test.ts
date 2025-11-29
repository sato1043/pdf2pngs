import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import {
  type TodoRepository,
  SqliteRepository,
  PrismaRepository,
} from '../repository.js';

// 共通テストスイート
function testRepository(
  name: string,
  createRepo: () => TodoRepository | Promise<TodoRepository>
) {
  describe(name, () => {
    let repo: TodoRepository;

    beforeEach(async () => {
      repo = await createRepo();
      await repo.reset();
    });

    afterAll(async () => {
      if (repo) {
        await repo.close();
      }
    });

    describe('create', () => {
      it('Todoを作成できる', async () => {
        const todo = await repo.create({ title: '買い物に行く' });
        expect(todo.id).toBeDefined();
        expect(todo.title).toBe('買い物に行く');
        expect(todo.completed).toBe(false);
        expect(todo.createdAt).toBeInstanceOf(Date);
      });

      it('複数のTodoを作成すると異なるIDが割り当てられる', async () => {
        const todo1 = await repo.create({ title: 'タスク1' });
        const todo2 = await repo.create({ title: 'タスク2' });
        expect(todo1.id).not.toBe(todo2.id);
      });
    });

    describe('findAll', () => {
      it('空のリポジトリでは空配列を返す', async () => {
        const todos = await repo.findAll();
        expect(todos).toEqual([]);
      });

      it('作成したTodoをすべて取得できる', async () => {
        await repo.create({ title: 'タスク1' });
        await repo.create({ title: 'タスク2' });
        await repo.create({ title: 'タスク3' });
        const todos = await repo.findAll();
        expect(todos).toHaveLength(3);
      });

      it('作成順にソートされる', async () => {
        await repo.create({ title: 'タスク1' });
        await repo.create({ title: 'タスク2' });
        const todos = await repo.findAll();
        expect(todos[0].title).toBe('タスク1');
        expect(todos[1].title).toBe('タスク2');
      });
    });

    describe('findById', () => {
      it('IDでTodoを取得できる', async () => {
        const created = await repo.create({ title: '検索対象' });
        const found = await repo.findById(created.id);
        expect(found).not.toBeNull();
        expect(found?.title).toBe('検索対象');
      });

      it('存在しないIDの場合はnullを返す', async () => {
        const found = await repo.findById('non-existent-id');
        expect(found).toBeNull();
      });
    });

    describe('update', () => {
      it('Todoのタイトルを更新できる', async () => {
        const todo = await repo.create({ title: '元のタイトル' });
        const updated = await repo.update(todo.id, { title: '新しいタイトル' });
        expect(updated?.title).toBe('新しいタイトル');
      });

      it('Todoの完了状態を更新できる', async () => {
        const todo = await repo.create({ title: 'タスク' });
        const updated = await repo.update(todo.id, { completed: true });
        expect(updated?.completed).toBe(true);
      });

      it('複数のフィールドを同時に更新できる', async () => {
        const todo = await repo.create({ title: '元のタスク' });
        const updated = await repo.update(todo.id, {
          title: '更新後のタスク',
          completed: true,
        });
        expect(updated?.title).toBe('更新後のタスク');
        expect(updated?.completed).toBe(true);
      });

      it('存在しないIDの場合はnullを返す', async () => {
        const updated = await repo.update('non-existent-id', {
          title: '新タイトル',
        });
        expect(updated).toBeNull();
      });

      it('更新してもcreatedAtは変更されない', async () => {
        const todo = await repo.create({ title: 'タスク' });
        const originalCreatedAt = todo.createdAt.getTime();
        const updated = await repo.update(todo.id, { title: '更新' });
        expect(updated?.createdAt.getTime()).toBe(originalCreatedAt);
      });
    });

    describe('delete', () => {
      it('Todoを削除できる', async () => {
        const todo = await repo.create({ title: '削除対象' });
        const deleted = await repo.delete(todo.id);
        expect(deleted).toBe(true);
        const found = await repo.findById(todo.id);
        expect(found).toBeNull();
      });

      it('存在しないIDの場合はfalseを返す', async () => {
        const deleted = await repo.delete('non-existent-id');
        expect(deleted).toBe(false);
      });

      it('削除後は全件取得から除外される', async () => {
        const todo1 = await repo.create({ title: 'タスク1' });
        const todo2 = await repo.create({ title: 'タスク2' });
        await repo.delete(todo1.id);
        const todos = await repo.findAll();
        expect(todos).toHaveLength(1);
        expect(todos[0].id).toBe(todo2.id);
      });
    });

    describe('reset', () => {
      it('リセットすると空の状態になる', async () => {
        await repo.create({ title: 'タスク1' });
        await repo.create({ title: 'タスク2' });
        await repo.reset();
        const todos = await repo.findAll();
        expect(todos).toEqual([]);
      });
    });
  });
}

// SqliteRepository テスト
testRepository('SqliteRepository', () => new SqliteRepository(':memory:'));

// PrismaRepository テスト（Prisma設定が必要なためスキップ）
// 実行するには: npx prisma migrate dev && DATABASE_URL=... npm test
describe.skip('PrismaRepository', () => {
  it('PrismaClientの設定が必要', () => {
    // PrismaRepository のテストを実行するには:
    // 1. npx prisma migrate dev でDBを準備
    // 2. PrismaClientをadapter付きで初期化
    // 例:
    // import { PrismaClient } from '../generated/prisma/client.js';
    // const prisma = new PrismaClient({ adapter: ... });
    // testRepository('PrismaRepository', () => new PrismaRepository(prisma));
  });
});
