"use client"

import { userStore } from "@/stores/user.store"
import { createClient } from "@/utils/supabase/client"
import { useCallback, useEffect } from "react"


export function DataProvider() {
    const { user, setUser } = userStore()

    const handleFetchUser = useCallback(async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            setUser(user)
        }
    }, [setUser])

    useEffect(() => {
        if (!user) handleFetchUser();
    }, [handleFetchUser])

    return <></>
}