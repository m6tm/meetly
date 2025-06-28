import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { createClient } from './utils/supabase/server';

export async function middleware(request: NextRequest) {
    const res = await updateSession(request);
    const isDashboard = request.nextUrl.pathname.startsWith('/dashboard');
    const isLogin = request.nextUrl.pathname.startsWith('/signin');
    const isSignup = request.nextUrl.pathname.startsWith('/signup');
    const isResetPassword = request.nextUrl.pathname.startsWith('/reset-password');
    const isApi = request.nextUrl.pathname.startsWith('/api/');
    const isMeet = request.nextUrl.pathname.startsWith('/meet');
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser()

    if (isMeet && !data?.user) {
        return NextResponse.redirect(new URL('/signin', request.url));
    }

    // Rediriger l'utilisateur authentifié loin des pages d'authentification
    if (data?.user && (isLogin || isSignup || isResetPassword)) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Permettre l'accès aux pages d'authentification si non authentifié
    if (!data?.user && (isLogin || isSignup || isResetPassword)) {
        return NextResponse.next();
    }

    // Permettre l'accès aux pages non protégées et aux API
    if (!isDashboard && !isApi) {
        return NextResponse.next();
    }

    // Gérer les réponses de Supabase pour la mise à jour de session
    return res;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}