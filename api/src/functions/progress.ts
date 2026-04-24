import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getProgressContainer } from '../lib/cosmos';

/**
 * GET /api/progress?userId=xxx&bookId=xxx
 * Returns reading progress for a specific book.
 *
 * PUT /api/progress
 * Body: { userId, bookId, currentWordIndex, currentChapter, totalWords, progress, bookmarks }
 * Syncs reading progress and bookmarks to the cloud.
 */
export async function getProgress(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const userId = request.query.get('userId');
    const bookId = request.query.get('bookId');

    if (!userId) {
      return { status: 400, jsonBody: { error: 'Missing userId' } };
    }

    const container = await getProgressContainer();

    if (bookId) {
      // Get progress for a specific book
      const id = `${userId}_${bookId}`;
      const { resource } = await container.item(id, userId).read();
      return { status: 200, jsonBody: { progress: resource || null } };
    }

    // Get all progress for user
    const { resources } = await container.items
      .query({
        query: 'SELECT * FROM c WHERE c.userId = @userId',
        parameters: [{ name: '@userId', value: userId }],
      })
      .fetchAll();

    return { status: 200, jsonBody: { progress: resources } };
  } catch (error: any) {
    context.error('getProgress error:', error);
    return { status: 500, jsonBody: { error: 'Internal server error' } };
  }
}

export async function syncProgress(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const body = (await request.json()) as {
      userId?: string;
      bookId?: string;
      currentWordIndex?: number;
      currentChapter?: number;
      totalWords?: number;
      progress?: number;
      bookmarks?: any[];
    };

    if (!body.userId || !body.bookId) {
      return { status: 400, jsonBody: { error: 'Missing userId or bookId' } };
    }

    const container = await getProgressContainer();
    const id = `${body.userId}_${body.bookId}`;

    const progressRecord = {
      id,
      userId: body.userId,
      bookId: body.bookId,
      currentWordIndex: body.currentWordIndex || 0,
      currentChapter: body.currentChapter || 0,
      totalWords: body.totalWords || 0,
      progress: body.progress || 0,
      bookmarks: body.bookmarks || [],
      lastSyncedAt: new Date().toISOString(),
    };

    await container.items.upsert(progressRecord);

    return {
      status: 200,
      jsonBody: { message: 'Progress synced', progress: progressRecord },
    };
  } catch (error: any) {
    context.error('syncProgress error:', error);
    return { status: 500, jsonBody: { error: 'Internal server error' } };
  }
}
