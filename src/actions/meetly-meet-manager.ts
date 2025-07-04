"use server";

import { ActionResponse } from '@/types/action-response';
import { ParticipantMetadata, ParticipantRole } from '@/types/meetly.types';
import { createMeetTokenValidator, startMeetRecorderValidator, stopMeetRecorderValidator } from '@/validators/meetly-manager';
import { AccessToken, EgressClient, EncodedFileOutput, EncodedFileType, EncodedOutputs, EncodingOptionsPreset, GCPUpload, RoomCompositeOptions, SegmentedFileOutput, StreamOutput } from 'livekit-server-sdk';
import { faker } from '@faker-js/faker'
import { createClient } from '@/utils/supabase/server';
import { getPrisma } from '@/lib/prisma';
import { verifyPassword } from '@/utils/secure';
import cred from '@/meetai-41ada.json';
import { z } from 'zod';

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
  if (!user) return {
    success: false,
    error: "User not founded",
    data: null
  }

  const firstVerificationMeet = await prisma.meeting.findFirst({
    where: {
      code: roomName.trim()
    },
    select: {
      userId: true,
      invitees: {
        select: {
          email: true,
          userId: true,
        }
      }
    }
  });

  if (firstVerificationMeet &&
    !firstVerificationMeet.invitees.some(
      invite => invite.email === user.email && invite.userId === user.id
    ) &&
    firstVerificationMeet.userId !== user.id
  ) return {
    success: false,
    error: "Not authorisation to join this meet",
    data: null
  }

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
      kind: "INSTANT",
    },
    update: {},
    select: {
      code: true,
      accessKey: true,
      userId: true,
      invitees: {
        select: {
          id: true,
          email: true,
          role: true
        }
      }
    }
  });

  const isModerator = meeting && meeting.userId === user.id
  const isAdmin = !isModerator && (meeting && meeting.invitees.some(invite => invite.email === user.email && invite.role === 'admin'))
  const isParticipant = !isModerator && !isAdmin

  if (isModerator) metadata.role = 'moderator'
  if (isAdmin) metadata.role = 'admin'
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

    await prisma.meetingInvitation.update({
      where: {
        id: meeting.invitees.find(invite => invite.email === user.email)!.id
      },
      data: {
        status: 'Accepted'
      }
    })

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

export async function validatePassword({ meetingCode, password }: { meetingCode: string; password: string; }): Promise<ActionResponse> {
  const prisma = getPrisma()
  const meeting = await prisma.meeting.findFirst({
    where: {
      code: meetingCode,
      accessKey: {
        not: null,
      },
    },
  })

  if (!meeting) return {
    success: false,
    error: "Invalid password",
    data: null,
  }

  const hashedPassword = meeting.accessKey!
  const isCorrectPassword = await verifyPassword(hashedPassword, password)

  return {
    success: isCorrectPassword,
    error: isCorrectPassword ? null : "Incorrect password",
    data: null
  }
}

export async function changeParticipantRole(participant_id: string, meet_code: string, newRole: ParticipantRole): Promise<ActionResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return {
    success: false,
    error: "Not user founded",
    data: null
  }
  const prisma = getPrisma()
  const invite = await await prisma.meetingInvitation.findFirst({
    where: {
      userId: participant_id,
      meeting: {
        code: meet_code,
      }
    }
  });

  if (!invite) return {
    success: false,
    error: "Not meet founded",
    data: null
  }

  try {
    await prisma.meetingInvitation.update({
      where: {
        id: invite.id,
      },
      data: {
        role: newRole,
      },
    });
  } catch (error) {
    return {
      success: false,
      error: null,
      data: null
    }
  }

  return {
    success: true,
    error: null,
    data: null
  }
}

export async function banneParticipant(participant_id: string, meet_code: string): Promise<ActionResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return {
    success: false,
    error: "Not user founded",
    data: null
  }
  const prisma = getPrisma()
  const invite = await await prisma.meetingInvitation.findFirst({
    where: {
      userId: participant_id,
      meeting: {
        code: meet_code,
      }
    }
  });

  if (!invite) return {
    success: false,
    error: "Not meet founded",
    data: null
  }

  try {
    await prisma.meetingInvitation.delete({
      where: {
        id: invite.id,
      }
    });
  } catch (error) {
    return {
      success: false,
      error: null,
      data: null
    }
  }

  return {
    success: true,
    error: null,
    data: null
  }
}

export async function inviteParticipantToMeet(email: string, meet_code: string): Promise<ActionResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return {
    success: false,
    error: "Votre session a expiré, veuillez vous reconnecter.",
    data: null
  }
  const prisma = getPrisma()
  const inviteUser = await prisma.users.findFirst({
    where: {
      email: email,
    },
    select: {
      id: true,
      email: true,
    }
  })

  const meeting = await prisma.meeting.findFirst({
    where: {
      code: meet_code
    },
    select: {
      id: true,
      invitees: {
        select: {
          email: true,
        }
      }
    }
  })

  if (!meeting) return {
    success: false,
    error: "Ce meet n'existe pas",
    data: null
  }

  if (meeting.invitees.some(invite => invite.email.trim() === email)) return {
    success: true,
    error: null,
    data: null
  }

  await prisma.meetingInvitation.create({
    data: {
      email: inviteUser ? inviteUser.email! : email.trim(),
      userId: inviteUser ? inviteUser.id : null,
      meetingId: meeting.id
    }
  })

  return {
    success: true,
    error: null,
    data: null
  }
}

export type TCredentials = {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
  universe_domain: string;
};

type StartRecordingPayload = {
  roomName: string;
}

export async function startRecoding(data: StartRecordingPayload): Promise<ActionResponse<null>> {
  const passed = startMeetRecorderValidator.safeParse(data);
  if (!passed.success) {
    return {
      error: passed.error.issues[0].message,
      success: false,
      data: null,
    };
  }

  const { roomName } = passed.data;
  const prisma = getPrisma()
  const meeting = await prisma.meeting.findFirst({
    where: {
      code: roomName
    },
    select: {
      id: true,
    }
  })
  if (!meeting) return {
    success: false,
    error: "Not meeting founded",
    data: null
  }

  const apiKey = process.env.LIVEKIT_KEY;
  const apiSecret = process.env.LIVEKIT_SECRET;
  const apiHost = process.env.NEXT_PUBLIC_LIVEKIT_URL;
  const credentials: TCredentials = cred;
  const egressClient = new EgressClient(apiHost!, apiKey, apiSecret);
  const outputs: EncodedOutputs | EncodedFileOutput | StreamOutput | SegmentedFileOutput = {
    file: new EncodedFileOutput({
      filepath: `recordings/${roomName}-${Date.now()}.mp4`,
      fileType: EncodedFileType.MP4,
      output: {
        case: 'gcp',
        value: new GCPUpload({
          credentials: JSON.stringify(credentials),
          bucket: 'meetai_bucket',
        }),
      },
    }),
  };
  const options: RoomCompositeOptions = {
    encodingOptions: EncodingOptionsPreset.H264_1080P_30,
    audioOnly: true,
  };

  try {
    const { egressId } = await egressClient.startRoomCompositeEgress(roomName, outputs, options);
    await prisma.meeting.update({
      where: {
        id: meeting.id
      },
      data: {
        egressId
      }
    });
    return {
      error: null,
      success: true,
      data: null,
    };
  } catch (error) {
    return {
      error: (error as Error).message,
      success: false,
      data: null,
    };
  }
}

type StopRecordingPayload = {
  roomName: string;
}

export async function stopRecoding(data: StopRecordingPayload): Promise<ActionResponse<null>> {
  const passed = stopMeetRecorderValidator.safeParse(data);
  if (!passed.success) {
    return {
      error: passed.error.issues[0].message,
      success: false,
      data: null,
    };
  }

  const { roomName } = passed.data;
  const prisma = getPrisma()
  const meeting = await prisma.meeting.findFirst({
    where: {
      code: roomName
    },
    select: {
      id: true,
      egressId: true,
    }
  })
  if (!meeting) return {
    success: false,
    error: "Not meeting founded",
    data: null
  }
  if (meeting && !meeting.egressId) return {
    success: true,
    error: null,
    data: null
  }

  const apiKey = process.env.LIVEKIT_KEY;
  const apiSecret = process.env.LIVEKIT_SECRET;
  const apiHost = process.env.NEXT_PUBLIC_LIVEKIT_URL;
  const egressClient = new EgressClient(apiHost!, apiKey, apiSecret);

  try {
    const list = await egressClient.listEgress({ roomName, egressId: meeting.egressId! });
    if (list && list.length > 0) {
      const _egressId = list[0].egressId;
      const egressInfo = await egressClient.stopEgress(_egressId);
      await prisma.meeting.update({
        where: {
          id: meeting.id
        },
        data: {
          egressId: null
        }
      })
      const _data = {
        egressId: egressInfo.egressId,
        filePaths: egressInfo.fileResults.map((file) => ({
          filename: file.filename,
          filepath: file.location,
        })),
      }
      return {
        error: null,
        success: true,
        data: null,
      };
    } else {
      return {
        error: 'Aucun enregistrement en cours trouvé pour cette salle.',
        success: false,
        data: null,
      };
    }
  } catch (error) {
    return {
      error: (error as Error).message,
      success: false,
      data: null,
    };
  }
}

export async function listeRecording() {
  try {
    const apiKey = process.env.LIVEKIT_KEY;
    const apiSecret = process.env.LIVEKIT_SECRET;
    const apiHost = process.env.NEXT_PUBLIC_LIVEKIT_URL;
    const egressClient = new EgressClient(apiHost!, apiKey, apiSecret);

    const recordings = await egressClient.listEgress();

    // Convert complex objects to plain objects
    const plainRecordings = recordings.map((recording) => ({
      egressId: recording.egressId,
      roomId: recording.roomId,
      roomName: recording.roomName,
      status: recording.status,
      fileResults: recording.fileResults.map((file) => ({
        filename: file.filename,
        filepath: file.location,
      })),
    }));

    return {
      error: null,
      code: 200,
      data: plainRecordings,
    };
  } catch (error) {
    console.error('Failed to list recordings:', error);
    return {
      error: (error as Error).message,
      code: 500,
      data: null,
    };
  }
}
