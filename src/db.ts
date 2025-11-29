import { DatabaseSync } from 'node:sqlite';

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

type TodoUpdate = Partial<Pick<Todo, 'title' | 'completed'>>;

interface TodoRow {
  id: string;
  title: string;
  completed: number;
  created_at: string;
}

export class Database {
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

  reset(): void {
    this.db.exec('DELETE FROM todos');
  }

  private rowToTodo(row: TodoRow): Todo {
    return {
      id: row.id,
      title: row.title,
      completed: row.completed === 1,
      createdAt: new Date(row.created_at),
    };
  }

  create(title: string): Todo {
    const id = crypto.randomUUID();
    const createdAt = new Date();
    const stmt = this.db.prepare(
      'INSERT INTO todos (id, title, completed, created_at) VALUES (?, ?, ?, ?)'
    );
    stmt.run(id, title, 0, createdAt.toISOString());
    return { id, title, completed: false, createdAt };
  }

  getAll(): Todo[] {
    const stmt = this.db.prepare('SELECT * FROM todos ORDER BY created_at');
    const rows = stmt.all() as unknown as TodoRow[];
    return rows.map((row) => this.rowToTodo(row));
  }

  getById(id: string): Todo | undefined {
    const stmt = this.db.prepare('SELECT * FROM todos WHERE id = ?');
    const row = stmt.get(id) as TodoRow | undefined;
    return row ? this.rowToTodo(row) : undefined;
  }

  update(id: string, updates: TodoUpdate): Todo | undefined {
    const existing = this.getById(id);
    if (!existing) {
      return undefined;
    }

    const fields: string[] = [];
    const values: (string | number)[] = [];

    if (updates.title !== undefined) {
      fields.push('title = ?');
      values.push(updates.title);
    }
    if (updates.completed !== undefined) {
      fields.push('completed = ?');
      values.push(updates.completed ? 1 : 0);
    }

    if (fields.length > 0) {
      values.push(id);
      const stmt = this.db.prepare(
        `UPDATE todos SET ${fields.join(', ')} WHERE id = ?`
      );
      stmt.run(...values);
    }

    return this.getById(id);
  }

  delete(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM todos WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  close(): void {
    this.db.close();
  }
}

// シングルトンインスタンスと互換関数
let db: Database = new Database();

export function initDb(): void {
  db.reset();
}

export function createTodo(title: string): Todo {
  return db.create(title);
}

export function getAllTodos(): Todo[] {
  return db.getAll();
}

export function getTodoById(id: string): Todo | undefined {
  return db.getById(id);
}

export function updateTodo(id: string, updates: TodoUpdate): Todo | undefined {
  return db.update(id, updates);
}

export function deleteTodo(id: string): boolean {
  return db.delete(id);
}
