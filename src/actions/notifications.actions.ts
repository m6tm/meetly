"use server"

import { NotificationItem } from "@/components/notifications/notifications";
import { Notification } from "@/generated/prisma";
import { getPrisma } from "@/lib/prisma";
import { ActionResponse } from "@/types/action-response";
import { createClient } from "@/utils/supabase/server";

export async function fetchNotifications(): Promise<ActionResponse<Notification[]>> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return {
        success: false,
        error: "Not user founded",
        data: null,
    }

    const prisma = getPrisma()
    const notifications = await prisma.notification.findMany({
        where: { userId: user.id }
    })

    return {
        success: true,
        error: null,
        data: notifications,
    }
}

export async function toggleNotificationReadUnred(notification: NotificationItem): Promise<ActionResponse<void>> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return {
        success: false,
        error: "Not user founded",
        data: null,
    }

    const prisma = getPrisma()
    await prisma.notification.update({
        where: { id: notification.id, userId: user.id },
        data: { read: !notification.read },
    })

    return {
        success: true,
        error: null,
        data: null,
    }
}

export async function markAllNotificationsAsRead(): Promise<ActionResponse<void>> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return {
        success: false,
        error: "Not user founded",
        data: null,
    }

    const prisma = getPrisma()
    await prisma.notification.updateMany({
        where: { userId: user.id },
        data: { read: true },
    })

    return {
        success: true,
        error: null,
        data: null,
    }
}
