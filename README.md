# testPDFjs

TypeScript + Vitest のサンプルプロジェクト

**必要環境**

- **Node.js** >= 22.5.0


## 実行例

```bash

$ npm install
$ npm run build

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


## コマンド

| コマンド                           | 説明              |
|--------------------------------|-----------------|
| `npm start -- add <title>`     | Todoを追加         |
| `npm start -- list`            | Todo一覧を表示       |
| `npm start -- done <number>`   | 指定番号のTodoを完了にする |
| `npm start -- delete <number>` | 指定番号のTodoを削除    |


## npmスクリプト

| コマンド                 | 説明                               |
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


## 技術構成

- **TypeScript** - 型安全な JavaScript
- **Vitest** - 高速なテストフレームワーク
- **tsx** - TypeScript 直接実行ツール（esbuild ベース）
- **ESModule** - ネイティブ ESM（`"type": "module"`）
- **Prisma** - ORマッパー
- **SQLite** - ローカルファイルデータベース


## ファイル構成

```
.
├── src/
│   ├── index.ts           # エントリーポイント
│   ├── cli.ts             # CLI層
│   ├── db.ts              # DB層 (node:sqlite)
│   ├── repository.ts      # リポジトリ層（抽象化）
│   ├── generated/prisma/  # Prisma Client（自動生成）
│   └── __tests__/
│       ├── cli.test.ts    # CLI層テスト
│       └── db.test.ts     # DB層テスト
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

| ファイル | 用途 | 使用タイミング |
|---------|------|--------------|
| `tsconfig.base.json` | 共通設定（継承元） | - |
| `tsconfig.json` | 開発用（緩いチェック） | `npm run dev` |
| `tsconfig.prod.json` | 本番用（厳密チェック） | `npm run dist:build` |

**設定の違い:**

| オプション | 開発用 | 本番用 |
|-----------|:-----:|:-----:|
| `noUnusedLocals` | - | ✓ |
| `noUnusedParameters` | - | ✓ |
| `noImplicitReturns` | - | ✓ |
| `noFallthroughCasesInSwitch` | - | ✓ |
| `noUncheckedIndexedAccess` | - | ✓ |
| `exactOptionalPropertyTypes` | - | ✓ |
| `declaration` | - | ✓ |
| `declarationMap` | - | ✓ |
| `removeComments` | - | ✓ |

開発時は未使用変数などのエラーを抑制し、素早く開発できます。本番ビルド時は厳密なチェックを行い、品質を確保します。

**厳密な型チェック設定:**

| オプション                     | 効果                              |
|----------------------------|-----------------------------------|
| `noUnusedLocals`           | 未使用のローカル変数をエラー                  |
| `noUnusedParameters`       | 未使用のパラメータをエラー                   |
| `noImplicitReturns`        | 全パスで return を強制                 |
| `noFallthroughCasesInSwitch` | switch の fall-through を禁止      |
| `noUncheckedIndexedAccess` | 配列アクセスに undefined を含める         |
| `exactOptionalPropertyTypes` | optional プロパティを厳密にチェック         |


## リポジトリパターン

データアクセスを抽象化するリポジトリパターンを実装しています。

### インターフェース

```typescript
interface TodoRepository {
  create(data: TodoCreate): Promise<Todo>;
  findAll(): Promise<Todo[]>;
  findById(id: string): Promise<Todo | null>;
  update(id: string, data: TodoUpdate): Promise<Todo | null>;
  delete(id: string): Promise<boolean>;
  reset(): Promise<void>;
  close(): Promise<void>;
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


