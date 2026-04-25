import { app } from '@azure/functions';
import { signup, login } from './functions/auth';
import { uploadBook, getBooks, getBookById, saveBookText, deleteBook } from './functions/books';
import { getProgress, syncProgress } from './functions/progress';
import { getStreaks, syncStreaks } from './functions/streaks';

// ===== Auth =====
app.http('signup', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'auth/signup',
  handler: signup,
});

app.http('login', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'auth/login',
  handler: login,
});

// ===== Books =====
app.http('uploadBook', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'books/upload',
  handler: uploadBook,
});

app.http('getBooks', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'books',
  handler: getBooks,
});

app.http('getBookById', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'books/{id}',
  handler: getBookById,
});

app.http('saveBookText', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'books/{id}/text',
  handler: saveBookText,
});

app.http('deleteBook', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'books/{id}',
  handler: deleteBook,
});

// ===== Progress =====
app.http('getProgress', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'progress',
  handler: getProgress,
});

app.http('syncProgress', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'progress',
  handler: syncProgress,
});

// ===== Streaks =====
app.http('getStreaks', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'streaks',
  handler: getStreaks,
});

app.http('syncStreaks', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'streaks',
  handler: syncStreaks,
});
