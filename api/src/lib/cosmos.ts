import { CosmosClient, Container, Database } from '@azure/cosmos';

let client: CosmosClient;
let database: Database;
let usersContainer: Container;
let booksContainer: Container;
let progressContainer: Container;
let referralContainer: Container;

function getClient(): CosmosClient {
  if (!client) {
    const endpoint = process.env.COSMOS_ENDPOINT!;
    const key = process.env.COSMOS_KEY!;
    client = new CosmosClient({ endpoint, key });
  }
  return client;
}

async function getDatabase(): Promise<Database> {
  if (!database) {
    const dbName = process.env.COSMOS_DATABASE || 'sealtools';
    const { database: db } = await getClient().databases.createIfNotExists({ id: dbName });
    database = db;
  }
  return database;
}

export async function getUsersContainer(): Promise<Container> {
  if (!usersContainer) {
    const db = await getDatabase();
    const { container } = await db.containers.createIfNotExists({
      id: 'users',
      partitionKey: { paths: ['/userId'] },
    });
    usersContainer = container;
  }
  return usersContainer;
}

export async function getBooksContainer(): Promise<Container> {
  if (!booksContainer) {
    const db = await getDatabase();
    const { container } = await db.containers.createIfNotExists({
      id: 'books',
      partitionKey: { paths: ['/userId'] },
    });
    booksContainer = container;
  }
  return booksContainer;
}

export async function getProgressContainer(): Promise<Container> {
  if (!progressContainer) {
    const db = await getDatabase();
    const { container } = await db.containers.createIfNotExists({
      id: 'progress',
      partitionKey: { paths: ['/userId'] },
    });
    progressContainer = container;
  }
  return progressContainer;
}

export async function getReferralContainer(): Promise<Container> {
  if (!referralContainer) {
    const db = await getDatabase();
    const { container } = await db.containers.createIfNotExists({
      id: 'referrals',
      partitionKey: { paths: ['/code'] },
    });
    referralContainer = container;
  }
  return referralContainer;
}
