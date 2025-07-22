import { ParticipantMetadata } from "@/types/meetly.types";
import { LocalParticipant, Participant } from "livekit-client";
import { faker } from '@faker-js/faker';

export function getParticipantMetadata(participant: Participant): ParticipantMetadata {
    const defaultMetadata: ParticipantMetadata = {
        id: faker.string.uuid(),
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

export function getParticipantJoined(participant: Participant) {
    const metadata = getParticipantMetadata(participant);
    return metadata.joined === 1;
}

export function getParticipantRole(participant: Participant) {
    const metadata = getParticipantMetadata(participant);
    return metadata.role;
}

// Format HH:mm:ss
export function formatToHHmmss(nanoseconds: number) {
    const totalSeconds = nanoseconds / 1_000_000_000;

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Format textuel adaptatif
export function formatToHumanReadable(nanoseconds: number) {
    const totalSeconds = nanoseconds / 1_000_000_000;

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    const parts = [];

    if (hours > 0) {
        parts.push(`${hours} Heure${hours > 1 ? 's' : ''}`);
    }

    if (minutes > 0) {
        parts.push(`${minutes}min`);
    }

    if (seconds > 0) {
        parts.push(`${seconds}s`);
    }

    if (parts.length === 0) {
        return "0s";
    }

    return parts.join(' ');
}
