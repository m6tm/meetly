"use server"

import { NotificationForm } from "@/components/settings/notification.component";
import { NotificationPreference, NotificationType } from "@/generated/prisma";
import { getPrisma } from "@/lib/prisma";
import { ActionResponse } from "@/types/action-response";
import { createClient } from "@/utils/supabase/server";
import { updateNotificationValidator } from "@/validators/settings.validators";

export const getNotificationPreferencesAction = async (): Promise<ActionResponse<NotificationPreference[]>> => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return {
        success: false,
        error: "User not founded",
        data: null
    }
    const prisma = getPrisma()
    const notificationPreferences = await prisma.notificationPreference.findMany({
        where: {
            userId: user.id
        }
    })
    return {
        success: true,
        error: null,
        data: notificationPreferences
    }
}

export const updateNotificationPreferencesAction = async (data: NotificationForm): Promise<ActionResponse> => {
    const validated = updateNotificationValidator.safeParse(data)
    if (!validated.success) return {
        success: false,
        error: validated.error.errors[0].message,
        data: null,
    }
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return {
        success: false,
        error: "Not user founded",
        data: null
    }
    const prisma = getPrisma()
    const typeMapping: Record<string, NotificationType> = {
        meetingReminder: NotificationType.MEETING_REMINDER,
        transcriptionUpdate: NotificationType.TRANSCRIPTION_UPDATE,
        teamActivity: NotificationType.TEAM_ACTIVITY,
        newsletter: NotificationType.NEWS_UPDATE
    };

    const updatePromises = Object.entries(typeMapping).map(([formField, notificationType]) => {
        const enabled = validated.data[formField as keyof NotificationForm];

        return prisma.notificationPreference.updateMany({
            where: {
                userId: user.id,
                type: notificationType
            },
            data: {
                enabled: enabled
            }
        });
    });
    await prisma.$transaction(updatePromises);

    return {
        success: true,
        error: null,
        data: null
    }
}
