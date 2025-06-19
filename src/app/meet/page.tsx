
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  PhoneOff,
  Users,
  MessageSquare,
  Settings2,
  LayoutGrid,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { cn } from "@/lib/utils";

// Dummy UserCircleIcon for placeholder when video is off
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

export default function MeetPage() {
  const [isInLobby, setIsInLobby] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const lobbyVideoRef = useRef<HTMLVideoElement>(null);
  const [lobbyIsMuted, setLobbyIsMuted] = useState(true);
  const [lobbyIsVideoOff, setLobbyIsVideoOff] = useState(false); // Start with video ON in lobby
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null); // null = pending, true = granted, false = denied

  // Main meeting states
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoOff, setIsVideoOff] = useState(true); // This will be participant's video state in the main grid
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    let streamInstance: MediaStream | null = null;

    const getCameraAndMicPermission = async () => {
      if (!isInLobby || typeof navigator === 'undefined' || !navigator.mediaDevices) {
        if (isInLobby) setHasCameraPermission(false); // Assume no permission if navigator.mediaDevices is not available
        return;
      }
      try {
        streamInstance = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setHasCameraPermission(true);
        if (lobbyVideoRef.current) {
          lobbyVideoRef.current.srcObject = streamInstance;
          // Apply initial mute/video off state to tracks after stream is attached
          streamInstance.getAudioTracks().forEach(track => track.enabled = !lobbyIsMuted);
          streamInstance.getVideoTracks().forEach(track => track.enabled = !lobbyIsVideoOff);
        }
      } catch (error) {
        console.error('Error accessing camera/mic:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Device Access Denied',
          description: 'Please enable camera and microphone permissions in your browser settings.',
        });
      }
    };

    if (isInLobby) {
      getCameraAndMicPermission();
    }

    return () => {
      if (streamInstance) {
        streamInstance.getTracks().forEach(track => track.stop());
      }
      if (lobbyVideoRef.current) {
        lobbyVideoRef.current.srcObject = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInLobby]); // Only run when isInLobby changes


  const handleJoinMeeting = () => {
    if (!displayName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name to join the meeting.",
        variant: "destructive",
      });
      return;
    }
    setIsMuted(lobbyIsMuted); // Set main meeting mute state from lobby
    setIsVideoOff(lobbyIsVideoOff); // Set main meeting video state from lobby
    setIsInLobby(false);
    toast({
      title: "Meeting Joined",
      description: `Welcome, ${displayName}!`,
    });
  };

  const handleLobbyToggleMute = () => {
    const newMutedState = !lobbyIsMuted;
    setLobbyIsMuted(newMutedState);
    if (lobbyVideoRef.current && lobbyVideoRef.current.srcObject) {
        const stream = lobbyVideoRef.current.srcObject as MediaStream;
        stream.getAudioTracks().forEach(track => track.enabled = !newMutedState);
    }
    toast({ title: newMutedState ? "Microphone Muted (Lobby)" : "Microphone Unmuted (Lobby)" });
  };

  const handleLobbyToggleVideo = () => {
    const newVideoOffState = !lobbyIsVideoOff;
    setLobbyIsVideoOff(newVideoOffState);
    if (lobbyVideoRef.current && lobbyVideoRef.current.srcObject) {
        const stream = lobbyVideoRef.current.srcObject as MediaStream;
        stream.getVideoTracks().forEach(track => track.enabled = !newVideoOffState);
    }
    toast({ title: newVideoOffState ? "Video Off (Lobby)" : "Video On (Lobby)" });
  };

  // Main meeting control handlers
  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    toast({ title: isMuted ? "Microphone Unmuted" : "Microphone Muted" });
  };

  const handleToggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    toast({ title: isVideoOff ? "Video On" : "Video Off" });
  };

  const handleShareScreen = () => {
    toast({ title: "Screen Sharing", description: "Screen sharing started (simulated)." });
  };

  const handleEndCall = () => {
    toast({ title: "Call Ended", description: "You have left the meeting.", variant: "destructive" });
    router.push('/'); 
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    if (!isChatOpen && isParticipantsOpen) setIsParticipantsOpen(false);
  };
  const toggleParticipants = () => {
    setIsParticipantsOpen(!isParticipantsOpen);
    if (!isParticipantsOpen && isChatOpen) setIsChatOpen(false);
  };

  if (isInLobby) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm p-4">
        <Card className="w-full max-w-lg shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Join Meeting</CardTitle>
            <CardDescription className="text-center">
              Set your audio and video preferences before joining.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="displayName" className="font-medium">Your Name</Label>
              <Input
                id="displayName"
                placeholder="Enter your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="text-base"
              />
            </div>

            <div className="aspect-video w-full bg-muted rounded-lg overflow-hidden flex items-center justify-center border border-border">
              {hasCameraPermission === false ? (
                <div className="p-4 text-center text-destructive">
                  <VideoOff className="h-12 w-12 mx-auto mb-2" />
                  <p className="font-semibold">Camera Access Denied</p>
                  <p className="text-xs">Please enable camera permissions in your browser.</p>
                </div>
              ) : lobbyIsVideoOff || hasCameraPermission === null ? (
                 <div className="flex flex-col items-center text-muted-foreground">
                    <UserCircleIcon className="h-24 w-24" />
                    {hasCameraPermission === null && <p className="mt-2 text-sm">Requesting camera...</p>}
                    {hasCameraPermission === true && lobbyIsVideoOff && <p className="mt-2 text-sm">Camera is off</p>}
                 </div>
              ) : (
                <video ref={lobbyVideoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
              )}
            </div>

            <div className="flex justify-center space-x-3 sm:space-x-4">
              <Button variant={lobbyIsMuted ? "secondary" : "outline"} size="lg" onClick={handleLobbyToggleMute} className="flex-1 group">
                {lobbyIsMuted ? <MicOff className="mr-2 h-5 w-5 text-destructive group-hover:text-destructive/80" /> : <Mic className="mr-2 h-5 w-5 text-primary group-hover:text-primary/80" />}
                {lobbyIsMuted ? 'Unmute' : 'Mute'}
              </Button>
              <Button variant={lobbyIsVideoOff ? "secondary" : "outline"} size="lg" onClick={handleLobbyToggleVideo} className="flex-1 group" disabled={hasCameraPermission === false}>
                {lobbyIsVideoOff ? <VideoOff className="mr-2 h-5 w-5 text-destructive group-hover:text-destructive/80" /> : <Video className="mr-2 h-5 w-5 text-primary group-hover:text-primary/80" />}
                {lobbyIsVideoOff ? 'Video On' : 'Video Off'}
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" size="lg" onClick={handleJoinMeeting} disabled={!displayName.trim()}>
              Join Meeting
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Main Video Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-1 sm:p-2 md:p-4 relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 w-full h-full">
            {[
              { name: displayName || "You", videoOffState: isVideoOff, hint: "person video call" },
              { name: "Participant 2", videoOffState: false, hint: "person video call" },
              { name: "Participant 3", videoOffState: true, hint: "person video call" },
              { name: "Participant 4", videoOffState: false, hint: "person video call" },
            ].map((participant, index) => (
                <div key={index} className="bg-gray-800 rounded-lg flex items-center justify-center relative overflow-hidden aspect-video">
                    {participant.videoOffState ? (
                        <div className="flex flex-col items-center">
                            <UserCircleIcon className="h-16 w-16 sm:h-24 sm:w-24 text-gray-500" />
                            <p className="mt-2 text-gray-400 text-xs sm:text-sm">{participant.name}</p>
                        </div>
                    ) : (
                        <Image 
                            src={`https://placehold.co/640x360.png?random=${index}`} 
                            alt={`${participant.name}'s video`} 
                            layout="fill" 
                            objectFit="cover" 
                            data-ai-hint={participant.hint}
                            className="rounded-lg"
                        />
                    )}
                    <span className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 bg-black/50 px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs sm:text-sm rounded">{participant.name}</span>
                </div>
            ))}
        </div>
      </div>

      {/* Sidebar for Chat/Participants */}
      <div className={cn(
          "absolute top-0 right-0 h-full w-72 sm:w-80 bg-gray-800/90 backdrop-blur-sm p-3 sm:p-4 space-y-4 overflow-y-auto transition-transform duration-300 ease-in-out z-20",
          (isChatOpen || isParticipantsOpen) ? "translate-x-0" : "translate-x-full"
        )}>
          <Button onClick={() => { setIsChatOpen(false); setIsParticipantsOpen(false); }} variant="ghost" size="sm" className="absolute top-2 right-2 text-gray-400 hover:text-white">
            Close
          </Button>
          {isChatOpen && (
            <Card className="bg-gray-700 border-gray-600 text-white shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-base sm:text-lg"><MessageSquare className="mr-2 h-4 w-4 sm:h-5 sm:w-5"/>Chat</CardTitle>
              </CardHeader>
              <CardContent className="h-[calc(100vh-220px)] sm:h-[calc(100vh-240px)] overflow-y-auto text-xs sm:text-sm space-y-2 p-2">
                 <p><span className="font-semibold text-blue-400">Alice:</span> Hello everyone! Ready for the discussion?</p>
                 <p><span className="font-semibold text-green-400">{displayName || "You"}:</span> Hi Alice! Yes, looking forward to it.</p>
                 <p><span className="font-semibold text-purple-400">Bob:</span> Morning all. Just joined.</p>
                 <p><span className="font-semibold text-yellow-400">Charlie:</span> Hey, I might be a few minutes late.</p>
              </CardContent>
              <CardFooter className="pt-2">
                  <Input type="text" placeholder="Type a message..." className="bg-gray-600 border-gray-500 text-white placeholder-gray-400 text-xs sm:text-sm"/>
              </CardFooter>
            </Card>
          )}
          {isParticipantsOpen && (
            <Card className="bg-gray-700 border-gray-600 text-white shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-base sm:text-lg"><Users className="mr-2 h-4 w-4 sm:h-5 sm:w-5"/>Participants (4)</CardTitle>
              </CardHeader>
              <CardContent className="h-[calc(100vh-220px)] sm:h-[calc(100vh-240px)] overflow-y-auto text-xs sm:text-sm space-y-3 p-2">
                <div className="flex items-center justify-between"><span className="flex items-center"><UserCircleIcon className="h-4 w-4 mr-2 text-green-400"/>{displayName || "You"}</span> {isMuted ? <MicOff className="h-4 w-4 text-red-500"/> : <Mic className="h-4 w-4 text-gray-300"/>}</div>
                <div className="flex items-center justify-between"><span className="flex items-center"><UserCircleIcon className="h-4 w-4 mr-2 text-gray-400"/>Participant 2</span> <Mic className="h-4 w-4 text-gray-300"/></div>
                <div className="flex items-center justify-between"><span className="flex items-center"><UserCircleIcon className="h-4 w-4 mr-2 text-gray-400"/>Participant 3</span> <Mic className="h-4 w-4 text-gray-300"/></div>
                <div className="flex items-center justify-between"><span className="flex items-center"><UserCircleIcon className="h-4 w-4 mr-2 text-gray-400"/>Participant 4</span> <MicOff className="h-4 w-4 text-red-500"/></div>
              </CardContent>
            </Card>
          )}
        </div>


      {/* Control Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-800/80 backdrop-blur-md p-2 sm:p-3 z-10">
        <div className="max-w-xs sm:max-w-md md:max-w-xl lg:max-w-2xl mx-auto flex justify-around sm:justify-center items-center space-x-1 sm:space-x-2 md:space-x-3">
          <Button variant="ghost" size="icon" onClick={handleToggleMute} className="text-white hover:bg-gray-700/70 p-2 sm:p-3 rounded-full aspect-square h-10 w-10 sm:h-12 sm:w-12">
            {isMuted ? <MicOff className="h-5 w-5 sm:h-6 sm:w-6" /> : <Mic className="h-5 w-5 sm:h-6 sm:w-6" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={handleToggleVideo} className="text-white hover:bg-gray-700/70 p-2 sm:p-3 rounded-full aspect-square h-10 w-10 sm:h-12 sm:w-12">
            {isVideoOff ? <VideoOff className="h-5 w-5 sm:h-6 sm:w-6" /> : <Video className="h-5 w-5 sm:h-6 sm:w-6" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={handleShareScreen} className="text-white hover:bg-gray-700/70 p-2 sm:p-3 rounded-full aspect-square h-10 w-10 sm:h-12 sm:w-12 hidden sm:inline-flex">
            <ScreenShare className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleParticipants} className={cn("text-white hover:bg-gray-700/70 p-2 sm:p-3 rounded-full aspect-square h-10 w-10 sm:h-12 sm:w-12", isParticipantsOpen && "bg-gray-700")}>
            <Users className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
           <Button variant="ghost" size="icon" onClick={toggleChat} className={cn("text-white hover:bg-gray-700/70 p-2 sm:p-3 rounded-full aspect-square h-10 w-10 sm:h-12 sm:w-12", isChatOpen && "bg-gray-700")}>
            <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => toast({ title: "Layout Options (Not Implemented)"})} className="text-white hover:bg-gray-700/70 p-2 sm:p-3 rounded-full aspect-square h-10 w-10 sm:h-12 sm:w-12 hidden md:inline-flex">
            <LayoutGrid className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => toast({ title: "Settings (Not Implemented)"})} className="text-white hover:bg-gray-700/70 p-2 sm:p-3 rounded-full aspect-square h-10 w-10 sm:h-12 sm:w-12 hidden md:inline-flex">
            <Settings2 className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
          <Button variant="destructive" onClick={handleEndCall} className="rounded-full h-10 sm:h-12 px-3 sm:px-4 bg-red-600 hover:bg-red-700 text-white">
            <PhoneOff className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="ml-1 sm:ml-2 hidden sm:inline text-sm sm:text-base">End</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

