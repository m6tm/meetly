
'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mic, MicOff } from 'lucide-react';
import Image from "next/image"; // For remote participant placeholder

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
  avatarUrl?: string; // For remote participant's actual avatar if available
  isUser?: boolean; // Is this the local user's tile?
  isMainScreen?: boolean; // Is this tile for the main screen view or sidebar?
  hasCameraPermission?: boolean | null;
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
}) => {
  const showVideo = !isVideoOff && (isUser ? hasCameraPermission === true : true); // Remote users always "show" video if not off

  const avatarSizeClass = isMainScreen ? "h-32 w-32" : "h-20 w-20";
  const avatarFallbackSizeClass = isMainScreen ? "text-5xl" : "text-3xl";
  const nameTextSizeClass = isMainScreen ? "text-lg" : "text-xs";

  return (
    <div className="bg-gray-800 rounded-lg flex items-center justify-center relative overflow-hidden w-full h-full">
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
      <span className={`absolute bottom-3 left-3 bg-black/60 px-3 py-1.5 ${isMainScreen ? 'text-sm' : 'text-xs'} rounded-md flex items-center`}>
        {isMuted ? <MicOff className="h-4 w-4 mr-1.5 text-red-400" /> : <Mic className="h-4 w-4 mr-1.5" />} {name}
      </span>
    </div>
  );
};

export default VideoTile;
