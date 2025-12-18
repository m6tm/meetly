import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { cache } from "react";

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined;
	pgPool: Pool | undefined;
};

export const getPrisma = cache((): PrismaClient => {
	if (globalForPrisma.prisma) return globalForPrisma.prisma;

	if (!globalForPrisma.pgPool) {
		globalForPrisma.pgPool = new Pool({
			connectionString: process.env.DATABASE_URL,
		});
	}

	const adapter = new PrismaPg(globalForPrisma.pgPool);

	const client = new PrismaClient({ adapter });

	if (process.env.NODE_ENV !== "production") {
		globalForPrisma.prisma = client;
	}

	return client;
});
