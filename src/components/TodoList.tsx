import { Box, Text } from 'ink';
import type { Todo, TodoWithTags } from '../repository.js';

interface TodoListProps {
  todos: (Todo | TodoWithTags)[];
  showTags?: boolean | undefined;
  emptyMessage?: string | undefined;
  title?: string | undefined;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('ja-JP');
}

function hasTags(todo: Todo | TodoWithTags): todo is TodoWithTags {
  return 'tags' in todo && Array.isArray(todo.tags);
}

export function TodoList({ todos, showTags = false, emptyMessage = 'Todoはありません', title }: TodoListProps) {
  if (todos.length === 0) {
    return <Text>{emptyMessage}</Text>;
  }

  return (
    <Box flexDirection="column">
      {title && <Text>{title}</Text>}
      {todos.map((todo, index) => {
        const status = todo.completed ? '✓' : ' ';
        const tags = showTags && hasTags(todo) && todo.tags.length > 0
          ? ` [${todo.tags.map(t => t.name).join(', ')}]`
          : '';

        return (
          <Text key={todo.id}>
            {index + 1}. [{status}] {todo.title}{tags} ({formatDate(todo.createdAt)})
          </Text>
        );
      })}
    </Box>
  );
}
