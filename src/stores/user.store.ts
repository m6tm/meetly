import { Theme } from "@/generated/prisma";
import { User } from "@supabase/supabase-js";
import { create } from "zustand";

type UserStore = {
    user: User | null
    appearance: {
        theme: Theme
        language: string
    } | null

    setUser: (user: User | null) => void
    setAppearance: (appearance: { theme: Theme, language: string } | null) => void
    applyTheme: (theme: Theme) => void
    setTheme: (theme: Theme) => void
}

export const userStore = create<UserStore>((set) => ({
    user: null,
    appearance: null,

    setUser: (user) => set({ user }),
    setAppearance: (appearance) => set({ appearance }),
    applyTheme: (theme: Theme) => {
        if (typeof window === 'undefined') return;

        if (theme === Theme.DARK) {
            document.documentElement.classList.add('dark');
        } else if (theme === Theme.LIGHT) {
            document.documentElement.classList.remove('dark');
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
    },
    setTheme: (theme: Theme) => {
        set({ appearance: { theme, language: userStore.getState().appearance?.language ?? 'en' } });
        userStore.getState().applyTheme(theme);
    },
}))