import { useState, useCallback, useMemo } from 'react';
import { Box, Text, useApp } from 'ink';
import { execSync } from 'node:child_process';
import { statSync } from 'node:fs';
import { extname } from 'node:path';
import { FileSelector } from './FileSelector.js';
import { Message } from './Message.js';
import { AdapterRegistry, PdfFileAdapter } from '../adapters/index.js';

interface FileSelectorAppProps {
  onExit: () => void;
}

type MessageItem = {
  type: 'success' | 'error' | 'info';
  text: string;
};

export function FileSelectorApp({ onExit }: FileSelectorAppProps) {
  const { exit } = useApp();
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSelector, setShowSelector] = useState(true);

  // ファイルアダプターレジストリの初期化
  const adapterRegistry = useMemo(() => {
    const registry = new AdapterRegistry();
    registry.register(new PdfFileAdapter());
    return registry;
  }, []);

  // メッセージを追加
  const addMessage = useCallback((msg: MessageItem) => {
    setMessages(prev => [...prev, msg]);
  }, []);

  // ファイルタイプを取得するヘルパー関数
  const getFileTypeInfo = useCallback((filePath: string): string => {
    try {
      const stat = statSync(filePath);
      const ext = extname(filePath).toLowerCase() || '(拡張子なし)';
      const size = stat.size;
      const sizeStr = size < 1024
        ? `${size} B`
        : size < 1024 * 1024
          ? `${(size / 1024).toFixed(1)} KB`
          : `${(size / 1024 / 1024).toFixed(1)} MB`;

      // file コマンドで MIME タイプを取得（macOS/Linux）
      let mimeType = '';
      try {
        mimeType = execSync(`file --brief --mime-type "${filePath}"`, { encoding: 'utf-8' }).trim();
      } catch {
        // file コマンドが使えない場合は拡張子のみ
      }

      const parts = [`拡張子: ${ext}`, `サイズ: ${sizeStr}`];
      if (mimeType) {
        parts.push(`タイプ: ${mimeType}`);
      }
      return parts.join(', ');
    } catch {
      return '(ファイル情報を取得できませんでした)';
    }
  }, []);

  // ファイル選択ハンドラ
  const handleFileSelect = useCallback(async (filePath: string) => {
    const fileInfo = getFileTypeInfo(filePath);

    // 対応するアダプターを検索
    const adapter = adapterRegistry.findAdapter(filePath);

    if (adapter) {
      // アダプターが見つかった場合は処理を実行
      setIsProcessing(true);
      setShowSelector(false);
      addMessage({ type: 'info', text: `選択されたファイル: ${filePath}` });
      addMessage({ type: 'info', text: `  ${fileInfo}` });
      addMessage({ type: 'info', text: `処理中... (${adapter.name})` });

      try {
        const result = await adapter.process(filePath);

        if (result.success) {
          for (const msg of result.messages) {
            addMessage({ type: msg.type, text: msg.text });
          }
        } else {
          addMessage({ type: 'error', text: `処理エラー: ${result.error}` });
        }
      } catch (error) {
        addMessage({
          type: 'error',
          text: `処理エラー: ${error instanceof Error ? error.message : String(error)}`,
        });
      } finally {
        setIsProcessing(false);
        // 処理完了後に終了
        setTimeout(() => {
          onExit();
          exit();
        }, 100);
      }
    } else {
      // アダプターが見つからない場合はファイル情報のみ表示して終了
      setShowSelector(false);
      addMessage({ type: 'info', text: `選択されたファイル: ${filePath}` });
      addMessage({ type: 'info', text: `  ${fileInfo}` });
      addMessage({ type: 'info', text: '(対応するアダプターがありません)' });
      setTimeout(() => {
        onExit();
        exit();
      }, 100);
    }
  }, [adapterRegistry, addMessage, getFileTypeInfo, onExit, exit]);

  // キャンセルハンドラ
  const handleCancel = useCallback(() => {
    onExit();
    exit();
  }, [onExit, exit]);

  return (
    <Box flexDirection="column">
      {/* ヘッダー */}
      <Box marginBottom={1}>
        <Text bold color="cyan">PDF to Images Converter</Text>
      </Box>

      {/* メッセージ表示 */}
      {messages.length > 0 && (
        <Box flexDirection="column" marginBottom={1}>
          {messages.map((msg, index) => (
            <Message key={index} type={msg.type}>{msg.text}</Message>
          ))}
        </Box>
      )}

      {/* 処理中表示 */}
      {isProcessing && (
        <Box>
          <Text color="yellow">処理中...</Text>
        </Box>
      )}

      {/* ファイルセレクター */}
      {showSelector && !isProcessing && (
        <FileSelector onSelect={handleFileSelect} onCancel={handleCancel} />
      )}
    </Box>
  );
}
