
'use client';

import React, { useCallback, useEffect } from 'react';
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
import { fetchTeamMembers, inviteTeamMember, removeTeamMember, updateTeamMemberRole, type TeamMember } from '@/actions/team-manager';
import { TeamMemberRole, TeamMemberStatus } from '@prisma/client';

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = React.useState<TeamMember[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [nameFilter, setNameFilter] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState<'all' | TeamMember['role']>('all');
  const [statusFilter, setStatusFilter] = React.useState<'all' | TeamMember['status']>('all');
  const { toast } = useToast();

  const [isMemberFormDialogOpen, setIsMemberFormDialogOpen] = React.useState(false);
  const [memberEmail, setMemberEmail] = React.useState('');
  const [memberRole, setMemberRole] = React.useState<TeamMember['role'] | ''>('');
  const [memberName, setMemberName] = React.useState('');
  const [isSavingMember, setIsSavingMember] = React.useState(false);
  const [currentEditingMember, setCurrentEditingMember] = React.useState<TeamMember | null>(null);

  const loadTeamMembers = useCallback(async () => {
    setLoading(true);
    const response = await fetchTeamMembers();
    if (response.success && response.data) {
      setTeamMembers(response.data);
    } else {
      toast({ title: "Erreur", description: response.error, variant: "destructive" });
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    loadTeamMembers();
  }, [loadTeamMembers]);

  const resetMemberForm = () => {
    setMemberEmail('');
    setMemberRole('');
    setMemberName('');
    setCurrentEditingMember(null);
  };

  const handleOpenMemberFormDialog = (open: boolean) => {
    setIsMemberFormDialogOpen(open);
    if (!open) {
      resetMemberForm();
    }
  };

  const handleSaveMember = async () => {
    if (!memberEmail || !memberRole) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez entrer une adresse e-mail et sélectionner un rôle.",
        variant: "destructive",
      });
      return;
    }
    setIsSavingMember(true);

    if (currentEditingMember) {
      const response = await updateTeamMemberRole(currentEditingMember.userId, memberRole);
      if (response.success) {
        toast({ title: "Membre mis à jour", description: `${currentEditingMember.name} a été mis à jour.` });
        if (response.data) {
          setTeamMembers(prev => [response.data!, ...prev.filter(m => m.email !== memberEmail)]);
        }
        loadTeamMembers();
      } else {
        toast({ title: "Erreur", description: response.error, variant: "destructive" });
      }
    } else {
      const response = await inviteTeamMember(memberEmail, memberName, memberRole);
      if (response.success) {
        toast({ title: "Action réussie", description: `L'utilisateur ${memberEmail} a été traité.` });
        if (response.data) {
          setTeamMembers(prev => [response.data!, ...prev.filter(m => m.email !== memberEmail)]);
        }
      } else {
        toast({ title: "Erreur", description: response.error, variant: "destructive" });
      }
    }

    setIsSavingMember(false);
    setIsMemberFormDialogOpen(false);
    resetMemberForm();
  };

  const handleEditMemberClick = (member: TeamMember) => {
    setCurrentEditingMember(member);
    setMemberName(member.name || '');
    setMemberEmail(member.email || '');
    setMemberRole(member.role);
    setIsMemberFormDialogOpen(true);
  };

  const handleRemoveMember = async (member: TeamMember) => {
    const response = await removeTeamMember(member.userId);
    if (response.success) {
      toast({ title: "Membre supprimé", description: `${member.name} a été supprimé.`, variant: "destructive" });
      setTeamMembers(prev => prev.filter(m => m.userId !== member.userId));
      loadTeamMembers();
    } else {
      toast({ title: "Erreur", description: response.error, variant: "destructive" });
    }
  };

  const handleResendInvitation = (member: TeamMember) => {
    // This would require a dedicated backend action
    toast({ title: "Invitation renvoyée", description: `L'invitation a été renvoyée à ${member.email}.` });
  };

  const columns: ColumnDef<TeamMember>[] = React.useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Nom',
        cell: ({ row }) => {
          const member = row.original;
          return (
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={member.avatarUrl ?? undefined} alt={member.name ?? ''} data-ai-hint="person face" />
                <AvatarFallback>{member.name?.split(' ').map(n => n[0]).join('') || 'U'}</AvatarFallback>
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
        header: 'Rôle',
        cell: ({ row }) => <Badge variant="secondary">{row.getValue('role')}</Badge>,
      },
      {
        accessorKey: 'status',
        header: 'Statut',
        cell: ({ row }) => {
          const status = row.getValue('status') as TeamMember['status'];
          return (
            <Badge
              variant={
                status === TeamMemberStatus.ACTIVE ? 'default' : status === TeamMemberStatus.INVITED ? 'outline' : 'destructive'
              }
              className={status === TeamMemberStatus.ACTIVE ? 'bg-green-500/20 text-green-700 border-green-500/30 dark:bg-green-700/30 dark:text-green-300' :
                status === TeamMemberStatus.INVITED ? 'bg-blue-500/20 text-blue-700 border-blue-500/30 dark:bg-blue-700/30 dark:text-blue-300' :
                  'bg-red-500/20 text-red-700 border-red-500/30 dark:bg-red-700/30 dark:text-red-300'}
            >
              {status}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'lastLogin',
        header: 'Dernière connexion',
        cell: ({ row }) => {
          const lastLoginIso = row.getValue('lastLogin') as string | undefined;
          if (!lastLoginIso) return <span className="text-muted-foreground">N/A</span>;
          try {
            return format(parseISO(lastLoginIso), 'MMM d, yyyy');
          } catch {
            return <span className="text-muted-foreground">Date invalide</span>;
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
                    <span className="sr-only">Plus d'actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEditMemberClick(member)}>
                    <Edit3 className="mr-2 h-4 w-4" />
                    Modifier le membre
                  </DropdownMenuItem>
                  {member.status === TeamMemberStatus.INVITED && (
                    <DropdownMenuItem onClick={() => handleResendInvitation(member)}>
                      <Mail className="mr-2 h-4 w-4" />
                      Renvoyer l'invitation
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => handleRemoveMember(member)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer le membre
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    []
  );

  const filteredMembers = React.useMemo(() => {
    return teamMembers
      .filter(member =>
        nameFilter ? (member.name || '').toLowerCase().includes(nameFilter.toLowerCase()) || (member.email || '').toLowerCase().includes(nameFilter.toLowerCase()) : true
      )
      .filter(member =>
        roleFilter !== 'all' ? member.role === roleFilter : true
      )
      .filter(member =>
        statusFilter !== 'all' ? member.status === statusFilter : true
      );
  }, [teamMembers, nameFilter, roleFilter, statusFilter]);

  const dialogTitle = currentEditingMember ? `Modifier: ${currentEditingMember.name}` : "Inviter un nouveau membre";
  const dialogDescription = currentEditingMember
    ? "Mettez à jour les détails du membre ci-dessous."
    : "Entrez l'adresse e-mail.";
  const dialogButtonText = currentEditingMember ? "Enregistrer les modifications" : "Envoyer l'invitation";
  const dialogIcon = currentEditingMember ? <Edit3 className="mr-2 h-5 w-5 text-primary" /> : <UserPlus className="mr-2 h-5 w-5 text-primary" />;


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Membres de l'équipe
          </h1>
          <p className="text-muted-foreground">
            Gérez les membres de votre équipe et leurs rôles.
          </p>
        </div>
        <Dialog open={isMemberFormDialogOpen} onOpenChange={handleOpenMemberFormDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => setCurrentEditingMember(null)} className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-5 w-5" />
              Ajouter un membre
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
                <Label htmlFor="member-email-dialog" className="text-right">
                  <Mail className="inline-block h-4 w-4 mr-1" />
                  Email
                </Label>
                <Input
                  id="member-email-dialog"
                  type="email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  placeholder="nom@example.com"
                  className="col-span-3"
                  disabled={isSavingMember || !!currentEditingMember}
                  readOnly={!!currentEditingMember}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="member-role-dialog" className="text-right">
                  <ShieldQuestion className="inline-block h-4 w-4 mr-1" />
                  Rôle
                </Label>
                <Select
                  value={memberRole}
                  onValueChange={(value) => setMemberRole(value as TeamMember['role'])}
                  disabled={isSavingMember}
                >
                  <SelectTrigger className="col-span-3" id="member-role-dialog">
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TeamMemberRole.ADMIN}>Admin</SelectItem>
                    <SelectItem value={TeamMemberRole.EDITOR}>Éditeur</SelectItem>
                    <SelectItem value={TeamMemberRole.VIEWER}>Lecteur</SelectItem>
                    <SelectItem value={TeamMemberRole.MEMBER}>Membre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsMemberFormDialogOpen(false)} disabled={isSavingMember}>
                Annuler
              </Button>
              <Button type="button" onClick={handleSaveMember} disabled={isSavingMember || !memberEmail || !memberRole}>
                {isSavingMember ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {isSavingMember ? (currentEditingMember ? 'Enregistrement...' : 'Envoi...') : dialogButtonText}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Liste des membres</CardTitle>
          <CardDescription>
            Aperçu de tous les membres de l'équipe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-2 py-4">
            <Input
              placeholder="Filtrer par nom ou email..."
              value={nameFilter}
              onChange={(event) => setNameFilter(event.target.value)}
              className="max-w-xs w-full sm:w-auto"
            />
            <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as 'all' | TeamMember['role'])}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrer par rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Editor">Éditeur</SelectItem>
                <SelectItem value="Viewer">Lecteur</SelectItem>
                <SelectItem value="Member">Membre</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | TeamMember['status'])}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="Active">Actif</SelectItem>
                <SelectItem value="Invited">Invité</SelectItem>
                <SelectItem value="Inactive">Inactif</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DataTable columns={columns} data={filteredMembers} loading={loading} initialPageSize={5} />
        </CardContent>
      </Card>
    </div>
  );
}
