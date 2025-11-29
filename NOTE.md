NOTE
=====


ここまで
https://zenn.dev/mizchi/articles/dena-ai-live-coding
を途中まで楽しくやってみた履歴


commit c8e19cb844a2e2ff5d590d0b4a38e88c63ad7940
Author: sato1043 <sato1043@updater.cc>
Date:   Sat Nov 29 18:07:14 2025 +0900

    feat: CLI REPL は Ctrl+D で終了（2回押しで終了）
    
    __ここまで__

commit 0e1979f0c514bdfe1bd7eead44518762eff45832
Author: sato1043 <sato1043@updater.cc>
Date:   Sat Nov 29 17:53:34 2025 +0900

    feat: CLI REPL は Emacs風キーバインドで操作
    
    **AIへの指示:**
    
    ```
    シェルで使えるemacs風キーアサインを加えてほしい
    Ctrl+P で履歴を遡る、Ctrl+Nで履歴を進む
    Ctrl+A で行頭、Ctrl+Eで行末、なども加えて欲しい
    通常コマンドモードでもシェルモードでもキーボードショートカットを使いたい
    README を更新
    ```
    
    __ここまで__

commit ff5a323e67a73e757eacf5482b02bff8e7119051
Author: sato1043 <sato1043@updater.cc>
Date:   Sat Nov 29 17:15:25 2025 +0900

    feat: CLIのREPLを実装
    
    **AIへの指示:**
    
    ```
    CLIを現在のReact Inkのフレームワークを使いながらも Claude CodeのようなREPLに更新
    READMEを更新
    REPLをCtrl+D で抜けられるようにする
    REPLでCtrl＋C入力時には quit コマンドでREPLを終了できるとメッセージする
    ```
    
    __ここまで__

commit dd2f494be7d87313811ad7db432e216842b9fe42
Author: sato1043 <sato1043@updater.cc>
Date:   Sat Nov 29 16:50:44 2025 +0900

    feat: CLIをReact Inkで再実装
    
    **AIへの指示:**
    
    ```
    CLIをReact Inkで再実装して
    READMEを更新
    package.json のスクリプトを --no-warnings 付きに更新
    ```
    
    __ここまで__

commit 22cc09d953b86725208937271541cdc81f0c95a1
Author: sato1043 <sato1043@updater.cc>
Date:   Sat Nov 29 16:25:44 2025 +0900

    feat: III.テスト駆動の実践 -5 タグ機能追加
    
    **AIへの指示:**
    
    ```
    タグ機能（多対多リレーション）を追加
    テストコードも追加
    ```
    
    __ここまで__

commit 6088267dfca81324b8e41b588d701c5dfea9ab26
Author: sato1043 <sato1043@updater.cc>
Date:   Sat Nov 29 14:51:07 2025 +0900

    feat: III.テスト駆動の実践 -5 検索コマンド追加
    
    **AIへの指示:**
    
    ```
    新しいコマンド search を追加。検索機能（タイトル検索）
    テストコードも追加
    ```
    
    __ここまで__

commit 7c74da75f279bb761d967d609f1ca90e5466e6b9
Author: sato1043 <sato1043@updater.cc>
Date:   Sat Nov 29 14:47:55 2025 +0900

    feat: III.テスト駆動の実践 -5 エクスポートコマンド追加
    
    **AIへの指示:**
    
    ```
    新しいコマンド export を追加。エクスポート機能。Todoをマークダウン形式で出力
    テストコードも追加
    ```
    
    __ここまで__

commit 9847b135e2a61ef71264765a0efe8b4ccf73df55
Author: sato1043 <sato1043@updater.cc>
Date:   Sat Nov 29 14:44:27 2025 +0900

    feat: III.テスト駆動の実践 -5 統計コマンド追加
    
    **AIへの指示:**
    
    ```
    新しいコマンドを追加します。status コマンド。統計表示（完了率）します
    ```
    
    __ここまで__

commit a9c42b1a595fbd5d89ba803b950ee7be38fcf1ce
Author: sato1043 <sato1043@updater.cc>
Date:   Sat Nov 29 14:33:28 2025 +0900

    feat: III.テスト駆動の実践 -5 リポジトリパターンの実装
    
    **AIへの指示:**
    
    ```
    src/repository.tsを作成し、データアクセスを抽象化してください
    src/__tests__/repository.test.tsを作成し、
    両方のリポジトリ実装が同じインターフェースに従うことを確認するテストを書いてください。
    
    1. TodoRepositoryインターフェースを定義
    2. SqliteRepository（既存のDatabaseクラスを使用）
    3. PrismaRepository（Prismaクライアントを使用）
    4. 両方が同じインターフェースを実装
    
    また、CLIで実装を切り替えられるようにしてください：
    1. 環境変数DB_TYPEで切り替え（sqlite/prisma）
    2. ファクトリーパターンでリポジトリを生成
    3. CLIコードは変更なしで動作
    ```
    
    **期待される結果**
    
    - リポジトリパターンの実装
    - 同上テストコード
    - 環境変数による実装の切り替え
    - CLIコードの変更が不要
    - Prismaスキーマの拡張
    - 新しいコマンドの追加
    - リポジトリインターフェースの拡張
    
    **よくある失敗例:**
    
    - インターフェースの不一致 → 結果: 実装の切り替えができない
    - 型の不整合 → 結果: TypeScriptエラー
    
    __ここまで__

commit 532b6479d2325bf079b34a8e0ed28389ac936cce
Author: sato1043 <sato1043@updater.cc>
Date:   Sat Nov 29 14:20:41 2025 +0900

    feat: III.テスト駆動の実践 -5 CLI更新
    
    **AIへの指示:**
    
    ```
    以下を実装してください：
    1. src/index.tsをエントリーポイントとして作成
    2. 実行例を含むREADMEに追記
    ```
    
    **期待される結果**
    
    - READMEの更新
    - CLIテストの更新
    
    __ここまで__

commit b8387741fab761bbd45a2bcc760bd85788040053
Author: sato1043 <sato1043@updater.cc>
Date:   Sat Nov 29 13:47:56 2025 +0900

    feat: III.テスト駆動の実践 -4 ORM導入(prisma)
    
    **AIへの指示:**
    
    ```
    既存のコードを保持したまま、Prismaを導入してください：
    1. Prismaをインストール
    2. prisma/schema.prismaを作成（SQLite使用）
    3. Todoモデルを定義
    4. マイグレーションを実行
    ```
    
    **期待される結果**
    
    - schema.prismaの作成
    
    **よくある失敗例:**
    
    - 既存のデータベースとの整合性を考慮しない → 結果: データ移行が必要
    - カラム名の違い（created_at vs createdAt） → 結果: マッピングエラー
    
    __ここまで__

commit e7af597cbc1d3f0fad70605dd6abdcf16fd6b296
Author: sato1043 <sato1043@updater.cc>
Date:   Sat Nov 29 13:41:13 2025 +0900

    feat: III.テスト駆動の実践 -3 データベースCLIの実装
    
    **AIへの指示:**
    
    ```
    src/cli.tsを作成し、コマンドライン引数を解析してTodo操作を行うCLIを実装してください。
    src/__tests__/cli.test.tsを作成し、CLIの統合テストを実装してください。
    各コマンドの動作を確認するテストを書いてください。
    
    コマンド例：
    - node cli.js add "買い物に行く"
    - node cli.js list
    - node cli.js done 1
    - node cli.js delete 1
    
    parseArgs（Node.js組み込み）を使用してください。
    ```
    
    **期待される結果**
    
    - コマンドライン引数の適切な解析
    - 各コマンドの実装
    - エラーハンドリング
    - CLIコマンドの動作確認
    - エラーケースのテスト
    
    **よくある失敗例:**
    
    - process.argvを直接解析しようとする → 結果: 複雑で保守しづらいコード
    - エラーハンドリングを忘れる → 結果: 不正な入力でクラッシュ
    
    __ここまで__

commit 2e632137fe8e812770abc9a631d85497f8597bf1
Author: sato1043 <sato1043@updater.cc>
Date:   Sat Nov 29 13:32:51 2025 +0900

    feat: III.テスト駆動の実践 -2 データベース層の実装
    
    **AIへの指示:**
    
    ```
    src/db.tsを作成し、node:sqliteを使ったデータベース層を実装してください。
    npm testでテストを実行し、すべてパスすることを確認してください。
    失敗するテストがあれば、実装を修正してください。
    
    要件：
    1. Databaseクラスを作成
    2. todosテーブル（id, title, completed, created_at）
    3. 初期化メソッド（テーブル作成）
    4. CRUD操作のメソッド（同期的に実装）
    ```
    
    **期待される結果:**
    
    - すべてのテストが緑色でパス
    - カバレッジの確認
    
    **よくある失敗例:**
    
    - Node.jsバージョンの確認忘れ → 結果: node:sqliteが使えない
    - node:sqliteのインポート方法を間違える → 結果: モジュールが見つからない
    - 非同期処理の扱いを間違える → 結果: DatabaseSyncは同期APIなのにasync/awaitを使う
    
    __ここまで__

commit 690e8455f9d5c8d39e0405c7d7293cb9d4c3048b
Author: sato1043 <sato1043@updater.cc>
Date:   Sat Nov 29 13:29:45 2025 +0900

    feat: III.テスト駆動の実践 -1 データベース層のインターフェイスの実装
    
    **AIへの指示:**
    
    ```
    最初にテストファイルsrc/__tests__/db.test.tsを作成してください。
    以下のテストケースを実装：
    1. データベースの初期化テスト
    2. Todoの作成テスト
    3. 全件取得テスト
    4. ID検索テスト
    5. 更新テスト
    6. 削除テスト
    
    その後、src/db.tsを実装してテストをパスさせてください。
    ```
    
    よくある失敗例:
    
    - Node.jsバージョンの確認忘れ → 結果: node:sqliteが使えない
    - ESModule設定忘れ → 結果: importエラー
    - テストの独立性を保てない → 結果: テストが相互に影響
    - メモリDBを使わない → 結果: テスト実行が遅い、ファイルが残る

commit ac74df29ea69639a258bf6c21090980b73364fd1
Author: sato1043 <sato1043@updater.cc>
Date:   Sat Nov 29 13:51:49 2025 +0900

    feat: II. 次節のために実装例を削除

commit 11f55a926380788ad1ccacf90ee9bedaf4903a20
Author: sato1043 <sato1043@updater.cc>
Date:   Sat Nov 29 13:20:01 2025 +0900

    feat: II. 実装例
    
    **AIへの指示:**
    
    ```
    src/graph.tsファイルを作成し、以下の型定義とクラスを実装してください：
    
    1. Node型: グラフのノードを表す（id: string）
    2. Edge型: エッジを表す（from: string, to: string, weight: number）
    3. Graphクラス:
       - addNode(id: string): void
       - addEdge(from: string, to: string, weight: number): void
       - getNeighbors(nodeId: string): Array<{node: string, weight: number}>
    
    src/dijkstra.tsファイルを作成し、ダイクストラ法を実装してください：
    
    関数シグネチャ:
    dijkstra(graph: Graph, startNode: string): Map<string, {distance: number, path: string[]}>
    
    返り値は各ノードへの最短距離とそのパスを含むMapです。
    到達不可能なノードはdistance: Infinityとしてください。
    
    src/dijkstra.test.tsを作成し、以下のテストケースを実装してください：
    
    1. 単純な一直線のグラフ（A→B→C）
    2. 複数の経路があるグラフ（最短経路を正しく選択するか）
    3. 到達不可能なノードがあるグラフ
    4. 単一ノードのグラフ
    5. サンプルとして、以下のグラフもテストしてください：
       A --(4)-- B
       |         |
      (2)       (1)
       |         |
       C --(5)-- D
       |
      (1)
       |
       E
    
    src/example.tsを作成し、実際の使用例を実装してください：
    都市間の最短経路を求める例
    - 東京、大阪、名古屋、福岡、仙台の5都市
    - 適当な距離でエッジを作成
    - 東京から各都市への最短経路を表示
    
    ```
    
    **ポイント**
    
    - 具体的な型定義を提供する
    - メソッドのシグネチャを明確に指定する
    - グラフの表現方法（隣接リスト）を暗黙的に示す
    
    - アルゴリズム名を明確に指定（AIは有名なアルゴリズムをよく知っている）
    - 入出力の形式を具体的に定義
    - エッジケース（到達不可能なノード）の扱いを明記
    
    - 様々なケースを網羅的にテストする
    - 具体的なグラフ構造を図で示す
    - エッジケースを忘れずに含める
    
    __ここまで__

commit e70a45f91a8ad9056622cbfa2a31a9473443629f
Author: sato1043 <sato1043@updater.cc>
Date:   Sat Nov 29 10:30:43 2025 +0900

    build: 5-1-6. README.md作成
    
    AIへの指示:
    
    ```
    現在の使い方と設定をREADME.mdへ記述
    ```
    
    READMEは見やすいように構成し直すといい
    
    情報が出揃ったらチャット履歴をコンパクトするかクリアするといい
    
    ```
    /compact
    ```
    
    __ここまで__

commit c98405bec669c6dddcb8f5f260ae7581f23b033e
Author: sato1043 <sato1043@updater.cc>
Date:   Sat Nov 29 10:29:07 2025 +0900

    build: 5-1-5. 本番向けの設定更新
    
    AIへの指示:
    
    ```
    本番環境用の設定をしてください：
    - tscでビルド後、最適化されたJSを実行
    - ソースマップは別ファイル
    - 型チェックは厳密に
    - tsconfig.jsonは開発向けと本番向けを分離する
    ```
    
    __ここまで__

commit d2dd220d45ed9ec22f8a287fce38018052e0d375
Author: sato1043 <sato1043@updater.cc>
Date:   Sat Nov 29 10:06:02 2025 +0900

    build: 5-1-4. 開発向けの設定更新
    
    AIへの指示:
    
    ```
    開発環境用の設定をしてください：
    - tsxを使用してホットリロード対応
    - デバッグしやすい設定
    - 高速な実行
    ```
    
    __ここまで__

commit 0ff8b166c00d69cc63c106a0d7f9a0a8f2d4d4c2
Author: sato1043 <sato1043@updater.cc>
Date:   Sat Nov 29 10:01:37 2025 +0900

    build: 5-1-2. tsxでランタイム実行
    
    AIへの指示:
    
    ```
    tsxを使ってTypeScriptファイルを直接実行できるようにしてください。
    ESModuleネイティブで動作する設定でお願いします。
    ```
    
    期待される結果:
    
    - ランタイムで実行する
    
    特徴:
    
    - 開発向け
    - 早い起動、実行
    - ESModule完全対応
    
    __ここまで__

commit c3a32e24f6e51641d0334af9de470cd702e52e9a
Author: sato1043 <sato1043@updater.cc>
Date:   Sat Nov 29 09:56:37 2025 +0900

    build: 5-1-1. tscビルドして実行
    
    AIへの指示:
    
    ```
    TypeScriptをJavaScriptにコンパイルしてから実行する方法を教えてください。
    tscでビルドして、nodeで実行する手順でお願いします。
    ```
    
    期待される結果:
    
    - トランスパイル後に実行する
    
    特徴:
    
    - 最も互換性が高い
    - 本番環境向け
    - ビルドステップが必要
    
    __ここまで__

commit 590784f90d8f8b584bc989b41bbb4cfef92de828
Author: sato1043 <sato1043@updater.cc>
Date:   Sat Nov 29 09:50:46 2025 +0900

    build: 4-1. テストファイルの実行
    
    AIへの指示:
    
    ```
    npm testでテストを実行して、全てのテストがパスすることを確認してください
    ```
    
    期待される結果:
    
    - すべてのテストが緑色でパス
    - テストの実行時間が表示される
    
    よくある失敗例:
    
    - import/exportのエラー → 原因: package.jsonに"type": "module"がない
    - 型エラー → 原因: tsconfig.jsonの設定ミス、またはインポート時の拡張子指定漏れ
    - テストの期待値が間違っている → 原因: 計算結果の確認不足
    
    __ここまで__

commit 131ae1d6622ef6c48cd2efa3d845adec4d0df32a
Author: sato1043 <sato1043@updater.cc>
Date:   Sat Nov 29 09:47:27 2025 +0900

    build: 3-1. テストファイルの作成と実装
    
    AIへの指示:
    
    ```
    src/math.test.tsファイルを作成し、以下のテストを実装してください：
    
    1. Vitestのdescribe、it、expectをインポート
    2. math.tsからadd、distance関数をインポート
    
    3. add関数のテスト：
       - 正の数同士（2 + 3 = 5）
       - 正の数と負の数（5 + (-3) = 2）
       - ゼロを含む（0 + 5 = 5）
    
    4. distance関数のテスト：
       - 原点から(3,4)までの距離は5
       - 同じ点(5,5)から(5,5)の距離は0
       - (1,1)から(4,5)までの距離は5
    ```
    
    期待される結果:
    
    - 正しいインポート文が記述される
    - 6つのテストケースが実装される
    - ピタゴラスの定理に基づいた正しい結果
    
    よくある失敗例:
    
    - from '@vitest'などの間違ったインポート → 結果: モジュールが見つからないエラー
    - インポート時に./math.jsの拡張子を忘れる → 結果: ESModuleでモジュールが見つからない
    - テストケースの数値が指示と異なる → 結果: 期待した動作の確認ができない
    - 浮動小数点の誤差を考慮していない → 結果: 5.0000000001のような値で失敗
    
    __ここまで__

commit d93a33d420fab924514d924c31f5758a64f1f63d
Author: sato1043 <sato1043@updater.cc>
Date:   Sat Nov 29 09:44:54 2025 +0900

    build: 2-1. 関数の実装
    
    AIへの指示:
    
    ```
    以下を実行してください：
    1. srcディレクトリを作成
    2. src/math.tsファイルを作成し、以下の2つの関数を実装：
       - add(a: number, b: number): number - 2つの数値を足す
       - distance(x1: number, y1: number, x2: number, y2: number): number - 2点間のユークリッド距離を計算する
       両方の関数をexportしてください。
    ```
    
    期待される結果:
    
    - ふたつのメソッドが実装される
    
    よくある失敗例:
    
    - exportを忘れる → 結果: テストファイルからインポートできない
    - 関数名や引数名が指示と異なる → 結果: テストが動作しない
    - distanceの計算式を間違える → 結果: テストが失敗する
    
    __ここまで__

commit 8ab90b85c0549b5e71f7c26e4c3b8adf431485c0
Author: sato1043 <sato1043@updater.cc>
Date:   Sat Nov 29 09:42:02 2025 +0900

    build: 1-2. プロジェクトの初期設定
    
    AIへの指示:
    
    ```
    以下の設定を行ってください：
    1. npm init -yでpackage.jsonを作成
    2. TypeScript、Vitest、@types/nodeを開発依存関係としてインストール
    3. package.jsonに"type": "module"を追加
    4. tsconfig.jsonを作成（target: ES2022、module: > ESNext、moduleResolution: bundler、strict: true）
    5. package.jsonのscriptsに"test": "vitest"を追加
    ```
    
    期待される結果:
    
    - package.jsonが正しく設定される（ESModule対応）
    - 必要な依存関係がインストールされる
    - TypeScriptが正しく設定される
    - テストスクリプトが追加される
    
    よくある失敗例:
    
    - "type": "module"の追加を忘れる → 結果: import/export文でエラーが発生
    - 本番依存関係（--save）としてインストール → 結果: 不要な依存関係が本番環境に含まれる
    - 古い設定（target: ES5、moduleResolution: node）を使う → 結果: 最新の機能が使えない、ESModuleが正しく動作しない
    - testスクリプトの追加を忘れる → 結果: npm testが実行できない
    
    __ここまで__

commit 522fdef3b799b4a3bf8210f7781680ffb68d72c8
Author: sato1043 <sato1043@updater.cc>
Date:   Sat Nov 29 09:11:54 2025 +0900

    build: 1-1. プロジェクトディレクトリの作成
    
    **AIへの指示:**
    
    ```
    projects/foobarディレクトリを作成して、そこに移動してください
    ```
    
    **期待される結果:**
    
    ```
    mkdir -p projects/foobar
    cd projects/foobar
    ```
    
    **よくある失敗例:**
    
    - AIが相対パスで移動しようとして失敗する
    - 親ディレクトリの確認をせずに作成する
    
    __ここまで__


gg
