import { useQuery } from "@tanstack/react-query";
import { httpClient } from "../../infrastructure/http";

/**
 * Hook d'exemple pour vérifier la santé de l'API.
 * Utilise TanStack Query et notre client HTTP Superagent.
 */
export function useApiHealth() {
	return useQuery({
		queryKey: ["health"],
		queryFn: () => httpClient.get<{ status: string }>("/health"),
		enabled: false, // Ne pas exécuter automatiquement
	});
}
