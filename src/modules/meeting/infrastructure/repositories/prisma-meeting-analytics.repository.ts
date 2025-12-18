import { getPrisma } from "@/lib/prisma";
import type { MeetingAnalytics, MeetingTrend, TranscriptionDistribution } from "../../domain/models/meeting-analytics";
import type { IMeetingAnalyticsRepository } from "../../domain/ports/meeting-analytics.repository";

export class PrismaMeetingAnalyticsRepository
	implements IMeetingAnalyticsRepository
{
	async getAnalytics(userId: string): Promise<MeetingAnalytics> {
		const prisma = getPrisma();
		const now = new Date();
		const oneMonthAgo = new Date(now);
		oneMonthAgo.setMonth(now.getMonth() - 1);

		return await prisma.$transaction(async (tx) => {
			// Total meetings
			const totalMeetings = await tx.meeting.count({
				where: { userId },
			});

			const lastMonthMeetings = await tx.meeting.count({
				where: {
					userId,
					createdAt: { gte: oneMonthAgo },
				},
			});

			// Average recording duration
			const recordings = await tx.meetingRecordingPath.findMany({
				where: {
					meetRecording: {
						meeting: {
							userId,
						},
					},
				},
				select: {
					duration: true,
					createdAt: true,
				},
			});

			const totalDuration = recordings.reduce(
				(sum, rec) => sum + parseInt(rec.duration || "0", 10),
				0,
			);
			const avgDuration =
				recordings.length > 0 ? totalDuration / recordings.length : 0;

			const lastMonthRecordings = recordings.filter(
				(rec) => rec.createdAt >= oneMonthAgo,
			);
			const lastMonthDuration = lastMonthRecordings.reduce(
				(sum, rec) => sum + parseInt(rec.duration || "0", 10),
				0,
			);
			const avgLastMonthDuration =
				lastMonthRecordings.length > 0
					? lastMonthDuration / lastMonthRecordings.length
					: 0;

			// Average meeting session duration
			const sessions = await tx.meetingSession.findMany({
				where: {
					meeting: {
						userId,
					},
				},
				select: {
					startedAt: true,
					endedAt: true,
				},
			});

			const totalMeetingDuration = sessions.reduce(
				(sum, session) =>
					sum +
					((session.endedAt?.getTime() ?? session.startedAt.getTime()) -
						session.startedAt.getTime()),
				0,
			);
			const avgMeetingDuration =
				sessions.length > 0 ? totalMeetingDuration / sessions.length : 0;
			const avgMeetingDurationInSeconds = avgMeetingDuration / 1000;

			const lastMonthSessions = sessions.filter(
				(session) => session.startedAt >= oneMonthAgo,
			);
			const lastMonthMeetingDuration = lastMonthSessions.reduce(
				(sum, session) =>
					sum +
					((session.endedAt?.getTime() ?? session.startedAt.getTime()) -
						session.startedAt.getTime()),
				0,
			);
			const avgLastMonthMeetingDuration =
				lastMonthSessions.length > 0
					? lastMonthMeetingDuration / lastMonthSessions.length
					: 0;
			const avgLastMonthMeetingDurationInSeconds =
				avgLastMonthMeetingDuration / 1000;

			// Transcription success rate
			const transcriptions = await tx.meetingRecording.findMany({
				where: {
					meeting: {
						userId,
					},
				},
				include: {
					meeting: {
						select: {
							createdAt: true,
						},
					},
				},
			});

			const successfulTranscriptions = transcriptions.filter(
				(t) => t.transcription_status === "TRANSCRIPTION_COMPLETED",
			).length;
			const transcriptionSuccessRate =
				transcriptions.length > 0
					? (successfulTranscriptions / transcriptions.length) * 100
					: 0;

			const lastMonthTranscriptions = transcriptions.filter(
				(t) => t.meeting.createdAt >= oneMonthAgo,
			);
			const lastMonthSuccessful = lastMonthTranscriptions.filter(
				(t) => t.transcription_status === "TRANSCRIPTION_COMPLETED",
			).length;
			const lastMonthSuccessRate =
				lastMonthTranscriptions.length > 0
					? (lastMonthSuccessful / lastMonthTranscriptions.length) * 100
					: 0;

			// Meeting trends (last 6 months)
			const trends: MeetingTrend[] = [];
			const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
			
			for (let i = 5; i >= 0; i--) {
				const d = new Date();
				d.setMonth(d.getMonth() - i);
				const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
				const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
				
				const count = await tx.meeting.count({
					where: {
						userId,
						createdAt: {
							gte: monthStart,
							lte: monthEnd,
						},
					},
				});
				
				trends.push({
					month: months[d.getMonth()],
					meetings: count,
				});
			}

			// Transcription status distribution
			const statusCounts = await tx.meetingRecording.groupBy({
				by: ["transcription_status"],
				where: {
					meeting: {
						userId,
					},
				},
				_count: {
					transcription_status: true,
				},
			});

			const statusColors: Record<string, string> = {
				TRANSCRIPTION_COMPLETED: "hsl(var(--chart-1))",
				TRANSCRIPTION_PENDING: "hsl(var(--chart-2))",
				TRANSCRIPTION_FAILED: "hsl(var(--chart-3))",
				TRANSCRIPTION_PROCESSING: "hsl(var(--chart-4))",
			};

			const distribution: TranscriptionDistribution[] = statusCounts.map((s) => ({
				name: s.transcription_status ?? "UNKNOWN",
				value: s._count.transcription_status,
				fill: statusColors[s.transcription_status ?? ""] ?? "hsl(var(--chart-5))",
			}));

			return {
				totalMeetings: {
					total: totalMeetings,
					lastMonth: lastMonthMeetings,
				},
				avgRecordingDuration: {
					total: Math.round(avgDuration),
					lastMonth: Math.round(avgLastMonthDuration),
				},
				avgMeetingDuration: {
					total: Math.round(avgMeetingDurationInSeconds),
					lastMonth: Math.round(avgLastMonthMeetingDurationInSeconds),
				},
				transcriptionSuccessRate: {
					total: Math.round(transcriptionSuccessRate * 100) / 100,
					lastMonth: Math.round(lastMonthSuccessRate * 100) / 100,
				},
				meetingTrends: trends,
				transcriptionStatusDistribution: distribution,
			};
		});
	}
}
