
export type ParticipantRole = 'admin' | 'moderator' | 'participant';

export type ParticipantMetadata = {
    id: string;
    handUp: boolean;
    name: string;
    avatar?: string;
    role: ParticipantRole;
    joined: number;
}
