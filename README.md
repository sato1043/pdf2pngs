# testPDFjs

TypeScript + Vitest のサンプルプロジェクト

**必要環境**

- **Node.js** >= 22.5.0


## 使用例

### REPLモード（対話型）

引数なしで起動すると対話型モードになります：

```bash
$ npm install
$ npm start

Todo CLI - Type 'help' for commands, 'exit' to quit

todo> add 牛乳を買う
追加しました: 牛乳を買う
todo> add メールを送る
追加しました: メールを送る
todo> list
Todo一覧:
1. [ ] 牛乳を買う (2025/11/29)
2. [ ] メールを送る (2025/11/29)
todo> done 1
完了にしました: 牛乳を買う
todo> list
Todo一覧:
1. [✓] 牛乳を買う (2025/11/29)
2. [ ] メールを送る (2025/11/29)
todo> exit
```

| REPLコマンド            | 説明             |
|------------------------|------------------|
| `help`                 | ヘルプを表示      |
| `clear`                | 画面をクリア      |
| `exit` / `quit`        | 終了             |
| `!<shell command>`     | シェルコマンド実行 |

**キーバインド（Emacs風）**

通常モード（`todo>`）とシェルモード（`!>`）の両方で使用可能：

| キー            | 説明               |
|----------------|--------------------|
| `↑` / `Ctrl+P` | 履歴を遡る         |
| `↓` / `Ctrl+N` | 履歴を進む         |
| `Ctrl+A`       | 行頭へ             |
| `Ctrl+E`       | 行末へ             |
| `←` / `Ctrl+B` | 1文字戻る          |
| `→` / `Ctrl+F` | 1文字進む          |
| `Ctrl+U`       | 行を削除           |
| `Ctrl+K`       | カーソル以降を削除  |
| `Ctrl+W`       | 単語を削除         |
| `Ctrl+D` ×2    | 終了（1秒以内に2回押し） |


### コマンドラインモード（単発実行）

引数を指定すると単発実行モードになります：

```bash
$ npm start -- add "牛乳を買う"
追加しました: 牛乳を買う

$ npm start -- add "メールを送る"
追加しました: メールを送る

$ npm start -- list
Todo一覧:
1. [ ] 牛乳を買う (2025/11/29)
2. [ ] メールを送る (2025/11/29)

$ npm start -- done 1
完了にしました: 牛乳を買う

$ npm start -- list
Todo一覧:
1. [✓] 牛乳を買う (2025/11/29)
2. [ ] メールを送る (2025/11/29)

$ npm start -- delete 1
削除しました: 牛乳を買う

$ npm start -- list
Todo一覧:
1. [ ] メールを送る (2025/11/29)

```

| Todoコマンド          | 説明              |
|-------------------|-----------------|
| `add <title>`     | Todoを追加         |
| `list`            | Todo一覧を表示       |
| `done <number>`   | 指定番号のTodoを完了にする |
| `delete <number>` | 指定番号のTodoを削除    |
| `status`          | 統計を表示（完了率）     |
| `export`          | マークダウン形式でエクスポート |
| `search <query>`  | タイトル・タグで検索     |


**統計・エクスポート使用例**

```bash
$ npm start -- status
統計:
  総数:     3
  完了:     1
  未完了:   2
  完了率:   33%

$ npm start -- export
# Todo List

> 完了率: 33% (1/3)

- [x] 牛乳を買う _(2025/11/29)_
- [ ] メールを送る _(2025/11/29)_
- [ ] 掃除する _(2025/11/29)_
```


**タグ機能使用例**

```bash

$ npm start -- tag add 仕事
タグを作成しました: 仕事

$ npm start -- tag set 1 仕事,緊急
タグを設定しました: 仕事, 緊急 → タスク1

$ npm start -- tag show 仕事
タグ "仕事" のTodo (1件):
1. [ ] タスク1 [仕事, 緊急] (2025/11/29)

$ npm start -- search 仕事
検索結果 (1件):
1. [ ] タスク1 [仕事, 緊急] (2025/11/29)

```

| タグコマンド                | 説明                 |
|-----------------------|--------------------|
| tag list              | タグ一覧を表示            |
| tag add <name>        | タグを作成              |
| tag delete <name>     | タグを削除              |
| tag set <num> <tags>  | Todoにタグを設定（カンマ区切り） |
| tag unset <num> <tag> | Todoからタグを解除        |
| tag show <name>       | タグでTodoを絞り込み       |


## 構成

| npmスクリプト             | 説明                               |
|----------------------|----------------------------------|
| `npm run start`      | tsxランタイムで実行                      |
| `npm run dev`        | デバッガ接続可能モードで実行                   |
| `npm run dev:watch`  | ホットリロード + デバッガ接続可能モードで実行         |
| `npm run typecheck`  | 型チェックのみ実行（出力なし）                  |
| `npm test`           | Vitest でテスト実行（ウォッチモード）           |
| `npm run test:run`   | Vitest でテスト単発実行                  |
| `npm run dist:clean` | dist ディレクトリを削除                   |
| `npm run dist:build` | clean → typecheck → tsc の順で本番ビルド |
| `npm run dist:start` | コンパイル済み JavaScript を実行           |


**技術構成**

- **TypeScript** - 型安全な JavaScript
- **React Ink** - CLI向けReactレンダラー
- **Vitest** - 高速なテストフレームワーク
- **tsx** - TypeScript 直接実行ツール（esbuild ベース）
- **ESModule** - ネイティブ ESM（`"type": "module"`）
- **Prisma** - ORマッパー
- **SQLite** - ローカルファイルデータベース


**ファイル構成**

```
.
├── src/
│   ├── index.ts           # エントリーポイント
│   ├── cli.tsx            # CLI層（React Ink）
│   ├── db.ts              # DB層 (node:sqlite)
│   ├── repository.ts      # リポジトリ層（抽象化）
│   ├── components/        # React Ink コンポーネント
│   │   ├── App.tsx        # 単発実行モード
│   │   ├── REPLApp.tsx    # REPLモード（対話型）
│   │   ├── TodoList.tsx   # Todo一覧表示
│   │   ├── Status.tsx     # 統計表示
│   │   ├── Export.tsx     # マークダウンエクスポート
│   │   ├── TagList.tsx    # タグ一覧表示
│   │   ├── Message.tsx    # メッセージ表示
│   │   ├── Usage.tsx      # ヘルプ表示
│   │   └── index.tsx      # エクスポート
│   ├── generated/prisma/  # Prisma Client（自動生成）
│   └── __tests__/
│       ├── cli.test.ts    # CLI層テスト
│       ├── db.test.ts     # DB層テスト
│       └── repository.test.ts  # リポジトリ層テスト
├── prisma/
│   ├── schema.prisma      # Prismaスキーマ
│   └── migrations/        # マイグレーション
├── dist/               # コンパイル出力（npm run dist:build で生成）
├── package.json
├── tsconfig.base.json  # 共通設定（継承元）
├── tsconfig.json       # 開発用設定
└── tsconfig.prod.json  # 本番用設定
```


## 開発フロー


### 開発時（ビルド不要）

```bash
npm run dev
```

tsx を使用して TypeScript を直接実行します。ホットリロード対応で、ファイルを保存すると自動的に再実行されます。デバッガ接続も可能です。

**Chrome DevTools でデバッグ:**

1. `npm run dev` を実行
2. Chrome で `chrome://inspect` を開く
3. 「Remote Target」に表示されるターゲットの「inspect」をクリック

**VS Code でデバッグ:**

1. `npm run dev` を実行
2. VS Code の「Run and Debug」(Ctrl+Shift+D) を開く
3. 「Attach to Node Process」を選択して接続


### 開発時テスト

```bash
npm test
```

Vitest でユニットテストを実行します。ウォッチモードで起動し、ファイル変更を検知して自動再実行します。

単発実行する場合：

```bash
npm test -- --run
```

### 本番ビルド（ビルド必要）

```bash
npm run dist:build
```

TypeScript を JavaScript にコンパイルしてから実行します。

ビルドは以下の順序で実行されます：

1. `dist:clean` - dist ディレクトリを削除
2. `typecheck` - 型チェック（エラーがあれば停止）
3. `tsc` - JavaScript へコンパイル

**出力ファイル (dist/):**

```
dist/
├── index.js          # コンパイル済み JS
├── index.js.map      # ソースマップ（別ファイル）
├── index.d.ts        # 型定義
├── index.d.ts.map    # 型定義マップ
└── ...
```


## TypeScript 設定

開発用と本番用で tsconfig を分離しています。

| ファイル                 | 用途          | 使用タイミング              |
|----------------------|-------------|----------------------|
| `tsconfig.base.json` | 共通設定（継承元）   | -                    |
| `tsconfig.json`      | 開発用（緩いチェック） | `npm run dev`        |
| `tsconfig.prod.json` | 本番用（厳密チェック） | `npm run dist:build` |

**設定の違い:**

| オプション                        | 開発用 | 本番用 |
|------------------------------|:---:|:---:|
| `noUnusedLocals`             |  -  |  ✓  |
| `noUnusedParameters`         |  -  |  ✓  |
| `noImplicitReturns`          |  -  |  ✓  |
| `noFallthroughCasesInSwitch` |  -  |  ✓  |
| `noUncheckedIndexedAccess`   |  -  |  ✓  |
| `exactOptionalPropertyTypes` |  -  |  ✓  |
| `declaration`                |  -  |  ✓  |
| `declarationMap`             |  -  |  ✓  |
| `removeComments`             |  -  |  ✓  |

開発時は未使用変数などのエラーを抑制し、素早く開発できます。本番ビルド時は厳密なチェックを行い、品質を確保します。

**厳密な型チェック設定:**

| オプション                        | 効果                        |
|------------------------------|---------------------------|
| `noUnusedLocals`             | 未使用のローカル変数をエラー            |
| `noUnusedParameters`         | 未使用のパラメータをエラー             |
| `noImplicitReturns`          | 全パスで return を強制           |
| `noFallthroughCasesInSwitch` | switch の fall-through を禁止 |
| `noUncheckedIndexedAccess`   | 配列アクセスに undefined を含める    |
| `exactOptionalPropertyTypes` | optional プロパティを厳密にチェック    |


## リポジトリパターン

データアクセスを抽象化するリポジトリパターンを実装しています。

### インターフェース

```typescript
interface TodoRepository {
  // Todo CRUD
  create(data: TodoCreate): Promise<Todo>;
  findAll(): Promise<Todo[]>;
  findById(id: string): Promise<Todo | null>;
  update(id: string, data: TodoUpdate): Promise<Todo | null>;
  delete(id: string): Promise<boolean>;
  reset(): Promise<void>;
  close(): Promise<void>;

  // タグ操作
  createTag(name: string): Promise<Tag>;
  findAllTags(): Promise<Tag[]>;
  findTagByName(name: string): Promise<Tag | null>;
  deleteTag(id: string): Promise<boolean>;

  // Todo-タグ関連
  addTagToTodo(todoId: string, tagId: string): Promise<boolean>;
  removeTagFromTodo(todoId: string, tagId: string): Promise<boolean>;
  findTodoWithTags(id: string): Promise<TodoWithTags | null>;
  findAllWithTags(): Promise<TodoWithTags[]>;
  findByTag(tagName: string): Promise<TodoWithTags[]>;
}
```

### 実装

| クラス                | 説明                          |
|--------------------|-----------------------------|
| `SqliteRepository` | node:sqlite を使用（軽量・組み込み）    |
| `PrismaRepository` | Prisma Client を使用（型安全・機能豊富） |

### 使用例

```typescript
import { SqliteRepository, PrismaRepository, createRepository } from './repository.js';

// SQLite（ファクトリ関数）
const repo = createRepository('sqlite', { filename: 'todos.db' });

// SQLite（直接インスタンス化）
const sqliteRepo = new SqliteRepository(':memory:');

// Prisma（要PrismaClient注入）
import { PrismaClient } from './generated/prisma/client.js';
const prisma = new PrismaClient({ /* options */ });
const prismaRepo = createRepository('prisma', { prisma });

// CRUD操作（両実装で同じインターフェース）
const todo = await repo.create({ title: '買い物' });
const todos = await repo.findAll();
const found = await repo.findById(todo.id);
await repo.update(todo.id, { completed: true });
await repo.delete(todo.id);
await repo.close();
```


## Prisma

### セットアップ

```bash
# スキーマからクライアント生成
npx prisma generate

# マイグレーション作成・実行
npx prisma migrate dev --name <name>

# DBをブラウザで確認
npx prisma studio
```

### スキーマ

```prisma
// prisma/schema.prisma
model Todo {
  id        String   @id @default(uuid())
  title     String
  completed Boolean  @default(false)
  createdAt DateTime @default(now()) @map("created_at")

  @@map("todos")
}
```

### 環境変数

```bash
# .env
DATABASE_URL="file:./dev.db"
```


## タグ機能

### データ構造（多対多リレーション）

```
  todos ←──┐
           │ todo_tags (中間テーブル)
  tags  ←──┘
```

### 検索機能の拡張

search コマンドがタイトルとタグの両方で検索できる


## React Ink アーキテクチャ

CLIはReact Inkで実装されており、Reactコンポーネントとしてターミナル出力をレンダリングします。

### 動作モード

| モード     | 起動方法                 | コンポーネント     | 説明              |
|---------|----------------------|-------------|-----------------|
| REPLモード | `npm start`          | REPLApp.tsx | 対話型。コマンド履歴、継続入力 |
| 単発実行モード | `npm start -- <cmd>` | App.tsx     | 1コマンド実行後終了      |

### コンポーネント構成

```
cli.tsx (エントリーポイント)
├── REPLApp.tsx     # REPLモード（対話型）
│   ├── useInput    # キーボード入力処理（Emacs風キーバインド）
│   └── 共通コンポーネント...
└── App.tsx         # 単発実行モード
    └── 共通コンポーネント...

共通コンポーネント:
├── TodoList.tsx    # Todo一覧（タグ表示対応）
├── Status.tsx      # 統計表示
├── Export.tsx      # マークダウン出力
├── TagList.tsx     # タグ一覧
├── Message.tsx     # 成功/エラーメッセージ
└── Usage.tsx       # ヘルプ表示
```

### REPLモードの状態管理

REPLAppコンポーネントが入力・出力履歴・コマンド履歴・カーソル位置を管理：

```typescript
// 入力テキストとカーソル位置
const [input, setInput] = useState('');
const [cursorPos, setCursorPos] = useState(0);

// 出力履歴（画面に表示される内容）
const [history, setHistory] = useState<OutputItem[]>([]);

// コマンド履歴（↑/↓キーでナビゲーション）
const [commandHistory, setCommandHistory] = useState<string[]>([]);
```

カスタム `useInput` フックでキーボード入力を処理し、Emacs風キーバインドを実現しています。

### メリット

- **宣言的UI**: Reactの宣言的なアプローチでCLI出力を構築
- **コンポーネント再利用**: 表示ロジックを再利用可能なコンポーネントに分離
- **型安全**: TypeScriptとの親和性が高い
- **テスタビリティ**: コンポーネント単位でのテストが容易
- **対話型体験**: REPLモードでシームレスな操作が可能


__END__
