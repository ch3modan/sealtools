import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getProgressContainer } from '../lib/cosmos';

/**
 * GET /api/streaks?userId=xxx
 * Returns the user's streak data.
 *
 * PUT /api/streaks
 * Body: { userId, currentStreak, longestStreak, lastReadDate, readingHistory, totalWordsRead, todayWordsRead }
 * Syncs streak data to the cloud.
 */
export async function getStreaks(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const userId = request.query.get('userId');
    if (!userId) {
      return { status: 400, jsonBody: { error: 'Missing userId' } };
    }

    const container = await getProgressContainer();
    const id = `streaks_${userId}`;

    try {
      const { resource } = await container.item(id, userId).read();
      return { status: 200, jsonBody: { streaks: resource || null } };
    } catch {
      return { status: 200, jsonBody: { streaks: null } };
    }
  } catch (error: any) {
    context.error('getStreaks error:', error);
    return { status: 500, jsonBody: { error: 'Internal server error' } };
  }
}

export async function syncStreaks(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const body = (await request.json()) as {
      userId?: string;
      currentStreak?: number;
      longestStreak?: number;
      lastReadDate?: string | null;
      readingHistory?: string[];
      totalBooksRead?: number;
      totalWordsRead?: number;
      todayWordsRead?: number;
      dailyGoal?: number;
    };

    if (!body.userId) {
      return { status: 400, jsonBody: { error: 'Missing userId' } };
    }

    const container = await getProgressContainer();
    const id = `streaks_${body.userId}`;

    const streakRecord = {
      id,
      userId: body.userId,
      currentStreak: body.currentStreak || 0,
      longestStreak: body.longestStreak || 0,
      lastReadDate: body.lastReadDate || null,
      readingHistory: body.readingHistory || [],
      totalBooksRead: body.totalBooksRead || 0,
      totalWordsRead: body.totalWordsRead || 0,
      todayWordsRead: body.todayWordsRead || 0,
      dailyGoal: body.dailyGoal || 1000,
      lastSyncedAt: new Date().toISOString(),
    };

    await container.items.upsert(streakRecord);

    return {
      status: 200,
      jsonBody: { message: 'Streaks synced', streaks: streakRecord },
    };
  } catch (error: any) {
    context.error('syncStreaks error:', error);
    return { status: 500, jsonBody: { error: 'Internal server error' } };
  }
}
