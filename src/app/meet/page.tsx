"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { generateMeetToken } from "@/lib/utils";

export default function Page() {
	const router = useRouter();

	useEffect(() => {
		router.push(`/meet/${generateMeetToken()}`);
	}, [router]);

	return <></>;
}
