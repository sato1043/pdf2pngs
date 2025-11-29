import { parseArgs } from 'node:util';
import {
  type TodoRepository,
  type Todo,
  type TodoWithTags,
  SqliteRepository,
} from './repository.js';

const DB_FILE = process.env['TODO_DB'] || 'todos.db';
const DB_TYPE = process.env['DB_TYPE'] || 'sqlite';

function showUsage(): void {
  console.log(`Usage:
  node cli.js add <title>           - Todoを追加
  node cli.js list                  - Todo一覧を表示
  node cli.js done <number>         - Todoを完了にする
  node cli.js delete <number>       - Todoを削除する
  node cli.js status                - 統計を表示
  node cli.js export                - マークダウン形式でエクスポート
  node cli.js search <query>        - タイトルで検索

Tag commands:
  node cli.js tag list              - タグ一覧を表示
  node cli.js tag add <name>        - タグを作成
  node cli.js tag delete <name>     - タグを削除
  node cli.js tag set <num> <tags>  - Todoにタグを設定（カンマ区切り）
  node cli.js tag unset <num> <tag> - Todoからタグを削除
  node cli.js tag show <name>       - タグでTodoを絞り込み

Environment:
  DB_TYPE  - リポジトリタイプ (sqlite|prisma) [default: sqlite]
  TODO_DB  - SQLiteデータベースファイル [default: todos.db]`);
}

function formatTodo(todo: Todo, index: number): string {
  const status = todo.completed ? '✓' : ' ';
  const date = todo.createdAt.toLocaleDateString('ja-JP');
  return `${index + 1}. [${status}] ${todo.title} (${date})`;
}

function formatTodoWithTags(todo: TodoWithTags, index: number): string {
  const status = todo.completed ? '✓' : ' ';
  const date = todo.createdAt.toLocaleDateString('ja-JP');
  const tags = todo.tags.length > 0 ? ` [${todo.tags.map((t) => t.name).join(', ')}]` : '';
  return `${index + 1}. [${status}] ${todo.title}${tags} (${date})`;
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

    case 'status': {
      const todos = await repo.findAll();
      const total = todos.length;
      const completed = todos.filter((t) => t.completed).length;
      const pending = total - completed;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

      console.log('統計:');
      console.log(`  総数:     ${total}`);
      console.log(`  完了:     ${completed}`);
      console.log(`  未完了:   ${pending}`);
      console.log(`  完了率:   ${rate}%`);
      break;
    }

    case 'export': {
      const todos = await repo.findAll();
      const total = todos.length;
      const completed = todos.filter((t) => t.completed).length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

      console.log('# Todo List');
      console.log('');
      console.log(`> 完了率: ${rate}% (${completed}/${total})`);
      console.log('');

      if (todos.length === 0) {
        console.log('_Todoはありません_');
      } else {
        for (const todo of todos) {
          const checkbox = todo.completed ? '[x]' : '[ ]';
          const date = todo.createdAt.toLocaleDateString('ja-JP');
          console.log(`- ${checkbox} ${todo.title} _(${date})_`);
        }
      }
      break;
    }

    case 'search': {
      const query = args.join(' ');
      if (!query) {
        console.error('Error: 検索キーワードを指定してください');
        process.exit(1);
      }
      const todos = await repo.findAllWithTags();
      const queryLower = query.toLowerCase();
      const results = todos.filter(
        (t) =>
          t.title.toLowerCase().includes(queryLower) ||
          t.tags.some((tag) => tag.name.toLowerCase().includes(queryLower))
      );

      if (results.length === 0) {
        console.log(`"${query}" に一致するTodoはありません`);
      } else {
        console.log(`検索結果 (${results.length}件):`);
        results.forEach((todo, i) => console.log(formatTodoWithTags(todo, i)));
      }
      break;
    }

    case 'tag': {
      const [subCommand, ...subArgs] = args;
      if (!subCommand) {
        console.error('Error: tagサブコマンドを指定してください');
        showUsage();
        process.exit(1);
      }

      switch (subCommand) {
        case 'list': {
          const tags = await repo.findAllTags();
          if (tags.length === 0) {
            console.log('タグはありません');
          } else {
            console.log('タグ一覧:');
            tags.forEach((tag) => console.log(`  - ${tag.name}`));
          }
          break;
        }

        case 'add': {
          const name = subArgs.join(' ');
          if (!name) {
            console.error('Error: タグ名を指定してください');
            process.exit(1);
          }
          const existing = await repo.findTagByName(name);
          if (existing) {
            console.error(`Error: タグ "${name}" は既に存在します`);
            process.exit(1);
          }
          await repo.createTag(name);
          console.log(`タグを作成しました: ${name}`);
          break;
        }

        case 'delete': {
          const name = subArgs.join(' ');
          if (!name) {
            console.error('Error: タグ名を指定してください');
            process.exit(1);
          }
          const tag = await repo.findTagByName(name);
          if (!tag) {
            console.error(`Error: タグ "${name}" は存在しません`);
            process.exit(1);
          }
          await repo.deleteTag(tag.id);
          console.log(`タグを削除しました: ${name}`);
          break;
        }

        case 'set': {
          const num = parseInt(subArgs[0] ?? '', 10);
          if (isNaN(num) || num < 1) {
            console.error('Error: 有効な番号を指定してください');
            process.exit(1);
          }
          const tagNames = subArgs.slice(1).join(' ').split(',').map((s) => s.trim()).filter(Boolean);
          if (tagNames.length === 0) {
            console.error('Error: タグ名を指定してください（カンマ区切り）');
            process.exit(1);
          }
          const todos = await repo.findAll();
          const todo = todos[num - 1];
          if (!todo) {
            console.error(`Error: Todo #${num} は存在しません`);
            process.exit(1);
          }
          for (const tagName of tagNames) {
            let tag = await repo.findTagByName(tagName);
            if (!tag) {
              tag = await repo.createTag(tagName);
            }
            await repo.addTagToTodo(todo.id, tag.id);
          }
          console.log(`タグを設定しました: ${tagNames.join(', ')} → ${todo.title}`);
          break;
        }

        case 'unset': {
          const num = parseInt(subArgs[0] ?? '', 10);
          if (isNaN(num) || num < 1) {
            console.error('Error: 有効な番号を指定してください');
            process.exit(1);
          }
          const tagName = subArgs.slice(1).join(' ');
          if (!tagName) {
            console.error('Error: タグ名を指定してください');
            process.exit(1);
          }
          const todos = await repo.findAll();
          const todo = todos[num - 1];
          if (!todo) {
            console.error(`Error: Todo #${num} は存在しません`);
            process.exit(1);
          }
          const tag = await repo.findTagByName(tagName);
          if (!tag) {
            console.error(`Error: タグ "${tagName}" は存在しません`);
            process.exit(1);
          }
          await repo.removeTagFromTodo(todo.id, tag.id);
          console.log(`タグを解除しました: ${tagName} ← ${todo.title}`);
          break;
        }

        case 'show': {
          const tagName = subArgs.join(' ');
          if (!tagName) {
            console.error('Error: タグ名を指定してください');
            process.exit(1);
          }
          const tag = await repo.findTagByName(tagName);
          if (!tag) {
            console.error(`Error: タグ "${tagName}" は存在しません`);
            process.exit(1);
          }
          const todos = await repo.findByTag(tagName);
          if (todos.length === 0) {
            console.log(`タグ "${tagName}" のTodoはありません`);
          } else {
            console.log(`タグ "${tagName}" のTodo (${todos.length}件):`);
            todos.forEach((todo, i) => console.log(formatTodoWithTags(todo, i)));
          }
          break;
        }

        default:
          console.error(`Error: 不明なtagサブコマンド: ${subCommand}`);
          showUsage();
          process.exit(1);
      }
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
