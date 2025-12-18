/**
 * Interface pour le client HTTP.
 * Définit les méthodes de base pour effectuer des requêtes API.
 */
export interface IHttpClient {
	get<T>(url: string, params?: Record<string, unknown>): Promise<T>;
	post<T>(url: string, body?: unknown): Promise<T>;
	put<T>(url: string, body?: unknown): Promise<T>;
	patch<T>(url: string, body?: unknown): Promise<T>;
	delete<T>(url: string): Promise<T>;
}
