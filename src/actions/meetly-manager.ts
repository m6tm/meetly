
"use server"

import { getPrisma } from "@/lib/prisma"
import { generateMeetToken } from "@/lib/utils"
import { ActionResponse } from "@/types/action-response"
import { hashPassword } from "@/utils/secure"
import { createClient } from "@/utils/supabase/server"
import { createMeetValidator } from "@/validators/meetly-manager"


export type CreateMeetType = {
    name: string
    date: Date
    time: string
    invitees: string[]
    isRecurring: boolean
    accessKey?: string
}

export async function createMeet<T = null>(data: CreateMeetType): Promise<ActionResponse<T>> {
    const validate = createMeetValidator.safeParse(data)
    if (!validate.success) return {
        success: false,
        error: validate.error.errors[0].message,
        data: null
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser()
    const prisma = getPrisma()
    const { name, date, time, invitees, isRecurring, accessKey } = validate.data

    if (!user) return {
        success: false,
        error: "User not found",
        data: null
    }

    const hashedPassword = accessKey ? await hashPassword(accessKey) : undefined

    await prisma.meeting.create({
        data: {
            name,
            date: date!,
            time,
            invitees,
            code: generateMeetToken(),
            isRecurring,
            accessKey: hashedPassword,
            createdAt: new Date(),
            updatedAt: new Date(),
            user: {
                connect: {
                    id: user.id
                }
            }
        }
    });

    return {
        success: true,
        error: null,
        data: null
    }
}
