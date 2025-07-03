'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mic, MicOff, Video, VideoOff, Volume2, UserCircle as UserCircleIconLucide, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useLocalParticipant, useMediaDeviceSelect, useMediaDevices, VideoTrack } from '@livekit/components-react';
import { LocalVideoTrack, Track } from 'livekit-client'; // Import Track type
import { getParticipantMetadata, getParticipantName, setParticimantMetadata } from '@/lib/meetly-tools';
import { validatePassword } from '@/actions/meetly-meet-manager';
import { ParticipantRole } from '@/types/meetly.types';

interface LobbyViewProps {
  displayName: string;
  setDisplayName: (name: string) => void;
  handleJoinMeeting: () => void;
  hasPassword: boolean;
  meetCode: string;
  role: ParticipantRole
}

const LobbyView: React.FC<LobbyViewProps> = ({
  displayName,
  setDisplayName,
  handleJoinMeeting,
  hasPassword,
  meetCode,
  role,
}) => {
  const { localParticipant } = useLocalParticipant();
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [verifying, setVerifying] = useState(false)

  // Find local camera and microphone tracks from published tracks
  const cameraPublication = Array.from(localParticipant.videoTrackPublications.values()).find(
    (pub) => pub.source === Track.Source.Camera
  );
  const cameraTrack = cameraPublication?.track as LocalVideoTrack | undefined;
  const isCameraEnabled = localParticipant.isCameraEnabled
  const toggleCamera = () => {
    localParticipant.setCameraEnabled(!isCameraEnabled);
  };
  const isMicrophoneEnabled = localParticipant.isMicrophoneEnabled
  const toggleMicrophone = () => {
    localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
  };

  const handleJoinMeetingLobby = async () => {
    setVerifying(true)
    if (hasPassword && role !== 'moderator') {
      const response = await validatePassword({ password, meetingCode: meetCode })
      if (!response.success) {
        setError(response.error!)
        setVerifying(false)
        return
      }
    }

    const metadata = getParticipantMetadata(localParticipant)
    metadata.name = displayName
    metadata.joined = 1
    await setParticimantMetadata(localParticipant, metadata)
    setVerifying(false)
    handleJoinMeeting()
  }

  const micDevices = useMediaDevices({ kind: 'audioinput' });
  const { activeDeviceId: selectedMicId, setActiveMediaDevice: setSelectedMicById } = useMediaDeviceSelect({ kind: 'audioinput' });

  const cameraDevices = useMediaDevices({ kind: 'videoinput' });
  const { activeDeviceId: selectedCamId, setActiveMediaDevice: setSelectedCamById } = useMediaDeviceSelect({ kind: 'videoinput' });

  const speakerDevices = useMediaDevices({ kind: 'audiooutput' });
  const { activeDeviceId: selectedSpeakerId, setActiveMediaDevice: setSelectedSpeakerById } = useMediaDeviceSelect({ kind: 'audiooutput' });

  const hasCameraPermission = cameraTrack !== undefined || cameraTrack === null ? true : (cameraTrack === undefined ? null : false); // Simplified permission check based on track availability

  return (
    <div className="flex h-screen w-screen bg-background text-foreground p-2 sm:p-4 md:p-8 items-center justify-center">
      <div className="flex flex-col lg:flex-row w-full max-w-6xl h-full max-h-[700px] lg:max-h-[calc(100vh-4rem)] gap-4 sm:gap-6 md:gap-8">
        <div className="flex-grow lg:w-2/3 flex flex-col h-1/2 lg:h-full">
          <div className="relative aspect-video w-full bg-muted rounded-xl overflow-hidden shadow-2xl flex items-center justify-center border flex-grow min-h-0">
            {hasCameraPermission === false ? (
              <div className="p-4 text-center text-destructive">
                <VideoOff className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-2 sm:mb-3" />
                <p className="font-semibold text-md sm:text-lg">Accès caméra refusé</p>
                <p className="text-xs sm:text-sm">Veuillez activer la caméra dans les paramètres.</p>
              </div>
            ) : !isCameraEnabled || cameraTrack === undefined ? ( // Use isCameraEnabled and cameraTrack state
              <div className="flex flex-col items-center text-muted-foreground">
                <UserCircleIconLucide className="h-24 w-24 sm:h-32 sm:w-32" />
                {cameraTrack === undefined && <p className="mt-2 sm:mt-3 text-sm sm:text-md">Demande d'accès caméra...</p>}
                {cameraTrack !== undefined && !isCameraEnabled && <p className="mt-2 sm:mt-3 text-sm sm:text-md">Caméra désactivée</p>}
              </div>
            ) : (
              <VideoTrack
                trackRef={{
                  participant: localParticipant,
                  source: Track.Source.Camera,
                  publication: localParticipant.getTrackPublication(Track.Source.Camera)!,
                }}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-black/50 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium">
              {displayName || "Votre Nom"}
            </div>

            <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-2 sm:space-x-3">
              <Button
                variant="secondary"
                size="icon"
                className={cn(
                  "rounded-full h-10 w-10 sm:h-14 sm:w-14 p-0 bg-black/40 hover:bg-black/60 text-white border-2 border-transparent",
                  !isMicrophoneEnabled && "bg-red-600 hover:bg-red-700" // Use isMicrophoneEnabled
                )}
                onClick={toggleMicrophone} // Use toggleMicrophone hook function
                aria-label={!isMicrophoneEnabled ? "Activer le microphone" : "Couper le microphone"}
              >
                {!isMicrophoneEnabled ? <MicOff className="h-5 w-5 sm:h-6 sm:w-6" /> : <Mic className="h-5 w-5 sm:h-6 sm:w-6" />}
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className={cn(
                  "rounded-full h-10 w-10 sm:h-14 sm:w-14 p-0 bg-black/40 hover:bg-black/60 text-white border-2 border-transparent",
                  !isCameraEnabled && "bg-red-600 hover:bg-red-700" // Use isCameraEnabled
                )}
                onClick={toggleCamera} // Use toggleCamera hook function
                disabled={hasCameraPermission === false}
                aria-label={!isCameraEnabled ? "Activer la caméra" : "Désactiver la caméra"}
              >
                {!isCameraEnabled ? <VideoOff className="h-5 w-5 sm:h-6 sm:w-6" /> : <Video className="h-5 w-5 sm:h-6 sm:w-6" />}
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mt-3 sm:mt-4">
            <Select value={selectedMicId} onValueChange={setSelectedMicById} disabled={hasCameraPermission === false}> {/* Use hook state and handler */}
              <SelectTrigger className="w-full bg-muted/50 border-border hover:border-primary/50 text-xs sm:text-sm h-9 sm:h-10">
                <div className="flex items-center truncate">
                  <Mic className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-muted-foreground flex-shrink-0" />
                  <SelectValue placeholder="Microphone" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {micDevices.map((device: MediaDeviceInfo) => (
                  <SelectItem key={device.deviceId} value={device.deviceId}>{device.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedSpeakerId} onValueChange={setSelectedSpeakerById} disabled={hasCameraPermission === false}> {/* Use hook state and handler */}
              <SelectTrigger className="w-full bg-muted/50 border-border hover:border-primary/50 text-xs sm:text-sm h-9 sm:h-10">
                <div className="flex items-center truncate">
                  <Volume2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-muted-foreground flex-shrink-0" />
                  <SelectValue placeholder="Haut-parleurs" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {speakerDevices.map((device: MediaDeviceInfo) => (
                  <SelectItem key={device.deviceId} value={device.deviceId}>{device.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedCamId} onValueChange={setSelectedCamById} disabled={hasCameraPermission === false}> {/* Use hook state and handler */}
              <SelectTrigger className="w-full bg-muted/50 border-border hover:border-primary/50 text-xs sm:text-sm h-9 sm:h-10">
                <div className="flex items-center truncate">
                  <Video className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-muted-foreground flex-shrink-0" />
                  <SelectValue placeholder="Caméra" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {cameraDevices.map((device: MediaDeviceInfo) => (
                  <SelectItem key={device.deviceId} value={device.deviceId}>{device.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="lg:w-1/3 flex flex-col justify-center items-center lg:items-start space-y-4 sm:space-y-5 p-4 sm:p-0">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground text-center lg:text-left">Prêt à participer ?</h2>
          <p className="text-xs sm:text-sm text-muted-foreground text-center lg:text-left">Personne d'autre ne participe à cet appel.</p>

          <div className="w-full space-y-1.5 sm:space-y-2">
            <Label htmlFor="displayNameLobby" className="text-xs sm:text-sm font-medium text-muted-foreground">Votre nom pour la réunion</Label>
            <Input
              id="displayNameLobby"
              placeholder="Entrez votre nom"
              disabled={verifying}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="text-sm sm:text-base h-10 sm:h-11"
            />
          </div>

          {
            hasPassword && role !== 'moderator' && (
              <div className="w-full space-y-1.5 sm:space-y-2">
                <Label htmlFor="access" className="text-xs sm:text-sm font-medium text-muted-foreground">Code d'accès</Label>
                <Input
                  id="access"
                  type='password'
                  value={password}
                  disabled={verifying}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Entrez le code d'accès"
                  className="text-sm sm:text-base h-10 sm:h-11"
                />
                {
                  error && <small className='text-red-500'>{error}</small>
                }
              </div>
            )
          }

          <Button
            className="w-full h-11 sm:h-12 text-sm sm:text-base rounded-full bg-primary hover:bg-primary/90"
            onClick={handleJoinMeetingLobby}
            disabled={!displayName.trim() || verifying}>
              {verifying ? (
                <Loader2 className='animate-spin' />
              ) : (
                <>
                  {role === 'moderator' ? 'Accéder' : 'Participer'} à la réunion
                </>
              )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LobbyView;
