"use server"

import { Account, AccountStatus, Appearance, Theme } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import { ActionResponse } from "@/types/action-response";
import { createClient } from "@/utils/supabase/server";
import { updateAppearanceValidator } from "@/validators/settings.validators";

export const getAccountAction = async (): Promise<ActionResponse<Account>> => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return {
        success: false,
        error: "User not founded",
        data: null
    }
    const prisma = getPrisma()
    const account = await prisma.account.findUnique({
        where: {
            userId: user.id
        }
    })
    return {
        success: true,
        error: null,
        data: account
    }
}

export const closeAccountAction = async (): Promise<ActionResponse<Account>> => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return {
        success: false,
        error: "User not founded",
        data: null
    }
    const prisma = getPrisma()

    const account = await prisma.account.update({
        where: {
            userId: user.id
        },
        data: {
            status: AccountStatus.CLOSE_REQUESTED
        }
    })

    return {
        success: true,
        error: null,
        data: account
    }
}

// Appearance
export const getAppearanceAction = async (): Promise<ActionResponse<Appearance>> => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return {
        success: false,
        error: "User not founded",
        data: null
    }
    const prisma = getPrisma()
    const appearance = await prisma.appearance.findUnique({
        where: {
            userId: user.id
        }
    })
    return {
        success: true,
        error: null,
        data: appearance
    }
}

type UpdateAppearancePayload = {
    theme: Theme
    language: string
}

export const updateAppearanceAction = async (payload: UpdateAppearancePayload): Promise<ActionResponse<Appearance>> => {
    const validate = updateAppearanceValidator.safeParse(payload)
    if (!validate.success) return {
        success: false,
        error: validate.error.errors[0].message,
        data: null
    }
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return {
        success: false,
        error: "User not founded",
        data: null
    }

    const prisma = getPrisma()
    const appearance = await prisma.appearance.update({
        where: {
            userId: user.id
        },
        data: {
            theme: payload.theme,
            language: payload.language
        }
    })

    return {
        success: true,
        error: null,
        data: appearance
    }
}

export const updateThemeAction = async (theme: Theme): Promise<ActionResponse<Appearance>> => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return {
        success: false,
        error: "User not founded",
        data: null
    }

    const prisma = getPrisma()
    const appearance = await prisma.appearance.update({
        where: {
            userId: user.id
        },
        data: {
            theme: theme
        }
    })

    return {
        success: true,
        error: null,
        data: appearance
    }
}