
'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Mic, MicOff, Video, VideoOff, ScreenShare, PhoneOff, Users, MessageSquare,
  Hand, Info, Clock, MoreVertical as MoreVerticalIcon, CircleDot
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LocalParticipant } from 'livekit-client';
import { getParticipantHandUp, getParticipantMetadata, setParticimantMetadata } from '@/lib/meetly-tools';
import { Participant } from './types';


interface ControlsBarProps {
  participant: Participant;
  isMuted: boolean;
  isVideoOff: boolean;
  handleToggleMute: () => void;
  handleToggleVideo: () => void;
  handleShareScreen: () => void;
  handleEndCall: () => void;
  toggleSidePanel: (panel: 'info' | 'participants' | 'chat') => void;
  meetingCode: string;
  activeSidePanel: 'info' | 'participants' | 'chat' | null;
  currentParticipantsCount: number;
}

const ControlsBar: React.FC<ControlsBarProps> = ({
  participant: _participant,
  isMuted,
  isVideoOff,
  handleToggleMute,
  handleToggleVideo,
  handleShareScreen,
  handleEndCall,
  toggleSidePanel,
  meetingCode,
  activeSidePanel,
  currentParticipantsCount,
}) => {
  const hour = new Date().getHours();
  const minute = new Date().getMinutes();
  const [currentTimeState, setCurrentTimeState] = useState(`${hour < 10 ? '0' + hour : hour}:${minute < 10 ? '0' + minute : minute}`);
  const [recording, setRecording] = useState(false)
  const participant = _participant.participant

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTimeState(`${hours}:${minutes}`);
    }, 1000 * 60)
    return () => {
      clearInterval(interval);
    }
  }, []);

  const handleRaiseHand = () => {
    const metadata = getParticipantMetadata(participant)
    metadata.handUp = !metadata.handUp
    setParticimantMetadata(participant as LocalParticipant, metadata)
  }

  const handleRegisterMeeting = () => {
    setRecording(!recording)
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gray-800/80 backdrop-blur-md p-2 sm:p-3 z-20">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {/* Left Controls: Time & Meeting Code - Hidden on small screens */}
        <div className="hidden md:flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm text-gray-300">
          <span className="flex items-center"><Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> {currentTimeState}</span>
          <span className="hidden sm:inline-block">{meetingCode}</span>
        </div>

        {/* Center Controls */}
        <div className="flex flex-grow md:flex-grow-0 items-center justify-center space-x-1 sm:space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleToggleMute} 
            className={cn(
              "text-white hover:bg-gray-700/70 p-2 sm:p-2.5 rounded-full h-9 w-9 sm:h-10 sm:w-10", 
              isMuted && "bg-red-600 hover:bg-red-700"
            )}
            aria-label={isMuted ? "Activer le microphone" : "Couper le microphone"}
          >
            {isMuted ? <MicOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Mic className="h-4 w-4 sm:h-5 sm:w-5" />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleToggleVideo} 
            className={cn(
              "text-white hover:bg-gray-700/70 p-2 sm:p-2.5 rounded-full h-9 w-9 sm:h-10 sm:w-10", 
              isVideoOff && "bg-red-600 hover:bg-red-700"
            )}
            aria-label={isVideoOff ? "Activer la caméra" : "Désactiver la caméra"}
          >
            {isVideoOff ? <VideoOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Video className="h-4 w-4 sm:h-5 sm:w-5" />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleShareScreen}
            className={cn( // Add conditional styling
              "text-white hover:bg-gray-700/70 p-2 sm:p-2.5 rounded-full h-9 w-9 sm:h-10 sm:w-10 hidden sm:flex",
              participant.isScreenShareEnabled && "bg-blue-600 hover:bg-blue-700" // Highlight when sharing
            )}
            aria-label={participant.isScreenShareEnabled ? "Arrêter le partage d'écran" : "Partager l'écran"} // Update aria-label
          >
            <ScreenShare className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleRaiseHand} 
            className={cn(
              "text-white hover:bg-gray-700/70 p-2 sm:p-2.5 rounded-full h-9 w-9 sm:h-10 sm:w-10",
              getParticipantHandUp(participant) && "bg-blue-600 hover:bg-blue-700"
            )}
            aria-label={getParticipantHandUp(participant) ? "Baisser la main" : "Lever la main"}
          >
            <Hand className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          {_participant.role !== 'participant' && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleRegisterMeeting} 
              className={cn(
                "text-white hover:bg-gray-700/70 p-2 sm:p-2.5 rounded-full h-9 w-9 sm:h-10 sm:w-10",
                recording && "bg-gray-700/70 hover:bg-gray-700/90 animate-pulse"
              )}
              aria-label={recording ? "Arrêter l'enregistrement" : "Démarrer l'enregistrement"}
            >
              {recording ? (
                <span className="text-red-500">
                  <CircleDot className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" />
                </span>
              ) : (
                <span className="text-white">
                  <CircleDot className="h-4 w-4 sm:h-5 sm:w-5" />
                </span>
              )}
            </Button>
          )}
          <Button 
            variant="destructive" 
            onClick={handleEndCall} 
            className="rounded-full h-9 w-auto px-3 sm:h-10 sm:px-4 bg-red-600 hover:bg-red-700 text-white"
            aria-label="Terminer l'appel"
          >
            <PhoneOff className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="ml-1.5 hidden sm:inline">Quitter</span>
          </Button>
        </div>

        {/* Right Controls - Panel Toggles */}
        {/* On small screens, these are in a "More" dropdown */}
        <div className="md:hidden">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-gray-700/70 p-2 sm:p-2.5 rounded-full h-9 w-9 sm:h-10 sm:w-10">
                        <MoreVerticalIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700 text-white">
                    <DropdownMenuItem onClick={() => toggleSidePanel('info')} className="focus:bg-gray-700">
                        <Info className="mr-2 h-4 w-4" /> Infos
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleSidePanel('participants')} className="focus:bg-gray-700">
                        <Users className="mr-2 h-4 w-4" /> Participants 
                        <Badge variant="default" className="ml-auto bg-blue-500 text-white text-[10px] h-4 w-4 min-w-4 rounded-full flex items-center justify-center p-0">
                            {currentParticipantsCount}
                        </Badge>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleSidePanel('chat')} className="focus:bg-gray-700">
                        <MessageSquare className="mr-2 h-4 w-4" /> Chat
                    </DropdownMenuItem>
                     <DropdownMenuItem onClick={handleShareScreen} className={cn("focus:bg-gray-700 sm:hidden", participant.isScreenShareEnabled && "bg-blue-600 hover:bg-blue-700")}> {/* Add conditional styling */}
                        <ScreenShare className="mr-2 h-4 w-4" /> {participant.isScreenShareEnabled ? "Arrêter le partage" : "Partager l'écran"} {/* Update text */}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
        <div className="hidden md:flex items-center space-x-1 sm:space-x-2">
           <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => toggleSidePanel('info')} 
            className={cn(
                "text-white hover:bg-gray-700/70 p-2 sm:p-2.5 rounded-full h-9 w-9 sm:h-10 sm:w-10", 
                activeSidePanel === 'info' && "bg-gray-700"
            )}
            aria-label="Afficher les informations de la réunion"
           >
            <Info className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => toggleSidePanel('participants')} 
            className={cn(
                "text-white hover:bg-gray-700/70 p-2 sm:p-2.5 rounded-full relative h-9 w-9 sm:h-10 sm:w-10", 
                activeSidePanel === 'participants' && "bg-gray-700"
            )}
            aria-label="Afficher les participants"
          >
            <Users className="h-4 w-4 sm:h-5 sm:w-5" />
            <Badge variant="default" className="absolute -top-0.5 -right-0.5 bg-blue-500 text-white text-[9px] sm:text-[10px] h-3.5 w-3.5 sm:h-4 sm:w-4 min-w-[0.875rem] sm:min-w-4 rounded-full flex items-center justify-center p-0">
                {currentParticipantsCount}
            </Badge>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => toggleSidePanel('chat')} 
            className={cn(
                "text-white hover:bg-gray-700/70 p-2 sm:p-2.5 rounded-full h-9 w-9 sm:h-10 sm:w-10", 
                activeSidePanel === 'chat' && "bg-gray-700"
            )}
            aria-label="Afficher le chat"
          >
            <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ControlsBar;
