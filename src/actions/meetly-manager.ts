
"use server"

import { MeetingKind, MeetingRecordingStatus, MeetingTranscriptionStatus } from "@/generated/prisma"
import { getPrisma } from "@/lib/prisma"
import { generateMeetToken } from "@/lib/utils"
import { ActionResponse } from "@/types/action-response"
import { ParticipantRole } from "@/types/meetly.types"
import { hashPassword } from "@/utils/secure"
import { createClient } from "@/utils/supabase/server"
import { createMeetValidator, updateMeetValidator } from "@/validators/meetly-manager"
import { User } from "@supabase/supabase-js"


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

    const meeting = await prisma.meeting.create({
        data: {
            name,
            date: date!,
            time,
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

    if (invitees && invitees.length > 0) {
        const invites_with_account = await prisma.users.findMany({
            where: {
                OR: invitees.map(invite => ({
                    email: invite,
                }))
            },
            select: {
                id: true,
                email: true,
            }
        });

        await prisma.meetingInvitation.createMany({
            data: invites_with_account
                .filter(invite => invite.email !== null && invite.email !== user.email)
                .map(invite => ({
                    userId: invite.id,
                    email: invite.email as string,
                    meetingId: meeting.id,
                }))
        })

        const invites_without_account = invitees.filter(
            invite => !invites_with_account.map(
                _invite => _invite.email!.trim()
            ).includes(invite) && invite !== user.email
        );

        await prisma.meetingInvitation.createMany({
            data: invites_without_account
                .map(invite => ({
                    email: invite,
                    meetingId: meeting.id,
                }))
        })
    }

    return {
        success: true,
        error: null,
        data: null
    }
}

export type UpdateMeetType = {
    id: string
    name?: string
    date?: Date
    time?: string
    invitees?: string[]
    isRecurring?: boolean
    accessKey?: string
}


export async function updateMeet<T = null>(data: UpdateMeetType): Promise<ActionResponse<T>> {
    const validate = updateMeetValidator.safeParse(data)
    if (!validate.success) return {
        success: false,
        error: validate.error.errors[0].message,
        data: null
    }
    const { id, name, date, time, invitees, isRecurring, accessKey } = validate.data

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser()
    const prisma = getPrisma()

    if (!user) return {
        success: false,
        error: "User not found",
        data: null
    }

    // Vérifier que la réunion existe et appartient à l'utilisateur
    const meeting = await prisma.meeting.findUnique({
        where: { id },
        select: { userId: true }
    })

    if (!meeting || meeting.userId !== user.id) {
        return {
            success: false,
            error: "Meeting not found or unauthorized",
            data: null
        }
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (date !== undefined) updateData.date = date
    if (time !== undefined) updateData.time = time
    if (isRecurring !== undefined) updateData.isRecurring = isRecurring
    if (accessKey !== undefined) updateData.accessKey = accessKey ? await hashPassword(accessKey) : null
    updateData.updatedAt = new Date()

    await prisma.meeting.update({
        where: { id },
        data: updateData
    })

    // Gestion des invités (remplacement complet)
    if (invitees) {
        // Supprimer les invitations existantes
        await prisma.meetingInvitation.deleteMany({
            where: { meetingId: id }
        })

        // Invités avec compte
        const invites_with_account = await prisma.users.findMany({
            where: {
                OR: invitees.map(invite => ({
                    email: invite,
                }))
            },
            select: {
                id: true,
                email: true,
            }
        });

        await prisma.meetingInvitation.createMany({
            data: invites_with_account
                .filter(invite => invite.email !== null && invite.email !== user.email)
                .map(invite => ({
                    userId: invite.id,
                    email: invite.email as string,
                    meetingId: id,
                }))
        })

        // Invités sans compte
        const invites_without_account = invitees.filter(
            invite => !invites_with_account.map(
                _invite => _invite.email!.trim()
            ).includes(invite) && invite !== user.email
        );

        await prisma.meetingInvitation.createMany({
            data: invites_without_account
                .map(invite => ({
                    email: invite,
                    meetingId: id,
                }))
        })
    }

    return {
        success: true,
        error: null,
        data: null
    }
}

export type MeetingsResponse = {
    meetings: {
        id: string;
        name: string;
        date: Date;
        code: string;
        time: string;
        isRecurring: boolean;
        accessKey: string | null;
        kind: MeetingKind;
        createdAt: Date;
        cancelled: boolean;
        userId: string;
        invitees: {
            role: ParticipantRole;
            email: string;
        }[];
        meetingRecordings: {
            id: string;
        }[];
    }[],
    user: User
}

export async function fetchMeetingsAction(): Promise<ActionResponse<MeetingsResponse>> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return {
        success: false,
        data: null,
        error: "Not user founded"
    }

    const prisma = getPrisma()
    const meetings = (await prisma.meeting.findMany({
        where: {
            OR: [
                {
                    userId: user.id,
                },
                {
                    invitees: {
                        some: {
                            email: user.email!
                        }
                    }
                }
            ]
        },
        select: {
            id: true,
            name: true,
            date: true,
            time: true,
            code: true,
            kind: true,
            isRecurring: true,
            accessKey: true,
            createdAt: true,
            cancelled: true,
            userId: true,
            invitees: {
                select: {
                    email: true,
                    role: true,
                }
            },
            meetingRecordings: { select: { id: true } }
        }
    })).map(meeting => ({
        ...meeting,
        accessKey: meeting.accessKey ? meeting.accessKey.split('').map(_ => '*').join('') : null
    }));

    return {
        success: true,
        data: {
            meetings,
            user,
        },
        error: null,
    }
}

export type RecordingResponse = {
    recordings: {
        id: string;
        name: string;
        egressId: string;
        recording_status: MeetingRecordingStatus;
        transcription_status: MeetingTranscriptionStatus;
        recordDate: Date;
        transcription: string | null;
        summary: string | null;
        meetingRecordingPaths: {
            filepath: string;
            duration: string;
        }[];
        meeting: {
            name: string;
        }
    }[]
    user: User
}

export async function fetchRecordingsAction(): Promise<ActionResponse<RecordingResponse>> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return {
        success: false,
        data: null,
        error: "Not user founded"
    }

    const prisma = getPrisma()
    const recordings = (await prisma.meetingRecording.findMany({
        where: {
            meeting: {
                OR: [
                    {
                        userId: user.id,
                    },
                    {
                        invitees: {
                            some: {
                                email: user.email!
                            }
                        }
                    }
                ]
            }
        },
        select: {
            id: true,
            name: true,
            egressId: true,
            recording_status: true,
            transcription_status: true,
            recordDate: true,
            transcription: true,
            summary: true,
            meetingRecordingPaths: {
                select: {
                    filepath: true,
                    duration: true
                }
            },
            meeting: {
                select: {
                    name: true
                }
            }
        }
    }))

    return {
        success: true,
        data: {
            recordings,
            user,
        },
        error: null,
    }
}

export async function cancelMeetingAction(meeting_id: string): Promise<ActionResponse> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return {
        success: false,
        error: "User not founded",
        data: null
    }
    const prisma = getPrisma()
    const meeting = await prisma.meeting.findFirst({
        where: {
            OR: [
                {
                    id: meeting_id,
                },
                {
                    userId: user.id,
                }, {
                    invitees: {
                        some: {
                            email: user.email,
                        }
                    }
                }
            ]
        },
        select: {
            id: true,
            userId: true,
            invitees: {
                where: {
                    email: user.email,
                }
            }
        }
    })

    if (!meeting) return {
        success: false,
        error: "Not meet founded",
        data: null
    }

    if (meeting.userId === user.id) {
        await prisma.meeting.update({
            where: {
                id: meeting.id
            },
            data: {
                cancelled: true
            }
        })
    }
    if (meeting.userId !== user.id && meeting.invitees.length === 1) {
        await prisma.meetingInvitation.update({
            where: {
                id: meeting.invitees[0].id
            },
            data: {
                status: "Cancelled"
            }
        })
    }

    return {
        success: true,
        error: null,
        data: null
    }
}
