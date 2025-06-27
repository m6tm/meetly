import { ParticipantMetadata } from "@/types/meetly.types";
import { LocalParticipant, RemoteParticipant } from "livekit-client";
import { faker } from '@faker-js/faker';

export function getParticipantMetadata(participant: RemoteParticipant | LocalParticipant): ParticipantMetadata {
    const defaultMetadata: ParticipantMetadata = {
        name: faker.internet.displayName(),
        handUp: false,
        avatar: undefined,
        role: 'participant',
        joined: 0,
    };
    const metadata = JSON.parse(participant.metadata ?? JSON.stringify(defaultMetadata));
    return metadata as ParticipantMetadata;
}

export function setParticimantMetadata(participant: LocalParticipant, newMetadata: ParticipantMetadata) {
    return participant.setMetadata(JSON.stringify(newMetadata));
}

export function getParticipantName(participant: RemoteParticipant | LocalParticipant) {
    const metadata = getParticipantMetadata(participant);
    return metadata.name;
}

export function getParticipantHandUp(participant: RemoteParticipant | LocalParticipant) {
    const metadata = getParticipantMetadata(participant);
    return metadata.handUp;
}

export function getParticipantAvatar(participant: LocalParticipant | RemoteParticipant) {
    const metadata = getParticipantMetadata(participant);
    return metadata.avatar;
}

export function getParticipantRole(participant: LocalParticipant | RemoteParticipant) {
    const metadata = getParticipantMetadata(participant);
    return metadata.role;
}