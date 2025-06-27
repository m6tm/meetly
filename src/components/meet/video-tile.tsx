'use client';

import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Mic, MicOff, Pin, PinOff, Hand } from 'lucide-react'; 
import Image from "next/image"; 
import { Button } from '@/components/ui/button'; 
import { cn } from '@/lib/utils';
import { useLocalParticipant, useRemoteParticipant, VideoTrack } from '@livekit/components-react';
import { Track, VideoTrack as VideoTrackT } from 'livekit-client';
import { getParticipantHandUp } from '@/lib/meetly-tools';

interface VideoTileProps {
  screenShareTrack?: VideoTrackT; // Add screen share track prop
  name: string;
  isMuted?: boolean;
  isLocal: boolean;
  isVideoOff?: boolean;
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
  screenShareTrack, // Destructure screen share track
  name,
  isMuted = false,
  isLocal,
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
  const participant = isLocal ? useLocalParticipant().localParticipant : useRemoteParticipant(participantId)!

  // Adjust sizes based on whether it's the main screen or a smaller tile
  const avatarSizeClass = isMainScreen ? "h-24 w-24 sm:h-32 sm:w-32" : "h-12 w-12 sm:h-16 sm:w-16";
  const avatarFallbackSizeClass = isMainScreen ? "text-4xl sm:text-5xl" : "text-xl sm:text-2xl";
  const nameTextSizeClass = isMainScreen ? "text-base sm:text-lg" : "text-[10px] sm:text-xs";
  const statusIconSizeClass = isMainScreen ? "h-4 w-4 sm:h-5 sm:w-5" : "h-3 w-3 sm:h-4 sm:w-4";
  const nameBarPaddingClass = isMainScreen ? "px-2 py-1 sm:px-3 sm:py-1.5" : "px-1.5 py-0.5 sm:px-2 sm:py-1";

  return (
    <div className="bg-gray-800 rounded-lg flex items-center justify-center relative overflow-hidden w-full h-full group">
      {screenShareTrack ? ( // Prioritize screen share track if available
        <VideoTrack
          trackRef={{
              participant: participant,
              source: Track.Source.ScreenShare, // Use ScreenShare source
              publication: participant.getTrackPublication(Track.Source.ScreenShare)!, // Use ScreenShare publication
          }}
          className="w-full h-full object-contain bg-black" // Use object-contain for screen share
        />
      ) : showVideo ? ( // Fallback to camera video if no screen share
        <VideoTrack
          trackRef={{
              participant: participant,
              source: Track.Source.Camera,
              publication: participant.getTrackPublication(Track.Source.Camera)!,
          }}
          className="w-full h-full object-cover"
        />
      ) : ( // Show avatar if no video or screen share
        <>
          {avatarUrl && (
            <Image
              src={avatarUrl}
              alt={`${name} background`}
              fill
              className="object-cover blur-lg"
              data-ai-hint="person face"
            />
          )}
          <div className="flex flex-col items-center p-2 z-10 relative">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={name}
                width={isMainScreen ? 128 : 64}
                height={isMainScreen ? 128 : 64}
                className={cn(
                  "rounded-full object-cover shadow-lg border-2 border-white/20",
                  avatarSizeClass
                )}
                data-ai-hint="person face"
              />
            ) : (
              <Avatar className={avatarSizeClass}>
                <AvatarFallback
                  className={cn(
                    avatarFallbackSizeClass,
                    isUser ? 'bg-gray-700' : 'bg-primary text-primary-foreground'
                  )}
                >
                  {avatarFallback}
                </AvatarFallback>
              </Avatar>
            )}
            <p
              className={cn(
                "mt-2 sm:mt-3 text-center truncate max-w-full font-medium text-white",
                nameTextSizeClass
              )}
              style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
            >
              {name}
            </p>
          </div>
        </>
      )}
      <span className={cn(
        `absolute bottom-1 left-1 sm:bottom-2 sm:left-2 bg-black/60 ${nameBarPaddingClass} ${nameTextSizeClass} rounded-md flex items-center z-10 max-w-[calc(100%-1rem)] sm:max-w-[calc(100%-2rem)]`
      )}>
        {isMuted ? <MicOff className={cn(statusIconSizeClass, "mr-1 text-red-400 flex-shrink-0")} /> : <Mic className={cn(statusIconSizeClass, "mr-1 flex-shrink-0")} />} 
        <span className="truncate">{name}</span>
      </span>

      {getParticipantHandUp(participant) && (
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
