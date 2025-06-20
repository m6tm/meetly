
'use client';

import React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreHorizontal, PlusCircle, Trash2, Edit3, UserCheck, UserX, Mail, UserPlus, Loader2, ShieldQuestion } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from 'date-fns';

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

  // State for Invite/Edit Member Dialog
  const [isMemberFormDialogOpen, setIsMemberFormDialogOpen] = React.useState(false);
  const [memberEmail, setMemberEmail] = React.useState('');
  const [memberRole, setMemberRole] = React.useState<TeamMember['role'] | ''>('');
  const [memberName, setMemberName] = React.useState(''); // Added for editing/inviting name
  const [isSavingMember, setIsSavingMember] = React.useState(false);
  const [currentEditingMember, setCurrentEditingMember] = React.useState<TeamMember | null>(null);

  const resetMemberForm = () => {
    setMemberEmail('');
    setMemberRole('');
    setMemberName('');
    setCurrentEditingMember(null);
  };

  const handleOpenMemberFormDialog = (open: boolean) => {
    setIsMemberFormDialogOpen(open);
    if (open) {
      if (!currentEditingMember) { // If opening for a new member (not editing)
        resetMemberForm();
      }
    } else { // If dialog is closing
      setCurrentEditingMember(null); // Always reset edit mode when dialog closes
       // resetMemberForm(); // Reset form fields when dialog closes, regardless of how
    }
  };

  const handleSaveMember = async () => {
    if (!memberEmail || !memberRole) {
      toast({
        title: "Missing Information",
        description: "Please enter an email address and select a role.",
        variant: "destructive",
      });
      return;
    }
    setIsSavingMember(true);

    if (currentEditingMember) {
      // Editing existing member
      console.log('Updating member:', currentEditingMember.id, 'with role:', memberRole, 'and name:', memberName);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setTeamMembers(prev => prev.map(member => 
        member.id === currentEditingMember.id 
        ? { ...member, role: memberRole as TeamMember['role'], name: memberName || member.name } 
        : member
      ));
      toast({
        title: "Member Updated",
        description: `${memberName || currentEditingMember.name} has been updated.`,
      });
    } else {
      // Inviting new member
      console.log('Sending invite to:', memberEmail, 'with role:', memberRole, 'and name:', memberName);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      const newMember: TeamMember = {
        id: `tm${teamMembers.length + 1 + Math.random().toString(16).slice(2)}`, // More unique ID
        name: memberName || 'Invited Member', // Use provided name or default
        email: memberEmail,
        role: memberRole as TeamMember['role'],
        status: 'Invited',
      };
      setTeamMembers(prev => [newMember, ...prev]);
      toast({
        title: "Invitation Sent",
        description: `An invitation has been sent to ${memberEmail}.`,
      });
    }
    
    setIsSavingMember(false);
    setIsMemberFormDialogOpen(false);
    // currentEditingMember is reset by onOpenChange/handleOpenMemberFormDialog which calls resetMemberForm
  };

  const handleEditMemberClick = (member: TeamMember) => {
    setCurrentEditingMember(member);
    setMemberName(member.name);
    setMemberEmail(member.email);
    setMemberRole(member.role);
    setIsMemberFormDialogOpen(true);
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
            const lastLoginIso = row.getValue('lastLogin') as string | undefined;
            if (!lastLoginIso) return <span className="text-muted-foreground">N/A</span>;
            try {
                 return format(parseISO(lastLoginIso), 'MMM d, yyyy');
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
                  <DropdownMenuItem onClick={() => handleEditMemberClick(member)}>
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

  const dialogTitle = currentEditingMember ? `Edit Member: ${currentEditingMember.name}` : "Invite New Team Member";
  const dialogDescription = currentEditingMember 
    ? "Update the member's details below. Click save when you're done."
    : "Enter the email address, name (optional), and select a role for the new team member.";
  const dialogButtonText = currentEditingMember ? "Save Changes" : "Send Invitation";
  const dialogIcon = currentEditingMember ? <Edit3 className="mr-2 h-5 w-5 text-primary" /> : <UserPlus className="mr-2 h-5 w-5 text-primary" />;


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Team Members
          </h1>
          <p className="text-muted-foreground">
            Manage your team members and their roles.
          </p>
        </div>
        <Dialog open={isMemberFormDialogOpen} onOpenChange={handleOpenMemberFormDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => setCurrentEditingMember(null)} className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-5 w-5" />
              Add New Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                {dialogIcon}
                {dialogTitle}
              </DialogTitle>
              <DialogDescription>
                {dialogDescription}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="member-name-dialog" className="text-right">
                  Name
                </Label>
                <Input
                  id="member-name-dialog"
                  type="text"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  placeholder={currentEditingMember ? currentEditingMember.name : "Full Name (Optional for invite)"}
                  className="col-span-3"
                  disabled={isSavingMember}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="member-email-dialog" className="text-right">
                  <Mail className="inline-block h-4 w-4 mr-1" />
                  Email
                </Label>
                <Input
                  id="member-email-dialog"
                  type="email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="col-span-3"
                  disabled={isSavingMember || !!currentEditingMember} 
                  readOnly={!!currentEditingMember}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="member-role-dialog" className="text-right">
                  <ShieldQuestion className="inline-block h-4 w-4 mr-1" />
                  Role
                </Label>
                <Select 
                  value={memberRole} 
                  onValueChange={(value) => setMemberRole(value as TeamMember['role'])}
                  disabled={isSavingMember}
                >
                  <SelectTrigger className="col-span-3" id="member-role-dialog">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Editor">Editor</SelectItem>
                    <SelectItem value="Viewer">Viewer</SelectItem>
                    <SelectItem value="Member">Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsMemberFormDialogOpen(false)} disabled={isSavingMember}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSaveMember} disabled={isSavingMember || !memberEmail || !memberRole}>
                {isSavingMember ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {isSavingMember ? (currentEditingMember ? 'Saving...' : 'Sending...') : dialogButtonText}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
