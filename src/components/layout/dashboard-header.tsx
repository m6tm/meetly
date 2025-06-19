
'use client';

import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Bell, UserCircle, Mail, MessageSquare, CheckCircle } from 'lucide-react';
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export default function DashboardHeader({ pageTitle }: { pageTitle?: string }) {
  const { isMobile } = useSidebar();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const toggleTheme = () => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark');
    }
  };

  // Placeholder notifications
  const notifications = [
    { id: 'n1', type: 'New Message', icon: <MessageSquare className="h-4 w-4 text-blue-500" />, content: 'You have a new message from Alice regarding Project Alpha.', time: '5m ago', read: false },
    { id: 'n2', type: 'Meeting Reminder', icon: <Mail className="h-4 w-4 text-purple-500" />, content: 'Upcoming meeting: "Q4 Strategy" in 30 minutes.', time: '10m ago', read: false },
    { id: 'n3', type: 'Transcription Complete', icon: <CheckCircle className="h-4 w-4 text-green-500" />, content: 'Transcription for "Client Call - Acme Corp" is complete.', time: '1h ago', read: true },
    { id: 'n4', type: 'Team Update', icon: <UserCircle className="h-4 w-4 text-orange-500" />, content: 'Bob B. has been added to your team.', time: '2h ago', read: true },
  ];

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      {isMobile || <SidebarTrigger />}
      <div className="flex-1">
        {pageTitle && <h1 className="text-lg font-semibold">{pageTitle}</h1>}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
          {mounted && (typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />)}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
              <Bell className="h-5 w-5" />
              {unreadNotificationsCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-4 w-4 min-w-4 p-0 flex items-center justify-center text-xs rounded-full"
                >
                  {unreadNotificationsCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 sm:w-96">
            <DropdownMenuLabel className="flex justify-between items-center">
              <span>Notifications</span>
              {unreadNotificationsCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {unreadNotificationsCount} Unread
                </Badge>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <DropdownMenuItem disabled className="text-center text-muted-foreground py-4">
                No new notifications
              </DropdownMenuItem>
            ) : (
              notifications.map(notification => (
                <DropdownMenuItem key={notification.id} className={`flex items-start gap-3 p-3 ${!notification.read ? 'bg-primary/5 dark:bg-primary/10' : ''}`}>
                  <div className="mt-1">{notification.icon}</div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>{notification.type}</p>
                    <p className={`text-xs ${!notification.read ? 'text-foreground/80' : 'text-muted-foreground/80'}`}>{notification.content}</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">{notification.time}</p>
                  </div>
                  {!notification.read && (
                     <div className="h-2 w-2 rounded-full bg-primary mt-1.5"></div>
                  )}
                </DropdownMenuItem>
              ))
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-primary hover:underline py-2">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="User menu">
              <UserCircle className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
