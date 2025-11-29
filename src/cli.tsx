import { parseArgs } from 'node:util';
import { render } from 'ink';
import { SqliteRepository } from './repository.js';
import { App } from './components/App.js';
import { REPLApp } from './components/REPLApp.js';

const DB_FILE = process.env['TODO_DB'] || 'todos.db';
const DB_TYPE = process.env['DB_TYPE'] || 'sqlite';

function createRepository() {
  switch (DB_TYPE) {
    case 'sqlite':
      return new SqliteRepository(DB_FILE);
    case 'prisma':
      throw new Error(
        'Prisma repository requires PrismaClient configuration. ' +
          'Use DB_TYPE=sqlite for now.'
      );
    default:
      throw new Error(`Unknown DB_TYPE: ${DB_TYPE}`);
  }
}

async function main(): Promise<void> {
  const { positionals } = parseArgs({
    allowPositionals: true,
    strict: false,
  });

  const [command, ...args] = positionals;
  const repo = createRepository();

  // コマンドが指定されていない場合はREPLモード
  if (!command) {
    return new Promise((resolve) => {
      const { waitUntilExit } = render(
        <REPLApp
          repo={repo}
          onExit={() => {
            resolve();
          }}
        />,
        { exitOnCtrlC: false }  // Ctrl+Cで終了しない（Ctrl+D/exit/quitで終了）
      );

      waitUntilExit().then(resolve);
    });
  }

  // コマンドが指定されている場合は単発実行モード（テスト互換性のため）
  return new Promise((resolve, reject) => {
    const { unmount, waitUntilExit } = render(
      <App
        repo={repo}
        command={command}
        args={args}
        onExit={async (code) => {
          await repo.close();
          unmount();
          if (code !== 0) {
            process.exitCode = code;
          }
        }}
      />
    );

    waitUntilExit()
      .then(resolve)
      .catch(reject);
  });
}

export { main };
