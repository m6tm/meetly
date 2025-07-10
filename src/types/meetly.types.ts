
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
    retry_count?: number;
}

export type StopRecordingPayload = {
    egressId: string;
    meetingId: string;
    datas: Array<RecordingPathData>
    retry_count?: number;
}

export type RecordingPathData = {
    filename: string;
    filepath: string;
    size: string;
    duration: string;
}
