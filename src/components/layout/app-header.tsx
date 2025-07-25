
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogIn, Sun, Moon, UserPlus, LayoutDashboard, LogOut } from 'lucide-react'; // Settings icon removed
import React, { useCallback, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient, signOut } from '@/utils/supabase/client';
import { userStore } from '@/stores/user.store';

const AppHeader = () => {
  const [mounted, setMounted] = React.useState(false);
  const {user, setUser} = userStore()
  const [loading, setLoading] = useState<boolean>(true)

  const fetchUser = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUser(user)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!user && loading) fetchUser()
    return () => {
      setUser(null)
      setLoading(true)
    }
  }, []);
  
  useEffect(() => setMounted(true), []);

  const toggleTheme = () => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark');
    }
  };
  
  const handleSignOut = async () => {
    await signOut();
    setUser(null)
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 w-full">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-primary">
            <path d="M4.5 4.5a3 3 0 00-3 3v9a3 3 0 003 3h15a3 3 0 003-3v-9a3 3 0 00-3-3h-15zm12.75 1.5a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-3a.75.75 0 01.75-.75zm-3.75 0a.75.75 0 01.75.75v6.75a.75.75 0 01-1.5 0V6.75a.75.75 0 01.75-.75zM7.5 12a.75.75 0 01.75-.75h3a.75.75 0 010 1.5h-3a.75.75 0 01-.75-.75zm-3 3.75a.75.75 0 01.75-.75h6.75a.75.75 0 010 1.5H5.25a.75.75 0 01-.75-.75z" />
          </svg>
          <span className="font-bold text-xl font-headline sm:inline-block">
            Meetly
          </span>
        </Link>
        <nav className="flex flex-1 items-center space-x-4">
          {/* Future navigation links can go here */}
        </nav>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {mounted && (typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />)}
          </Button>
          {/* Settings button removed */}
          {user && (
            <>
              <Button variant="ghost" asChild size="sm">
                <Link href="/dashboard">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className='text-red-500' onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
              </Button>
            </>
          )}
          {(!user && !loading) && (
            <>
              <Button variant="outline" asChild size="sm">
                <Link href="/signin">
                  <LogIn className="mr-2 h-4 w-4" />
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
