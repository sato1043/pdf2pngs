import { DatabaseSync } from 'node:sqlite';
import { PrismaClient } from './generated/prisma/client.js';

// 共通の型定義
export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
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
}

// SQLite実装
interface TodoRow {
  id: string;
  title: string;
  completed: number;
  created_at: string;
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
    this.db.exec('DELETE FROM todos');
  }

  async close(): Promise<void> {
    this.db.close();
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
