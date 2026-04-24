import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { randomUUID } from 'crypto';
import { getBooksContainer } from '../lib/cosmos';
import { generateUploadSasUrl, generateReadSasUrl } from '../lib/storage';

interface BookMetadata {
  title: string;
  author: string;
  fileType: 'pdf' | 'epub';
  fileName: string;
  fileSize: number;
}

/**
 * POST /api/books/upload
 * Body: BookMetadata + userId from auth
 * Returns: { bookId, uploadUrl } — client uses uploadUrl to PUT the file to Blob Storage.
 *
 * GET /api/books
 * Query: ?userId=xxx
 * Returns: Array of user's book metadata.
 *
 * GET /api/books/:id
 * Query: ?userId=xxx
 * Returns: Book metadata + download URL.
 */
export async function uploadBook(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const body = (await request.json()) as BookMetadata & { userId?: string };

    if (!body.userId || !body.title || !body.fileType || !body.fileName) {
      return {
        status: 400,
        jsonBody: { error: 'Missing required fields: userId, title, fileType, fileName' },
      };
    }

    const bookId = randomUUID();
    const blobName = `${body.userId}/${bookId}/${body.fileName}`;

    // Generate SAS URL for client-side upload
    const uploadUrl = generateUploadSasUrl(blobName);

    // Save book metadata to Cosmos DB
    const container = await getBooksContainer();
    const bookRecord = {
      id: bookId,
      userId: body.userId,
      title: body.title,
      author: body.author || 'Unknown',
      fileType: body.fileType,
      fileName: body.fileName,
      fileSize: body.fileSize || 0,
      blobName,
      totalWords: 0,
      chapters: [],
      createdAt: new Date().toISOString(),
      extractedText: null, // Will be populated after client-side extraction
    };

    await container.items.create(bookRecord);

    context.log(`Book ${bookId} created for user ${body.userId}`);

    return {
      status: 201,
      jsonBody: { bookId, uploadUrl, book: bookRecord },
    };
  } catch (error: any) {
    context.error('uploadBook error:', error);
    return {
      status: 500,
      jsonBody: { error: 'Internal server error' },
    };
  }
}

export async function getBooks(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const userId = request.query.get('userId');
    if (!userId) {
      return { status: 400, jsonBody: { error: 'Missing userId query parameter' } };
    }

    const container = await getBooksContainer();
    const { resources } = await container.items
      .query({
        query: 'SELECT * FROM c WHERE c.userId = @userId ORDER BY c.createdAt DESC',
        parameters: [{ name: '@userId', value: userId }],
      })
      .fetchAll();

    return {
      status: 200,
      jsonBody: { books: resources },
    };
  } catch (error: any) {
    context.error('getBooks error:', error);
    return { status: 500, jsonBody: { error: 'Internal server error' } };
  }
}

export async function getBookById(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const bookId = request.params.id;
    const userId = request.query.get('userId');

    if (!bookId || !userId) {
      return { status: 400, jsonBody: { error: 'Missing bookId or userId' } };
    }

    const container = await getBooksContainer();
    const { resource } = await container.item(bookId, userId).read();

    if (!resource) {
      return { status: 404, jsonBody: { error: 'Book not found' } };
    }

    // Generate a read SAS URL for the file
    const downloadUrl = resource.blobName
      ? generateReadSasUrl(resource.blobName)
      : null;

    return {
      status: 200,
      jsonBody: { book: resource, downloadUrl },
    };
  } catch (error: any) {
    context.error('getBookById error:', error);
    return { status: 500, jsonBody: { error: 'Internal server error' } };
  }
}

/**
 * PUT /api/books/:id/text
 * Body: { userId, extractedText, chapters, totalWords }
 * Called after client-side text extraction to store the parsed content.
 */
export async function saveBookText(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const bookId = request.params.id;
    const body = (await request.json()) as {
      userId?: string;
      extractedText?: string;
      chapters?: any[];
      totalWords?: number;
    };

    if (!bookId || !body.userId) {
      return { status: 400, jsonBody: { error: 'Missing bookId or userId' } };
    }

    const container = await getBooksContainer();
    const { resource } = await container.item(bookId, body.userId).read();

    if (!resource) {
      return { status: 404, jsonBody: { error: 'Book not found' } };
    }

    // Update with extracted text
    resource.extractedText = body.extractedText || resource.extractedText;
    resource.chapters = body.chapters || resource.chapters;
    resource.totalWords = body.totalWords || resource.totalWords;
    resource.extractedAt = new Date().toISOString();

    await container.item(bookId, body.userId).replace(resource);

    return {
      status: 200,
      jsonBody: { message: 'Book text saved successfully' },
    };
  } catch (error: any) {
    context.error('saveBookText error:', error);
    return { status: 500, jsonBody: { error: 'Internal server error' } };
  }
}
