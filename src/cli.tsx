import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { render } from 'ink';
import { AdapterRegistry, PdfFileAdapter } from './adapters/index.js';
import { FileSelectorApp } from './components/FileSelectorApp.js';

/**
 * 引数で指定されたファイルを直接変換する
 */
async function convertFile(filePath: string): Promise<void> {
  // 絶対パスに変換
  const absolutePath = resolve(filePath);

  // ファイル存在チェック
  if (!existsSync(absolutePath)) {
    console.error(`エラー: ファイルが見つかりません: ${absolutePath}`);
    process.exit(1);
  }

  // ディレクトリチェック
  const stat = statSync(absolutePath);
  if (stat.isDirectory()) {
    console.error(`エラー: ディレクトリは指定できません: ${absolutePath}`);
    process.exit(1);
  }

  // アダプターレジストリを初期化
  const registry = new AdapterRegistry();
  registry.register(new PdfFileAdapter());

  // 対応するアダプターを検索
  const adapter = registry.findAdapter(absolutePath);

  if (!adapter) {
    console.error(`エラー: 対応していないファイル形式です: ${absolutePath}`);
    process.exit(1);
  }

  console.log(`変換中: ${absolutePath}`);

  try {
    const result = await adapter.process(absolutePath);

    if (result.success) {
      for (const msg of result.messages) {
        console.log(msg.text);
      }
    } else {
      console.error(`エラー: ${result.error}`);
      process.exit(1);
    }
  } catch (error) {
    console.error(
      `エラー: ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exit(1);
  }
}

/**
 * ファイルセレクターを表示する
 */
async function showFileSelector(): Promise<void> {
  return new Promise((resolve) => {
    const { waitUntilExit } = render(
      <FileSelectorApp onExit={() => resolve()} />,
      { exitOnCtrlC: true },
    );

    waitUntilExit().then(resolve);
  });
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length > 0) {
    // 引数がある場合はファイルを直接変換
    await convertFile(args[0]);
  } else {
    // 引数がない場合はファイルセレクターを表示
    await showFileSelector();
  }
}

export { main };
