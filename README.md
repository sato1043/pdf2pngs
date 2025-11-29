# pdf2pngs

PDFファイルを選択して、各ページをPNG画像に変換するCLIツール

**必要環境**

- **Node.js** >= 22.5.0


**インストール**

```bash
git clone <repository>
cd pdf2pngs
npm install
npm run build
npm link
```

`npm link` は `package.json` の `bin` フィールドを読み取り、グローバルにシンボリックリンクを作成します。
これにより、どのディレクトリからでも `pdf2pngs` コマンドが使えるようになります。

**アンインストール:**

```bash
npm unlink -g pdf2pngs
```


## 使用方法

```bash
# npm link 後
pdf2pngs

# または開発時
npm start
```

起動するとファイル選択が開きます：

```
PDF to PNG Converter

┌ ファイルを選択 (↑↓: 移動, Enter: 選択, Esc: キャンセル)
│
│ /Users/user/documents
│
│ ▸ 📁 reports/
│   📁 images/
│   📄 sample.pdf
│   📄 readme.txt
└
```

**操作方法**

| キー | 説明 |
|------|------|
| `↑` / `Ctrl+P` | 上へ移動 |
| `↓` / `Ctrl+N` | 下へ移動 |
| `Enter` / `Space` | 選択（ディレクトリは移動、ファイルは処理） |
| `Esc` | キャンセル（終了） |

PDFファイルを選択すると、自動的に各ページをPNG画像に変換します：

```
選択されたファイル: /Users/user/documents/sample.pdf
  拡張子: .pdf, サイズ: 2.5 MB, タイプ: application/pdf
処理中... (PdfFileAdapter)
PDF変換完了: 10ページ → /Users/user/documents/sample/
  保存ファイル: page_01.png 〜 page_10.png
```

| 変換仕様 | 説明 |
|---------|------|
| 出力フォルダ | PDFファイル名と同名のサブフォルダ |
| 出力場所 | PDFファイルと同じディレクトリ内 |
| ファイル名 | `page_01.png`, `page_02.png`, ... (ゼロパディング) |
| 解像度 | 2倍スケール（高解像度） |
| 形式 | PNG |


## 構成

| npmスクリプト | 説明 |
|-------------|------|
| `npm start` | tsxランタイムで実行 |
| `npm run dev` | デバッガ接続可能モードで実行 |
| `npm run dev:watch` | ホットリロード + デバッガ接続可能モードで実行 |
| `npm run typecheck` | 型チェックのみ実行（出力なし） |
| `npm test` | Vitest でテスト実行（ウォッチモード） |
| `npm run test:run` | Vitest でテスト単発実行 |
| `npm run clean` | dist ディレクトリを削除 |
| `npm run build` | clean → typecheck → tsc の順で本番ビルド |


**技術構成**

- **TypeScript** - 型安全な JavaScript
- **React Ink** - CLI向けReactレンダラー
- **Vitest** - 高速なテストフレームワーク
- **tsx** - TypeScript 直接実行ツール（esbuild ベース）
- **ESModule** - ネイティブ ESM（`"type": "module"`）
- **pdf-to-png-converter** - PDF→PNG変換（外部依存なし）


**ファイル構成**

```
.
├── src/
│   ├── index.ts              # エントリーポイント
│   ├── cli.tsx               # CLI層（React Ink）
│   ├── pdf2pngs.ts           # PDF→PNG変換ユーティリティ
│   ├── adapters/             # ファイル処理アダプター
│   │   ├── FileAdapter.ts    # アダプターインターフェース
│   │   ├── AdapterRegistry.ts # アダプターレジストリ
│   │   ├── PdfFileAdapter.ts     # PDF変換アダプター
│   │   └── index.ts          # エクスポート
│   ├── components/           # React Ink コンポーネント
│   │   ├── FileSelectorApp.tsx # メインアプリケーション
│   │   ├── FileSelector.tsx  # ファイル選択ダイアログ
│   │   └── Message.tsx       # メッセージ表示
│   └── __tests__/
│       └── adapters.test.ts  # アダプターテスト
├── dist/                     # コンパイル出力（npm run build で生成）
├── package.json
├── tsconfig.base.json        # 共通設定（継承元）
├── tsconfig.json             # 開発用設定
└── tsconfig.prod.json        # 本番用設定
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
npm run test:run
```

### 本番ビルド

```bash
npm run build
```

TypeScript を JavaScript にコンパイルします。

ビルドは以下の順序で実行されます：

1. `clean` - dist ディレクトリを削除
2. `typecheck` - 型チェック（エラーがあれば停止）
3. `tsc` - JavaScript へコンパイル


## TypeScript 設定

開発用と本番用で tsconfig を分離しています。

| ファイル | 用途 | 使用タイミング |
|---------|------|---------------|
| `tsconfig.base.json` | 共通設定（継承元） | - |
| `tsconfig.json` | 開発用（緩いチェック） | `npm run dev` |
| `tsconfig.prod.json` | 本番用（厳密チェック） | `npm run build` |

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


## アーキテクチャ

### Adapterパターン

ファイルタイプごとの処理を拡張可能なAdapterパターンで実装：

```
FileAdapter (interface)
├── canHandle(filePath): boolean  // ファイルタイプ判定
├── process(filePath): Promise<FileProcessResult>  // 処理実行
└── name: string  // アダプター名

AdapterRegistry (class)
├── register(adapter)  // アダプター登録
├── findAdapter(filePath)  // 対応アダプター検索
└── hasAdapter(filePath)  // 対応可否確認

PdfFileAdapter implements FileAdapter
└── PDF→PNG変換処理
```

### 新しいファイルタイプの追加

1. `FileAdapter`インターフェースを実装したクラスを作成
2. `AdapterRegistry`に登録

```typescript
// 例: ImageAdapter を追加
import { AdapterRegistry, PdfFileAdapter } from './adapters/index.js';
import { ImageAdapter } from './adapters/ImageAdapter.js';

const registry = new AdapterRegistry();
registry.register(new PdfFileAdapter());
registry.register(new ImageAdapter());  // 追加
```


__END__
