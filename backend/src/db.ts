import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';

// 1. Find the exact, absolute path to your manual dev.db file
const dbPath = path.resolve(process.cwd(), 'prisma/dev.db');

// 2. Initialize the Prisma 7 SQLite Adapter
const adapter = new PrismaBetterSqlite3({
  url: `file:${dbPath}`
});

// 3. Pass the adapter into the Prisma Client
const prisma = new PrismaClient({ adapter });

export default prisma;