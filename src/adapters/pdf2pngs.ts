import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, basename, extname } from 'node:path';
import { pdfToPng } from 'pdf-to-png-converter';

export interface PdfConversionResult {
  success: boolean;
  outputDir: string;
  pageCount: number;
  files: string[];
  error?: string;
}

export interface PdfConversionOptions {
  scale?: number;  // 解像度スケール（デフォルト: 2.0）
}

/**
 * PDFファイルを1ページ1画像としてPNGに変換する
 * @param pdfPath PDFファイルのパス
 * @param options 変換オプション
 * @returns 変換結果
 */
export async function convertPdfToPngs(
  pdfPath: string,
  options: PdfConversionOptions = {}
): Promise<PdfConversionResult> {
  const { scale = 2.0 } = options;

  // 出力ディレクトリを決定（PDFファイル名のbasename）
  const pdfDir = dirname(pdfPath);
  const pdfBasename = basename(pdfPath, extname(pdfPath));
  const outputDir = join(pdfDir, pdfBasename);

  const files: string[] = [];

  try {
    // 出力ディレクトリを作成
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    // PDFをPNGに変換
    const pngPages = await pdfToPng(pdfPath, {
      viewportScale: scale,
    });

    const pageCount = pngPages.length;
    const padLength = String(pageCount).length;

    // 各ページをファイルに保存
    for (let i = 0; i < pngPages.length; i++) {
      const page = pngPages[i];
      if (!page?.content) continue;

      const paddedNum = String(i + 1).padStart(padLength, '0');
      const outputPath = join(outputDir, `page_${paddedNum}.png`);

      writeFileSync(outputPath, page.content);
      files.push(outputPath);
    }

    return {
      success: true,
      outputDir,
      pageCount,
      files,
    };
  } catch (error) {
    return {
      success: false,
      outputDir,
      pageCount: 0,
      files,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * ファイルがPDFかどうかを判定する
 * @param filePath ファイルパス
 * @returns PDFの場合true
 */
export function isPdfFile(filePath: string): boolean {
  return extname(filePath).toLowerCase() === '.pdf';
}
