import { parseArgs } from 'node:util';
import { Database, type Todo } from './db.js';

const DB_FILE = process.env['TODO_DB'] || 'todos.db';

function showUsage(): void {
  console.log(`Usage:
  node cli.js add <title>    - Todoを追加
  node cli.js list           - Todo一覧を表示
  node cli.js done <number>  - Todoを完了にする
  node cli.js delete <number> - Todoを削除する`);
}

function formatTodo(todo: Todo, index: number): string {
  const status = todo.completed ? '✓' : ' ';
  const date = todo.createdAt.toLocaleDateString('ja-JP');
  return `${index + 1}. [${status}] ${todo.title} (${date})`;
}

function main(): void {
  const { positionals } = parseArgs({
    allowPositionals: true,
    strict: false,
  });

  const [command, ...args] = positionals;

  if (!command) {
    showUsage();
    process.exit(1);
  }

  const db = new Database(DB_FILE);

  try {
    switch (command) {
      case 'add': {
        const title = args.join(' ');
        if (!title) {
          console.error('Error: タイトルを指定してください');
          process.exit(1);
        }
        const todo = db.create(title);
        console.log(`追加しました: ${todo.title}`);
        break;
      }

      case 'list': {
        const todos = db.getAll();
        if (todos.length === 0) {
          console.log('Todoはありません');
        } else {
          console.log('Todo一覧:');
          todos.forEach((todo, i) => console.log(formatTodo(todo, i)));
        }
        break;
      }

      case 'done': {
        const num = parseInt(args[0], 10);
        if (isNaN(num) || num < 1) {
          console.error('Error: 有効な番号を指定してください');
          process.exit(1);
        }
        const todos = db.getAll();
        const todo = todos[num - 1];
        if (!todo) {
          console.error(`Error: Todo #${num} は存在しません`);
          process.exit(1);
        }
        db.update(todo.id, { completed: true });
        console.log(`完了にしました: ${todo.title}`);
        break;
      }

      case 'delete': {
        const num = parseInt(args[0], 10);
        if (isNaN(num) || num < 1) {
          console.error('Error: 有効な番号を指定してください');
          process.exit(1);
        }
        const todos = db.getAll();
        const todo = todos[num - 1];
        if (!todo) {
          console.error(`Error: Todo #${num} は存在しません`);
          process.exit(1);
        }
        db.delete(todo.id);
        console.log(`削除しました: ${todo.title}`);
        break;
      }

      default:
        console.error(`Error: 不明なコマンド: ${command}`);
        showUsage();
        process.exit(1);
    }
  } finally {
    db.close();
  }
}

main();
