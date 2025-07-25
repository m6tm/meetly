import { Theme } from "@/generated/prisma";
import z from "zod";


export const updateAppearanceValidator = z.object({
    theme: z.enum([Theme.LIGHT, Theme.DARK, Theme.SYSTEM]),
    language: z.string().min(2).max(10),
});

export const updateNotificationValidator = z.object({
    meetingReminder: z.boolean(),
    transcriptionUpdate: z.boolean(),
    teamActivity: z.boolean(),
    newsletter: z.boolean(),
})

export const changePasswordValidator = z.object({
    currentPassword: z.string().min(8, 'Current password is required'),
    newPassword: z.string()
        .min(8, 'Password must be at least 8 characters long')
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]).*$/,
            'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        ),
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

