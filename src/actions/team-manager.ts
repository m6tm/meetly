
'use server';

import { getPrisma } from "@/lib/prisma";
import { ActionResponse } from "@/types/action-response";
import { createClient } from "@/utils/supabase/server";
import { User } from "@supabase/supabase-js";

export type TeamMember = {
    id: string;
    name: string | null;
    email: string | null;
    avatarUrl: string | null;
    role: 'Admin' | 'Editor' | 'Viewer' | 'Member';
    status: 'Active' | 'Invited' | 'Inactive';
    lastLogin: string | null;
};

export async function fetchTeamMembers(): Promise<ActionResponse<TeamMember[]>> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Utilisateur non authentifié", data: null };
    }

    const prisma = getPrisma();
    const teamMembers = await prisma.users.findMany({
        where: {
            OR: [
                { id: user.id }, // The user itself
                // This logic needs to be adapted to how you define a "team".
                // Assuming for now a simple model where we can see other users.
                // In a real scenario, this would check for users in the same organization/team.
            ]
        },
        select: {
            id: true,
            email: true,
            raw_user_meta_data: true,
            last_sign_in_at: true,
        }
    });

    const formattedMembers: TeamMember[] = teamMembers.map(member => ({
        id: member.id,
        name: (member.raw_user_meta_data as any)?.name || member.email?.split('@')[0] || 'Unknown',
        email: member.email,
        role: (member.raw_user_meta_data as any)?.role || 'Member',
        status: member.last_sign_in_at ? 'Active' : 'Invited', // Simplified logic
        avatarUrl: (member.raw_user_meta_data as any)?.avatar_url || null,
        lastLogin: member.last_sign_in_at,
    }));

    return { success: true, data: formattedMembers, error: null };
}

export async function inviteTeamMember(email: string, name: string | null, role: 'Admin' | 'Editor' | 'Viewer' | 'Member'): Promise<ActionResponse<TeamMember>> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Utilisateur non authentifié", data: null };
    }

    const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: { name, role: role }
    });


    if (inviteError) {
        return { success: false, error: `Erreur lors de l'invitation: ${inviteError.message}`, data: null };
    }
    
    // We fetch the newly invited user to return its data
    const prisma = getPrisma();
    const newUser = await prisma.users.findUnique({ where: { email } });

    if(!newUser) {
      return { success: false, error: "L'utilisateur invité n'a pas été trouvé.", data: null };
    }

    const newMember: TeamMember = {
        id: newUser.id,
        name: (newUser.raw_user_meta_data as any)?.name || newUser.email?.split('@')[0] || 'Unknown',
        email: newUser.email,
        role: (newUser.raw_user_meta_data as any)?.role || 'Member',
        status: 'Invited',
        avatarUrl: (newUser.raw_user_meta_data as any)?.avatar_url || null,
        lastLogin: newUser.last_sign_in_at,
    };


    return { success: true, data: newMember, error: null };
}

export async function updateTeamMemberRole(memberId: string, role: 'Admin' | 'Editor' | 'Viewer' | 'Member'): Promise<ActionResponse<null>> {
    const supabase = await createClient();
    const { error } = await supabase.auth.admin.updateUserById(memberId, {
        user_metadata: { role: role }
    });

    if (error) {
        return { success: false, error: error.message, data: null };
    }
    return { success: true, data: null, error: null };
}

export async function removeTeamMember(memberId: string): Promise<ActionResponse<null>> {
    const supabase = await createClient();
    const { error } = await supabase.auth.admin.deleteUser(memberId);
    if (error) {
        return { success: false, error: error.message, data: null };
    }
    return { success: true, data: null, error: null };
}
