import { parseArgs } from 'node:util';
import {
  type TodoRepository,
  type Todo,
  SqliteRepository,
} from './repository.js';

const DB_FILE = process.env['TODO_DB'] || 'todos.db';
const DB_TYPE = process.env['DB_TYPE'] || 'sqlite';

function showUsage(): void {
  console.log(`Usage:
  node cli.js add <title>    - Todoを追加
  node cli.js list           - Todo一覧を表示
  node cli.js done <number>  - Todoを完了にする
  node cli.js delete <number> - Todoを削除する

Environment:
  DB_TYPE  - リポジトリタイプ (sqlite|prisma) [default: sqlite]
  TODO_DB  - SQLiteデータベースファイル [default: todos.db]`);
}

function formatTodo(todo: Todo, index: number): string {
  const status = todo.completed ? '✓' : ' ';
  const date = todo.createdAt.toLocaleDateString('ja-JP');
  return `${index + 1}. [${status}] ${todo.title} (${date})`;
}

function createRepository(): TodoRepository {
  switch (DB_TYPE) {
    case 'sqlite':
      return new SqliteRepository(DB_FILE);
    case 'prisma':
      // Prisma 7ではPrismaClientにadapterが必要
      // 将来の拡張用に準備
      throw new Error(
        'Prisma repository requires PrismaClient configuration. ' +
          'Use DB_TYPE=sqlite for now.'
      );
    default:
      throw new Error(`Unknown DB_TYPE: ${DB_TYPE}`);
  }
}

async function run(repo: TodoRepository, command: string, args: string[]): Promise<void> {
  switch (command) {
    case 'add': {
      const title = args.join(' ');
      if (!title) {
        console.error('Error: タイトルを指定してください');
        process.exit(1);
      }
      const todo = await repo.create({ title });
      console.log(`追加しました: ${todo.title}`);
      break;
    }

    case 'list': {
      const todos = await repo.findAll();
      if (todos.length === 0) {
        console.log('Todoはありません');
      } else {
        console.log('Todo一覧:');
        todos.forEach((todo, i) => console.log(formatTodo(todo, i)));
      }
      break;
    }

    case 'done': {
      const num = parseInt(args[0] ?? '', 10);
      if (isNaN(num) || num < 1) {
        console.error('Error: 有効な番号を指定してください');
        process.exit(1);
      }
      const todos = await repo.findAll();
      const todo = todos[num - 1];
      if (!todo) {
        console.error(`Error: Todo #${num} は存在しません`);
        process.exit(1);
      }
      await repo.update(todo.id, { completed: true });
      console.log(`完了にしました: ${todo.title}`);
      break;
    }

    case 'delete': {
      const num = parseInt(args[0] ?? '', 10);
      if (isNaN(num) || num < 1) {
        console.error('Error: 有効な番号を指定してください');
        process.exit(1);
      }
      const todos = await repo.findAll();
      const todo = todos[num - 1];
      if (!todo) {
        console.error(`Error: Todo #${num} は存在しません`);
        process.exit(1);
      }
      await repo.delete(todo.id);
      console.log(`削除しました: ${todo.title}`);
      break;
    }

    default:
      console.error(`Error: 不明なコマンド: ${command}`);
      showUsage();
      process.exit(1);
  }
}

async function main(): Promise<void> {
  const { positionals } = parseArgs({
    allowPositionals: true,
    strict: false,
  });

  const [command, ...args] = positionals;

  if (!command) {
    showUsage();
    process.exit(1);
  }

  const repo = createRepository();

  try {
    await run(repo, command, args);
  } finally {
    await repo.close();
  }
}

export { main };
