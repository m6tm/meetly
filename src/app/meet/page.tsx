"use client";

import { useRouter } from "next/navigation"
import { generateMeetToken } from "@/lib/utils"


import { useEffect } from "react";

export default function Page() {
    const router = useRouter();

    useEffect(() => {
        router.push(`/meet/${generateMeetToken()}`);
    }, [router]);

    return (
        <></>
    );
}