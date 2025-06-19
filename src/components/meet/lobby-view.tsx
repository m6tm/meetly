
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mic, MicOff, Video, VideoOff, Volume2, UserCircle as UserCircleIconLucide } from 'lucide-react';
import { cn } from "@/lib/utils";

interface LobbyViewProps {
  displayName: string;
  setDisplayName: (name: string) => void;
  lobbyVideoRef: React.RefObject<HTMLVideoElement>;
  lobbyIsMuted: boolean;
  lobbyIsVideoOff: boolean;
  hasCameraPermission: boolean | null;
  handleLobbyToggleMute: () => void;
  handleLobbyToggleVideo: () => void;
  handleJoinMeeting: () => void;
}

const LobbyView: React.FC<LobbyViewProps> = ({
  displayName,
  setDisplayName,
  lobbyVideoRef,
  lobbyIsMuted,
  lobbyIsVideoOff,
  hasCameraPermission,
  handleLobbyToggleMute,
  handleLobbyToggleVideo,
  handleJoinMeeting,
}) => {
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
                  <UserCircleIconLucide className="h-32 w-32" />
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
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
};

export default LobbyView;
