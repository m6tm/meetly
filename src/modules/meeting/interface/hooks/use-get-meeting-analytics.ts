import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@/modules/shared/infrastructure/http";
import type { MeetingAnalytics } from "../../domain/models/meeting-analytics";

export const useGetMeetingAnalytics = () => {
	return useQuery<MeetingAnalytics>({
		queryKey: ["analytics"],
		queryFn: async () => {
			const response = await httpClient.get<MeetingAnalytics>("/api/analytics");
			return response;
		},
	});
};
