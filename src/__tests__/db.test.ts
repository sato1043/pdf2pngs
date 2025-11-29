import { describe, it, expect, beforeEach } from 'vitest';
import {
  initDb,
  createTodo,
  getAllTodos,
  getTodoById,
  updateTodo,
  deleteTodo,
  type Todo,
} from '../db.js';

describe('Database', () => {
  beforeEach(() => {
    initDb();
  });

  describe('initDb', () => {
    it('データベースを初期化すると空の状態になる', () => {
      createTodo('テスト');
      initDb();
      expect(getAllTodos()).toEqual([]);
    });
  });

  describe('createTodo', () => {
    it('Todoを作成できる', () => {
      const todo = createTodo('買い物に行く');
      expect(todo.id).toBeDefined();
      expect(todo.title).toBe('買い物に行く');
      expect(todo.completed).toBe(false);
      expect(todo.createdAt).toBeInstanceOf(Date);
    });

    it('複数のTodoを作成すると異なるIDが割り当てられる', () => {
      const todo1 = createTodo('タスク1');
      const todo2 = createTodo('タスク2');
      expect(todo1.id).not.toBe(todo2.id);
    });
  });

  describe('getAllTodos', () => {
    it('空のデータベースでは空配列を返す', () => {
      expect(getAllTodos()).toEqual([]);
    });

    it('作成したTodoをすべて取得できる', () => {
      createTodo('タスク1');
      createTodo('タスク2');
      createTodo('タスク3');
      const todos = getAllTodos();
      expect(todos).toHaveLength(3);
    });

    it('取得した配列を変更しても元データに影響しない', () => {
      createTodo('タスク1');
      const todos = getAllTodos();
      todos.pop();
      expect(getAllTodos()).toHaveLength(1);
    });
  });

  describe('getTodoById', () => {
    it('IDでTodoを取得できる', () => {
      const created = createTodo('検索対象');
      const found = getTodoById(created.id);
      expect(found).toBeDefined();
      expect(found?.title).toBe('検索対象');
    });

    it('存在しないIDの場合はundefinedを返す', () => {
      const found = getTodoById('non-existent-id');
      expect(found).toBeUndefined();
    });
  });

  describe('updateTodo', () => {
    it('Todoのタイトルを更新できる', () => {
      const todo = createTodo('元のタイトル');
      const updated = updateTodo(todo.id, { title: '新しいタイトル' });
      expect(updated?.title).toBe('新しいタイトル');
    });

    it('Todoの完了状態を更新できる', () => {
      const todo = createTodo('タスク');
      const updated = updateTodo(todo.id, { completed: true });
      expect(updated?.completed).toBe(true);
    });

    it('複数のフィールドを同時に更新できる', () => {
      const todo = createTodo('元のタスク');
      const updated = updateTodo(todo.id, {
        title: '更新後のタスク',
        completed: true,
      });
      expect(updated?.title).toBe('更新後のタスク');
      expect(updated?.completed).toBe(true);
    });

    it('存在しないIDの場合はundefinedを返す', () => {
      const updated = updateTodo('non-existent-id', { title: '新タイトル' });
      expect(updated).toBeUndefined();
    });

    it('更新してもcreatedAtは変更されない', () => {
      const todo = createTodo('タスク');
      const originalCreatedAt = todo.createdAt;
      const updated = updateTodo(todo.id, { title: '更新' });
      expect(updated?.createdAt).toEqual(originalCreatedAt);
    });
  });

  describe('deleteTodo', () => {
    it('Todoを削除できる', () => {
      const todo = createTodo('削除対象');
      const deleted = deleteTodo(todo.id);
      expect(deleted).toBe(true);
      expect(getTodoById(todo.id)).toBeUndefined();
    });

    it('存在しないIDの場合はfalseを返す', () => {
      const deleted = deleteTodo('non-existent-id');
      expect(deleted).toBe(false);
    });

    it('削除後は全件取得から除外される', () => {
      const todo1 = createTodo('タスク1');
      const todo2 = createTodo('タスク2');
      deleteTodo(todo1.id);
      const todos = getAllTodos();
      expect(todos).toHaveLength(1);
      expect(todos[0].id).toBe(todo2.id);
    });
  });
});
