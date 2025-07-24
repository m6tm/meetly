import { Theme } from "@/generated/prisma";
import z from "zod";


export const updateAppearanceValidator = z.object({
    theme: z.enum([Theme.LIGHT, Theme.DARK, Theme.SYSTEM]),
    language: z.string().min(2).max(10),
});