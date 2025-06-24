import { z } from "zod";


export const createMeetValidator = z.object({
    name: z.string(),
    date: z.date().optional(),
    time: z.string(),
    invitees: z.array(z.string()),
    isRecurring: z.boolean(),
});