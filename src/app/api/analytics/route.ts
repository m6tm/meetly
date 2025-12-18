import { NextResponse } from "next/server";
import { GetMeetingAnalyticsUseCase } from "@/modules/meeting/application/use-cases/get-meeting-analytics.use-case";
import { PrismaMeetingAnalyticsRepository } from "@/modules/meeting/infrastructure/repositories/prisma-meeting-analytics.repository";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const repository = new PrismaMeetingAnalyticsRepository();
	const useCase = new GetMeetingAnalyticsUseCase(repository);

	try {
		const analytics = await useCase.execute(user.id);
		return NextResponse.json(analytics);
	} catch (error) {
		console.error("Error fetching analytics:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
