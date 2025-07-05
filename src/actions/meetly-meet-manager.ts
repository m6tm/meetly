"use server";

import { ActionResponse } from '@/types/action-response';
import { ParticipantMetadata, ParticipantRole } from '@/types/meetly.types';
import { createMeetTokenValidator, startMeetRecorderValidator, stopMeetRecorderValidator } from '@/validators/meetly-manager';
import { AccessToken, EgressClient, EncodedFileOutput, EncodedFileType, EncodedOutputs, EncodingOptionsPreset, S3Upload, RoomCompositeOptions, SegmentedFileOutput, StreamOutput, GCPUpload } from 'livekit-server-sdk';
import { faker } from '@faker-js/faker'
import { createClient } from '@/utils/supabase/server';
import { getPrisma } from '@/lib/prisma';
import { verifyPassword } from '@/utils/secure';
import cred from '@/meetai-41ada.json';

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

    const invite = meeting.invitees.find(invite => invite.email === user.email)
    if (invite) await prisma.meetingInvitation.update({
      where: {
        id: invite.id
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

// Configuration S3 pour Supabase Storage
export type TSupabaseS3Config = {
  accessKey: string;
  secret: string;
  region: string;
  endpoint: string;
  bucket: string;
  forcePathStyle: boolean;
};

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

// Configuration S3 pour Supabase Storage

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
      egressId: true,
    }
  })

  if (!meeting) return {
    success: false,
    error: "Not meeting founded",
    data: null
  }

  if (meeting.egressId !== null) return {
    success: false,
    error: "The previous recording is not finished",
    data: null
  }

  const apiKey = process.env.LIVEKIT_KEY;
  const apiSecret = process.env.LIVEKIT_SECRET;
  const apiHost = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  const egressClient = new EgressClient(apiHost!, apiKey, apiSecret);
  const meet_name = `${roomName}-${faker.string.uuid()}`
  const filepath = `recordings/${meet_name}.mp4`;

  // Configuration S3 pour Supabase Storage
  const supabaseS3Config: TSupabaseS3Config = {
    accessKey: process.env.NEXT_PUBLIC_SUPABASE_S3_ACCESS_KEY_ID!,
    secret: process.env.NEXT_PUBLIC_SUPABASE_S3_SECRET_ACCESS_KEY!,
    region: process.env.NEXT_PUBLIC_SUPABASE_S3_REGION || 'auto',
    endpoint: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/s3`,
    bucket: process.env.NEXT_PUBLIC_SUPABASE_STORAGE_MEETINGS_BUCKET!,
    forcePathStyle: true
  };
  const credentials: TCredentials = cred;

  const s3Value = new S3Upload({
    accessKey: supabaseS3Config.accessKey,
    secret: supabaseS3Config.secret,
    region: supabaseS3Config.region,
    endpoint: supabaseS3Config.endpoint,
    bucket: supabaseS3Config.bucket,
    forcePathStyle: supabaseS3Config.forcePathStyle,
    metadata: {
      'meeting-room': roomName,
      'recording-date': new Date().toISOString(),
      'recording-author': 'Meetly AI Meetings'
    }
  })
  const gcpValue = new GCPUpload({
    credentials: JSON.stringify(credentials),
    bucket: 'meetai_bucket',
  })

  const outputs: EncodedOutputs | EncodedFileOutput | StreamOutput | SegmentedFileOutput = {
    file: new EncodedFileOutput({
      filepath: filepath,
      fileType: EncodedFileType.MP4,
      output: {
        case: 'gcp',
        value: gcpValue
      },
    }),
  };

  const options: RoomCompositeOptions = {
    encodingOptions: EncodingOptionsPreset.H264_1080P_30,
    audioOnly: false, // Changé à false pour avoir vidéo + audio
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

    const meetRecording = await prisma.meetingRecording.create({
      data: {
        meetingId: meeting.id,
        egressId,
        recordDate: new Date(),
        name: meet_name,
        // filepath: filepath,
        // bucket: supabaseS3Config.bucket
      }
    })

    await prisma.meetingRecordingPath.create({
      data: {
        meetingRecordingId: meetRecording.id,
        createdAt: new Date(),
        filename: `${meet_name}.mp4`,
        filepath,
      }
    })

    return {
      error: null,
      success: true,
      data: null,
    };
  } catch (error) {
    console.error('Erreur lors du démarrage de l\'enregistrement:', error);
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
      const meetingRecording = await prisma.meetingRecording.findFirst({
        where: {
          egressId: _egressId,
        },
        select: {
          id: true,
        }
      })

      // Mettre à jour l'enregistrement avec les informations finales
      await prisma.meetingRecordingPath.updateMany({
        where: {
          meetingRecordingId: meetingRecording!.id
        },
        data: {
          saveDate: new Date(),
        }
      });

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
          size: file.size,
          duration: file.duration
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
    console.error('Erreur lors de l\'arrêt de l\'enregistrement:', error);
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
      startedAt: recording.startedAt,
      endedAt: recording.endedAt,
      fileResults: recording.fileResults.map((file) => ({
        filename: file.filename,
        filepath: file.location,
        size: file.size,
        duration: file.duration
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

// Fonction utilitaire pour générer une URL publique Supabase
export async function getRecordingPublicUrl(filepath: string): Promise<string> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_MEETINGS_BUCKET!;

  // URL publique directe (si le bucket est public)
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${filepath}`;
}

// Fonction utilitaire pour générer une URL signée Supabase
export async function getRecordingSignedUrl(filepath: string, expiresIn: number = 3600): Promise<string | null> {
  try {
    const supabase = await createClient();

    const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_MEETINGS_BUCKET!;

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filepath, expiresIn);

    if (error) {
      console.error('Erreur génération URL signée:', error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Erreur lors de la génération de l\'URL signée:', error);
    return null;
  }
}

type Recordings = Array<{
  publicUrl: string;
  signedUrl: string | null;
  createdAt: Date;
  saveDate: Date | null;
  filename: string;
  filepath: string;
}>

// Fonction pour récupérer les enregistrements depuis la base de données
export async function getRecordingsFromDB(meetingId?: string): Promise<ActionResponse<Recordings>> {
  try {
    const prisma = getPrisma();

    const recordings = await prisma.meetingRecording.findFirst({
      where: meetingId ? { meetingId } : {},
      select: {
        meeting: {
          select: {
            code: true,
            name: true,
            createdAt: true,
          }
        },
        meetingRecordingPaths: {
          select: {
            createdAt: true,
            saveDate: true,
            filename: true,
            filepath: true,
          }
        }
      },
      orderBy: {
        recordDate: 'desc'
      }
    });

    if (!recordings) return {
      success: false,
      error: "Not meeting recording founded",
      data: null
    }

    // Ajouter les URLs publiques
    const recordingsWithUrls = await Promise.all(
      recordings.meetingRecordingPaths.map(async (recording) => {
        const publicUrl = await getRecordingPublicUrl(recording.filepath || '');
        const signedUrl = await getRecordingSignedUrl(recording.filepath || '', 3600);

        return {
          ...recording,
          publicUrl,
          signedUrl
        };
      })
    );

    return {
      success: true,
      error: null,
      data: recordingsWithUrls,
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des enregistrements:', error);
    return {
      success: false,
      error: (error as Error).message,
      data: null,
    };
  }
}

// Fonction pour supprimer un enregistrement
export async function deleteRecording(recordingId: string): Promise<ActionResponse<null>> {
  try {
    const prisma = getPrisma();

    const supabase = await createClient();

    // Récupérer l'enregistrement
    const recording = await prisma.meetingRecording.findUnique({
      where: { id: recordingId },
      select: { meetingRecordingPaths: true }
    });

    if (!recording) {
      return {
        error: 'Enregistrement non trouvé',
        success: false,
        data: null
      };
    }

    // Supprimer le fichier du stockage
    await Promise.all(recording.meetingRecordingPaths.map(async recording_item => {
      const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_MEETINGS_BUCKET!;
      const { error: storageError } = await supabase.storage
        .from(bucket)
        .remove([recording_item.filepath]);

      if (storageError) throw storageError
    }))

    // Supprimer l'enregistrement de la base de données
    await prisma.meetingRecording.delete({
      where: { id: recordingId }
    });

    return {
      error: null,
      success: true,
      data: null
    };
  } catch (error) {
    return {
      error: (error as Error).message,
      success: false,
      data: null
    };
  }
}
