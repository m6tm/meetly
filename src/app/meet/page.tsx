"use client";

import { useRouter } from "next/navigation"
import { generateMeetToken } from "@/lib/utils"


export default function Page() {
    const router = useRouter()
    router.push(`/meet/${generateMeetToken()}`)
    return (
        <></>
    )
}