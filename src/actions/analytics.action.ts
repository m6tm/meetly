"use server"

import { getPrisma } from "@/lib/prisma";
import { ActionResponse } from "@/types/action-response";
import { createClient } from "@/utils/supabase/server";

export type AnalyticsResponse = {
    totalMeetings: {
        total: number;
        lastMonth: number;
    };
    avgRecordingDuration: {
        total: number;
        lastMonth: number;
    };
    transcriptionSuccessRate: {
        total: number;
        lastMonth: number;
    };
    activeUsers: {
        total: number;
        lastWeek: number;
    };
}

export async function getAnalytics(): Promise<ActionResponse<AnalyticsResponse>> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return {
        success: false,
        error: "User not founded",
        data: null
    }
    const prisma = getPrisma()
    const now = new Date();
    const oneMonthAgo = new Date(now);
    oneMonthAgo.setMonth(now.getMonth() - 1);

    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);

    const response = await prisma.$transaction(async (prisma) => {
        // Total meetings
        const totalMeetings = await prisma.meeting.count({
            where: { userId: user.id }
        });

        const lastMonthMeetings = await prisma.meeting.count({
            where: {
                userId: user.id,
                createdAt: { gte: oneMonthAgo }
            }
        });

        // Average duration
        const recordings = await prisma.meetingRecordingPath.findMany({
            where: {
                meetRecording: {
                    meeting: {
                        userId: user.id
                    }
                }
            },
            select: {
                duration: true,
                createdAt: true
            }
        });

        const totalDuration = recordings.reduce((sum, rec) => sum + parseInt(rec.duration || '0'), 0);
        const avgDuration = recordings.length > 0 ? totalDuration / recordings.length : 0;

        const lastMonthRecordings = recordings.filter(rec => rec.createdAt >= oneMonthAgo);
        const lastMonthDuration = lastMonthRecordings.reduce((sum, rec) => sum + parseInt(rec.duration || '0'), 0);
        const avgLastMonthDuration = lastMonthRecordings.length > 0 ? lastMonthDuration / lastMonthRecordings.length : 0;

        // Transcription success rate
        const transcriptions = await prisma.meetingRecording.findMany({
            where: {
                meeting: {
                    userId: user.id
                }
            },
            include: {
                meeting: {
                    select: {
                        createdAt: true
                    }
                }
            }
        });

        const successfulTranscriptions = transcriptions.filter(t => t.transcription_status === 'TRANSCRIPTION_COMPLETED').length;
        const transcriptionSuccessRate = transcriptions.length > 0
            ? (successfulTranscriptions / transcriptions.length) * 100
            : 0;

        const lastMonthTranscriptions = transcriptions.filter(t => t.meeting.createdAt >= oneMonthAgo);
        const lastMonthSuccessful = lastMonthTranscriptions.filter(t => t.transcription_status === 'TRANSCRIPTION_COMPLETED').length;
        const lastMonthSuccessRate = lastMonthTranscriptions.length > 0
            ? (lastMonthSuccessful / lastMonthTranscriptions.length) * 100
            : 0;

        // Active users (for team members)
        const teamMembers = await prisma.teamMember.findMany({
            where: {
                team: {
                    createdBy: user.id
                },
                status: 'ACTIVE'
            },
            include: {
                user: true
            }
        });

        const activeUsers = teamMembers.length;
        const activeUsersLastWeek = teamMembers.filter(member =>
            member.lastLogin && member.lastLogin >= oneWeekAgo
        ).length;

        return {
            totalMeetings: {
                total: totalMeetings,
                lastMonth: lastMonthMeetings
            },
            avgRecordingDuration: {
                total: Math.round(avgDuration),
                lastMonth: Math.round(avgLastMonthDuration)
            },
            transcriptionSuccessRate: {
                total: Math.round(transcriptionSuccessRate * 100) / 100, // Round to 2 decimal places
                lastMonth: Math.round(lastMonthSuccessRate * 100) / 100
            },
            activeUsers: {
                total: activeUsers,
                lastWeek: activeUsersLastWeek
            }
        };
    });

    return {
        success: true,
        error: null,
        data: response
    }
}