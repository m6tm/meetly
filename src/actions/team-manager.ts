"use server";

import { faker } from "@faker-js/faker";
import {
	TeamInvitationStatus,
	type TeamMemberRole,
	TeamMemberStatus,
} from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import type { ActionResponse } from "@/types/action-response";
import { createClient } from "@/utils/supabase/server";

export type TeamMember = {
	id: string;
	name: string | null;
	email: string | null;
	avatarUrl: string | null;
	userId: string;
	role: TeamMemberRole;
	status: TeamMemberStatus | TeamInvitationStatus;
	lastLogin: string | null;
};

type TeamWithMembers = {
	members: Array<{
		userId: string;
		role: TeamMemberRole;
		status: TeamMemberStatus;
		user: {
			id: string;
			email: string | null;
			last_sign_in_at: Date | null;
			raw_user_meta_data: unknown;
		} | null;
	}>;
};

export async function fetchTeamMembers(): Promise<
	ActionResponse<TeamMember[]>
> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return { success: false, error: "Utilisateur non authentifié", data: null };
	}

	const prisma = getPrisma();
	const team = (await prisma.team.findFirst({
		where: {
			createdBy: user.id,
		},
		select: {
			members: {
				select: {
					userId: true,
					role: true,
					status: true,
					user: {
						select: {
							id: true,
							email: true,
							last_sign_in_at: true,
							raw_user_meta_data: true,
						},
					},
				},
			},
		},
	})) as TeamWithMembers | null;

	if (!team) {
		return { success: false, error: "Equipe non trouvée", data: null };
	}

	const formattedMembers: TeamMember[] = team.members.map((member) => {
		const meta = member.user?.raw_user_meta_data as
			| Record<string, unknown>
			| undefined;
		return {
			id: member.userId,
			name:
				(meta?.name as string) ||
				member.user?.email?.split("@")[0] ||
				"Unknown",
			email: member.user?.email ?? "Unknown",
			userId: member.userId,
			role: member.role,
			status: member.status,
			avatarUrl: (meta?.avatar_url as string) || null,
			lastLogin: member.user?.last_sign_in_at?.toISOString() || null,
		};
	});

	return { success: true, data: formattedMembers, error: null };
}

export async function inviteTeamMember(
	email: string,
	_name: string | null,
	role: TeamMemberRole,
): Promise<ActionResponse<TeamMember>> {
	const supabase = await createClient();
	const {
		data: { user: currentUser },
	} = await supabase.auth.getUser();

	if (!currentUser) {
		return { success: false, error: "Utilisateur non authentifié", data: null };
	}

	const prisma = getPrisma();
	const userToInvite = await prisma.users.findFirst({
		where: {
			email: email,
		},
		select: {
			id: true,
			email: true,
		},
	});

	const team = await prisma.team.findFirst({
		where: {
			createdBy: currentUser.id,
		},
		select: {
			id: true,
			members: {
				select: {
					userId: true,
					status: true,
				},
			},
		},
	});

	if (!userToInvite) {
		return { success: false, error: "Utilisateur non trouvé", data: null };
	}
	if (!team) {
		return { success: false, error: "Equipe non trouvée", data: null };
	}

	const isMember = team.members.some(
		(member) => member.userId === userToInvite.id,
	);
	const isInvited = team.members.some(
		(member) =>
			member.userId === userToInvite.id &&
			member.status === TeamMemberStatus.INVITED,
	);

	if (isMember && !isInvited) {
		return { success: false, error: "Utilisateur déjà membre", data: null };
	}
	if (isMember && isInvited) {
		return { success: false, error: "Utilisateur déjà invité", data: null };
	}

	const token = faker.string.uuid();
	const expiresAt = new Date();
	expiresAt.setHours(expiresAt.getHours() + 1);

	const memberSelection = {
		id: true,
		status: true,
		role: true,
		user: {
			select: {
				id: true,
				email: true,
				last_sign_in_at: true,
				raw_user_meta_data: true,
			},
		},
	};

	const member = (await prisma.teamMember.create({
		data: {
			teamId: team.id,
			userId: userToInvite.id,
			role: role,
		},
		select: memberSelection,
	})) as TeamWithMembers["members"][0] & { id: string };

	await prisma.teamInvitation.create({
		data: {
			teamId: team.id,
			userId: userToInvite.id,
			email: email,
			role: role,
			token: token,
			expiresAt: expiresAt,
			invitedBy: currentUser.id,
		},
	});

	const meta = member.user?.raw_user_meta_data as
		| Record<string, unknown>
		| undefined;

	return {
		success: true,
		error: null,
		data: {
			id: member.id,
			name:
				(meta?.name as string) ||
				member.user?.email?.split("@")[0] ||
				"Unknown",
			email: email,
			userId: userToInvite.id,
			role: role,
			status: member.status,
			avatarUrl: (meta?.avatar_url as string) || null,
			lastLogin: member.user?.last_sign_in_at?.toISOString() || null,
		},
	};
}

export async function updateTeamMemberRole(
	memberId: string,
	role: TeamMemberRole,
): Promise<ActionResponse<TeamMember | null>> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) return { success: false, error: "User not founded", data: null };

	const prisma = getPrisma();
	const team = await prisma.team.findFirst({
		where: {
			createdBy: user.id,
		},
		select: {
			id: true,
			members: {
				select: {
					id: true,
					status: true,
					userId: true,
				},
			},
		},
	});

	if (!team) return { success: false, error: "Team not founded", data: null };

	const isMember = team.members.some((member) => member.userId === memberId);
	const isInvited = team.members.some(
		(member) =>
			member.userId === memberId && member.status === TeamMemberStatus.INVITED,
	);

	if (!isMember && !isInvited)
		return { success: false, error: "Member not founded", data: null };

	if (isMember) {
		const member = (await prisma.teamMember.update({
			where: {
				teamId_userId: {
					teamId: team.id,
					userId: memberId,
				},
			},
			data: {
				role: role,
			},
			select: {
				id: true,
				status: true,
				role: true,
				user: {
					select: {
						id: true,
						email: true,
						last_sign_in_at: true,
						raw_user_meta_data: true,
					},
				},
			},
		})) as TeamWithMembers["members"][0] & { id: string };

		if (isInvited) {
			const invitation = await prisma.teamInvitation.findFirst({
				where: {
					userId: memberId,
					teamId: team.id,
				},
			});
			if (invitation) {
				await prisma.teamInvitation.update({
					where: {
						id: invitation.id,
					},
					data: {
						role: role,
					},
				});
			}
		}

		const meta = member.user?.raw_user_meta_data as
			| Record<string, unknown>
			| undefined;

		return {
			success: true,
			data: {
				id: member.id,
				name:
					(meta?.name as string) ||
					member.user?.email?.split("@")[0] ||
					"Unknown",
				email: member.user?.email ?? "Unknown",
				userId: member.user?.id ?? memberId,
				role: member.role,
				status: member.status,
				avatarUrl: (meta?.avatar_url as string) || null,
				lastLogin: member.user?.last_sign_in_at?.toISOString() || null,
			},
			error: null,
		};
	}

	return { success: true, data: null, error: null };
}

export async function removeTeamMember(
	memberId: string,
): Promise<ActionResponse> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return { success: false, error: "User not founded", data: null };
	}

	const prisma = getPrisma();
	const team = await prisma.team.findFirst({
		where: {
			createdBy: user.id,
		},
		select: {
			id: true,
			members: {
				select: {
					id: true,
					userId: true,
				},
			},
		},
	});

	if (!team) return { success: false, error: "Team not founded", data: null };

	const isMember = team.members.some((member) => member.userId === memberId);
	if (!isMember)
		return { success: false, error: "Member not founded", data: null };

	await prisma.$transaction(async (tx) => {
		await tx.teamMember.delete({
			where: {
				teamId_userId: {
					teamId: team.id,
					userId: memberId,
				},
			},
		});
		await tx.teamInvitation.deleteMany({
			where: {
				userId: memberId,
				teamId: team.id,
			},
		});
	});

	return { success: true, data: null, error: null };
}

export async function acceptTeamInvitation(
	invitationToken: string,
): Promise<ActionResponse> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return { success: false, error: "User not founded", data: null };
	}

	const prisma = getPrisma();
	const invitation = await prisma.teamInvitation.findFirst({
		where: {
			token: invitationToken,
		},
		select: {
			teamId: true,
			userId: true,
			status: true,
		},
	});

	if (
		!invitation ||
		invitation.status !== TeamInvitationStatus.PENDING ||
		!invitation.userId
	)
		return { success: false, error: "Invitation not founded", data: null };

	await prisma.teamMember.updateMany({
		where: {
			teamId: invitation.teamId,
			userId: invitation.userId,
		},
		data: {
			status: TeamMemberStatus.ACTIVE,
		},
	});

	await prisma.teamInvitation.updateMany({
		where: {
			userId: invitation.userId,
			teamId: invitation.teamId,
		},
		data: {
			status: TeamInvitationStatus.ACCEPTED,
		},
	});

	return { success: true, data: null, error: null };
}
