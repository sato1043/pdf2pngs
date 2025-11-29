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
      <Text>  exit / quit / Ctrl+D  - 終了</Text>
      <Text />
      <Text bold>Tips:</Text>
      <Text>  ↑/↓                   - コマンド履歴を参照</Text>
    </Box>
  );
}
