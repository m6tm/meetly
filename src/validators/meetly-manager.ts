
import { z } from "zod";

export const createMeetValidator = z.object({
    name: z.string().min(3, { message: "Le nom de la réunion est obligatoire." }),
    date: z.date({ message: "La date est obligatoire." }),
    time: z.string().regex(new RegExp('^\\d{2}:\\d{2}$'), { message: "Vous devez sélectionner une heure." }),
    invitees: z.array(z.string().email({ message: "L'adresse mail de l'un des invités est invalide" })).optional(),
    isRecurring: z.boolean(),
    accessKey: z.string().optional(),
});

export const updateMeetValidator = z.object({
    id: z.string({ message: "L'identifiant de la réunion est obligatoire." }).min(1, { message: "L'identifiant de la réunion est obligatoire." }),
    name: z.string().optional(),
    date: z.coerce.date().optional(),
    time: z.string().optional(),
    invitees: z.array(z.string().email({ message: "L'adresse mail de l'un des invités est invalide." })).optional(),
    isRecurring: z.boolean().optional(),
    accessKey: z.string().optional(),
})

export const createMeetTokenValidator = z.object({
    roomName: z.string(),
    participantName: z.string(),
    metadata: z.object({
        avatar: z.string().optional(),
        role: z.union([z.literal('admin'), z.literal('moderator'), z.literal('participant')]),
        joined: z.number(),
    }),
});
