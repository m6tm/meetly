
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

export type TranscriptionAiResult = {
    data: TranscriptionResultData;
}

export type TranscriptionResultData = {
    candidates: TranscriptionResultCandidate[];
    usageMetadata: TranscriptionResultUsageMetadata;
    modelVersion: string;
    responseId: string;
}

export type TranscriptionResultCandidate = {
    content: TranscriptionResultContent;
    finishReason: string;
    index: number;
}

export type TranscriptionResultContent = {
    parts: TranscriptionResultContentPart[];
    role: string;
}

export type TranscriptionResultContentPart = {
    text: string;
}

export type TranscriptionResultUsageMetadata = {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
    promptTokensDetails: {
        modality: string;
        tokenCount: number;
    }[];
    thoughtsTokenCount: number;
}