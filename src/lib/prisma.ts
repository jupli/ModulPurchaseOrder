import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "mongodb+srv://jupli503:jupli123@cluster0.toef1.mongodb.net/modulPO?appName=Cluster0",
    },
  },
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
