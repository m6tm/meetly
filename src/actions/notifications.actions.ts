"use server"

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