
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
  LayoutGrid, // Placeholder for Activities for now
  Laptop, 
  Presentation,
  Phone,
  ChevronUp,
  Sparkles, 
  Volume2,
  MoreVertical, // For more options
  Hand, // For Raise Hand
  Info, // For Meeting Info
  Maximize2, // For Pin/Unpin or Focus
  UserCircle, // Placeholder icon
  Bell, // Placeholder for CC as it's more common
  Activity, // Alternative for Activities
  Clock,
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
  const userVideoRef = useRef<HTMLVideoElement>(null); // For user's video in main meeting
  const [lobbyIsMuted, setLobbyIsMuted] = useState(false);
  const [lobbyIsVideoOff, setLobbyIsVideoOff] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  
  const { toast } = useToast();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState('20:11'); // Static for now

  useEffect(() => {
    let streamInstance: MediaStream | null = null;

    const getCameraAndMicPermission = async (videoElementRef: React.RefObject<HTMLVideoElement>, useMutedState: boolean, useVideoOffState: boolean) => {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
        setHasCameraPermission(false);
        return null;
      }
      try {
        streamInstance = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setHasCameraPermission(true);
        if (videoElementRef.current) {
          videoElementRef.current.srcObject = streamInstance;
          streamInstance.getAudioTracks().forEach(track => track.enabled = !useMutedState);
          streamInstance.getVideoTracks().forEach(track => track.enabled = !useVideoOffState);
        }
        return streamInstance;
      } catch (error) {
        console.error('Error accessing camera/mic:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Accès aux appareils refusé',
          description: 'Veuillez activer les permissions pour la caméra et le microphone dans les paramètres de votre navigateur.',
        });
        return null;
      }
    };

    if (isInLobby) {
      getCameraAndMicPermission(lobbyVideoRef, lobbyIsMuted, lobbyIsVideoOff);
    } else if (userVideoRef.current && !isVideoOff && hasCameraPermission) {
       // When moving from lobby to meeting, try to re-acquire or use existing permissions
       // This part might need more robust stream management in a real app
      getCameraAndMicPermission(userVideoRef, isMuted, isVideoOff);
    }


    return () => {
      if (streamInstance) {
        streamInstance.getTracks().forEach(track => track.stop());
      }
      if (lobbyVideoRef.current) lobbyVideoRef.current.srcObject = null;
      if (userVideoRef.current) userVideoRef.current.srcObject = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInLobby, isVideoOff, isMuted, hasCameraPermission]); // Re-run if these states change


  const handleJoinMeeting = () => {
    if (!displayName.trim()) {
      toast({
        title: "Nom Requis",
        description: "Veuillez entrer votre nom pour participer à la réunion.",
        variant: "destructive",
      });
      return;
    }
    setIsMuted(lobbyIsMuted); // Carry over lobby mute state
    setIsVideoOff(lobbyIsVideoOff); // Carry over lobby video state
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
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    if (userVideoRef.current && userVideoRef.current.srcObject) {
      const stream = userVideoRef.current.srcObject as MediaStream;
      stream.getAudioTracks().forEach(track => track.enabled = !newMutedState);
    }
    toast({ title: newMutedState ? "Microphone coupé" : "Microphone activé" });
  };

  const handleToggleVideo = () => {
    const newVideoOffState = !isVideoOff;
    setIsVideoOff(newVideoOffState);
     if (userVideoRef.current && userVideoRef.current.srcObject) {
      const stream = userVideoRef.current.srcObject as MediaStream;
      stream.getVideoTracks().forEach(track => track.enabled = !newVideoOffState);
    }
    toast({ title: newVideoOffState ? "Vidéo désactivée" : "Vidéo activée" });
  };

  const handleShareScreen = () => {
    toast({ title: "Partage d'écran", description: "Partage d'écran démarré (simulé)." });
  };
  const handleToggleSubtitles = () => toast({ title: "Sous-titres (CC)", description: "Fonctionnalité non implémentée." });
  const handleRaiseHand = () => toast({ title: "Lever la main", description: "Fonctionnalité non implémentée." });
  const handleMoreOptions = () => toast({ title: "Plus d'options", description: "Fonctionnalité non implémentée." });
  const handleMeetingInfo = () => toast({ title: "Informations sur la réunion", description: "Fonctionnalité non implémentée." });
  const handleActivities = () => toast({ title: "Activités", description: "Fonctionnalité non implémentée." });

  const handleEndCall = () => {
    toast({ title: "Appel Terminé", description: "Vous avez quitté la réunion.", variant: "destructive" });
    router.push('/'); 
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    if (isParticipantsOpen && !isChatOpen) setIsParticipantsOpen(false); // Close participants if opening chat
  };
  const toggleParticipants = () => {
    setIsParticipantsOpen(!isParticipantsOpen);
    if (isChatOpen && !isParticipantsOpen) setIsChatOpen(false); // Close chat if opening participants
  };


  if (isInLobby) {
    return (
      <div className="flex h-screen w-screen bg-background text-foreground p-4 sm:p-8 items-center justify-center">
        <div className="flex flex-col lg:flex-row w-full max-w-6xl h-full max-h-[700px] gap-4 sm:gap-8">
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-gray-900 text-white relative overflow-hidden select-none">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-2 md:p-4">
        {/* Video Area */}
        <div className="flex-1 grid grid-cols-12 gap-2">
          {/* Main Participant Video (You) */}
          <div className="col-span-12 md:col-span-9 lg:col-span-10 bg-gray-800 rounded-lg flex items-center justify-center relative overflow-hidden">
            {isVideoOff || !hasCameraPermission ? (
              <div className="flex flex-col items-center">
                <UserCircleIcon className="h-32 w-32 text-gray-600" />
                <p className="mt-2 text-gray-500 text-lg">{displayName || "You"}</p>
              </div>
            ) : (
              <video ref={userVideoRef} className="w-full h-full object-cover" autoPlay playsInline muted={isMuted}/>
            )}
            <span className="absolute bottom-3 left-3 bg-black/60 px-3 py-1.5 text-sm rounded-md flex items-center">
              <Mic className="h-4 w-4 mr-1.5" /> {displayName || "You"}
            </span>
             {/* Placeholder for "unpin" icon from image - functionality not implemented */}
             <Button variant="ghost" size="icon" className="absolute bottom-3 right-3 bg-black/60 hover:bg-black/50 p-2 rounded-full">
                <Maximize2 className="h-5 w-5"/>
            </Button>
          </div>

          {/* Sidebar Participant */}
          <div className="hidden md:block md:col-span-3 lg:col-span-2 bg-gray-800 rounded-lg flex items-center justify-center relative overflow-hidden">
            {/* Using UserCircleIcon as placeholder, can be an Image component */}
            <div className="flex flex-col items-center">
                <UserCircleIcon className="h-24 w-24 text-gray-600" />
                <p className="mt-2 text-gray-500 text-sm">Daniel MABOA</p>
            </div>
            <span className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 text-xs rounded-md">Daniel MABOA</span>
          </div>
        </div>
      </div>

      {/* Chat/Participants Side Panel - Overlays on top of the participant sidebar if open */}
      <div className={cn(
          "absolute top-0 right-0 h-full w-72 sm:w-80 bg-gray-800/95 backdrop-blur-sm p-3 sm:p-4 space-y-4 overflow-y-auto transition-transform duration-300 ease-in-out z-30",
          (isChatOpen || isParticipantsOpen) ? "translate-x-0" : "translate-x-full"
        )}>
          <Button onClick={() => { setIsChatOpen(false); setIsParticipantsOpen(false); }} variant="ghost" size="sm" className="absolute top-2 right-2 text-gray-400 hover:text-white">
            Fermer
          </Button>
          {isChatOpen && (
            <div className="bg-gray-700/50 border border-gray-600/50 rounded-lg text-white shadow-xl flex flex-col h-full">
              <div className="p-3 border-b border-gray-600/50">
                <h3 className="flex items-center text-base sm:text-lg font-medium"><MessageSquare className="mr-2 h-4 w-4 sm:h-5 sm:w-5"/>Chat</h3>
              </div>
              <div className="flex-grow p-2 space-y-2 overflow-y-auto text-xs sm:text-sm">
                 <p><span className="font-semibold text-blue-400">Alice:</span> Bonjour à tous ! Prêts pour la discussion ?</p>
                 <p><span className="font-semibold text-green-400">{displayName || "You"}:</span> Salut Alice ! Oui, impatient.</p>
              </div>
              <div className="p-3 border-t border-gray-600/50">
                  <Input type="text" placeholder="Écrire un message..." className="bg-gray-600/70 border-gray-500/70 text-white placeholder-gray-400 text-xs sm:text-sm"/>
              </div>
            </div>
          )}
          {isParticipantsOpen && (
             <div className="bg-gray-700/50 border border-gray-600/50 rounded-lg text-white shadow-xl flex flex-col h-full">
              <div className="p-3 border-b border-gray-600/50">
                <h3 className="flex items-center text-base sm:text-lg font-medium"><Users className="mr-2 h-4 w-4 sm:h-5 sm:w-5"/>Participants (2)</h3>
              </div>
              <div className="flex-grow p-2 space-y-3 overflow-y-auto text-xs sm:text-sm">
                <div className="flex items-center justify-between"><span className="flex items-center"><UserCircleIcon className="h-4 w-4 mr-2 text-green-400"/>{displayName || "You"}</span> {isMuted ? <MicOff className="h-4 w-4 text-red-500"/> : <Mic className="h-4 w-4 text-gray-300"/>}</div>
                <div className="flex items-center justify-between"><span className="flex items-center"><UserCircleIcon className="h-4 w-4 mr-2 text-gray-400"/>Daniel MABOA</span> <Mic className="h-4 w-4 text-gray-300"/></div>
              </div>
            </div>
          )}
      </div>
      
      {/* Bottom Controls Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-800/70 backdrop-blur-md p-3 z-20">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {/* Left Controls: Time & Meeting Code */}
          <div className="flex items-center space-x-3 text-sm text-gray-300">
            <span className="flex items-center"><Clock className="h-4 w-4 mr-1" /> {currentTime}</span>
            <span>zom-ygez-wrc</span>
          </div>

          {/* Center Controls */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={handleToggleMute} className={cn("text-white hover:bg-gray-700/70 p-2.5 rounded-full", isMuted && "bg-red-600 hover:bg-red-700")}>
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleToggleVideo} className={cn("text-white hover:bg-gray-700/70 p-2.5 rounded-full", isVideoOff && "bg-red-600 hover:bg-red-700")}>
              {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleToggleSubtitles} className="text-white hover:bg-gray-700/70 p-2.5 rounded-full">
              <Bell className="h-5 w-5" /> {/* Using Bell as CC placeholder */}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleShareScreen} className="text-white hover:bg-gray-700/70 p-2.5 rounded-full">
              <ScreenShare className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleRaiseHand} className="text-white hover:bg-gray-700/70 p-2.5 rounded-full">
              <Hand className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleMoreOptions} className="text-white hover:bg-gray-700/70 p-2.5 rounded-full">
              <MoreVertical className="h-5 w-5" />
            </Button>
            <Button variant="destructive" onClick={handleEndCall} className="rounded-full h-10 px-4 bg-red-600 hover:bg-red-700 text-white">
              <PhoneOff className="h-5 w-5" />
            </Button>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-2">
             <Button variant="ghost" size="icon" onClick={handleMeetingInfo} className="text-white hover:bg-gray-700/70 p-2.5 rounded-full">
              <Info className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleParticipants} className={cn("text-white hover:bg-gray-700/70 p-2.5 rounded-full relative", isParticipantsOpen && "bg-gray-700")}>
              <Users className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 bg-blue-500 text-white text-[10px] h-4 w-4 min-w-4 rounded-full flex items-center justify-center">2</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleChat} className={cn("text-white hover:bg-gray-700/70 p-2.5 rounded-full", isChatOpen && "bg-gray-700")}>
              <MessageSquare className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleActivities} className="text-white hover:bg-gray-700/70 p-2.5 rounded-full">
              <Activity className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
