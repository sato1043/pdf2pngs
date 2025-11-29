# testPDFjs

TypeScript + Vitest のサンプルプロジェクト


## セットアップ

```bash
npm install
```

**技術スタック**

- **TypeScript** - 型安全な JavaScript
- **Vitest** - 高速なテストフレームワーク
- **tsx** - TypeScript 直接実行ツール（esbuild ベース）
- **ESModule** - ネイティブ ESM（`"type": "module"`）


## npmスクリプト

| コマンド                  | 説明                                         |
|-------------------------|----------------------------------------------|
| `npm run dev`           | ホットリロード + デバッガ接続可能モードで実行                  |
| `npm run typecheck`     | 型チェックのみ実行（出力なし）                           |
| `npm test`              | Vitest でテスト実行（ウォッチモード）                     |
| `npm run test:run`      | Vitest でテスト単発実行                            |
| `npm run dist:clean`    | dist ディレクトリを削除                            |
| `npm run dist:build`    | clean → typecheck → tsc の順で本番ビルド          |
| `npm run dist:start`    | コンパイル済み JavaScript を実行                     |


## ファイル構成

```
.
├── src/
│   ├── index.ts        # エントリーポイント
│   ├── math.ts         # 数学関数モジュール
│   └── math.test.ts    # テストファイル
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
npm run dist:start
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

