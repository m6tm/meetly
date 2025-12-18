import "dotenv/config";
import { defineConfig, env } from "prisma/config";

/**
 * Configuration Prisma ORM v7.
 * Centralise les paramètres de la base de données et du schéma.
 */
export default defineConfig({
	schema: "prisma/schema.prisma",
	datasource: {
		url: env("DATABASE_URL"),
		shadowDatabaseUrl: env("DIRECT_URL"),
	},
});
