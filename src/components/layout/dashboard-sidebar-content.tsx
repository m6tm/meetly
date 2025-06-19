
'use client';

import Link from 'next/link';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Home, Settings, Users, Briefcase, BarChart3, LogOut, ClipboardList, Clapperboard } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';

interface DashboardSidebarContentProps {
  // onSearchClick prop removed
}

export default function DashboardSidebarContent({ /* onSearchClick prop removed */ }: DashboardSidebarContentProps) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 text-primary">
            <path d="M4.5 4.5a3 3 0 00-3 3v9a3 3 0 003 3h15a3 3 0 003-3v-9a3 3 0 00-3-3h-15zm12.75 1.5a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-3a.75.75 0 01.75-.75zm-3.75 0a.75.75 0 01.75.75v6.75a.75.75 0 01-1.5 0V6.75a.75.75 0 01.75-.75zM7.5 12a.75.75 0 01.75-.75h3a.75.75 0 010 1.5h-3a.75.75 0 01-.75-.75zm-3 3.75a.75.75 0 01.75-.75h6.75a.75.75 0 010 1.5H5.25a.75.75 0 01-.75-.75z" />
          </svg>
          <span className="font-bold text-lg group-data-[collapsible=icon]:hidden">Meetly Dashboard</span>
        </div>
        {/* Search Button removed from sidebar header */}
      </SidebarHeader>

      <SidebarMenu className="flex-1 p-2">
        <SidebarMenuItem>
          <Link href="/dashboard">
            <SidebarMenuButton tooltip="Home" isActive={isActive('/dashboard')}>
              <Home />
              <span>Home</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
        <SidebarMenuItem>
           <Link href="/dashboard/meetings">
            <SidebarMenuButton tooltip="Meetings" isActive={isActive('/dashboard/meetings')}>
              <Briefcase />
              <span>Meetings</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <Link href="/dashboard/recordings">
            <SidebarMenuButton tooltip="Recordings" isActive={isActive('/dashboard/recordings')}>
              <Clapperboard />
              <span>Recordings</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <Link href="/dashboard/transcriptions">
            <SidebarMenuButton tooltip="Transcriptions" isActive={isActive('/dashboard/transcriptions')}>
              <ClipboardList />
              <span>Transcriptions</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <Link href="/dashboard/analytics">
            <SidebarMenuButton tooltip="Analytics" isActive={isActive('/dashboard/analytics')}>
              <BarChart3 />
              <span>Analytics</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <Link href="/dashboard/team">
            <SidebarMenuButton tooltip="Team Management" isActive={isActive('/dashboard/team')}>
              <Users />
              <span>Team</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      </SidebarMenu>

      <SidebarSeparator className="my-1" />

      <SidebarMenu className="p-2">
        <SidebarMenuItem>
          <Link href="/dashboard/settings">
            <SidebarMenuButton tooltip="Settings" isActive={isActive('/dashboard/settings')}>
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      </SidebarMenu>

      <SidebarFooter className="p-4 mt-auto border-t border-sidebar-border">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src="https://placehold.co/100x100.png" alt="User Avatar" data-ai-hint="user avatar" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className="group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-semibold">John Doe</p>
            <p className="text-xs text-muted-foreground">john.doe@example.com</p>
          </div>
          <Button variant="ghost" size="icon" className="ml-auto group-data-[collapsible=icon]:hidden">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </>
  );
}
