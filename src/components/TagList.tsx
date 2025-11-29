import { Box, Text } from 'ink';
import type { Tag } from '../repository.js';

interface TagListProps {
  tags: Tag[];
}

export function TagList({ tags }: TagListProps) {
  if (tags.length === 0) {
    return <Text>タグはありません</Text>;
  }

  return (
    <Box flexDirection="column">
      <Text>タグ一覧:</Text>
      {tags.map(tag => (
        <Text key={tag.id}>  - {tag.name}</Text>
      ))}
    </Box>
  );
}
