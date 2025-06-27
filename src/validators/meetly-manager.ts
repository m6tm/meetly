
import { z } from "zod";


export const createMeetValidator = z.object({
    name: z.string(),
    date: z.date().optional(),
    time: z.string(),
    invitees: z.array(z.string()),
    isRecurring: z.boolean(),
    accessKey: z.string().optional(),
});

export const createMeetTokenValidator = z.object({
    roomName: z.string(),
    participantName: z.string(),
    metadata: z.object({
        avatar: z.string().optional(),
        role: z.union([z.literal('admin'), z.literal('moderator'), z.literal('participant'), z.literal('viewer')]),
        joined: z.number(),
    }),
});
