export interface Book {
  id: string;
  title: string;
  author: string;
  coverUri?: string;
  fileType: 'pdf' | 'epub';
  totalWords: number;
  chapters: Chapter[];
  addedAt: string; // ISO date
  blobUri?: string; // Azure Blob Storage URI
}

export interface Chapter {
  index: number;
  title: string;
  startWordIndex: number;
  endWordIndex: number;
  text: string;
}

export interface Bookmark {
  id: string;
  bookId: string;
  wordIndex: number;
  chapterIndex: number;
  label?: string;
  createdAt: string;
}

export interface ReadingProgress {
  bookId: string;
  currentWordIndex: number;
  currentChapter: number;
  totalWords: number;
  progress: number; // 0.0–1.0
  lastReadAt: string;
}
