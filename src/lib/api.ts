/**
 * API client for communicating with the Azure Functions backend.
 * In production (SWA), the /api prefix is automatically routed.
 * In development, we proxy to the local Functions runtime.
 */

const API_BASE = '/api';

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// ===== Auth =====
interface AuthResponse {
  message: string;
  user: {
    userId: string;
    email: string;
    displayName: string;
    sessionToken: string;
  };
}

export async function signup(email: string, password: string, displayName: string, referralCode: string) {
  return request<AuthResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, displayName, referralCode }),
  });
}

export async function login(email: string, password: string) {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

// ===== Books =====
export async function uploadBookMetadata(userId: string, metadata: {
  title: string;
  author: string;
  fileType: 'pdf' | 'epub';
  fileName: string;
  fileSize: number;
}) {
  return request<{ bookId: string; uploadUrl: string; book: any }>('/books/upload', {
    method: 'POST',
    body: JSON.stringify({ userId, ...metadata }),
  });
}

export async function getBooks(userId: string) {
  return request<{ books: any[] }>(`/books?userId=${encodeURIComponent(userId)}`);
}

export async function getBookById(bookId: string, userId: string) {
  return request<{ book: any; downloadUrl: string | null }>(
    `/books/${bookId}?userId=${encodeURIComponent(userId)}`
  );
}

export async function saveBookText(bookId: string, userId: string, data: {
  extractedText: string;
  chapters: any[];
  totalWords: number;
}) {
  return request<{ message: string }>(`/books/${bookId}/text`, {
    method: 'PUT',
    body: JSON.stringify({ userId, ...data }),
  });
}

// ===== Progress =====
export async function getProgress(userId: string, bookId?: string) {
  const params = new URLSearchParams({ userId });
  if (bookId) params.set('bookId', bookId);
  return request<{ progress: any }>(`/progress?${params}`);
}

export async function syncProgress(data: {
  userId: string;
  bookId: string;
  currentWordIndex: number;
  currentChapter: number;
  totalWords: number;
  progress: number;
  bookmarks: any[];
}) {
  return request<{ message: string; progress: any }>('/progress', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ===== Streaks =====
export async function getStreaks(userId: string) {
  return request<{ streaks: any }>(`/streaks?userId=${encodeURIComponent(userId)}`);
}

export async function syncStreaks(data: {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastReadDate: string | null;
  readingHistory: string[];
  totalBooksRead: number;
  totalWordsRead: number;
  todayWordsRead: number;
  dailyGoal: number;
}) {
  return request<{ message: string; streaks: any }>('/streaks', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Upload a file directly to Azure Blob Storage using the SAS URL
 * returned from the uploadBookMetadata endpoint.
 */
export async function uploadFileToBlob(
  sasUrl: string,
  file: Blob,
  onProgress?: (loaded: number, total: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', sasUrl, true);
    xhr.setRequestHeader('x-ms-blob-type', 'BlockBlob');
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');

    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          onProgress(e.loaded, e.total);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed: ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error('Upload network error'));
    xhr.send(file);
  });
}
