import { ParticipantMetadata } from "@/types/meetly.types";
import { LocalParticipant, Participant } from "livekit-client";
import { faker } from '@faker-js/faker';

export function getParticipantMetadata(participant: Participant): ParticipantMetadata {
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

export function getParticipantName(participant: Participant) {
    const metadata = getParticipantMetadata(participant);
    return metadata.name;
}

export function getParticipantHandUp(participant: Participant) {
    const metadata = getParticipantMetadata(participant);
    return metadata.handUp;
}

export function getParticipantAvatar(participant: Participant) {
    const metadata = getParticipantMetadata(participant);
    return metadata.avatar;
}

export function getParticipantRole(participant: Participant) {
    const metadata = getParticipantMetadata(participant);
    return metadata.role;
}