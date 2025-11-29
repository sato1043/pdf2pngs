import { Box, Text } from 'ink';
import type { Todo } from '../repository.js';

interface ExportProps {
  todos: Todo[];
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('ja-JP');
}

export function Export({ todos }: ExportProps) {
  const total = todos.length;
  const completed = todos.filter(t => t.completed).length;
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <Box flexDirection="column">
      <Text># Todo List</Text>
      <Text />
      <Text>{`> 完了率: ${rate}% (${completed}/${total})`}</Text>
      <Text />
      {todos.length === 0 ? (
        <Text>_Todoはありません_</Text>
      ) : (
        todos.map(todo => {
          const checkbox = todo.completed ? '[x]' : '[ ]';
          return (
            <Text key={todo.id}>
              - {checkbox} {todo.title} _({formatDate(todo.createdAt)})_
            </Text>
          );
        })
      )}
    </Box>
  );
}
