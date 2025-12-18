"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

/**
 * Provider pour TanStack Query.
 * Configure le client de requête avec des options par défaut robustes.
 */
export function ReactQueryProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						// Options par défaut pour les requêtes
						staleTime: 60 * 1000, // Les données sont considérées comme fraîches pendant 1 minute
						retry: 1, // Réessayer une fois en cas d'échec
						refetchOnWindowFocus: false, // Ne pas recharger automatiquement au focus de la fenêtre
					},
				},
			}),
	);

	return (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
}
