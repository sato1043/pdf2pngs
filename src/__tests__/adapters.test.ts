import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { FileAdapter, FileProcessResult } from '../adapters/FileAdapter.js';
import { AdapterRegistry } from '../adapters/AdapterRegistry.js';
import { PdfAdapter } from '../adapters/PdfAdapter.js';

// pdfToImages モジュールをモック
vi.mock('../pdfToImages.js', () => ({
  convertPdfToImages: vi.fn(),
}));

import { convertPdfToImages } from '../pdfToImages.js';
const mockConvertPdfToImages = vi.mocked(convertPdfToImages);

// テスト用のダミーアダプター
class DummyAdapter implements FileAdapter {
  readonly name = 'DummyAdapter';
  private extension: string;

  constructor(extension: string) {
    this.extension = extension;
  }

  canHandle(filePath: string): boolean {
    return filePath.toLowerCase().endsWith(this.extension);
  }

  async process(_filePath: string): Promise<FileProcessResult> {
    return {
      success: true,
      messages: [{ type: 'success', text: `${this.name} processed` }],
    };
  }
}

describe('AdapterRegistry', () => {
  let registry: AdapterRegistry;

  beforeEach(() => {
    registry = new AdapterRegistry();
  });

  describe('register', () => {
    it('アダプターを登録できる', () => {
      const adapter = new DummyAdapter('.txt');
      registry.register(adapter);
      expect(registry.count).toBe(1);
    });

    it('複数のアダプターを登録できる', () => {
      registry.register(new DummyAdapter('.txt'));
      registry.register(new DummyAdapter('.md'));
      expect(registry.count).toBe(2);
    });
  });

  describe('registerAll', () => {
    it('複数のアダプターを一括登録できる', () => {
      const adapters = [
        new DummyAdapter('.txt'),
        new DummyAdapter('.md'),
        new DummyAdapter('.json'),
      ];
      registry.registerAll(adapters);
      expect(registry.count).toBe(3);
    });
  });

  describe('findAdapter', () => {
    beforeEach(() => {
      registry.register(new DummyAdapter('.txt'));
      registry.register(new DummyAdapter('.md'));
      registry.register(new PdfAdapter());
    });

    it('対応するアダプターを見つけられる', () => {
      const adapter = registry.findAdapter('/path/to/file.txt');
      expect(adapter).toBeDefined();
      expect(adapter?.name).toBe('DummyAdapter');
    });

    it('PDFファイルに対してPdfAdapterを返す', () => {
      const adapter = registry.findAdapter('/path/to/document.pdf');
      expect(adapter).toBeDefined();
      expect(adapter?.name).toBe('PdfAdapter');
    });

    it('大文字小文字を区別しない', () => {
      const adapter = registry.findAdapter('/path/to/DOCUMENT.PDF');
      expect(adapter).toBeDefined();
      expect(adapter?.name).toBe('PdfAdapter');
    });

    it('対応するアダプターがない場合はundefinedを返す', () => {
      const adapter = registry.findAdapter('/path/to/file.unknown');
      expect(adapter).toBeUndefined();
    });

    it('最初に見つかったアダプターを返す', () => {
      // 同じ拡張子に対応するアダプターを追加
      registry.register(new DummyAdapter('.txt'));
      const adapter = registry.findAdapter('/path/to/file.txt');
      expect(adapter?.name).toBe('DummyAdapter');
    });
  });

  describe('hasAdapter', () => {
    beforeEach(() => {
      registry.register(new DummyAdapter('.txt'));
      registry.register(new PdfAdapter());
    });

    it('対応するアダプターがある場合はtrueを返す', () => {
      expect(registry.hasAdapter('/path/to/file.txt')).toBe(true);
      expect(registry.hasAdapter('/path/to/document.pdf')).toBe(true);
    });

    it('対応するアダプターがない場合はfalseを返す', () => {
      expect(registry.hasAdapter('/path/to/file.unknown')).toBe(false);
    });
  });

  describe('getAdapterNames', () => {
    it('登録されているアダプター名の一覧を取得できる', () => {
      registry.register(new DummyAdapter('.txt'));
      registry.register(new PdfAdapter());
      const names = registry.getAdapterNames();
      expect(names).toContain('DummyAdapter');
      expect(names).toContain('PdfAdapter');
    });

    it('空のレジストリでは空配列を返す', () => {
      const names = registry.getAdapterNames();
      expect(names).toEqual([]);
    });
  });
});

describe('PdfAdapter', () => {
  let adapter: PdfAdapter;

  beforeEach(() => {
    adapter = new PdfAdapter();
    vi.clearAllMocks();
  });

  describe('canHandle', () => {
    it('PDFファイルに対してtrueを返す', () => {
      expect(adapter.canHandle('/path/to/document.pdf')).toBe(true);
    });

    it('大文字の拡張子でもtrueを返す', () => {
      expect(adapter.canHandle('/path/to/DOCUMENT.PDF')).toBe(true);
    });

    it('混在した大文字小文字でもtrueを返す', () => {
      expect(adapter.canHandle('/path/to/Document.Pdf')).toBe(true);
    });

    it('PDF以外のファイルに対してfalseを返す', () => {
      expect(adapter.canHandle('/path/to/document.txt')).toBe(false);
      expect(adapter.canHandle('/path/to/image.png')).toBe(false);
      expect(adapter.canHandle('/path/to/document')).toBe(false);
    });

    it('pdfを含むがPDFでないファイルに対してfalseを返す', () => {
      expect(adapter.canHandle('/path/to/pdf_info.txt')).toBe(false);
      expect(adapter.canHandle('/path/to/my.pdf.backup')).toBe(false);
    });
  });

  describe('process', () => {
    it('変換成功時に成功メッセージを返す', async () => {
      mockConvertPdfToImages.mockResolvedValue({
        success: true,
        outputDir: '/path/to/document',
        pageCount: 5,
        files: [
          '/path/to/document/page_1.png',
          '/path/to/document/page_2.png',
          '/path/to/document/page_3.png',
          '/path/to/document/page_4.png',
          '/path/to/document/page_5.png',
        ],
      });

      const result = await adapter.process('/path/to/document.pdf');

      expect(result.success).toBe(true);
      expect(result.messages).toHaveLength(2);
      expect(result.messages[0].type).toBe('success');
      expect(result.messages[0].text).toContain('5ページ');
      expect(result.messages[1].type).toBe('info');
    });

    it('変換失敗時にエラーメッセージを返す', async () => {
      mockConvertPdfToImages.mockResolvedValue({
        success: false,
        outputDir: '/path/to/document',
        pageCount: 0,
        files: [],
        error: 'ファイルが見つかりません',
      });

      const result = await adapter.process('/path/to/document.pdf');

      expect(result.success).toBe(false);
      expect(result.error).toBe('ファイルが見つかりません');
    });

    it('例外発生時にエラーメッセージを返す', async () => {
      mockConvertPdfToImages.mockRejectedValue(new Error('予期せぬエラー'));

      const result = await adapter.process('/path/to/document.pdf');

      expect(result.success).toBe(false);
      expect(result.error).toBe('予期せぬエラー');
    });

    it('エラーがundefinedの場合はデフォルトメッセージを返す', async () => {
      mockConvertPdfToImages.mockResolvedValue({
        success: false,
        outputDir: '/path/to/document',
        pageCount: 0,
        files: [],
        // error は undefined
      });

      const result = await adapter.process('/path/to/document.pdf');

      expect(result.success).toBe(false);
      expect(result.error).toBe('不明なエラー');
    });
  });

  describe('オプション', () => {
    it('スケールオプションを指定できる', async () => {
      const adapterWithScale = new PdfAdapter({ scale: 3.0 });

      mockConvertPdfToImages.mockResolvedValue({
        success: true,
        outputDir: '/path/to/document',
        pageCount: 1,
        files: ['/path/to/document/page_1.png'],
      });

      await adapterWithScale.process('/path/to/document.pdf');

      expect(mockConvertPdfToImages).toHaveBeenCalledWith(
        '/path/to/document.pdf',
        { scale: 3.0 }
      );
    });

    it('スケールオプションが未指定の場合は空オブジェクトを渡す', async () => {
      mockConvertPdfToImages.mockResolvedValue({
        success: true,
        outputDir: '/path/to/document',
        pageCount: 1,
        files: ['/path/to/document/page_1.png'],
      });

      await adapter.process('/path/to/document.pdf');

      expect(mockConvertPdfToImages).toHaveBeenCalledWith(
        '/path/to/document.pdf',
        {}
      );
    });
  });
});

describe('FileAdapter インターフェース', () => {
  it('name プロパティを持つ', () => {
    const adapter: FileAdapter = new PdfAdapter();
    expect(adapter.name).toBe('PdfAdapter');
  });

  it('canHandle メソッドを持つ', () => {
    const adapter: FileAdapter = new PdfAdapter();
    expect(typeof adapter.canHandle).toBe('function');
  });

  it('process メソッドを持つ', () => {
    const adapter: FileAdapter = new PdfAdapter();
    expect(typeof adapter.process).toBe('function');
  });
});

describe('統合テスト: Registry + Adapter', () => {
  it('レジストリから取得したアダプターでファイルを処理できる', async () => {
    const registry = new AdapterRegistry();
    registry.register(new PdfAdapter());

    mockConvertPdfToImages.mockResolvedValue({
      success: true,
      outputDir: '/path/to/document',
      pageCount: 3,
      files: [
        '/path/to/document/page_1.png',
        '/path/to/document/page_2.png',
        '/path/to/document/page_3.png',
      ],
    });

    const filePath = '/path/to/document.pdf';
    const adapter = registry.findAdapter(filePath);

    expect(adapter).toBeDefined();
    if (adapter) {
      const result = await adapter.process(filePath);
      expect(result.success).toBe(true);
      expect(result.messages[0].text).toContain('3ページ');
    }
  });

  it('対応するアダプターがない場合は処理をスキップできる', () => {
    const registry = new AdapterRegistry();
    registry.register(new PdfAdapter());

    const adapter = registry.findAdapter('/path/to/file.txt');
    expect(adapter).toBeUndefined();
  });
});
