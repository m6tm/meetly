
export type ParticipantRole = 'admin' | 'moderator' | 'participant' | 'viewer';

export type ParticipantMetadata = {
    name: string;
    avatar?: string;
    role: ParticipantRole;
    joined: number;
}
