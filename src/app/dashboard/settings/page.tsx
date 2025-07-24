
'use client';

import React, { useCallback } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserCog, CreditCard, Palette, Bell, ShieldCheck } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import ProfileComponent from '@/components/settings/profile.component';
import AccountComponent from '@/components/settings/account.component';
import AppearanceComponent from '@/components/settings/appearance.component';
import NotificationComponent from '@/components/settings/notification.component';
import SecurityComponent from '@/components/settings/security.component';

export default function SettingsPage() {
  const [user, setUser] = React.useState<User | null>(null);
  const supabase = createClient();

  const handleFetchUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  }, []);

  React.useEffect(() => {
    handleFetchUser();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
          <UserCog className="mr-3 h-8 w-8 text-primary" /> Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your account settings, preferences, and more.
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1 mb-4 h-auto">
          <TabsTrigger value="profile"><UserCog className="mr-2 h-4 w-4 hidden sm:inline-block" />Profile</TabsTrigger>
          <TabsTrigger value="account"><CreditCard className="mr-2 h-4 w-4 hidden sm:inline-block" />Account</TabsTrigger>
          <TabsTrigger value="appearance"><Palette className="mr-2 h-4 w-4 hidden sm:inline-block" />Appearance</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="mr-2 h-4 w-4 hidden sm:inline-block" />Notifications</TabsTrigger>
          <TabsTrigger value="security"><ShieldCheck className="mr-2 h-4 w-4 hidden sm:inline-block" />Security</TabsTrigger>
        </TabsList>

        <ProfileComponent user={user} handleFetchUser={handleFetchUser} />

        <AccountComponent />

        <AppearanceComponent />

        <NotificationComponent />

        <SecurityComponent />
      </Tabs>
    </div>
  );
}



