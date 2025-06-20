
'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mic, MicOff, Pin, PinOff, Hand } from 'lucide-react'; 
import Image from "next/image"; 
import { Button } from '@/components/ui/button'; 
import { cn } from '@/lib/utils';

interface VideoTileProps {
  videoRef?: React.RefObject<HTMLVideoElement>;
  name: string;
  isMuted?: boolean;
  isVideoOff?: boolean;
  isHandRaised?: boolean;
  avatarFallback: string;
  avatarUrl?: string; 
  isUser?: boolean; 
  isMainScreen?: boolean; 
  hasCameraPermission?: boolean | null;
  participantId: string; 
  onToggleFeature?: (participantId: string) => void; 
  isCurrentlyFeatured?: boolean; 
}

const VideoTile: React.FC<VideoTileProps> = ({
  videoRef,
  name,
  isMuted = false,
  isVideoOff = false,
  isHandRaised = false,
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

  // Adjust sizes based on whether it's the main screen or a smaller tile
  const avatarSizeClass = isMainScreen ? "h-24 w-24 sm:h-32 sm:w-32" : "h-12 w-12 sm:h-16 sm:w-16";
  const avatarFallbackSizeClass = isMainScreen ? "text-4xl sm:text-5xl" : "text-xl sm:text-2xl";
  const nameTextSizeClass = isMainScreen ? "text-base sm:text-lg" : "text-[10px] sm:text-xs";
  const statusIconSizeClass = isMainScreen ? "h-4 w-4 sm:h-5 sm:w-5" : "h-3 w-3 sm:h-4 sm:w-4";
  const nameBarPaddingClass = isMainScreen ? "px-2 py-1 sm:px-3 sm:py-1.5" : "px-1.5 py-0.5 sm:px-2 sm:py-1";

  return (
    <div className="bg-gray-800 rounded-lg flex items-center justify-center relative overflow-hidden w-full h-full group">
      {showVideo ? (
        <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted={isUser ? true : isMuted} />
      ) : (
        <div className="flex flex-col items-center text-gray-400 p-2">
          {avatarUrl ? (
             <Image 
                src={avatarUrl} 
                alt={name} 
                width={isMainScreen ? 128 : 64} 
                height={isMainScreen ? 128 : 64} 
                className={cn("rounded-full object-cover", isMainScreen ? "w-24 h-24 sm:w-32 sm:h-32" : "w-12 h-12 sm:w-16 sm:h-16" )}
                data-ai-hint="person face"
             />
          ) : (
            <Avatar className={avatarSizeClass}>
              <AvatarFallback className={`${avatarFallbackSizeClass} ${isUser ? 'bg-gray-700' : 'bg-primary text-primary-foreground'}`}>
                {avatarFallback}
              </AvatarFallback>
            </Avatar>
          )}
          <p className={`mt-1 sm:mt-2 ${nameTextSizeClass} text-center truncate max-w-full`}>{name}</p>
        </div>
      )}
      <span className={cn(
        `absolute bottom-1 left-1 sm:bottom-2 sm:left-2 bg-black/60 ${nameBarPaddingClass} ${nameTextSizeClass} rounded-md flex items-center z-10 max-w-[calc(100%-1rem)] sm:max-w-[calc(100%-2rem)]`
      )}>
        {isMuted ? <MicOff className={cn(statusIconSizeClass, "mr-1 text-red-400 flex-shrink-0")} /> : <Mic className={cn(statusIconSizeClass, "mr-1 flex-shrink-0")} />} 
        <span className="truncate">{name}</span>
      </span>

      {isHandRaised && (
        <span className="absolute top-1 left-1 sm:top-2 sm:left-2 bg-blue-600/80 p-1 sm:p-1.5 rounded-full z-10" title="Main levée">
          <Hand className={cn(statusIconSizeClass, "text-white")} />
        </span>
      )}

      {onToggleFeature && (
        <div className={cn(
          "absolute top-1 right-1 sm:top-2 sm:right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
          isCurrentlyFeatured && "opacity-100" 
        )}>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation(); 
              onToggleFeature(participantId);
            }}
            className="text-white bg-black/40 hover:bg-black/60 h-6 w-6 sm:h-8 sm:w-8 p-1 sm:p-1.5 rounded-full"
            title={isCurrentlyFeatured ? "Détacher le participant" : "Mettre en avant le participant"}
          >
            {isCurrentlyFeatured ? <PinOff className={statusIconSizeClass} /> : <Pin className={statusIconSizeClass} />}
          </Button>
        </div>
      )}
    </div>
  );
};

export default VideoTile;
