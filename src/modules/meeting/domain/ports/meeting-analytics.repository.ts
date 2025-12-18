import type { MeetingAnalytics } from "../models/meeting-analytics";

export interface IMeetingAnalyticsRepository {
	getAnalytics(userId: string): Promise<MeetingAnalytics>;
}
