"use client";

import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { createClient } from "@/utils/supabase/client";
import { SetStateAction } from "react";

// Placeholder for social icons, can be replaced with actual icons later
const GithubIcon = () => <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"><title>GitHub</title><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>;
const GoogleIcon = () => <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"><title>Google</title><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-5.113 2.4-4.333 0-7.8-3.533-7.8-7.933s3.467-7.933 7.8-7.933c2.6 0 4.507 1.027 5.907 2.347l2.04-2.04C18.963 3.533 16.267 2.4 13.487 2.4 6.68 2.4 1.533 7.547 1.533 14.347s5.147 11.947 11.954 11.947c3.027 0 5.76-1.027 7.607-2.867 1.987-1.987 2.92-4.72 2.92-8.04v-2.4H12.48z"/></svg>;
const FacebookIcon = () => <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"><title>Facebook</title><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg>;

const REDIRECTION_URL = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:9002'}/auth/pwd/callback`

type AlternativeMethodAuthType = {
    setIsLoading: (loading: boolean) => void
    setError: (error: SetStateAction<string | null>) => void
    isLoading: boolean
    type: 'signin' | 'signup'
}

export default function AlternativeMethodAuth({
    setIsLoading,
    setError,
    isLoading,
    type,
}: AlternativeMethodAuthType) {
    const router = useRouter()
    const supabase = createClient();

    const handleGoogleSignUp = async () => {
        setIsLoading(true);
        setError(null);
        const { data, error: googleError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: REDIRECTION_URL,
        },
        });

        if (googleError) {
        setError(googleError.message);
        } else if (data.url) {
        // Redirect to Google's OAuth login page
        router.push(data.url);
        }
        setIsLoading(false);
    };

    const handleFacebookSignUp = async () => {
        setIsLoading(true);
        setError(null);
        const { data, error: facebookError } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
            redirectTo: REDIRECTION_URL,
        },
        });

        if (facebookError) {
        setError(facebookError.message);
        } else if (data.url) {
        // Redirect to Google's OAuth login page
        router.push(data.url);
        }
        setIsLoading(false);
    };

    const handleGithubSignUp = async () => {
        setIsLoading(true);
        setError(null);
        const { data, error: githubError } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
            redirectTo: REDIRECTION_URL,
        },
        });

        if (githubError) {
        setError(githubError.message);
        } else if (data.url) {
        // Redirect to Google's OAuth login page
        router.push(data.url);
        }
        setIsLoading(false);
    };
    
    return (
        <>
          <Button variant="outline" className="w-full" onClick={handleGoogleSignUp} disabled={isLoading}>
            <GoogleIcon /> <span className="ml-2">{type === 'signin' ? 'Sign in' : 'Sign up'} with Google</span>
          </Button>
          <Button variant="outline" className="w-full" onClick={handleFacebookSignUp} disabled={isLoading}>
            <FacebookIcon /> <span className="ml-2">{type === 'signin' ? 'Sign in' : 'Sign up'} with Facebook</span>
          </Button>
          <Button variant="outline" className="w-full" onClick={handleGithubSignUp} disabled={isLoading}>
            <GithubIcon /> <span className="ml-2">{type === 'signin' ? 'Sign in' : 'Sign up'} with GitHub</span>
          </Button>
        </>
    )
}