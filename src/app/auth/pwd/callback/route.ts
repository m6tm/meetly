import { type CookieMethodsServer, createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SyncUserUseCase } from "@/modules/auth/application/use-cases/sync-user.use-case";
import { PrismaAuthRepository } from "@/modules/auth/infrastructure/repositories/prisma-auth.repository";

export async function GET(request: Request) {
	const { searchParams, origin } = new URL(request.url);
	try {
		const code = searchParams.get("code");
		// if "next" is in param, use it as the redirect URL
		const next = searchParams.get("next") ?? "/dashboard";

		if (code) {
			const cookieStore = await cookies();
			const supabase = createServerClient(
				process.env.NEXT_PUBLIC_SUPABASE_URL || "",
				process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
				{
					cookies: {
						getAll() {
							return cookieStore.getAll();
						},
						setAll(cookiesToSet) {
							cookiesToSet.forEach(({ name, value, options }) => {
								cookieStore.set(name, value, options);
							});
						},
					} as CookieMethodsServer,
				},
			);

			const { error } = await supabase.auth.exchangeCodeForSession(code);
			if (error) throw error;

			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (user) {
				// Utilisation du module Auth (Hexagonal)
				const authRepository = new PrismaAuthRepository();
				const syncUserUseCase = new SyncUserUseCase(authRepository);

				await syncUserUseCase.execute({
					id: user.id,
					email: user.email ?? "",
					name: user.user_metadata.full_name || user.user_metadata.name,
					image: user.user_metadata.avatar_url,
				});

				return NextResponse.redirect(`${origin}${next}`);
			}
		}

		// return the user to an error page with instructions
		return NextResponse.redirect(
			`${origin}/signin?error=authentication_failed`,
		);
	} catch (error) {
		console.error(error);
		return NextResponse.redirect(
			`${origin}/signin?error=authentication_failed`,
		);
	}
}
