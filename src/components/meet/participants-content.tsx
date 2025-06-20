
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UserPlus, Search, ChevronUp, ChevronDown, MoreHorizontal, MoreVertical } from 'lucide-react';
import type { Participant } from './types';
import { cn } from "@/lib/utils";

interface ParticipantsContentProps {
  currentParticipantsCount: number;
  displayName: string;
  remoteParticipants: Participant[];
}

const ParticipantsContent: React.FC<ParticipantsContentProps> = ({
  currentParticipantsCount,
  displayName,
  remoteParticipants
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isParticipantsListExpanded, setIsParticipantsListExpanded] = useState(true);

  const allDisplayParticipants = [
    { id: 'user-local', name: `${displayName || "Vous"} (Vous)`, avatarFallback: displayName ? displayName.charAt(0).toUpperCase() : 'U', isLocal: true },
    ...remoteParticipants.map(p => ({...p, isLocal: false}))
  ];

  const filteredParticipants = allDisplayParticipants.filter(participant =>
    participant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleParticipantsList = () => {
    setIsParticipantsListExpanded(prev => !prev);
  };

  return (
    <>
      <div className="p-4 space-y-4 flex-shrink-0">
        <Button className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30">
            <UserPlus className="mr-2 h-5 w-5"/> Ajouter
        </Button>
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher des contacts"
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>
      <div className="flex-grow p-4 space-y-2 overflow-y-auto text-sm text-white custom-scrollbar-chat"> {/* Added custom-scrollbar-chat here */}
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-gray-400 uppercase tracking-wider">Contributeurs ({filteredParticipants.length})</p>
          <Button variant="ghost" size="icon" onClick={toggleParticipantsList} className="text-gray-400 hover:text-white h-7 w-7">
            {isParticipantsListExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </Button>
        </div>
        {isParticipantsListExpanded && (
          <>
            {filteredParticipants.map((participant) => (
                <div key={participant.id} className="flex items-center justify-between p-2 hover:bg-gray-700/80 rounded-md cursor-pointer">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback className={cn(participant.isLocal ? "bg-green-600 text-white" : "bg-primary text-primary-foreground")}>{participant.avatarFallback}</AvatarFallback>
                        </Avatar>
                        <span>{participant.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="text-white bg-purple-600 hover:bg-purple-700 p-1.5 rounded-full h-7 w-7">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white h-7 w-7">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            ))}
            {filteredParticipants.length === 0 && searchTerm && (
              <p className="text-center text-gray-400 text-xs py-4">Aucun participant trouvé pour "{searchTerm}".</p>
            )}
             {filteredParticipants.length === 0 && !searchTerm && (
              <p className="text-center text-gray-400 text-xs py-4">Aucun participant dans l'appel.</p>
            )}
          </>
        )}
        {!isParticipantsListExpanded && (
           <p className="text-center text-gray-400 text-xs py-4">Liste des participants masquée.</p>
        )}
      </div>
    </>
  );
};

export default ParticipantsContent;

