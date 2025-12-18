import { PrismaClient } from "@prisma/client";
import { cache } from "react";

let prismaInstance: PrismaClient | undefined;

export const getPrisma = cache((): PrismaClient => {
	if (prismaInstance) return prismaInstance;

	const globalForPrisma = globalThis as { prisma?: PrismaClient };

	if (process.env.NODE_ENV === "production") {
		console.log(
			"Initializing Prisma in production. DATABASE_URL defined:",
			!!process.env.DATABASE_URL,
		);
		prismaInstance = new PrismaClient({
			accelerateUrl: process.env.DATABASE_URL,
		});
		return prismaInstance;
	}

	if (!globalForPrisma.prisma) {
		console.log(
			"Initializing Prisma in development. DATABASE_URL defined:",
			!!process.env.DATABASE_URL,
		);
		globalForPrisma.prisma = new PrismaClient({
			accelerateUrl: process.env.DATABASE_URL,
		});
	}

	prismaInstance = globalForPrisma.prisma;
	return prismaInstance;
});
