'use client';

import React from 'react';
import { Bell, MessageSquare, Mail, CheckCircle, UserCircle, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { DataTable } from '@/components/ui/data-table';
import type { ColumnDef } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type NotificationItem = {
    id: string;
    type: string;
    icon: React.ReactNode;
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

export function Notifications() {
    const [notificationsData, setNotificationsData] = React.useState<NotificationItem[]>(initialNotifications);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [filterText, setFilterText] = React.useState('');
    const [filterType, setFilterType] = React.useState('all');
    const [filterReadStatus, setFilterReadStatus] = React.useState('all');

    const unreadCount = notificationsData.filter(n => !n.read).length;

    const toggleReadStatus = React.useCallback((notificationId: string) => {
        setNotificationsData(prev =>
            prev.map(n =>
                n.id === notificationId ? { ...n, read: !n.read } : n
            )
        );
    }, []);

    const markAllAsRead = () => {
        setNotificationsData(prev => prev.map(n => ({ ...n, read: true })));
    };

    const notificationTypes = React.useMemo(() => {
        const types = new Set(notificationsData.map(n => n.type));
        return Array.from(types);
    }, [notificationsData]);

    const columns: ColumnDef<NotificationItem>[] = React.useMemo(() => [
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
                        onClick={() => toggleReadStatus(row.original.id)}
                    >
                        {row.original.read ? 'Mark Unread' : 'Mark Read'}
                    </Button>
                </div>
            ),
            enableSorting: false,
        },
    ], [toggleReadStatus]);

    const filteredNotifications = React.useMemo(() => {
        return notificationsData
            .filter(n => filterText ?
                n.content.toLowerCase().includes(filterText.toLowerCase()) ||
                n.type.toLowerCase().includes(filterText.toLowerCase())
                : true)
            .filter(n => filterType !== 'all' ? n.type === filterType : true)
            .filter(n => {
                if (filterReadStatus === 'all') return true;
                return filterReadStatus === 'read' ? n.read : !n.read;
            });
    }, [notificationsData, filterText, filterType, filterReadStatus]);

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                            <Badge
                                variant="destructive"
                                className="absolute -top-1 -right-1 h-4 w-4 min-w-4 p-0 flex items-center justify-center text-xs rounded-full"
                            >
                                {unreadCount}
                            </Badge>
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 sm:w-96">
                    <DropdownMenuLabel className="flex justify-between items-center">
                        <span>Notifications</span>
                        {unreadCount > 0 && (
                            <Badge variant="secondary" className="text-xs">
                                {unreadCount} Unread
                            </Badge>
                        )}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {notificationsData.slice(0, 4).length === 0 ? (
                        <DropdownMenuItem disabled className="text-center text-muted-foreground py-4">
                            No new notifications
                        </DropdownMenuItem>
                    ) : (
                        <div className="max-h-96 overflow-y-auto">
                            {notificationsData.slice(0, 4).map((notification) => (
                                <DropdownMenuItem
                                    key={notification.id}
                                    className={`flex items-start gap-3 p-3 ${!notification.read ? 'bg-muted/50' : ''}`}
                                    onClick={() => toggleReadStatus(notification.id)}
                                >
                                    <div className="mt-0.5">{notification.icon}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{notification.type}</p>
                                        <p className="text-xs text-muted-foreground truncate">{notification.content}</p>
                                        <p className="text-xs text-muted-foreground">{notification.time}</p>
                                    </div>
                                    {!notification.read && (
                                        <div className="h-2 w-2 rounded-full bg-primary ml-2 flex-shrink-0" />
                                    )}
                                </DropdownMenuItem>
                            ))}
                        </div>
                    )}
                    <DropdownMenuSeparator />
                    <div className="flex justify-between p-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsModalOpen(true)}
                            className="text-xs"
                        >
                            View All
                        </Button>
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={markAllAsRead}
                                className="text-xs"
                            >
                                Mark all as read
                            </Button>
                        )}
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>All Notifications</DialogTitle>
                        <DialogDescription>
                            Manage your notifications
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-4 flex-1 overflow-hidden">
                        <div className="flex flex-col sm:flex-row gap-4 mt-2 mx-2">
                            <div className="flex-1">
                                <Input
                                    placeholder="Search notifications..."
                                    value={filterText}
                                    onChange={(e) => setFilterText(e.target.value)}
                                    className="w-full"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Select value={filterType} onValueChange={setFilterType}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="All Types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        {notificationTypes.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={filterReadStatus} onValueChange={setFilterReadStatus}>
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="unread">Unread</SelectItem>
                                        <SelectItem value="read">Read</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex-1 overflow-hidden">
                            <DataTable
                                columns={columns}
                                data={filteredNotifications}
                                initialPageSize={10}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <div className="flex justify-between w-full items-center">
                            <Button
                                variant="outline"
                                onClick={markAllAsRead}
                                disabled={unreadCount === 0}
                            >
                                Mark All as Read
                            </Button>
                            <div className="text-sm text-muted-foreground">
                                {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''} found
                            </div>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
