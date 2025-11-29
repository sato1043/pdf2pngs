import { DatabaseSync } from 'node:sqlite';
import { PrismaClient } from './generated/prisma/client.js';

// 共通の型定義
export interface Tag {
  id: string;
  name: string;
}

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

export interface TodoWithTags extends Todo {
  tags: Tag[];
}

export type TodoCreate = Pick<Todo, 'title'>;
export type TodoUpdate = Partial<Pick<Todo, 'title' | 'completed'>>;

// リポジトリインターフェース
export interface TodoRepository {
  create(data: TodoCreate): Promise<Todo>;
  findAll(): Promise<Todo[]>;
  findById(id: string): Promise<Todo | null>;
  update(id: string, data: TodoUpdate): Promise<Todo | null>;
  delete(id: string): Promise<boolean>;
  reset(): Promise<void>;
  close(): Promise<void>;

  // タグ関連
  createTag(name: string): Promise<Tag>;
  findAllTags(): Promise<Tag[]>;
  findTagByName(name: string): Promise<Tag | null>;
  deleteTag(id: string): Promise<boolean>;
  addTagToTodo(todoId: string, tagId: string): Promise<boolean>;
  removeTagFromTodo(todoId: string, tagId: string): Promise<boolean>;
  findTodoWithTags(id: string): Promise<TodoWithTags | null>;
  findAllWithTags(): Promise<TodoWithTags[]>;
  findByTag(tagName: string): Promise<TodoWithTags[]>;
}

// SQLite実装
interface TodoRow {
  id: string;
  title: string;
  completed: number;
  created_at: string;
}

interface TagRow {
  id: string;
  name: string;
}

export class SqliteRepository implements TodoRepository {
  private db: DatabaseSync;

  constructor(filename: string = ':memory:') {
    this.db = new DatabaseSync(filename);
    this.init();
  }

  private init(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS todos (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      )
    `);
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tags (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
      )
    `);
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS todo_tags (
        todo_id TEXT NOT NULL,
        tag_id TEXT NOT NULL,
        PRIMARY KEY (todo_id, tag_id),
        FOREIGN KEY (todo_id) REFERENCES todos(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      )
    `);
  }

  private rowToTodo(row: TodoRow): Todo {
    return {
      id: row.id,
      title: row.title,
      completed: row.completed === 1,
      createdAt: new Date(row.created_at),
    };
  }

  async create(data: TodoCreate): Promise<Todo> {
    const id = crypto.randomUUID();
    const createdAt = new Date();
    const stmt = this.db.prepare(
      'INSERT INTO todos (id, title, completed, created_at) VALUES (?, ?, ?, ?)'
    );
    stmt.run(id, data.title, 0, createdAt.toISOString());
    return { id, title: data.title, completed: false, createdAt };
  }

  async findAll(): Promise<Todo[]> {
    const stmt = this.db.prepare('SELECT * FROM todos ORDER BY created_at');
    const rows = stmt.all() as unknown as TodoRow[];
    return rows.map((row) => this.rowToTodo(row));
  }

  async findById(id: string): Promise<Todo | null> {
    const stmt = this.db.prepare('SELECT * FROM todos WHERE id = ?');
    const row = stmt.get(id) as TodoRow | undefined;
    return row ? this.rowToTodo(row) : null;
  }

  async update(id: string, data: TodoUpdate): Promise<Todo | null> {
    const existing = await this.findById(id);
    if (!existing) {
      return null;
    }

    const fields: string[] = [];
    const values: (string | number)[] = [];

    if (data.title !== undefined) {
      fields.push('title = ?');
      values.push(data.title);
    }
    if (data.completed !== undefined) {
      fields.push('completed = ?');
      values.push(data.completed ? 1 : 0);
    }

    if (fields.length > 0) {
      values.push(id);
      const stmt = this.db.prepare(
        `UPDATE todos SET ${fields.join(', ')} WHERE id = ?`
      );
      stmt.run(...values);
    }

    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const stmt = this.db.prepare('DELETE FROM todos WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  async reset(): Promise<void> {
    this.db.exec('DELETE FROM todo_tags');
    this.db.exec('DELETE FROM tags');
    this.db.exec('DELETE FROM todos');
  }

  async close(): Promise<void> {
    this.db.close();
  }

  // タグ関連メソッド
  async createTag(name: string): Promise<Tag> {
    const id = crypto.randomUUID();
    const stmt = this.db.prepare('INSERT INTO tags (id, name) VALUES (?, ?)');
    stmt.run(id, name);
    return { id, name };
  }

  async findAllTags(): Promise<Tag[]> {
    const stmt = this.db.prepare('SELECT * FROM tags ORDER BY name');
    const rows = stmt.all() as unknown as TagRow[];
    return rows.map((row) => ({ id: row.id, name: row.name }));
  }

  async findTagByName(name: string): Promise<Tag | null> {
    const stmt = this.db.prepare('SELECT * FROM tags WHERE name = ?');
    const row = stmt.get(name) as TagRow | undefined;
    return row ? { id: row.id, name: row.name } : null;
  }

  async deleteTag(id: string): Promise<boolean> {
    this.db.exec(`DELETE FROM todo_tags WHERE tag_id = '${id}'`);
    const stmt = this.db.prepare('DELETE FROM tags WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  async addTagToTodo(todoId: string, tagId: string): Promise<boolean> {
    try {
      const stmt = this.db.prepare(
        'INSERT OR IGNORE INTO todo_tags (todo_id, tag_id) VALUES (?, ?)'
      );
      stmt.run(todoId, tagId);
      return true;
    } catch {
      return false;
    }
  }

  async removeTagFromTodo(todoId: string, tagId: string): Promise<boolean> {
    const stmt = this.db.prepare(
      'DELETE FROM todo_tags WHERE todo_id = ? AND tag_id = ?'
    );
    const result = stmt.run(todoId, tagId);
    return result.changes > 0;
  }

  private async getTagsForTodo(todoId: string): Promise<Tag[]> {
    const stmt = this.db.prepare(`
      SELECT t.id, t.name FROM tags t
      JOIN todo_tags tt ON t.id = tt.tag_id
      WHERE tt.todo_id = ?
      ORDER BY t.name
    `);
    const rows = stmt.all(todoId) as unknown as TagRow[];
    return rows.map((row) => ({ id: row.id, name: row.name }));
  }

  async findTodoWithTags(id: string): Promise<TodoWithTags | null> {
    const todo = await this.findById(id);
    if (!todo) return null;
    const tags = await this.getTagsForTodo(id);
    return { ...todo, tags };
  }

  async findAllWithTags(): Promise<TodoWithTags[]> {
    const todos = await this.findAll();
    const result: TodoWithTags[] = [];
    for (const todo of todos) {
      const tags = await this.getTagsForTodo(todo.id);
      result.push({ ...todo, tags });
    }
    return result;
  }

  async findByTag(tagName: string): Promise<TodoWithTags[]> {
    const stmt = this.db.prepare(`
      SELECT DISTINCT todos.* FROM todos
      JOIN todo_tags ON todos.id = todo_tags.todo_id
      JOIN tags ON todo_tags.tag_id = tags.id
      WHERE tags.name = ?
      ORDER BY todos.created_at
    `);
    const rows = stmt.all(tagName) as unknown as TodoRow[];
    const result: TodoWithTags[] = [];
    for (const row of rows) {
      const todo = this.rowToTodo(row);
      const tags = await this.getTagsForTodo(todo.id);
      result.push({ ...todo, tags });
    }
    return result;
  }
}

// Prisma実装
export class PrismaRepository implements TodoRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(data: TodoCreate): Promise<Todo> {
    return this.prisma.todo.create({
      data: { title: data.title },
    });
  }

  async findAll(): Promise<Todo[]> {
    return this.prisma.todo.findMany({
      orderBy: { createdAt: 'asc' },
    });
  }

  async findById(id: string): Promise<Todo | null> {
    return this.prisma.todo.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: TodoUpdate): Promise<Todo | null> {
    try {
      return await this.prisma.todo.update({
        where: { id },
        data,
      });
    } catch {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.todo.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  async reset(): Promise<void> {
    await this.prisma.todo.deleteMany();
  }

  async close(): Promise<void> {
    await this.prisma.$disconnect();
  }

  // タグ関連メソッド（Prismaスキーマ更新後に実装）
  async createTag(_name: string): Promise<Tag> {
    throw new Error('Tag operations require Prisma schema update');
  }

  async findAllTags(): Promise<Tag[]> {
    throw new Error('Tag operations require Prisma schema update');
  }

  async findTagByName(_name: string): Promise<Tag | null> {
    throw new Error('Tag operations require Prisma schema update');
  }

  async deleteTag(_id: string): Promise<boolean> {
    throw new Error('Tag operations require Prisma schema update');
  }

  async addTagToTodo(_todoId: string, _tagId: string): Promise<boolean> {
    throw new Error('Tag operations require Prisma schema update');
  }

  async removeTagFromTodo(_todoId: string, _tagId: string): Promise<boolean> {
    throw new Error('Tag operations require Prisma schema update');
  }

  async findTodoWithTags(_id: string): Promise<TodoWithTags | null> {
    throw new Error('Tag operations require Prisma schema update');
  }

  async findAllWithTags(): Promise<TodoWithTags[]> {
    throw new Error('Tag operations require Prisma schema update');
  }

  async findByTag(_tagName: string): Promise<TodoWithTags[]> {
    throw new Error('Tag operations require Prisma schema update');
  }
}

// ファクトリ関数
export type RepositoryType = 'sqlite' | 'prisma';

export function createRepository(
  type: 'sqlite',
  options?: { filename?: string }
): TodoRepository;
export function createRepository(
  type: 'prisma',
  options: { prisma: PrismaClient }
): TodoRepository;
export function createRepository(
  type: RepositoryType,
  options?: { filename?: string; prisma?: PrismaClient }
): TodoRepository {
  switch (type) {
    case 'sqlite':
      return new SqliteRepository(options?.filename);
    case 'prisma':
      if (!options?.prisma) {
        throw new Error('PrismaClient is required for prisma repository');
      }
      return new PrismaRepository(options.prisma);
    default:
      throw new Error(`Unknown repository type: ${type}`);
  }
}
