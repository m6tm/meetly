import { getPrisma } from '@/lib/prisma';
import { createServerClient, type CookieMethodsServer } from '@supabase/ssr'; // Correct import and add CookieMethodsServer type
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { faker } from '@faker-js/faker'
import { AccountStatus, NotificationType, Theme } from '@/generated/prisma';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const cookieStore = await cookies(); // Await cookies()
    const supabase = createServerClient( // Use createServerClient
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: { // Use getAll and setAll methods
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        } as CookieMethodsServer, // Explicitly cast to the new type
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    const { data: { user } } = await supabase.auth.getUser();
    const prisma = getPrisma();
    if (user)
      await prisma.$transaction([
        prisma.account.create({
          data: {
            status: AccountStatus.ACTIVE,
            userId: user.id,
            createdAt: user.created_at ?? new Date(),
          }
        }),
        prisma.team.create({
          data: {
            name: user.email ? user.email.split('@')[0] : faker.person.middleName(),
            createdBy: user.id,
          }
        }),
        prisma.appearance.create({
          data: {
            userId: user.id,
            theme: Theme.SYSTEM,
            language: 'en',
          }
        }),
        prisma.notificationPreference.createMany({
          data: [
            {
              userId: user.id,
              type: NotificationType.MEETING_REMINDER,
              enabled: true,
            },
            {
              userId: user.id,
              type: NotificationType.TRANSCRIPTION_UPDATE,
              enabled: true,
            },
            {
              userId: user.id,
              type: NotificationType.TEAM_ACTIVITY,
              enabled: true,
            },
            {
              userId: user.id,
              type: NotificationType.NEWS_UPDATE,
              enabled: false,
            },
            {
              userId: user.id,
              type: NotificationType.SECURITY_ALERT,
              enabled: true,
            },
          ],
        }),
      ])

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/signin?error=authentication_failed`);
}