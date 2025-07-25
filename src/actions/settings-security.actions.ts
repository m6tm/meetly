"use server"

import { createClient } from "@/utils/supabase/server";
import { ActionResponse } from "@/types/action-response";
import { changePasswordValidator } from "@/validators/settings.validators";
import { getPrisma } from "@/lib/prisma";

export const changePasswordAction = async (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}): Promise<ActionResponse> => {
    // Validate the input data
    const validated = changePasswordValidator.safeParse(data);
    if (!validated.success) {
        return {
            success: false,
            error: validated.error.errors[0].message,
            data: null
        };
    }

    const { currentPassword, newPassword } = validated.data;
    const supabase = await createClient();

    try {
        // Verify current password
        const { data: { user }, error: userError } = await supabase.auth.signInWithPassword({
            email: (await supabase.auth.getUser()).data.user?.email || '',
            password: currentPassword,
        });

        if (userError || !user) {
            return {
                success: false,
                error: "Current password is incorrect",
                data: null
            };
        }

        // Update password
        const { error: updateError } = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (updateError) {
            console.error("Password update error:", updateError);
            return {
                success: false,
                error: "Failed to update password. Please try again.",
                data: null
            };
        }

        return {
            success: true,
            error: null,
            data: null
        };
    } catch (error) {
        console.error("Error changing password:", error);
        return {
            success: false,
            error: "An unexpected error occurred. Please try again.",
            data: null
        };
    }
};

export const signOutOfAllSessionsAction = async (): Promise<ActionResponse> => {
    const supabase = await createClient();

    try {
        const { error } = await supabase.auth.signOut({ scope: 'others' });

        if (error) {
            console.error("Error signing out of all sessions:", error);
            return {
                success: false,
                error: "Failed to sign out of all sessions. Please try again.",
                data: null
            };
        }

        return {
            success: true,
            error: null,
            data: null
        };
    } catch (error) {
        console.error("Error in signOutOfAllSessionsAction:", error);
        return {
            success: false,
            error: "An unexpected error occurred. Please try again.",
            data: null
        };
    }
};

export type SessionData = {
    id: string;
    user_id: string;
    created_at: Date | null;
    updated_at: Date | null;
    user_agent: string | null;
    ip: string | null;
    isCurrent: boolean;
};

export const getActiveSessionsAction = async (): Promise<ActionResponse<SessionData[]>> => {
    const supabase = await createClient();

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return {
                success: false,
                error: "User not authenticated",
                data: null,
            };
        }
        const prisma = getPrisma()

        const sessions = await prisma.sessions.findMany({
            where: {
                user_id: user.id,
            },
            select: {
                id: true,
                user_id: true,
                created_at: true,
                updated_at: true,
                user_agent: true,
                ip: true,
            }
        })

        if (!sessions) {
            console.error("Error fetching sessions");
            return {
                success: false,
                error: "Failed to fetch active sessions",
                data: null,
            };
        }

        const currentSession = (await supabase.auth.getSession()).data.session;

        const formattedSessions: SessionData[] = sessions.map(session => ({
            id: session.id,
            user_id: session.user_id,
            created_at: session.created_at,
            updated_at: session.updated_at,
            user_agent: session.user_agent,
            ip: session.ip,
            isCurrent: currentSession?.user.id === session.user_id,
        }));

        return {
            success: true,
            error: null,
            data: formattedSessions,
        };
    } catch (error) {
        console.error("Error in getActiveSessionsAction:", error);
        return {
            success: false,
            error: "An unexpected error occurred",
            data: null,
        };
    }
};

export const revokeSessionAction = async (sessionId: string): Promise<ActionResponse> => {
    const supabase = await createClient();

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return {
                success: false,
                error: "User not authenticated",
                data: null,
            };
        }

        // Don't allow revoking the current session from this action
        const currentSession = (await supabase.auth.getSession()).data.session;
        if (currentSession?.id === sessionId) {
            return {
                success: false,
                error: "Cannot revoke current session from this action",
                data: null,
            };
        }

        const { error } = await supabase
            .from('sessions')
            .delete()
            .eq('id', sessionId)
            .eq('user_id', user.id);

        if (error) {
            console.error("Error revoking session:", error);
            return {
                success: false,
                error: "Failed to revoke session",
                data: null,
            };
        }

        return {
            success: true,
            error: null,
            data: null,
        };
    } catch (error) {
        console.error("Error in revokeSessionAction:", error);
        return {
            success: false,
            error: "An unexpected error occurred",
            data: null,
        };
    }
};
