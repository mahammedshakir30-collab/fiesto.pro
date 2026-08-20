import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient; pool: Pool };

let prismaClient: PrismaClient;

if (globalForPrisma.prisma) {
  prismaClient = globalForPrisma.prisma;
} else {
  const connectionString = process.env.DATABASE_URL;
  const pool = globalForPrisma.pool || new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.pool = pool;
  }
  const adapter = new PrismaPg(pool);
  prismaClient = new PrismaClient({ 
    adapter, 
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"] 
  });
}

export const prisma = prismaClient;

export function withRLS(userId: string) {
  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          const [, result] = await prisma.$transaction([
            prisma.$executeRawUnsafe(`SELECT set_config('role', 'authenticated', TRUE), set_config('app.current_user_id', '${userId}', TRUE)`),
            query(args)
          ]);
          return result;
        }
      }
    }
  });
}

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
