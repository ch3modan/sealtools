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
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  const pageTexts: string[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    let pageText = '';
    let lastY = null;

    for (const item of textContent.items as any[]) {
      const str = item.str.trim();
      if (!str) continue;

      const y = item.transform[5];
      
      if (lastY !== null) {
        const diff = Math.abs(y - lastY);
        // If Y difference is large, it's likely a new paragraph
        if (diff > 18) {
          pageText += '\n\n';
        } else if (diff > 5) {
          // Normal line break, just add a space to continue the paragraph
          pageText += ' ';
        } else {
          // Same line
          pageText += ' ';
        }
      }
      
      pageText += str;
      lastY = y;
    }

    const cleanedPage = pageText
      .replace(/[ \t\r]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (cleanedPage) {
      pageTexts.push(cleanedPage);
    }
  }

  const chapters: Chapter[] = [];
  let globalWordIndex = 0;

  for (let i = 0; i < pageTexts.length; i += pagesPerChapter) {
    const chunkPages = pageTexts.slice(i, i + pagesPerChapter);
    const chapterText = chunkPages.join('\n\n\n');
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

export async function extractTextFromEPUB(
  arrayBuffer: ArrayBuffer
): Promise<{ chapters: Chapter[]; totalWords: number }> {
  try {
    const ePub = await import('epubjs').catch(() => null);
    if (ePub) {
      return extractWithEpubJs(arrayBuffer, ePub.default);
    }
  } catch {}

  const decoder = new TextDecoder('utf-8');
  const text = decoder.decode(arrayBuffer);

  const bodyMatches = text.match(/<body[^>]*>([\s\S]*?)<\/body>/gi) || [];
  const extractedTexts = bodyMatches.map((body) =>
    body
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/[ \t\r]+/g, ' ')
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

    let textContent = '';
    
    if (typeof doc === 'string') {
      textContent = doc.replace(/<[^>]+>/g, ' ');
    } else if (doc && doc.body) {
      // Inject newlines into block elements to preserve true paragraph structure
      const blockElements = doc.body.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, blockquote, div');
      blockElements.forEach((el: Element) => {
        el.prepend(doc.createTextNode('\n\n'));
      });
      
      const brElements = doc.body.querySelectorAll('br');
      brElements.forEach((el: Element) => {
        el.replaceWith(doc.createTextNode('\n'));
      });

      const rawText = doc.body.textContent || '';
      textContent = rawText
        .replace(/[ \t\r]+/g, ' ') // collapse horizontal whitespace
        .replace(/\s*\n\s*/g, '\n') // clean up spaces around newlines
        .replace(/\n{3,}/g, '\n\n'); // cap consecutive newlines at 2
    } else if (doc) {
      textContent = doc.textContent || '';
    }

    const text = textContent.trim();
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
