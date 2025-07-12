
export type ParticipantRole = 'admin' | 'moderator' | 'participant';

export type ParticipantMetadata = {
    id: string;
    handUp: boolean;
    name: string;
    avatar?: string;
    role: ParticipantRole;
    joined: number;
}

export type RecordingStartData = {
    egressId: string;
    meetingId: string;
    meet_name: string;
    filepath: string;
    retry_count: number;
}

export type StopRecordingPayload = {
    egressId: string;
    meetingId: string;
    duration?: string;
    retry_count: number;
}

export type TranscriptionStartData = {
    recordingId: string;
    retry_count: number;
}

export type SummaryStartData = {
    recordingId: string;
    transcription: string;
    retry_count: number;
}
