import { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import type { TodoRepository, Todo, TodoWithTags, Tag } from '../repository.js';
import { TodoList } from './TodoList.js';
import { Status } from './Status.js';
import { Export } from './Export.js';
import { TagList } from './TagList.js';
import { Message } from './Message.js';
import { Usage } from './Usage.js';

interface AppProps {
  repo: TodoRepository;
  command: string;
  args: string[];
  onExit: (code: number) => void;
}

type AppState =
  | { type: 'loading' }
  | { type: 'usage'; showError?: string }
  | { type: 'message'; messageType: 'success' | 'error' | 'info'; text: string }
  | { type: 'todoList'; todos: Todo[]; title?: string }
  | { type: 'todoListWithTags'; todos: TodoWithTags[]; title?: string }
  | { type: 'status'; todos: Todo[] }
  | { type: 'export'; todos: Todo[] }
  | { type: 'tagList'; tags: Tag[] }
  | { type: 'searchResults'; todos: TodoWithTags[]; query: string };

export function App({ repo, command, args, onExit }: AppProps) {
  const [state, setState] = useState<AppState>({ type: 'loading' });
  const [exitCode, setExitCode] = useState<number | null>(null);

  useEffect(() => {
    if (exitCode !== null) {
      onExit(exitCode);
    }
  }, [exitCode, onExit]);

  useEffect(() => {
    const run = async () => {
      try {
        await executeCommand();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        setState({ type: 'message', messageType: 'error', text: message });
        setExitCode(1);
      }
    };
    run();
  }, []);

  const executeCommand = async () => {
    switch (command) {
      case 'add': {
        const title = args.join(' ');
        if (!title) {
          setState({ type: 'message', messageType: 'error', text: 'タイトルを指定してください' });
          setExitCode(1);
          return;
        }
        const todo = await repo.create({ title });
        setState({ type: 'message', messageType: 'success', text: `追加しました: ${todo.title}` });
        setExitCode(0);
        break;
      }

      case 'list': {
        const todos = await repo.findAll();
        if (todos.length === 0) {
          setState({ type: 'message', messageType: 'info', text: 'Todoはありません' });
        } else {
          setState({ type: 'todoList', todos, title: 'Todo一覧:' });
        }
        setExitCode(0);
        break;
      }

      case 'done': {
        const num = parseInt(args[0] ?? '', 10);
        if (isNaN(num) || num < 1) {
          setState({ type: 'message', messageType: 'error', text: '有効な番号を指定してください' });
          setExitCode(1);
          return;
        }
        const todos = await repo.findAll();
        const todo = todos[num - 1];
        if (!todo) {
          setState({ type: 'message', messageType: 'error', text: `Todo #${num} は存在しません` });
          setExitCode(1);
          return;
        }
        await repo.update(todo.id, { completed: true });
        setState({ type: 'message', messageType: 'success', text: `完了にしました: ${todo.title}` });
        setExitCode(0);
        break;
      }

      case 'delete': {
        const num = parseInt(args[0] ?? '', 10);
        if (isNaN(num) || num < 1) {
          setState({ type: 'message', messageType: 'error', text: '有効な番号を指定してください' });
          setExitCode(1);
          return;
        }
        const todos = await repo.findAll();
        const todo = todos[num - 1];
        if (!todo) {
          setState({ type: 'message', messageType: 'error', text: `Todo #${num} は存在しません` });
          setExitCode(1);
          return;
        }
        await repo.delete(todo.id);
        setState({ type: 'message', messageType: 'success', text: `削除しました: ${todo.title}` });
        setExitCode(0);
        break;
      }

      case 'status': {
        const todos = await repo.findAll();
        setState({ type: 'status', todos });
        setExitCode(0);
        break;
      }

      case 'export': {
        const todos = await repo.findAll();
        setState({ type: 'export', todos });
        setExitCode(0);
        break;
      }

      case 'search': {
        const query = args.join(' ');
        if (!query) {
          setState({ type: 'message', messageType: 'error', text: '検索キーワードを指定してください' });
          setExitCode(1);
          return;
        }
        const todos = await repo.findAllWithTags();
        const queryLower = query.toLowerCase();
        const results = todos.filter(
          t =>
            t.title.toLowerCase().includes(queryLower) ||
            t.tags.some(tag => tag.name.toLowerCase().includes(queryLower))
        );
        setState({ type: 'searchResults', todos: results, query });
        setExitCode(0);
        break;
      }

      case 'tag': {
        await handleTagCommand();
        break;
      }

      default:
        if (!command) {
          setState({ type: 'usage' });
        } else {
          setState({ type: 'usage', showError: `不明なコマンド: ${command}` });
        }
        setExitCode(1);
    }
  };

  const handleTagCommand = async () => {
    const [subCommand, ...subArgs] = args;

    if (!subCommand) {
      setState({ type: 'usage', showError: 'tagサブコマンドを指定してください' });
      setExitCode(1);
      return;
    }

    switch (subCommand) {
      case 'list': {
        const tags = await repo.findAllTags();
        setState({ type: 'tagList', tags });
        setExitCode(0);
        break;
      }

      case 'add': {
        const name = subArgs.join(' ');
        if (!name) {
          setState({ type: 'message', messageType: 'error', text: 'タグ名を指定してください' });
          setExitCode(1);
          return;
        }
        const existing = await repo.findTagByName(name);
        if (existing) {
          setState({ type: 'message', messageType: 'error', text: `タグ "${name}" は既に存在します` });
          setExitCode(1);
          return;
        }
        await repo.createTag(name);
        setState({ type: 'message', messageType: 'success', text: `タグを作成しました: ${name}` });
        setExitCode(0);
        break;
      }

      case 'delete': {
        const name = subArgs.join(' ');
        if (!name) {
          setState({ type: 'message', messageType: 'error', text: 'タグ名を指定してください' });
          setExitCode(1);
          return;
        }
        const tag = await repo.findTagByName(name);
        if (!tag) {
          setState({ type: 'message', messageType: 'error', text: `タグ "${name}" は存在しません` });
          setExitCode(1);
          return;
        }
        await repo.deleteTag(tag.id);
        setState({ type: 'message', messageType: 'success', text: `タグを削除しました: ${name}` });
        setExitCode(0);
        break;
      }

      case 'set': {
        const num = parseInt(subArgs[0] ?? '', 10);
        if (isNaN(num) || num < 1) {
          setState({ type: 'message', messageType: 'error', text: '有効な番号を指定してください' });
          setExitCode(1);
          return;
        }
        const tagNames = subArgs.slice(1).join(' ').split(',').map(s => s.trim()).filter(Boolean);
        if (tagNames.length === 0) {
          setState({ type: 'message', messageType: 'error', text: 'タグ名を指定してください（カンマ区切り）' });
          setExitCode(1);
          return;
        }
        const todos = await repo.findAll();
        const todo = todos[num - 1];
        if (!todo) {
          setState({ type: 'message', messageType: 'error', text: `Todo #${num} は存在しません` });
          setExitCode(1);
          return;
        }
        for (const tagName of tagNames) {
          let tag = await repo.findTagByName(tagName);
          if (!tag) {
            tag = await repo.createTag(tagName);
          }
          await repo.addTagToTodo(todo.id, tag.id);
        }
        setState({ type: 'message', messageType: 'success', text: `タグを設定しました: ${tagNames.join(', ')} → ${todo.title}` });
        setExitCode(0);
        break;
      }

      case 'unset': {
        const num = parseInt(subArgs[0] ?? '', 10);
        if (isNaN(num) || num < 1) {
          setState({ type: 'message', messageType: 'error', text: '有効な番号を指定してください' });
          setExitCode(1);
          return;
        }
        const tagName = subArgs.slice(1).join(' ');
        if (!tagName) {
          setState({ type: 'message', messageType: 'error', text: 'タグ名を指定してください' });
          setExitCode(1);
          return;
        }
        const todos = await repo.findAll();
        const todo = todos[num - 1];
        if (!todo) {
          setState({ type: 'message', messageType: 'error', text: `Todo #${num} は存在しません` });
          setExitCode(1);
          return;
        }
        const tag = await repo.findTagByName(tagName);
        if (!tag) {
          setState({ type: 'message', messageType: 'error', text: `タグ "${tagName}" は存在しません` });
          setExitCode(1);
          return;
        }
        await repo.removeTagFromTodo(todo.id, tag.id);
        setState({ type: 'message', messageType: 'success', text: `タグを解除しました: ${tagName} ← ${todo.title}` });
        setExitCode(0);
        break;
      }

      case 'show': {
        const tagName = subArgs.join(' ');
        if (!tagName) {
          setState({ type: 'message', messageType: 'error', text: 'タグ名を指定してください' });
          setExitCode(1);
          return;
        }
        const tag = await repo.findTagByName(tagName);
        if (!tag) {
          setState({ type: 'message', messageType: 'error', text: `タグ "${tagName}" は存在しません` });
          setExitCode(1);
          return;
        }
        const todos = await repo.findByTag(tagName);
        setState({
          type: 'todoListWithTags',
          todos,
          title: todos.length === 0
            ? `タグ "${tagName}" のTodoはありません`
            : `タグ "${tagName}" のTodo (${todos.length}件):`
        });
        setExitCode(0);
        break;
      }

      default:
        setState({ type: 'usage', showError: `不明なtagサブコマンド: ${subCommand}` });
        setExitCode(1);
    }
  };

  // Render based on state
  switch (state.type) {
    case 'loading':
      return null;

    case 'usage':
      return (
        <Box flexDirection="column">
          {state.showError && <Message type="error">{state.showError}</Message>}
          <Usage />
        </Box>
      );

    case 'message':
      return <Message type={state.messageType}>{state.text}</Message>;

    case 'todoList':
      return <TodoList todos={state.todos} title={state.title} />;

    case 'todoListWithTags':
      return <TodoList todos={state.todos} title={state.title} showTags />;

    case 'status':
      return <Status todos={state.todos} />;

    case 'export':
      return <Export todos={state.todos} />;

    case 'tagList':
      return <TagList tags={state.tags} />;

    case 'searchResults':
      if (state.todos.length === 0) {
        return <Text>"{state.query}" に一致するTodoはありません</Text>;
      }
      return (
        <TodoList
          todos={state.todos}
          title={`検索結果 (${state.todos.length}件):`}
          showTags
        />
      );

    default:
      return null;
  }
}
