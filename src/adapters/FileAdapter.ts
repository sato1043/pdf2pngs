/**
 * ファイル処理の結果を表す型
 */
export interface FileProcessResult {
  /** 処理が成功したか */
  success: boolean;
  /** 処理結果のメッセージ（複数行対応） */
  messages: FileProcessMessage[];
  /** エラーメッセージ（失敗時） */
  error?: string;
}

/**
 * 処理結果のメッセージ
 */
export interface FileProcessMessage {
  type: 'success' | 'error' | 'info';
  text: string;
}

/**
 * ファイル処理アダプターのインターフェース
 * 各ファイルタイプに対応するアダプターはこのインターフェースを実装する
 */
export interface FileAdapter {
  /** アダプターの名前（識別用） */
  readonly name: string;

  /**
   * このアダプターが指定されたファイルを処理できるかを判定する
   * @param filePath ファイルパス
   * @returns 処理可能な場合 true
   */
  canHandle(filePath: string): boolean;

  /**
   * ファイルを処理する
   * @param filePath ファイルパス
   * @returns 処理結果
   */
  process(filePath: string): Promise<FileProcessResult>;
}
