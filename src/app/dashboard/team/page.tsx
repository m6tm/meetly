
'use client';

import React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreHorizontal, PlusCircle, Trash2, Edit3, UserCheck, UserX, Mail } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from "@/hooks/use-toast";

// Define the TeamMember type
export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Viewer' | 'Member';
  status: 'Active' | 'Invited' | 'Inactive';
  avatarUrl?: string;
  lastLogin?: string; // ISO string or formatted string
};

// Placeholder data for team members
const initialTeamMembers: TeamMember[] = [
  {
    id: 'tm1',
    name: 'Alice Wonderland',
    email: 'alice@example.com',
    role: 'Admin',
    status: 'Active',
    avatarUrl: 'https://placehold.co/100x100.png',
    lastLogin: '2024-08-20T10:00:00Z',
  },
  {
    id: 'tm2',
    name: 'Bob The Builder',
    email: 'bob@example.com',
    role: 'Editor',
    status: 'Active',
    avatarUrl: 'https://placehold.co/100x100.png',
    lastLogin: '2024-08-19T14:30:00Z',
  },
  {
    id: 'tm3',
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    role: 'Viewer',
    status: 'Invited',
  },
  {
    id: 'tm4',
    name: 'Diana Prince',
    email: 'diana@example.com',
    role: 'Member',
    status: 'Inactive',
    avatarUrl: 'https://placehold.co/100x100.png',
    lastLogin: '2024-07-15T09:00:00Z',
  },
  {
    id: 'tm5',
    name: 'Edward Scissorhands',
    email: 'edward@example.com',
    role: 'Member',
    status: 'Active',
    avatarUrl: 'https://placehold.co/100x100.png',
    lastLogin: '2024-08-21T11:00:00Z',
  },
];

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = React.useState<TeamMember[]>(initialTeamMembers);
  const [nameFilter, setNameFilter] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState<'all' | TeamMember['role']>('all');
  const [statusFilter, setStatusFilter] = React.useState<'all' | TeamMember['status']>('all');
  const { toast } = useToast();

  const handleAddNewMember = () => {
    console.log('Add new member clicked');
    // Placeholder for opening a dialog or navigating to a form
    toast({ title: "Add New Member", description: "Functionality to add a new member will be implemented here." });
  };

  const handleEditMember = (memberId: string) => {
    console.log('Edit member:', memberId);
    toast({ title: "Edit Member", description: `Editing member ${memberId}. (Placeholder)` });
  };

  const handleRemoveMember = (memberId: string) => {
    console.log('Remove member:', memberId);
    setTeamMembers(prev => prev.filter(member => member.id !== memberId));
    toast({ title: "Member Removed", description: `Member ${memberId} has been removed.`, variant: "destructive" });
  };

  const handleResendInvitation = (memberId: string) => {
    console.log('Resend invitation for member:', memberId);
    toast({ title: "Invitation Resent", description: `Invitation resent for member ${memberId}.` });
  };

  const handleDeactivateMember = (memberId: string) => {
     console.log('Deactivate member:', memberId);
     setTeamMembers(prevMembers => prevMembers.map(m => m.id === memberId ? {...m, status: 'Inactive'} : m));
     toast({ title: "Member Deactivated", description: `Member ${memberId} has been deactivated.` });
  }

  const handleActivateMember = (memberId: string) => {
    console.log('Activate member:', memberId);
    setTeamMembers(prevMembers => prevMembers.map(m => m.id === memberId ? {...m, status: 'Active'} : m));
    toast({ title: "Member Activated", description: `Member ${memberId} has been activated.` });
  }


  const columns: ColumnDef<TeamMember>[] = React.useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => {
          const member = row.original;
          return (
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={member.avatarUrl} alt={member.name} data-ai-hint="person face" />
                <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium">{member.name}</span>
                <span className="text-xs text-muted-foreground">{member.email}</span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }) => <Badge variant="secondary">{row.getValue('role')}</Badge>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.getValue('status') as TeamMember['status'];
          return (
            <Badge
              variant={
                status === 'Active'
                  ? 'default'
                  : status === 'Invited'
                  ? 'outline'
                  : 'destructive'
              }
              className={status === 'Active' ? 'bg-green-500/20 text-green-700 border-green-500/30 hover:bg-green-500/30 dark:bg-green-700/30 dark:text-green-300 dark:border-green-700/40' : 
                           status === 'Invited' ? 'bg-blue-500/20 text-blue-700 border-blue-500/30 hover:bg-blue-500/30 dark:bg-blue-700/30 dark:text-blue-300 dark:border-blue-700/40' : 
                           'bg-red-500/20 text-red-700 border-red-500/30 hover:bg-red-500/30 dark:bg-red-700/30 dark:text-red-300 dark:border-red-700/40'}
            >
              {status}
            </Badge>
          );
        },
      },
       {
        accessorKey: 'lastLogin',
        header: 'Last Login',
        cell: ({ row }) => {
            const lastLogin = row.getValue('lastLogin') as string | undefined;
            if (!lastLogin) return <span className="text-muted-foreground">N/A</span>;
            // This basic formatting assumes ISO string. Consider using date-fns for more robust parsing/formatting.
            try {
                 return new Date(lastLogin).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
            } catch {
                return <span className="text-muted-foreground">Invalid Date</span>;
            }
        },
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const member = row.original;
          return (
            <div className="text-right whitespace-nowrap">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">More actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEditMember(member.id)}>
                    <Edit3 className="mr-2 h-4 w-4" />
                    Edit Member
                  </DropdownMenuItem>
                  {member.status === 'Invited' && (
                    <DropdownMenuItem onClick={() => handleResendInvitation(member.id)}>
                      <Mail className="mr-2 h-4 w-4" />
                      Resend Invitation
                    </DropdownMenuItem>
                  )}
                   {member.status === 'Active' && (
                    <DropdownMenuItem onClick={() => handleDeactivateMember(member.id)}>
                      <UserX className="mr-2 h-4 w-4" />
                      Deactivate
                    </DropdownMenuItem>
                  )}
                  {member.status === 'Inactive' && (
                    <DropdownMenuItem onClick={() => handleActivateMember(member.id)}>
                      <UserCheck className="mr-2 h-4 w-4" />
                      Activate
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => handleRemoveMember(member.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove Member
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [] 
  );

  const filteredMembers = React.useMemo(() => {
    return teamMembers
      .filter(member =>
        nameFilter ? member.name.toLowerCase().includes(nameFilter.toLowerCase()) || member.email.toLowerCase().includes(nameFilter.toLowerCase()) : true
      )
      .filter(member =>
        roleFilter !== 'all' ? member.role === roleFilter : true
      )
      .filter(member =>
        statusFilter !== 'all' ? member.status === statusFilter : true
      );
  }, [teamMembers, nameFilter, roleFilter, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Team Members
          </h1>
          <p className="text-muted-foreground">
            Manage your team members and their roles.
          </p>
        </div>
        <Button onClick={handleAddNewMember}>
          <PlusCircle className="mr-2 h-5 w-5" />
          Add New Member
        </Button>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Member List</CardTitle>
          <CardDescription>
            Overview of all team members. Apply filters to narrow down your search.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-2 py-4">
            <Input
              placeholder="Filter by name or email..."
              value={nameFilter}
              onChange={(event) => setNameFilter(event.target.value)}
              className="max-w-xs w-full sm:w-auto"
            />
            <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as 'all' | TeamMember['role'])}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Editor">Editor</SelectItem>
                <SelectItem value="Viewer">Viewer</SelectItem>
                <SelectItem value="Member">Member</SelectItem>
              </SelectContent>
            </Select>
             <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | TeamMember['status'])}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Invited">Invited</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DataTable columns={columns} data={filteredMembers} initialPageSize={5} />
        </CardContent>
      </Card>
    </div>
  );
}
