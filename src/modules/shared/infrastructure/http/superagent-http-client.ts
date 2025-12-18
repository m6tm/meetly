import type { Response } from "superagent";
import superagent from "superagent";
import type { IHttpClient } from "../../domain/interfaces/http-client.interface";

/**
 * Implémentation robuste du client HTTP utilisant Superagent.
 */
export class SuperagentHttpClient implements IHttpClient {
	private agent: typeof superagent;

	constructor(private readonly baseUrl: string = "") {
		this.agent = superagent;
	}

	/**
	 * Effectue une requête GET.
	 * @param url - L'URL de la ressource.
	 * @param params - Les paramètres de requête.
	 * @returns La réponse typée.
	 */
	async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
		try {
			const response: Response = await this.agent
				.get(`${this.baseUrl}${url}`)
				.query(params || {})
				.set("Accept", "application/json");

			return response.body as T;
		} catch (error: unknown) {
			this.handleError(error);
		}
	}

	/**
	 * Effectue une requête POST.
	 * @param url - L'URL de la ressource.
	 * @param body - Le corps de la requête.
	 * @returns La réponse typée.
	 */
	async post<T>(url: string, body?: unknown): Promise<T> {
		try {
			const response: Response = await this.agent
				.post(`${this.baseUrl}${url}`)
				.send(body as object)
				.set("Content-Type", "application/json")
				.set("Accept", "application/json");

			return response.body as T;
		} catch (error: unknown) {
			this.handleError(error);
		}
	}

	/**
	 * Effectue une requête PUT.
	 * @param url - L'URL de la ressource.
	 * @param body - Le corps de la requête.
	 * @returns La réponse typée.
	 */
	async put<T>(url: string, body?: unknown): Promise<T> {
		try {
			const response: Response = await this.agent
				.put(`${this.baseUrl}${url}`)
				.send(body as object)
				.set("Content-Type", "application/json")
				.set("Accept", "application/json");

			return response.body as T;
		} catch (error: unknown) {
			this.handleError(error);
		}
	}

	/**
	 * Effectue une requête PATCH.
	 * @param url - L'URL de la ressource.
	 * @param body - Le corps de la requête.
	 * @returns La réponse typée.
	 */
	async patch<T>(url: string, body?: unknown): Promise<T> {
		try {
			const response: Response = await this.agent
				.patch(`${this.baseUrl}${url}`)
				.send(body as object)
				.set("Content-Type", "application/json")
				.set("Accept", "application/json");

			return response.body as T;
		} catch (error: unknown) {
			this.handleError(error);
		}
	}

	/**
	 * Effectue une requête DELETE.
	 * @param url - L'URL de la ressource.
	 * @returns La réponse typée.
	 */
	async delete<T>(url: string): Promise<T> {
		try {
			const response: Response = await this.agent
				.delete(`${this.baseUrl}${url}`)
				.set("Accept", "application/json");

			return response.body as T;
		} catch (error: unknown) {
			this.handleError(error);
		}
	}

	/**
	 * Gère les erreurs de requête de manière centralisée.
	 * @param error - L'erreur interceptée.
	 */
	private handleError(error: unknown): never {
		if (this.isSuperagentError(error)) {
			const status = error.status;
			const body = error.response?.body;

			console.error(`HTTP error ${status}:`, body);
			throw new Error(body?.message || `Erreur HTTP ${status}`);
		}

		if (error instanceof Error) {
			console.error("HTTP client error:", error.message);
			throw error;
		}

		throw new Error("Une erreur inattendue s'est produite lors de la requête.");
	}

	/**
	 * Vérifie si l'erreur est une erreur Superagent.
	 */
	private isSuperagentError(
		error: any,
	): error is { status: number; response?: { body?: { message?: string } } } {
		return error && typeof error.status === "number";
	}
}
