import type { MeetingAnalytics } from "../../domain/models/meeting-analytics";
import type { IMeetingAnalyticsRepository } from "../../domain/ports/meeting-analytics.repository";

export class GetMeetingAnalyticsUseCase {
	constructor(
		private readonly meetingAnalyticsRepository: IMeetingAnalyticsRepository,
	) {}

	async execute(userId: string): Promise<MeetingAnalytics> {
		return await this.meetingAnalyticsRepository.getAnalytics(userId);
	}
}
