
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  MoreHorizontal,
  Laptop, // For Companion mode
  Presentation, // For Present screen
  Phone, // For Join by phone for audio
  ChevronUp,
  Sparkles, // Placeholder for effects
  Volume2, // For speaker selection
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
  const [lobbyIsMuted, setLobbyIsMuted] = useState(false); // Default to unmuted based on image
  const [lobbyIsVideoOff, setLobbyIsVideoOff] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    let streamInstance: MediaStream | null = null;

    const getCameraAndMicPermission = async () => {
      if (!isInLobby || typeof navigator === 'undefined' || !navigator.mediaDevices) {
        if (isInLobby) setHasCameraPermission(false);
        return;
      }
      try {
        streamInstance = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setHasCameraPermission(true);
        if (lobbyVideoRef.current) {
          lobbyVideoRef.current.srcObject = streamInstance;
          streamInstance.getAudioTracks().forEach(track => track.enabled = !lobbyIsMuted);
          streamInstance.getVideoTracks().forEach(track => track.enabled = !lobbyIsVideoOff);
        }
      } catch (error) {
        console.error('Error accessing camera/mic:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Accès aux appareils refusé',
          description: 'Veuillez activer les permissions pour la caméra et le microphone dans les paramètres de votre navigateur.',
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
  }, [isInLobby]);


  const handleJoinMeeting = () => {
    if (!displayName.trim()) {
      toast({
        title: "Nom Requis",
        description: "Veuillez entrer votre nom pour participer à la réunion.",
        variant: "destructive",
      });
      return;
    }
    setIsMuted(lobbyIsMuted);
    setIsVideoOff(lobbyIsVideoOff);
    setIsInLobby(false);
    toast({
      title: "Réunion Rejointe",
      description: `Bienvenue, ${displayName}!`,
    });
  };

  const handleLobbyToggleMute = () => {
    const newMutedState = !lobbyIsMuted;
    setLobbyIsMuted(newMutedState);
    if (lobbyVideoRef.current && lobbyVideoRef.current.srcObject) {
        const stream = lobbyVideoRef.current.srcObject as MediaStream;
        stream.getAudioTracks().forEach(track => track.enabled = !newMutedState);
    }
    toast({ title: newMutedState ? "Microphone coupé (Salle d'attente)" : "Microphone activé (Salle d'attente)" });
  };

  const handleLobbyToggleVideo = () => {
    const newVideoOffState = !lobbyIsVideoOff;
    setLobbyIsVideoOff(newVideoOffState);
    if (lobbyVideoRef.current && lobbyVideoRef.current.srcObject) {
        const stream = lobbyVideoRef.current.srcObject as MediaStream;
        stream.getVideoTracks().forEach(track => track.enabled = !newVideoOffState);
    }
    toast({ title: newVideoOffState ? "Vidéo désactivée (Salle d'attente)" : "Vidéo activée (Salle d'attente)" });
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    toast({ title: isMuted ? "Microphone activé" : "Microphone coupé" });
  };

  const handleToggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    toast({ title: isVideoOff ? "Vidéo activée" : "Vidéo désactivée" });
  };

  const handleShareScreen = () => {
    toast({ title: "Partage d'écran", description: "Partage d'écran démarré (simulé)." });
  };

  const handleEndCall = () => {
    toast({ title: "Appel Terminé", description: "Vous avez quitté la réunion.", variant: "destructive" });
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
      <div className="flex h-screen w-screen bg-background text-foreground p-4 sm:p-8 items-center justify-center">
        <div className="flex flex-col lg:flex-row w-full max-w-6xl h-full max-h-[700px] gap-4 sm:gap-8">
          {/* Left Panel: Video Preview */}
          <div className="flex-grow lg:w-2/3 flex flex-col">
            <div className="relative aspect-video w-full bg-muted rounded-xl overflow-hidden shadow-2xl flex items-center justify-center border">
              {hasCameraPermission === false ? (
                <div className="p-4 text-center text-destructive">
                  <VideoOff className="h-16 w-16 mx-auto mb-3" />
                  <p className="font-semibold text-lg">Accès caméra refusé</p>
                  <p className="text-sm">Veuillez activer la caméra dans les paramètres.</p>
                </div>
              ) : lobbyIsVideoOff || hasCameraPermission === null ? (
                 <div className="flex flex-col items-center text-muted-foreground">
                    <UserCircleIcon className="h-32 w-32" />
                    {hasCameraPermission === null && <p className="mt-3 text-md">Demande d'accès caméra...</p>}
                    {hasCameraPermission === true && lobbyIsVideoOff && <p className="mt-3 text-md">Caméra désactivée</p>}
                 </div>
              ) : (
                <video ref={lobbyVideoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
              )}
              <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
                {displayName || "Votre Nom"}
              </div>
              <Button variant="ghost" size="icon" className="absolute top-3 right-3 bg-black/30 hover:bg-black/50 text-white rounded-full">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-3">
                <Button 
                    variant="secondary" 
                    size="icon" 
                    className={cn(
                        "rounded-full h-14 w-14 p-0 bg-black/40 hover:bg-black/60 text-white border-2 border-transparent",
                        lobbyIsMuted && "bg-red-600 hover:bg-red-700"
                    )} 
                    onClick={handleLobbyToggleMute}
                >
                  {lobbyIsMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                </Button>
                <Button 
                    variant="secondary" 
                    size="icon" 
                    className={cn(
                        "rounded-full h-14 w-14 p-0 bg-black/40 hover:bg-black/60 text-white border-2 border-transparent",
                        lobbyIsVideoOff && "bg-red-600 hover:bg-red-700"
                    )} 
                    onClick={handleLobbyToggleVideo} 
                    disabled={hasCameraPermission === false}
                >
                  {lobbyIsVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
                </Button>
                <Button variant="secondary" size="icon" className="rounded-full h-14 w-14 p-0 bg-black/40 hover:bg-black/60 text-white">
                  <Sparkles className="h-6 w-6" />
                </Button>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Select defaultValue="default-mic" disabled={hasCameraPermission === false}>
                <SelectTrigger className="w-full bg-muted/50 border-border hover:border-primary/50">
                  <div className="flex items-center">
                    <Mic className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Microphone" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default-mic">Audio interne (par défaut)</SelectItem>
                  <SelectItem value="mic-2">Microphone externe</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="default-speaker" disabled={hasCameraPermission === false}>
                <SelectTrigger className="w-full bg-muted/50 border-border hover:border-primary/50">
                   <div className="flex items-center">
                    <Volume2 className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Haut-parleurs" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default-speaker">Haut-parleurs internes (par défaut)</SelectItem>
                  <SelectItem value="speaker-2">Casque externe</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="default-cam" disabled={hasCameraPermission === false}>
                <SelectTrigger className="w-full bg-muted/50 border-border hover:border-primary/50">
                  <div className="flex items-center">
                    <Video className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Caméra" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default-cam">Integrated Camera (par défaut)</SelectItem>
                  <SelectItem value="cam-2">Webcam externe</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Right Panel: Join Options */}
          <div className="lg:w-1/3 flex flex-col justify-center items-center lg:items-start space-y-5 p-4 sm:p-6">
            <h2 className="text-3xl sm:text-4xl font-semibold text-foreground">Prêt à participer ?</h2>
            <p className="text-sm text-muted-foreground">Personne d'autre ne participe à cet appel.</p>
            
            <div className="w-full space-y-2">
              <Label htmlFor="displayNameLobby" className="text-sm font-medium text-muted-foreground">Votre nom pour la réunion</Label>
              <Input
                id="displayNameLobby"
                placeholder="Entrez votre nom"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="text-base h-11"
              />
            </div>

            <Button className="w-full h-12 text-base rounded-full bg-primary hover:bg-primary/90" onClick={handleJoinMeeting} disabled={!displayName.trim()}>
              Participer à la réunion
            </Button>
            {/* Removed buttons below "Participer à la réunion" */}
          </div>
        </div>
      </div>
    );
  }

  // Main Meeting UI (remains the same for now)
  return (
    <div className="flex h-screen w-screen bg-gray-900 text-white relative overflow-hidden">
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
                            fill 
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            style={{objectFit: 'cover'}}
                            data-ai-hint={participant.hint}
                            className="rounded-lg"
                            priority={index < 2} // Prioritize loading for first few images
                        />
                    )}
                    <span className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 bg-black/50 px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs sm:text-sm rounded">{participant.name}</span>
                </div>
            ))}
        </div>
      </div>

      <div className={cn(
          "absolute top-0 right-0 h-full w-72 sm:w-80 bg-gray-800/90 backdrop-blur-sm p-3 sm:p-4 space-y-4 overflow-y-auto transition-transform duration-300 ease-in-out z-20",
          (isChatOpen || isParticipantsOpen) ? "translate-x-0" : "translate-x-full"
        )}>
          <Button onClick={() => { setIsChatOpen(false); setIsParticipantsOpen(false); }} variant="ghost" size="sm" className="absolute top-2 right-2 text-gray-400 hover:text-white">
            Close
          </Button>
          {isChatOpen && (
            <div className="bg-gray-700 border border-gray-600 rounded-lg text-white shadow-xl flex flex-col h-full">
              <div className="p-3 border-b border-gray-600">
                <h3 className="flex items-center text-base sm:text-lg font-medium"><MessageSquare className="mr-2 h-4 w-4 sm:h-5 sm:w-5"/>Chat</h3>
              </div>
              <div className="flex-grow p-2 space-y-2 overflow-y-auto text-xs sm:text-sm">
                 <p><span className="font-semibold text-blue-400">Alice:</span> Hello everyone! Ready for the discussion?</p>
                 <p><span className="font-semibold text-green-400">{displayName || "You"}:</span> Hi Alice! Yes, looking forward to it.</p>
                 <p><span className="font-semibold text-purple-400">Bob:</span> Morning all. Just joined.</p>
                 <p><span className="font-semibold text-yellow-400">Charlie:</span> Hey, I might be a few minutes late.</p>
              </div>
              <div className="p-3 border-t border-gray-600">
                  <Input type="text" placeholder="Type a message..." className="bg-gray-600 border-gray-500 text-white placeholder-gray-400 text-xs sm:text-sm"/>
              </div>
            </div>
          )}
          {isParticipantsOpen && (
             <div className="bg-gray-700 border border-gray-600 rounded-lg text-white shadow-xl flex flex-col h-full">
              <div className="p-3 border-b border-gray-600">
                <h3 className="flex items-center text-base sm:text-lg font-medium"><Users className="mr-2 h-4 w-4 sm:h-5 sm:w-5"/>Participants (4)</h3>
              </div>
              <div className="flex-grow p-2 space-y-3 overflow-y-auto text-xs sm:text-sm">
                <div className="flex items-center justify-between"><span className="flex items-center"><UserCircleIcon className="h-4 w-4 mr-2 text-green-400"/>{displayName || "You"}</span> {isMuted ? <MicOff className="h-4 w-4 text-red-500"/> : <Mic className="h-4 w-4 text-gray-300"/>}</div>
                <div className="flex items-center justify-between"><span className="flex items-center"><UserCircleIcon className="h-4 w-4 mr-2 text-gray-400"/>Participant 2</span> <Mic className="h-4 w-4 text-gray-300"/></div>
                <div className="flex items-center justify-between"><span className="flex items-center"><UserCircleIcon className="h-4 w-4 mr-2 text-gray-400"/>Participant 3</span> <Mic className="h-4 w-4 text-gray-300"/></div>
                <div className="flex items-center justify-between"><span className="flex items-center"><UserCircleIcon className="h-4 w-4 mr-2 text-gray-400"/>Participant 4</span> <MicOff className="h-4 w-4 text-red-500"/></div>
              </div>
            </div>
          )}
        </div>

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
