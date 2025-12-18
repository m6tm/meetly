export type MeetingTrend = {
	month: string;
	meetings: number;
};

export type TranscriptionDistribution = {
	name: string;
	value: number;
	fill: string;
};

export type MeetingAnalytics = {
	totalMeetings: {
		total: number;
		lastMonth: number;
	};
	avgRecordingDuration: {
		total: number;
		lastMonth: number;
	};
	avgMeetingDuration: {
		total: number;
		lastMonth: number;
	};
	transcriptionSuccessRate: {
		total: number;
		lastMonth: number;
	};
	meetingTrends: MeetingTrend[];
	transcriptionStatusDistribution: TranscriptionDistribution[];
};
