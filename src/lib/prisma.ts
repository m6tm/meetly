import { cache } from 'react';
import { PrismaClient } from '../generated/prisma';

let prismaInstance: PrismaClient | undefined;

export const getPrisma = cache((): PrismaClient => {
    if (prismaInstance) return prismaInstance;

    const globalForPrisma = globalThis as { prisma?: PrismaClient };

    if (process.env.NODE_ENV === 'production') {
        prismaInstance = new PrismaClient();
        return prismaInstance;
    }

    if (!globalForPrisma.prisma) {
        globalForPrisma.prisma = new PrismaClient();
    }

    prismaInstance = globalForPrisma.prisma;
    return prismaInstance;
});