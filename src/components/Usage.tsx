import { Box, Text } from 'ink';

export function Usage() {
  return (
    <Box flexDirection="column">
      <Text bold>Usage:</Text>
      <Text>  node cli.js add {'<title>'}           - Todoを追加</Text>
      <Text>  node cli.js list                  - Todo一覧を表示</Text>
      <Text>  node cli.js done {'<number>'}         - Todoを完了にする</Text>
      <Text>  node cli.js delete {'<number>'}       - Todoを削除する</Text>
      <Text>  node cli.js status                - 統計を表示</Text>
      <Text>  node cli.js export                - マークダウン形式でエクスポート</Text>
      <Text>  node cli.js search {'<query>'}        - タイトルで検索</Text>
      <Text />
      <Text bold>Tag commands:</Text>
      <Text>  node cli.js tag list              - タグ一覧を表示</Text>
      <Text>  node cli.js tag add {'<name>'}        - タグを作成</Text>
      <Text>  node cli.js tag delete {'<name>'}     - タグを削除</Text>
      <Text>  node cli.js tag set {'<num> <tags>'}  - Todoにタグを設定（カンマ区切り）</Text>
      <Text>  node cli.js tag unset {'<num> <tag>'} - Todoからタグを削除</Text>
      <Text>  node cli.js tag show {'<name>'}       - タグでTodoを絞り込み</Text>
      <Text />
      <Text bold>Environment:</Text>
      <Text>  DB_TYPE  - リポジトリタイプ (sqlite|prisma) [default: sqlite]</Text>
      <Text>  TODO_DB  - SQLiteデータベースファイル [default: todos.db]</Text>
    </Box>
  );
}
