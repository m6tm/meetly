
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Mic, MicOff, Video, VideoOff, ScreenShare, PhoneOff, Users, MessageSquare,
  Laptop, Presentation, Phone, ChevronUp, Sparkles, Volume2, MoreVertical,
  Hand, Info, Maximize2, Bell, Activity, Clock
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Badge } from '@/components/ui/badge';


interface ControlsBarProps {
  isMuted: boolean;
  isVideoOff: boolean;
  isHandRaised: boolean;
  handleToggleMute: () => void;
  handleToggleVideo: () => void;
  handleShareScreen: () => void;
  handleRaiseHand: () => void;
  handleEndCall: () => void;
  toggleSidePanel: (panel: 'info' | 'participants' | 'chat') => void;
  currentTimeState: string;
  meetingCode: string;
  activeSidePanel: 'info' | 'participants' | 'chat' | null;
  currentParticipantsCount: number;
}

const ControlsBar: React.FC<ControlsBarProps> = ({
  isMuted,
  isVideoOff,
  isHandRaised,
  handleToggleMute,
  handleToggleVideo,
  handleShareScreen,
  handleRaiseHand,
  handleEndCall,
  toggleSidePanel,
  currentTimeState,
  meetingCode,
  activeSidePanel,
  currentParticipantsCount,
}) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gray-800/80 backdrop-blur-md p-3 z-20">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {/* Left Controls: Time & Meeting Code */}
        <div className="flex items-center space-x-3 text-sm text-gray-300">
          <span className="flex items-center"><Clock className="h-4 w-4 mr-1" /> {currentTimeState}</span>
          <span>{meetingCode}</span>
        </div>

        {/* Center Controls */}
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={handleToggleMute} className={cn("text-white hover:bg-gray-700/70 p-2.5 rounded-full", isMuted && "bg-red-600 hover:bg-red-700")}>
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={handleToggleVideo} className={cn("text-white hover:bg-gray-700/70 p-2.5 rounded-full", isVideoOff && "bg-red-600 hover:bg-red-700")}>
            {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={handleShareScreen} className="text-white hover:bg-gray-700/70 p-2.5 rounded-full">
            <ScreenShare className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleRaiseHand} 
            className={cn(
              "text-white hover:bg-gray-700/70 p-2.5 rounded-full",
              isHandRaised && "bg-blue-600 hover:bg-blue-700"
            )}
          >
            <Hand className="h-5 w-5" />
          </Button>
          <Button variant="destructive" onClick={handleEndCall} className="rounded-full h-10 px-4 bg-red-600 hover:bg-red-700 text-white">
            <PhoneOff className="h-5 w-5" />
          </Button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-2">
           <Button variant="ghost" size="icon" onClick={() => toggleSidePanel('info')} className={cn("text-white hover:bg-gray-700/70 p-2.5 rounded-full", activeSidePanel === 'info' && "bg-gray-700")}>
            <Info className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => toggleSidePanel('participants')} className={cn("text-white hover:bg-gray-700/70 p-2.5 rounded-full relative", activeSidePanel === 'participants' && "bg-gray-700")}>
            <Users className="h-5 w-5" />
            <Badge variant="default" className="absolute -top-0.5 -right-0.5 bg-blue-500 text-white text-[10px] h-4 w-4 min-w-4 rounded-full flex items-center justify-center p-0">
                {currentParticipantsCount}
            </Badge>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => toggleSidePanel('chat')} className={cn("text-white hover:bg-gray-700/70 p-2.5 rounded-full", activeSidePanel === 'chat' && "bg-gray-700")}>
            <MessageSquare className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ControlsBar;
