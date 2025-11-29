import { useState, useCallback } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import TextInput from 'ink-text-input';
import type { TodoRepository, Todo, TodoWithTags, Tag } from '../repository.js';
import { TodoList } from './TodoList.js';
import { Status } from './Status.js';
import { Export } from './Export.js';
import { TagList } from './TagList.js';
import { Message } from './Message.js';
import { Usage } from './Usage.js';

interface REPLAppProps {
  repo: TodoRepository;
  onExit: () => void;
}

type OutputItem =
  | { type: 'command'; text: string }
  | { type: 'message'; messageType: 'success' | 'error' | 'info'; text: string }
  | { type: 'todoList'; todos: Todo[]; title?: string | undefined }
  | { type: 'todoListWithTags'; todos: TodoWithTags[]; title?: string | undefined }
  | { type: 'status'; todos: Todo[] }
  | { type: 'export'; todos: Todo[] }
  | { type: 'tagList'; tags: Tag[] }
  | { type: 'searchResults'; todos: TodoWithTags[]; query: string }
  | { type: 'usage'; showError?: string | undefined };

export function REPLApp({ repo, onExit }: REPLAppProps) {
  const { exit } = useApp();
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<OutputItem[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isProcessing, setIsProcessing] = useState(false);

  // コマンド履歴ナビゲーション & Ctrl+D終了
  useInput(async (input, key) => {
    if (isProcessing) return;

    // Ctrl+C でヒントを表示
    if (input === 'c' && key.ctrl) {
      addToHistory({ type: 'message', messageType: 'info', text: '終了するには quit または Ctrl+D を入力してください' });
      return;
    }

    // Ctrl+D で終了
    if (input === 'd' && key.ctrl) {
      await repo.close();
      onExit();
      exit();
      return;
    }

    if (key.upArrow && commandHistory.length > 0) {
      const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
      setHistoryIndex(newIndex);
      setInput(commandHistory[commandHistory.length - 1 - newIndex] ?? '');
    }

    if (key.downArrow) {
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex] ?? '');
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  });

  const addToHistory = useCallback((item: OutputItem) => {
    setHistory(prev => [...prev, item]);
  }, []);

  const executeCommand = useCallback(async (commandLine: string) => {
    const parts = commandLine.trim().split(/\s+/);
    const [command, ...args] = parts;

    if (!command) return;

    // コマンド履歴に追加
    addToHistory({ type: 'command', text: `> ${commandLine}` });
    setCommandHistory(prev => [...prev, commandLine]);
    setHistoryIndex(-1);

    // exit/quit コマンド
    if (command === 'exit' || command === 'quit') {
      await repo.close();
      onExit();
      exit();
      return;
    }

    // clear コマンド
    if (command === 'clear') {
      setHistory([]);
      return;
    }

    // help コマンド
    if (command === 'help') {
      addToHistory({ type: 'usage' });
      return;
    }

    try {
      switch (command) {
        case 'add': {
          const title = args.join(' ');
          if (!title) {
            addToHistory({ type: 'message', messageType: 'error', text: 'タイトルを指定してください' });
            return;
          }
          const todo = await repo.create({ title });
          addToHistory({ type: 'message', messageType: 'success', text: `追加しました: ${todo.title}` });
          break;
        }

        case 'list': {
          const todos = await repo.findAll();
          if (todos.length === 0) {
            addToHistory({ type: 'message', messageType: 'info', text: 'Todoはありません' });
          } else {
            addToHistory({ type: 'todoList', todos, title: 'Todo一覧:' });
          }
          break;
        }

        case 'done': {
          const num = parseInt(args[0] ?? '', 10);
          if (isNaN(num) || num < 1) {
            addToHistory({ type: 'message', messageType: 'error', text: '有効な番号を指定してください' });
            return;
          }
          const todos = await repo.findAll();
          const todo = todos[num - 1];
          if (!todo) {
            addToHistory({ type: 'message', messageType: 'error', text: `Todo #${num} は存在しません` });
            return;
          }
          await repo.update(todo.id, { completed: true });
          addToHistory({ type: 'message', messageType: 'success', text: `完了にしました: ${todo.title}` });
          break;
        }

        case 'delete': {
          const num = parseInt(args[0] ?? '', 10);
          if (isNaN(num) || num < 1) {
            addToHistory({ type: 'message', messageType: 'error', text: '有効な番号を指定してください' });
            return;
          }
          const todos = await repo.findAll();
          const todo = todos[num - 1];
          if (!todo) {
            addToHistory({ type: 'message', messageType: 'error', text: `Todo #${num} は存在しません` });
            return;
          }
          await repo.delete(todo.id);
          addToHistory({ type: 'message', messageType: 'success', text: `削除しました: ${todo.title}` });
          break;
        }

        case 'status': {
          const todos = await repo.findAll();
          addToHistory({ type: 'status', todos });
          break;
        }

        case 'export': {
          const todos = await repo.findAll();
          addToHistory({ type: 'export', todos });
          break;
        }

        case 'search': {
          const query = args.join(' ');
          if (!query) {
            addToHistory({ type: 'message', messageType: 'error', text: '検索キーワードを指定してください' });
            return;
          }
          const todos = await repo.findAllWithTags();
          const queryLower = query.toLowerCase();
          const results = todos.filter(
            t =>
              t.title.toLowerCase().includes(queryLower) ||
              t.tags.some(tag => tag.name.toLowerCase().includes(queryLower))
          );
          addToHistory({ type: 'searchResults', todos: results, query });
          break;
        }

        case 'tag': {
          await handleTagCommand(args);
          break;
        }

        default:
          addToHistory({ type: 'usage', showError: `不明なコマンド: ${command}` });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      addToHistory({ type: 'message', messageType: 'error', text: message });
    }
  }, [repo, addToHistory, exit, onExit]);

  const handleTagCommand = useCallback(async (args: string[]) => {
    const [subCommand, ...subArgs] = args;

    if (!subCommand) {
      addToHistory({ type: 'usage', showError: 'tagサブコマンドを指定してください' });
      return;
    }

    switch (subCommand) {
      case 'list': {
        const tags = await repo.findAllTags();
        addToHistory({ type: 'tagList', tags });
        break;
      }

      case 'add': {
        const name = subArgs.join(' ');
        if (!name) {
          addToHistory({ type: 'message', messageType: 'error', text: 'タグ名を指定してください' });
          return;
        }
        const existing = await repo.findTagByName(name);
        if (existing) {
          addToHistory({ type: 'message', messageType: 'error', text: `タグ "${name}" は既に存在します` });
          return;
        }
        await repo.createTag(name);
        addToHistory({ type: 'message', messageType: 'success', text: `タグを作成しました: ${name}` });
        break;
      }

      case 'delete': {
        const name = subArgs.join(' ');
        if (!name) {
          addToHistory({ type: 'message', messageType: 'error', text: 'タグ名を指定してください' });
          return;
        }
        const tag = await repo.findTagByName(name);
        if (!tag) {
          addToHistory({ type: 'message', messageType: 'error', text: `タグ "${name}" は存在しません` });
          return;
        }
        await repo.deleteTag(tag.id);
        addToHistory({ type: 'message', messageType: 'success', text: `タグを削除しました: ${name}` });
        break;
      }

      case 'set': {
        const num = parseInt(subArgs[0] ?? '', 10);
        if (isNaN(num) || num < 1) {
          addToHistory({ type: 'message', messageType: 'error', text: '有効な番号を指定してください' });
          return;
        }
        const tagNames = subArgs.slice(1).join(' ').split(',').map(s => s.trim()).filter(Boolean);
        if (tagNames.length === 0) {
          addToHistory({ type: 'message', messageType: 'error', text: 'タグ名を指定してください（カンマ区切り）' });
          return;
        }
        const todos = await repo.findAll();
        const todo = todos[num - 1];
        if (!todo) {
          addToHistory({ type: 'message', messageType: 'error', text: `Todo #${num} は存在しません` });
          return;
        }
        for (const tagName of tagNames) {
          let tag = await repo.findTagByName(tagName);
          if (!tag) {
            tag = await repo.createTag(tagName);
          }
          await repo.addTagToTodo(todo.id, tag.id);
        }
        addToHistory({ type: 'message', messageType: 'success', text: `タグを設定しました: ${tagNames.join(', ')} → ${todo.title}` });
        break;
      }

      case 'unset': {
        const num = parseInt(subArgs[0] ?? '', 10);
        if (isNaN(num) || num < 1) {
          addToHistory({ type: 'message', messageType: 'error', text: '有効な番号を指定してください' });
          return;
        }
        const tagName = subArgs.slice(1).join(' ');
        if (!tagName) {
          addToHistory({ type: 'message', messageType: 'error', text: 'タグ名を指定してください' });
          return;
        }
        const todos = await repo.findAll();
        const todo = todos[num - 1];
        if (!todo) {
          addToHistory({ type: 'message', messageType: 'error', text: `Todo #${num} は存在しません` });
          return;
        }
        const tag = await repo.findTagByName(tagName);
        if (!tag) {
          addToHistory({ type: 'message', messageType: 'error', text: `タグ "${tagName}" は存在しません` });
          return;
        }
        await repo.removeTagFromTodo(todo.id, tag.id);
        addToHistory({ type: 'message', messageType: 'success', text: `タグを解除しました: ${tagName} ← ${todo.title}` });
        break;
      }

      case 'show': {
        const tagName = subArgs.join(' ');
        if (!tagName) {
          addToHistory({ type: 'message', messageType: 'error', text: 'タグ名を指定してください' });
          return;
        }
        const tag = await repo.findTagByName(tagName);
        if (!tag) {
          addToHistory({ type: 'message', messageType: 'error', text: `タグ "${tagName}" は存在しません` });
          return;
        }
        const todos = await repo.findByTag(tagName);
        addToHistory({
          type: 'todoListWithTags',
          todos,
          title: todos.length === 0
            ? `タグ "${tagName}" のTodoはありません`
            : `タグ "${tagName}" のTodo (${todos.length}件):`
        });
        break;
      }

      default:
        addToHistory({ type: 'usage', showError: `不明なtagサブコマンド: ${subCommand}` });
    }
  }, [repo, addToHistory]);

  const handleSubmit = useCallback(async (value: string) => {
    if (isProcessing) return;

    setIsProcessing(true);
    setInput('');

    try {
      await executeCommand(value);
    } finally {
      setIsProcessing(false);
    }
  }, [executeCommand, isProcessing]);

  const renderOutputItem = (item: OutputItem, index: number) => {
    switch (item.type) {
      case 'command':
        return <Text key={index} color="gray">{item.text}</Text>;

      case 'message':
        return <Message key={index} type={item.messageType}>{item.text}</Message>;

      case 'todoList':
        return <TodoList key={index} todos={item.todos} title={item.title} />;

      case 'todoListWithTags':
        return <TodoList key={index} todos={item.todos} title={item.title} showTags />;

      case 'status':
        return <Status key={index} todos={item.todos} />;

      case 'export':
        return <Export key={index} todos={item.todos} />;

      case 'tagList':
        return <TagList key={index} tags={item.tags} />;

      case 'searchResults':
        if (item.todos.length === 0) {
          return <Text key={index}>"{item.query}" に一致するTodoはありません</Text>;
        }
        return (
          <TodoList
            key={index}
            todos={item.todos}
            title={`検索結果 (${item.todos.length}件):`}
            showTags
          />
        );

      case 'usage':
        return (
          <Box key={index} flexDirection="column">
            {item.showError && <Message type="error">{item.showError}</Message>}
            <Usage />
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box flexDirection="column">
      {/* ヘッダー */}
      <Box marginBottom={1}>
        <Text bold color="cyan">Todo CLI</Text>
        <Text color="gray"> - Type 'help' for commands, 'exit' to quit</Text>
      </Box>

      {/* 出力履歴 */}
      <Box flexDirection="column" marginBottom={1}>
        {history.map((item, index) => renderOutputItem(item, index))}
      </Box>

      {/* プロンプト */}
      <Box>
        <Text color="green" bold>todo{'>'} </Text>
        <TextInput
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          placeholder={isProcessing ? '処理中...' : ''}
        />
      </Box>
    </Box>
  );
}
