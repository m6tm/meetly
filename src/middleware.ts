import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { createClient } from './utils/supabase/server';

export async function middleware(request: NextRequest) {
    const res = await updateSession(request)
    const isDashboard = request.nextUrl.pathname.startsWith('/dashboard');
    const isLogin = request.nextUrl.pathname.startsWith('/signin');
    const isSignup = request.nextUrl.pathname.startsWith('/signup');
    const isResetPassword = request.nextUrl.pathname.startsWith('/reset-password');
    const isApi = request.nextUrl.pathname.startsWith('/api/');
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser()

    if (isDashboard && (error || !data?.user)) {
        return NextResponse.redirect(new URL('/signin', request.url));
    }

    if ((isLogin && data?.user) || (isSignup && data?.user) || (isResetPassword && data?.user)) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if ((isLogin && !data?.user) || (isSignup && !data?.user) || (isResetPassword && !data?.user)) {
        return NextResponse.next();
    }

    if (!isDashboard && !isApi) return NextResponse.next();
    return res;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}