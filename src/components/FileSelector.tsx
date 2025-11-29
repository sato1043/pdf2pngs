import { useState, useEffect, useCallback } from 'react';
import { Box, Text, useInput } from 'ink';
import { readdirSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';

interface FileSelectorProps {
  onSelect: (filePath: string) => void;
  onCancel: () => void;
  startDir?: string;
}

interface DirEntry {
  name: string;
  isDirectory: boolean;
}

export function FileSelector({ onSelect, onCancel, startDir }: FileSelectorProps) {
  const [currentDir, setCurrentDir] = useState(() => startDir || process.cwd());
  const [entries, setEntries] = useState<DirEntry[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // ディレクトリ内容を読み取る
  const loadDirectory = useCallback((dir: string) => {
    try {
      const resolvedDir = resolve(dir);
      const items = readdirSync(resolvedDir);

      const dirEntries: DirEntry[] = items
        .filter(name => !name.startsWith('.')) // 隠しファイルを除外
        .map(name => {
          try {
            const fullPath = join(resolvedDir, name);
            const stat = statSync(fullPath);
            return { name, isDirectory: stat.isDirectory() };
          } catch {
            return { name, isDirectory: false };
          }
        })
        .sort((a, b) => {
          // ディレクトリを先に、その後ファイル
          if (a.isDirectory && !b.isDirectory) return -1;
          if (!a.isDirectory && b.isDirectory) return 1;
          return a.name.localeCompare(b.name);
        });

      // 親ディレクトリへの移動オプションを先頭に追加
      const parentDir = dirname(resolvedDir);
      if (parentDir !== resolvedDir) {
        dirEntries.unshift({ name: '..', isDirectory: true });
      }

      setCurrentDir(resolvedDir);
      setEntries(dirEntries);
      setSelectedIndex(0);
      setError(null);
    } catch (err) {
      setError(`ディレクトリを開けません: ${dir}`);
    }
  }, []);

  // 初期ディレクトリ読み込み
  useEffect(() => {
    loadDirectory(currentDir);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // キー入力処理
  useInput((ch, key) => {
    // Escでキャンセル
    if (key.escape) {
      onCancel();
      return;
    }

    // 上キー または Ctrl+P で前のファイルへ
    if (key.upArrow || (ch === 'p' && key.ctrl)) {
      setSelectedIndex(prev => Math.max(0, prev - 1));
      return;
    }
    // 下キー または Ctrl+N で次のファイルへ
    if (key.downArrow || (ch === 'n' && key.ctrl)) {
      setSelectedIndex(prev => Math.min(entries.length - 1, prev + 1));
      return;
    }

    // Enter または Space で選択
    if ((key.return || ch === ' ') && entries.length > 0) {
      const selected = entries[selectedIndex];
      if (!selected) return;

      const fullPath = selected.name === '..'
        ? dirname(currentDir)
        : join(currentDir, selected.name);

      if (selected.isDirectory) {
        loadDirectory(fullPath);
      } else {
        onSelect(fullPath);
      }
      return;
    }
  });

  // 表示する項目数を制限（スクロール表示）
  const maxVisible = 10;
  const startIdx = Math.max(0, selectedIndex - Math.floor(maxVisible / 2));
  const visibleEntries = entries.slice(startIdx, startIdx + maxVisible);

  return (
    <Box flexDirection="column" borderStyle="single" borderColor="cyan" paddingX={1}>
      <Box marginBottom={1}>
        <Text bold color="cyan">ファイルを選択 </Text>
        <Text color="gray">(↑↓: 移動, Enter: 選択, Esc: キャンセル)</Text>
      </Box>

      <Box marginBottom={1}>
        <Text color="yellow">{currentDir}</Text>
      </Box>

      {error ? (
        <Text color="red">{error}</Text>
      ) : entries.length === 0 ? (
        <Text color="gray">(空のディレクトリ)</Text>
      ) : (
        <Box flexDirection="column">
          {startIdx > 0 && <Text color="gray">  ↑ ({startIdx}件)</Text>}

          {visibleEntries.map((entry, idx) => {
            const actualIdx = startIdx + idx;
            const isSelected = actualIdx === selectedIndex;
            const icon = entry.isDirectory ? '📁 ' : '📄 ';

            return (
              <Box key={entry.name}>
                {isSelected ? (
                  <Text color="cyan">
                    {'▸ '}{icon}{entry.name}{entry.isDirectory && '/'}
                  </Text>
                ) : (
                  <Text>
                    {'  '}{icon}{entry.name}{entry.isDirectory && '/'}
                  </Text>
                )}
              </Box>
            );
          })}

          {startIdx + maxVisible < entries.length && (
            <Text color="gray">  ↓ ({entries.length - startIdx - maxVisible}件)</Text>
          )}
        </Box>
      )}
    </Box>
  );
}
