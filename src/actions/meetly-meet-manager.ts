"use server";

import { ActionResponse } from '@/types/action-response';
import { ParticipantMetadata, ParticipantRole } from '@/types/meetly.types';
import { createMeetTokenValidator } from '@/validators/meetly-manager';
import { AccessToken } from 'livekit-server-sdk';
import { faker } from '@faker-js/faker'
import { createClient } from '@/utils/supabase/server';
import { getPrisma } from '@/lib/prisma';

export type MeetTokenDataType = {
  roomName: string;
  participantName: string;
  metadata: ParticipantMetadata
}

export type GenerationMeetTokenResponse = {
  token: string;
  hasPassword: boolean;
  final_role: ParticipantRole
}

export async function generateMeetTokenAction(data: MeetTokenDataType): Promise<ActionResponse<GenerationMeetTokenResponse>> {
  const validate = createMeetTokenValidator.safeParse(data);
  if (!validate.success) {
    return {
      success: false,
      error: validate.error.issues[0].message,
      data: null
    }
  }
  const { roomName, participantName, metadata } = validate.data;

  if (!roomName || !participantName) {
    return {
      success: false,
      error: 'Invalid roomName or participantName',
      data: null,
    };
  }

  const supabase = await createClient()
  const prisma = getPrisma()
  const { data: { user } } = await supabase.auth.getUser();
  const meeting = await prisma.meeting.upsert({
    where: {
      code: roomName.trim(),
    },
    create: {
      code: roomName.trim(),
      accessKey: null,
      userId: user!.id,
      name: roomName.trim(),
      date: new Date(),
      time: Date.now().toString(),
    },
    update: {},
    select: {
      code: true,
      accessKey: true,
      userId: true,
      invitees: true
    }
  });

  const isModerator = !!(user && meeting && meeting.userId === user.id) ||
    !!(user && meeting && !meeting.invitees.some(invite => invite.trim() === user.email!.trim()))
  const isParticipant = !isModerator

  if (isModerator) metadata.role = 'moderator'

  if (isParticipant) metadata.role = 'participant'

  const livekitKey = process.env.LIVEKIT_KEY;
  const livekitSecret = process.env.LIVEKIT_SECRET;
  if (!livekitKey || !livekitSecret) {
    return {
      success: false,
      error: 'Missing Meet configuration',
      data: null,
    };
  }

  try {
    if (metadata.joined === undefined) metadata.joined = 0
    // Création du token avec métadonnées
    const token = new AccessToken(
      livekitKey,
      livekitSecret,
      {
        identity: faker.string.uuid(),
        // Métadonnées personnalisées (avatar, rôle, etc.)
        metadata: JSON.stringify(metadata),
      }
    );

    // Configuration des permissions basées sur le rôle
    const permissions = getPermissionsByRole(metadata.role);

    token.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: permissions.canPublish,
      canPublishData: permissions.canPublishData,
      canSubscribe: permissions.canSubscribe,
      canUpdateOwnMetadata: true,
    });

    const jwt = await token.toJwt();
    return {
      success: true,
      error: null,
      data: {
        token: jwt,
        hasPassword: !!(meeting && meeting.accessKey),
        final_role: metadata.role,
      },
    };
  } catch (error) {
    console.error('Error generating token:', error);
    return {
      success: false,
      error: 'Error generating token',
      data: null,
    };
  }
}

/**
 * Récupère les permissions LiveKit en fonction du rôle fourni.
 * @param role Le rôle du participant ('admin', 'moderator', 'participant', 'viewer').
 * @returns Un objet contenant les drapeaux booléens pour `canPublish`, `canPublishData` et `canSubscribe`.
 */
function getPermissionsByRole(role: MeetTokenDataType['metadata']['role']) {
  switch (role) {
    case 'admin':
      return {
        canPublish: true,
        canPublishData: true,
        canSubscribe: true,
      };
    case 'moderator':
      return {
        canPublish: true,
        canPublishData: true,
        canSubscribe: true,
      };
    case 'participant':
      return {
        canPublish: true,
        canPublishData: false,
        canSubscribe: true,
      };
    default:
      return {
        canPublish: true,
        canPublishData: false,
        canSubscribe: true,
      };
  }
}

export async function validatePassword({ meetingCode, password }: { meetingCode: string; password: string; }): Promise<ActionResponse<null>> {
  const prisma = getPrisma()
  const meeting = await prisma.meeting.findFirst({
    where: {
      code: meetingCode,
      accessKey: password
    }
  })

  if (!meeting) return {
    success: false,
    error: "Invalid password",
    data: null,
  }

  return {
    success: true,
    error: null,
    data: null
  }
}
