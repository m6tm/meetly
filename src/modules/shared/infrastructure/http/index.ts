import { SuperagentHttpClient } from "./superagent-http-client";

/**
 * Instance par défaut du client HTTP.
 * Peut être configurée avec une URL de base via les variables d'environnement.
 */
export const httpClient = new SuperagentHttpClient(
  process.env.NEXT_PUBLIC_API_URL || ""
);

export * from "./superagent-http-client";
