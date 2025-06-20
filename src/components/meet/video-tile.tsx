
'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mic, MicOff, Pin, PinOff } from 'lucide-react'; // Added Pin, PinOff
import Image from "next/image"; 
import { Button } from '@/components/ui/button'; // Added Button
import { cn } from '@/lib/utils';

// Local UserCircleIcon for placeholder when video is off
function UserCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="10" r="3" />
      <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
    </svg>
  );
}

interface VideoTileProps {
  videoRef?: React.RefObject<HTMLVideoElement>;
  name: string;
  isMuted?: boolean;
  isVideoOff?: boolean;
  avatarFallback: string;
  avatarUrl?: string; 
  isUser?: boolean; 
  isMainScreen?: boolean; 
  hasCameraPermission?: boolean | null;
  participantId: string; // Added participantId
  onToggleFeature?: (participantId: string) => void; // Added onToggleFeature
  isCurrentlyFeatured?: boolean; // Added isCurrentlyFeatured
}

const VideoTile: React.FC<VideoTileProps> = ({
  videoRef,
  name,
  isMuted = false,
  isVideoOff = false,
  avatarFallback,
  avatarUrl,
  isUser = false,
  isMainScreen = true,
  hasCameraPermission,
  participantId,
  onToggleFeature,
  isCurrentlyFeatured = false,
}) => {
  const showVideo = !isVideoOff && (isUser ? hasCameraPermission === true : true); 

  const avatarSizeClass = isMainScreen ? "h-32 w-32" : "h-20 w-20";
  const avatarFallbackSizeClass = isMainScreen ? "text-5xl" : "text-3xl";
  const nameTextSizeClass = isMainScreen ? "text-lg" : "text-xs";

  return (
    <div className="bg-gray-800 rounded-lg flex items-center justify-center relative overflow-hidden w-full h-full group"> {/* Added group class for hover effect */}
      {showVideo ? (
        <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted={isUser ? true : isMuted} />
      ) : (
        <div className="flex flex-col items-center text-gray-400">
          {avatarUrl ? (
             <Image src={avatarUrl} alt={name} width={isMainScreen ? 128 : 80} height={isMainScreen ? 128 : 80} className="rounded-full object-cover" data-ai-hint="person face"/>
          ) : (
            <Avatar className={avatarSizeClass}>
              <AvatarFallback className={`${avatarFallbackSizeClass} ${isUser ? 'bg-gray-700' : 'bg-primary text-primary-foreground'}`}>
                {avatarFallback}
              </AvatarFallback>
            </Avatar>
          )}
          <p className={`mt-2 ${nameTextSizeClass}`}>{name}</p>
        </div>
      )}
      <span className={`absolute bottom-3 left-3 bg-black/60 px-3 py-1.5 ${isMainScreen ? 'text-sm' : 'text-xs'} rounded-md flex items-center z-10`}>
        {isMuted ? <MicOff className="h-4 w-4 mr-1.5 text-red-400" /> : <Mic className="h-4 w-4 mr-1.5" />} {name}
      </span>

      {onToggleFeature && (
        <div className={cn(
          "absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
          isCurrentlyFeatured && "opacity-100" // Always show if featured
        )}>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation(); // Prevent click from bubbling to other elements if any
              onToggleFeature(participantId);
            }}
            className="text-white bg-black/40 hover:bg-black/60 h-8 w-8 p-1.5 rounded-full"
            title={isCurrentlyFeatured ? "Unfeature Participant" : "Feature Participant"}
          >
            {isCurrentlyFeatured ? <PinOff className="h-4 w-4 text-yellow-400" /> : <Pin className="h-4 w-4" />}
          </Button>
        </div>
      )}
    </div>
  );
};

export default VideoTile;
