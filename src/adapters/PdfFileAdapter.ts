import { extname } from 'node:path';
import type { FileAdapter, FileProcessResult } from './FileAdapter.js';
import { convertPdfToPngs } from './pdf2pngs.js';

/**
 * PDF変換オプション
 */
export interface PdfFileAdapterOptions {
  /** 解像度スケール（デフォルト: 2.0） */
  scale?: number;
}

/**
 * PDFファイルをPNG画像に変換するアダプター
 */
export class PdfFileAdapter implements FileAdapter {
  readonly name = 'PdfFileAdapter';
  private options: PdfFileAdapterOptions;

  constructor(options: PdfFileAdapterOptions = {}) {
    this.options = options;
  }

  /**
   * ファイルがPDFかどうかを判定する
   * @param filePath ファイルパス
   * @returns PDFの場合 true
   */
  canHandle(filePath: string): boolean {
    return extname(filePath).toLowerCase() === '.pdf';
  }

  /**
   * PDFファイルを画像に変換する
   * @param filePath PDFファイルのパス
   * @returns 処理結果
   */
  async process(filePath: string): Promise<FileProcessResult> {
    try {
      // undefinedの場合はオプションを渡さない
      const options = this.options.scale !== undefined ? { scale: this.options.scale } : {};
      const result = await convertPdfToPngs(filePath, options);

      if (result.success) {
        const padLength = String(result.pageCount).length;
        return {
          success: true,
          messages: [
            {
              type: 'success',
              text: `PDF変換完了: ${result.pageCount}ページ → ${result.outputDir}/`,
            },
            {
              type: 'info',
              text: `  保存ファイル: page_${'0'.repeat(padLength - 1)}1.png 〜 page_${String(result.pageCount).padStart(padLength, '0')}.png`,
            },
          ],
        };
      } else {
        return {
          success: false,
          messages: [],
          error: result.error ?? '不明なエラー',
        };
      }
    } catch (error) {
      return {
        success: false,
        messages: [],
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
