import { textVide } from 'text-vide';

export interface ProcessedWord {
  original: string;
  boldPart: string;
  normalPart: string;
  orpIndex: number;
  hasPunctuation: boolean;
  isEndOfSentence: boolean;
  isEndOfParagraph: boolean;
}

/**
 * Calculate the Optimal Recognition Point (ORP) index for a word.
 * For short words (1-3 chars), the ORP is the 1st character.
 * For medium words (4-6 chars), the ORP is the 2nd character.
 * For longer words, the ORP is the 3rd character.
 */
export function calculateORP(word: string): number {
  const len = word.replace(/[^a-zA-Z]/g, '').length;
  if (len <= 1) return 0;
  if (len <= 3) return 0;
  if (len <= 6) return 1;
  return 2;
}

/**
 * Process raw text into an array of ProcessedWord objects for RSVP display.
 */
export function processText(rawText: string): ProcessedWord[] {
  const paragraphs = rawText.split(/\n\s*\n/);
  const words: ProcessedWord[] = [];

  for (const paragraph of paragraphs) {
    const paraWords = paragraph.trim().split(/\s+/).filter(Boolean);

    for (let i = 0; i < paraWords.length; i++) {
      const w = paraWords[i];
      const orpIndex = calculateORP(w);

      // Calculate bionic reading split (bold first ~half of letters)
      const letterCount = w.replace(/[^a-zA-Z]/g, '').length;
      const boldLen = Math.ceil(letterCount / 2);
      let boldPart = '';
      let normalPart = '';
      let lettersSeen = 0;

      for (let c = 0; c < w.length; c++) {
        if (/[a-zA-Z]/.test(w[c])) {
          lettersSeen++;
          if (lettersSeen <= boldLen) {
            boldPart += w[c];
          } else {
            normalPart += w[c];
          }
        } else {
          // Punctuation goes with whichever part we're in
          if (lettersSeen <= boldLen) {
            boldPart += w[c];
          } else {
            normalPart += w[c];
          }
        }
      }

      words.push({
        original: w,
        boldPart,
        normalPart,
        orpIndex,
        hasPunctuation: /[.,;:!?"')\]]/.test(w),
        isEndOfSentence: /[.!?]$/.test(w) || /[.!?]["')]$/.test(w),
        isEndOfParagraph: i === paraWords.length - 1,
      });
    }
  }

  return words;
}

/**
 * Apply bionic reading HTML formatting using text-vide library.
 * Returns HTML string with <b> tags for the bold fixation points.
 */
export function applyBionicReading(text: string): string {
  return textVide(text);
}

/**
 * Calculate the display delay for a word in milliseconds.
 * Smart pauses: sentence-end gets 2.5x delay, paragraph-end gets 3x.
 */
export function getWordDelay(
  word: ProcessedWord,
  wpm: number,
  smartPause: boolean
): number {
  const baseDelay = 60000 / wpm;

  if (!smartPause) return baseDelay;

  if (word.isEndOfParagraph) return baseDelay * 3;
  if (word.isEndOfSentence) return baseDelay * 2.5;
  if (word.hasPunctuation) return baseDelay * 1.5;

  return baseDelay;
}

/**
 * Extract chunks of N words for multi-word RSVP display.
 */
export function getWordChunk(
  words: ProcessedWord[],
  startIndex: number,
  count: number
): ProcessedWord[] {
  return words.slice(startIndex, startIndex + count);
}
