import z from "zod";

export const validatorUploadProfile = z.object({
    fullName: z.string().min(3).max(100),
    bio: z.string().max(5000),
})