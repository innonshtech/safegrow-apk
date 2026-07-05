import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

// If running in edge runtimes, we might need different handling, but for now we rely on Node.
// In Monorepos, Next.js handles the loading of root .env automatically.
const connectionString = process.env.DATABASE_URL;
console.log('[DB PACKAGE] DATABASE_URL IS:', connectionString ? 'DEFINED' : 'UNDEFINED');

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in process.env');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export * from '@prisma/client';
