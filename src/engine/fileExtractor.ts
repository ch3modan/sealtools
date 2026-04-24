import { Chapter } from '../types/book';

/**
 * Extract text from a PDF file using pdf.js (web-only).
 * Each page becomes a separate extraction unit.
 * We group pages into chapters based on a configurable pages-per-chapter.
 */
export async function extractTextFromPDF(
  arrayBuffer: ArrayBuffer,
  pagesPerChapter: number = 10
): Promise<{ chapters: Chapter[]; totalWords: number }> {
  // Dynamic import — pdf.js is only available on web
  const pdfjsLib = await import('pdfjs-dist');

  // Set worker source — use unpkg to avoid Metro bundling issues and ensure version matches
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  const pageTexts: string[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    pageTexts.push(pageText);
  }

  // Group pages into chapters
  const chapters: Chapter[] = [];
  let globalWordIndex = 0;

  for (let i = 0; i < pageTexts.length; i += pagesPerChapter) {
    const chunkPages = pageTexts.slice(i, i + pagesPerChapter);
    const chapterText = chunkPages.join('\n\n');
    const words = chapterText.split(/\s+/).filter(Boolean);

    const startPage = i + 1;
    const endPage = Math.min(i + pagesPerChapter, pageTexts.length);

    chapters.push({
      index: chapters.length,
      title: `Pages ${startPage}–${endPage}`,
      startWordIndex: globalWordIndex,
      endWordIndex: globalWordIndex + words.length - 1,
      text: chapterText,
    });

    globalWordIndex += words.length;
  }

  return { chapters, totalWords: globalWordIndex };
}

/**
 * Extract text from an EPUB file.
 * Uses a simple approach: parse the EPUB as a ZIP, find HTML content files,
 * and strip HTML tags to get plain text.
 */
export async function extractTextFromEPUB(
  arrayBuffer: ArrayBuffer
): Promise<{ chapters: Chapter[]; totalWords: number }> {
  // EPUBs are ZIP files containing XHTML content
  // We'll use a simple approach without external EPUB library:
  // 1. Parse the ZIP
  // 2. Find content files from the OPF manifest
  // 3. Extract text from HTML

  // For web, we can use the built-in DecompressionStream or a simple approach
  // For now, we'll use a basic HTML text extraction from the raw content

  try {
    // Try to load epub.js if available
    const ePub = await import('epubjs').catch(() => null);

    if (ePub) {
      return extractWithEpubJs(arrayBuffer, ePub.default);
    }
  } catch {
    // epub.js not available — fall through to basic extraction
  }

  // Fallback: treat the entire content as text
  const decoder = new TextDecoder('utf-8');
  const text = decoder.decode(arrayBuffer);

  // Try to extract text between HTML body tags
  const bodyMatches = text.match(/<body[^>]*>([\s\S]*?)<\/body>/gi) || [];
  const extractedTexts = bodyMatches.map((body) =>
    body
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ')
      .trim()
  );

  const fullText = extractedTexts.join('\n\n') || 'Unable to extract text from this EPUB file.';
  const words = fullText.split(/\s+/).filter(Boolean);

  return {
    chapters: [
      {
        index: 0,
        title: 'Full Text',
        startWordIndex: 0,
        endWordIndex: words.length - 1,
        text: fullText,
      },
    ],
    totalWords: words.length,
  };
}

async function extractWithEpubJs(
  arrayBuffer: ArrayBuffer,
  ePub: any
): Promise<{ chapters: Chapter[]; totalWords: number }> {
  const book = ePub(arrayBuffer);
  await book.ready;

  const spine = book.spine;
  const chapters: Chapter[] = [];
  let globalWordIndex = 0;

  for (let i = 0; i < spine.items.length; i++) {
    const section = spine.get(i);
    if (!section) continue;
    
    const contents = await section.load(book.load.bind(book));
    const doc = contents.document || contents;

    // Extract text from the section
    const textContent = doc.body
      ? doc.body.textContent || ''
      : typeof contents === 'string'
        ? contents.replace(/<[^>]+>/g, ' ')
        : '';

    const text = textContent.replace(/\s+/g, ' ').trim();
    if (!text) continue;

    const words = text.split(/\s+/).filter(Boolean);

    chapters.push({
      index: chapters.length,
      title: section.idref || `Chapter ${chapters.length + 1}`,
      startWordIndex: globalWordIndex,
      endWordIndex: globalWordIndex + words.length - 1,
      text,
    });

    globalWordIndex += words.length;
  }

  book.destroy();

  return { chapters, totalWords: globalWordIndex };
}
