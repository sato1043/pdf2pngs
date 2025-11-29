import { Box, Text } from 'ink';

export function Usage() {
  return (
    <Box flexDirection="column">
      <Text bold>Commands:</Text>
      <Text>  add {'<title>'}           - Todoを追加</Text>
      <Text>  list                  - Todo一覧を表示</Text>
      <Text>  done {'<number>'}         - Todoを完了にする</Text>
      <Text>  delete {'<number>'}       - Todoを削除する</Text>
      <Text>  status                - 統計を表示</Text>
      <Text>  export                - マークダウン形式でエクスポート</Text>
      <Text>  search {'<query>'}        - タイトル・タグで検索</Text>
      <Text />
      <Text bold>Tag commands:</Text>
      <Text>  tag list              - タグ一覧を表示</Text>
      <Text>  tag add {'<name>'}        - タグを作成</Text>
      <Text>  tag delete {'<name>'}     - タグを削除</Text>
      <Text>  tag set {'<num> <tags>'}  - Todoにタグを設定（カンマ区切り）</Text>
      <Text>  tag unset {'<num> <tag>'} - Todoからタグを削除</Text>
      <Text>  tag show {'<name>'}       - タグでTodoを絞り込み</Text>
      <Text />
      <Text bold>REPL commands:</Text>
      <Text>  help                  - このヘルプを表示</Text>
      <Text>  clear                 - 画面をクリア</Text>
      <Text>  select                - ファイル選択ダイアログを開く</Text>
      <Text>  exit / quit / Ctrl+D×2 - 終了</Text>
      <Text>  !{'<shell command>'}      - シェルコマンドを実行</Text>
      <Text />
      <Text bold>キーバインド:</Text>
      <Text>  ↑ / Ctrl+P            - 履歴を遡る</Text>
      <Text>  ↓ / Ctrl+N            - 履歴を進む</Text>
      <Text>  Ctrl+A                - 行頭へ</Text>
      <Text>  Ctrl+E                - 行末へ</Text>
      <Text>  Ctrl+B / ←            - 1文字戻る</Text>
      <Text>  Ctrl+F / →            - 1文字進む</Text>
      <Text>  Ctrl+U                - 行を削除</Text>
      <Text>  Ctrl+K                - カーソル以降を削除</Text>
      <Text>  Ctrl+W                - 単語を削除</Text>
      <Text>  Ctrl+O                - ファイル選択ダイアログを開く</Text>
    </Box>
  );
}
