import { Box, Text } from 'ink';
import type { Todo } from '../repository.js';

interface StatusProps {
  todos: Todo[];
}

export function Status({ todos }: StatusProps) {
  const total = todos.length;
  const completed = todos.filter(t => t.completed).length;
  const pending = total - completed;
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <Box flexDirection="column">
      <Text>統計:</Text>
      <Text>  総数:     {total}</Text>
      <Text>  完了:     {completed}</Text>
      <Text>  未完了:   {pending}</Text>
      <Text>  完了率:   {rate}%</Text>
    </Box>
  );
}
