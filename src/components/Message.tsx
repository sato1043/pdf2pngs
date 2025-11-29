import { Text } from 'ink';

interface MessageProps {
  type: 'success' | 'error' | 'info';
  children: React.ReactNode;
}

export function Message({ type, children }: MessageProps) {
  const prefix = type === 'error' ? 'Error: ' : '';

  if (type === 'error') {
    return <Text color="red">{prefix}{children}</Text>;
  }
  if (type === 'success') {
    return <Text color="green">{children}</Text>;
  }
  return <Text>{children}</Text>;
}
