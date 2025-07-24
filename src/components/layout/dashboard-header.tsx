
'use client';

import type { ReactNode } from 'react';
import React, { useCallback, useEffect } from 'react';
import Link from 'next/link';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Bell, UserCircle, Mail, MessageSquare, CheckCircle, Settings, Filter, X, Eye } from 'lucide-react'; // Search, Command removed
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { DataTable } from '@/components/ui/data-table';
import type { ColumnDef } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { userStore } from '@/stores/user.store';
import { Theme } from '@/generated/prisma';
import { updateThemeAction } from '@/actions/account.actions';

// Local NotificationItem type for clarity
type NotificationItem = {
  id: string;
  type: string;
  icon: ReactNode;
  content: string;
  time: string;
  read: boolean;
};

const initialNotifications: NotificationItem[] = [
  { id: 'n1', type: 'New Message', icon: <MessageSquare className="h-4 w-4 text-blue-500 group-focus:text-accent-foreground" />, content: 'You have a new message from Alice regarding Project Alpha.', time: '5m ago', read: false },
  { id: 'n2', type: 'Meeting Reminder', icon: <Mail className="h-4 w-4 text-purple-500 group-focus:text-accent-foreground" />, content: 'Upcoming meeting: "Q4 Strategy" in 30 minutes.', time: '10m ago', read: false },
  { id: 'n3', type: 'Transcription Complete', icon: <CheckCircle className="h-4 w-4 text-green-500 group-focus:text-accent-foreground" />, content: 'Transcription for "Client Call - Acme Corp" is complete.', time: '1h ago', read: true },
  { id: 'n4', type: 'Team Update', icon: <UserCircle className="h-4 w-4 text-orange-500 group-focus:text-accent-foreground" />, content: 'Bob B. has been added to your team.', time: '2h ago', read: true },
  { id: 'n5', type: 'New Message', icon: <MessageSquare className="h-4 w-4 text-blue-500 group-focus:text-accent-foreground" />, content: 'Reminder: Submit your weekly report by EOD.', time: '3h ago', read: false },
  { id: 'n6', type: 'Security Alert', icon: <Settings className="h-4 w-4 text-red-500 group-focus:text-accent-foreground" />, content: 'Unusual login attempt detected on your account.', time: '4h ago', read: true },
];

interface DashboardHeaderProps {
  pageTitle?: string;
}

export default function DashboardHeader({ pageTitle }: DashboardHeaderProps) {
  const { isMobile } = useSidebar();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const [notificationsData, setNotificationsData] = React.useState<NotificationItem[]>(initialNotifications);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = React.useState(false);

  // State for filters in the modal
  const [modalFilterText, setModalFilterText] = React.useState('');
  const [modalFilterType, setModalFilterType] = React.useState('all');
  const [modalFilterReadStatus, setModalFilterReadStatus] = React.useState('all');

  const { appearance, setTheme } = userStore()
  const toggleTheme = async () => {
    const oldTheme = appearance?.theme ?? Theme.LIGHT;
    const newTheme = oldTheme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT;
    setTheme(newTheme);
    const response = await updateThemeAction(newTheme);
    if (!response.success || !response.data) {
      setTheme(oldTheme);
    }
  };

  const unreadNotificationsCount = notificationsData.filter(n => !n.read).length;

  const handleMarkAsReadToggleInModal = (notificationId: string) => {
    setNotificationsData(prevNotifications =>
      prevNotifications.map(n =>
        n.id === notificationId ? { ...n, read: !n.read } : n
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotificationsData(prev => prev.map(n => ({ ...n, read: true })));
  };

  const uniqueNotificationTypes = React.useMemo(() => {
    const types = new Set(notificationsData.map(n => n.type));
    return Array.from(types);
  }, [notificationsData]);

  const notificationColumns: ColumnDef<NotificationItem>[] = React.useMemo(() => [
    {
      accessorKey: "icon",
      header: () => <span className="sr-only">Icon</span>,
      cell: ({ row }) => <div className="flex justify-center items-center h-full w-6">{row.original.icon}</div>,
      size: 40,
      enableSorting: false,
    },
    {
      accessorKey: "type",
      header: "Type",
      size: 150,
    },
    {
      accessorKey: "content",
      header: "Content",
      cell: ({ row }) => <div className="truncate max-w-md" title={row.original.content}>{row.original.content}</div>,
    },
    {
      accessorKey: "time",
      header: "Time",
      size: 100,
    },
    {
      accessorKey: "read",
      header: "Status",
      size: 100,
      cell: ({ row }) => (
        <Badge variant={row.original.read ? "secondary" : "default"} className={row.original.read ? "font-normal" : "bg-primary/80"}>
          {row.original.read ? "Read" : "Unread"}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: () => <div className="text-center">Actions</div>,
      size: 120,
      cell: ({ row }) => (
        <div className="text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleMarkAsReadToggleInModal(row.original.id)}
          >
            {row.original.read ? 'Mark Unread' : 'Mark Read'}
          </Button>
        </div>
      ),
      enableSorting: false,
    },
  ], [notificationsData]);

  const filteredModalNotifications = React.useMemo(() => {
    return notificationsData
      .filter(n => modalFilterText ? n.content.toLowerCase().includes(modalFilterText.toLowerCase()) || n.type.toLowerCase().includes(modalFilterText.toLowerCase()) : true)
      .filter(n => modalFilterType !== 'all' ? n.type === modalFilterType : true)
      .filter(n => {
        if (modalFilterReadStatus === 'all') return true;
        return modalFilterReadStatus === 'read' ? n.read : !n.read;
      });
  }, [notificationsData, modalFilterText, modalFilterType, modalFilterReadStatus]);


  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <SidebarTrigger />
        <div className="flex-1">
          {pageTitle && <h1 className="text-lg font-semibold md:hidden">{pageTitle}</h1>}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme">
            {mounted && (appearance?.theme === Theme.DARK ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />)}
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
              {notificationsData.slice(0, 4).length === 0 ? (
                <DropdownMenuItem disabled className="text-center text-muted-foreground py-4">
                  No new notifications
                </DropdownMenuItem>
              ) : (
                notificationsData.slice(0, 4).map(notification => (
                  <DropdownMenuItem key={notification.id} className={`group flex items-start gap-3 p-3 ${!notification.read ? 'bg-primary/5 dark:bg-primary/10' : ''}`}>
                    <div className="mt-1">{notification.icon}</div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'} group-focus:text-accent-foreground`}>{notification.type}</p>
                      <p className={`text-xs ${!notification.read ? 'text-foreground/80' : 'text-muted-foreground/80'} group-focus:text-accent-foreground`}>{notification.content}</p>
                      <p className="text-xs text-muted-foreground/60 group-focus:text-accent-foreground mt-1">{notification.time}</p>
                    </div>
                    {!notification.read && (
                      <div className="h-2 w-2 rounded-full bg-primary mt-1.5"></div>
                    )}
                  </DropdownMenuItem>
                ))
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setIsNotificationsModalOpen(true)} className="justify-center text-primary hover:underline py-2 cursor-pointer">
                <Eye className="mr-2 h-4 w-4" /> View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile Dropdown Removed */}
        </div>
      </header>

      <Dialog open={isNotificationsModalOpen} onOpenChange={setIsNotificationsModalOpen}>
        <DialogContent className="max-w-4xl w-[90vw] h-[85vh] flex flex-col p-0">
          <DialogHeader className="p-4 border-b flex-shrink-0">
            <DialogTitle className="flex items-center">
              <Bell className="mr-2 h-6 w-6 text-primary" /> All Notifications
            </DialogTitle>
            <DialogDescription>Browse, filter, and manage all your notifications.</DialogDescription>
          </DialogHeader>

          <div className="flex-grow overflow-hidden flex flex-col">
            <div className="flex flex-col sm:flex-row items-center gap-2 p-4 border-b flex-shrink-0">
              <Input
                placeholder="Filter by content or type..."
                value={modalFilterText}
                onChange={(e) => setModalFilterText(e.target.value)}
                className="max-w-xs w-full sm:w-auto"
              />
              <Select value={modalFilterType} onValueChange={setModalFilterType}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {uniqueNotificationTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={modalFilterReadStatus} onValueChange={setModalFilterReadStatus}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleMarkAllAsRead} variant="outline" size="sm" className="ml-auto">
                Mark all as read
              </Button>
            </div>

            <div className="flex-grow overflow-auto p-4">
              <DataTable columns={notificationColumns} data={filteredModalNotifications} initialPageSize={10} />
            </div>
          </div>

          <DialogFooter className="p-4 border-t flex-shrink-0">
            <Button variant="outline" onClick={() => setIsNotificationsModalOpen(false)}>
              <X className="mr-2 h-4 w-4" /> Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
