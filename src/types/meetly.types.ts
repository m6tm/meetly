
export type ParticipantRole = 'admin' | 'moderator' | 'participant';

export type ParticipantMetadata = {
    handUp: boolean;
    name: string;
    avatar?: string;
    role: ParticipantRole;
    joined: number;
}
