import type { FileAdapter } from './FileAdapter.js';

/**
 * ファイルアダプターのレジストリ
 * 登録されたアダプターの中から、指定されたファイルを処理できるものを検索する
 */
export class AdapterRegistry {
  private adapters: FileAdapter[] = [];

  /**
   * アダプターを登録する
   * @param adapter 登録するアダプター
   */
  register(adapter: FileAdapter): void {
    this.adapters.push(adapter);
  }

  /**
   * 複数のアダプターを一括登録する
   * @param adapters 登録するアダプターの配列
   */
  registerAll(adapters: FileAdapter[]): void {
    this.adapters.push(...adapters);
  }

  /**
   * 指定されたファイルを処理できるアダプターを検索する
   * @param filePath ファイルパス
   * @returns 対応するアダプター、見つからない場合は undefined
   */
  findAdapter(filePath: string): FileAdapter | undefined {
    return this.adapters.find((adapter) => adapter.canHandle(filePath));
  }

  /**
   * 指定されたファイルを処理できるアダプターが存在するかを確認する
   * @param filePath ファイルパス
   * @returns 対応するアダプターが存在する場合 true
   */
  hasAdapter(filePath: string): boolean {
    return this.adapters.some((adapter) => adapter.canHandle(filePath));
  }

  /**
   * 登録されているアダプターの数を取得する
   */
  get count(): number {
    return this.adapters.length;
  }

  /**
   * 登録されているアダプター名の一覧を取得する
   */
  getAdapterNames(): string[] {
    return this.adapters.map((adapter) => adapter.name);
  }
}
