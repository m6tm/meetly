"use server"

import { Account, AccountStatus } from "@/generated/prisma";
import { getPrisma } from "@/lib/prisma";
import { ActionResponse } from "@/types/action-response";
import { createClient } from "@/utils/supabase/server";

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