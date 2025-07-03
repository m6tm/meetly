'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UserPlus, Search, ChevronUp, ChevronDown, MoreVertical, Loader2, ShieldCheck, UserX } from 'lucide-react';
import type { Participant } from './types';
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuPortal,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
  } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useIsSpeaking, useRoomContext } from '@livekit/components-react';
import type { ParticipantRole } from '@/types/meetly.types';
import { LocalParticipant, RemoteParticipant, DataPacket_Kind } from 'livekit-client';
import { getParticipantMetadata, setParticimantMetadata } from '@/lib/meetly-tools';

interface ParticipantsContentProps {
  allParticipants: Participant[];
}

// Types pour les messages LiveKit
interface LiveKitMessage {
  type: 'ROLE_CHANGE' | 'PARTICIPANT_REMOVAL' | 'PARTICIPANT_INVITE';
  data: {
    participantId?: string;
    role?: ParticipantRole;
    email?: string;
    timestamp: number;
    senderId: string;
  };
}

const SpeakingIndicator = ({ participant }: { participant: LocalParticipant | RemoteParticipant }) => {
  const isSpeaking = useIsSpeaking(participant);

  if (!isSpeaking) {
    return (
        <div className="h-6 w-6 sm:h-7 sm:w-7 flex items-center justify-center">
            {/* Placeholder to keep layout consistent */}
        </div>
    );
  }

  return (
    <div className="h-6 w-6 sm:h-7 sm:w-7 flex items-center justify-center" title="En train de parler">
      <div className="speaking-indicator">
        <div className="speaking-indicator-bar"></div>
        <div className="speaking-indicator-bar"></div>
        <div className="speaking-indicator-bar"></div>
      </div>
    </div>
  );
};

const ParticipantsContent: React.FC<ParticipantsContentProps> = ({
  allParticipants: _allParticipants
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isParticipantsListExpanded, setIsParticipantsListExpanded] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const { toast } = useToast();

  // Récupérer la room LiveKit
  const room = useRoomContext();
  
  // Local state to manage participants for UI changes (role, removal)
  const [allParticipants, setAllParticipants] = useState<Participant[]>(_allParticipants);
  const localParticipant = allParticipants.find(participant => !participant.isRemote)!;

  // Fonction pour publier des données via LiveKit
  const publishLiveKitData = async (message: LiveKitMessage) => {
    if (!room || !room.localParticipant) {
      console.error('Room non connectée ou participant local non disponible');
      return false;
    }

    try {
      const encoder = new TextEncoder();
      const messageData = JSON.stringify(message);
      const encodedData = encoder.encode(messageData);

      // Publier les données de manière fiable (TCP-like)
      await room.localParticipant.publishData(
        encodedData,
        { reliable: true }
      );

      return true;
    } catch (error) {
      console.error('Erreur lors de la publication des données LiveKit:', error);
      return false;
    }
  };

  // Gestionnaire pour les changements de rôle
  const handleSetRole = (participant: Participant, role: ParticipantRole) => {
    // Créer le message LiveKit
    const message: LiveKitMessage = {
      type: 'ROLE_CHANGE',
      data: {
        participantId: participant.participant.identity,
        role: role,
        timestamp: Date.now(),
        senderId: localParticipant.participant.identity,
      }
    };

    // Publier via LiveKit
    publishLiveKitData(message);
  };

  // Gestionnaire pour l'envoi d'invitations
  const handleSendInvite = async () => {
    // Invitation ...
  };

  const handleDataReceived = useCallback(async (payload: Uint8Array, participant: RemoteParticipant | undefined) => {
    try {
      const decoder = new TextDecoder();
      const messageData = decoder.decode(payload);
      const message: LiveKitMessage = JSON.parse(messageData);

      // Traiter le message selon son type
      switch (message.type) {
        case 'ROLE_CHANGE':
          if (message.data.participantId && message.data.role && message.data.participantId === localParticipant.participant.identity) {
            const metadata = getParticipantMetadata(localParticipant.participant)
            if (message.data.role) metadata.role = message.data.role
            await setParticimantMetadata(localParticipant.participant as LocalParticipant, metadata)
          }
          break;
        
        default:
          console.warn('Type de message Meetly non reconnu:', message.type);
      }
    } catch (error) {
      console.error('Erreur lors du traitement du message LiveKit:', error);
    }
  }, []);

  // Écouter les messages LiveKit entrants
  useEffect(() => {
    if (!room) return;
    // Écouter les données reçues
    room.on('dataReceived', handleDataReceived);

    // Nettoyer l'écouteur
    return () => {
      room.off('dataReceived', handleDataReceived);
    };
  }, [room, localParticipant.id, allParticipants, toast]);

  const filteredParticipants = allParticipants.filter(participant =>
    participant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleParticipantsList = () => {
    setIsParticipantsListExpanded(prev => !prev);
  };

  return (
    <>
      <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 flex-shrink-0">
        <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
            <DialogTrigger asChild>
                <Button className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 h-9 sm:h-10 text-xs sm:text-sm">
                    <UserPlus className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5"/> Ajouter
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-gray-800 border-gray-700 text-white">
                <DialogHeader>
                    <DialogTitle>Inviter quelqu'un</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Entrez l'adresse e-mail de la personne que vous souhaitez inviter.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="invite-email" className="text-right text-gray-300">
                            Email
                        </Label>
                        <Input
                            id="invite-email"
                            type="email"
                            placeholder="nom@example.com"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            className="col-span-3 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                            disabled={isSendingInvite}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="ghost" className="hover:bg-destructive hover:text-destructive-foreground" onClick={() => setIsInviteModalOpen(false)} disabled={isSendingInvite}>
                        Annuler
                    </Button>
                    <Button type="button" onClick={handleSendInvite} disabled={isSendingInvite || !inviteEmail.trim()}>
                        {isSendingInvite ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        {isSendingInvite ? 'Envoi...' : "Envoyer l'invitation"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        <div className="relative">
            <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher des contacts"
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 pl-8 sm:pl-10 h-9 sm:h-10 text-xs sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>
      <div className="flex-grow p-3 sm:p-4 space-y-1.5 sm:space-y-2 overflow-y-auto text-sm text-white custom-scrollbar-chat">
        <div className="flex items-center justify-between mb-1.5 sm:mb-2">
          <p className="text-xs text-gray-400 uppercase tracking-wider">Contributeurs ({filteredParticipants.length})</p>
          <Button variant="ghost" size="icon" onClick={toggleParticipantsList} className="text-gray-400 hover:text-white h-6 w-6 sm:h-7 sm:w-7">
            {isParticipantsListExpanded ? <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5" /> : <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />}
          </Button>
        </div>
        {isParticipantsListExpanded && (
          <>
            {filteredParticipants.map((participant) => (
                <div key={participant.id} className="flex items-center justify-between p-1.5 sm:p-2 rounded-md">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <Avatar className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0">
                          <AvatarFallback className={cn("text-xs sm:text-sm", participant.isRemote === false ? "bg-green-600 text-white" : "bg-primary text-primary-foreground")}>{participant.avatarFallback}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="truncate text-xs sm:text-sm">{participant.name} { !participant.isRemote && '(Vous)' }</span>
                        <span className="text-[10px] text-gray-400 capitalize">{participant.role}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                        <SpeakingIndicator participant={participant.participant} />
                        
                        {participant.isRemote &&
                          (localParticipant.role === 'moderator' || localParticipant.role === 'admin') &&
                          (participant.role === 'participant' || participant.role === 'admin') ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white h-6 w-6 sm:h-7 sm:w-7">
                                        <MoreVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700 text-white">
                                    <DropdownMenuSub>
                                        <DropdownMenuSubTrigger className="focus:bg-gray-700">
                                            <ShieldCheck className="mr-2 h-4 w-4" />
                                            <span>Changer le rôle</span>
                                        </DropdownMenuSubTrigger>
                                        <DropdownMenuPortal>
                                            <DropdownMenuSubContent className="bg-gray-800 border-gray-700 text-white">
                                                <DropdownMenuRadioGroup value={participant.role} onValueChange={(value) => handleSetRole(participant, value as ParticipantRole)}>
                                                    <DropdownMenuRadioItem value="admin" className="focus:bg-gray-700">Admin</DropdownMenuRadioItem>
                                                    <DropdownMenuRadioItem value="moderator" className="focus:bg-gray-700">Modérateur</DropdownMenuRadioItem>
                                                    <DropdownMenuRadioItem value="participant" className="focus:bg-gray-700">Participant</DropdownMenuRadioItem>
                                                </DropdownMenuRadioGroup>
                                            </DropdownMenuSubContent>
                                        </DropdownMenuPortal>
                                    </DropdownMenuSub>
                                    <DropdownMenuSeparator className="bg-gray-700"/>
                                    <DropdownMenuItem 
                                        className="text-red-400 focus:bg-red-500/20 focus:text-red-300"
                                    >
                                        <UserX className="mr-2 h-4 w-4" />
                                        <span>Retirer de la réunion</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="w-6 sm:w-7"></div> // Placeholder to keep alignment for local user
                        )}
                    </div>
                </div>
            ))}
            {filteredParticipants.length === 0 && searchTerm && (
              <p className="text-center text-gray-400 text-xs py-3 sm:py-4">Aucun participant trouvé pour "{searchTerm}".</p>
            )}
             {filteredParticipants.length === 0 && !searchTerm && (
              <p className="text-center text-gray-400 text-xs py-3 sm:py-4">Aucun participant dans l'appel.</p>
            )}
          </>
        )}
        {!isParticipantsListExpanded && (
           <p className="text-center text-gray-400 text-xs py-3 sm:py-4">Liste des participants masquée.</p>
        )}
      </div>
    </>
  );
};

export default ParticipantsContent;