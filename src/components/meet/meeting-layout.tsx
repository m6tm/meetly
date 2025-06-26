
'use client';

import React, { useState, useEffect, useRef } from 'react';
import VideoTile from './video-tile';
import ControlsBar from './controls-bar';
import SidePanelContainer from './side-panel-container';
import MeetingInfoContent from './meeting-info-content';
import ChatContent from './chat-content';
import ParticipantsContent from './participants-content';
import type { Participant, Message } from './types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useLocalParticipant, useRemoteParticipants } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { getParticipantHandUp } from '@/lib/meetly-tools';


interface MeetingLayoutProps {
  userVideoRef: React.RefObject<HTMLVideoElement>;
  displayName: string;
  activeSidePanel: 'chat' | 'participants' | 'info' | null;
  setActiveSidePanel: (panel: 'chat' | 'participants' | 'info' | null) => void;
  chatMessage: string;
  setChatMessage: (message: string) => void;
  handleSendChatMessage: (e: React.FormEvent | React.KeyboardEvent<HTMLTextAreaElement>) => void;
  handleChatInputKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  messages: Message[];
  meetingCode: string;
  handleCopyMeetingLink: () => void;
  currentTimeState: string;
  pinnedMessageIds: string[];
  handlePinMessage: (messageId: string) => void;
  handleUnpinMessageFromBanner: (messageId: string) => void;
}

const MeetingLayout: React.FC<MeetingLayoutProps> = ({
  userVideoRef,
  displayName,
  activeSidePanel,
  setActiveSidePanel,
  chatMessage,
  setChatMessage,
  handleSendChatMessage,
  handleChatInputKeyDown,
  messages,
  meetingCode,
  handleCopyMeetingLink,
  currentTimeState,
  pinnedMessageIds,
  handlePinMessage,
  handleUnpinMessageFromBanner,
}) => {
  const { localParticipant, isCameraEnabled, isMicrophoneEnabled, cameraTrack } = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();
  const router = useRouter();
  const { toast } = useToast();

  const [featuredParticipantId, setFeaturedParticipantId] = useState<string | null>(null);
  const [feedbackToastDetails, setFeedbackToastDetails] = useState<{ title: string, description?: string, variant?: "default" | "destructive" } | null>(null);


  // Effect to attach local video track to the video element
  useEffect(() => {
    if (userVideoRef.current && cameraTrack?.track) {
      userVideoRef.current.srcObject = new MediaStream([cameraTrack.track.mediaStreamTrack]);
    }

    return () => {
      if (userVideoRef.current) {
        userVideoRef.current.srcObject = null;
      }
    };
  }, [cameraTrack?.track, userVideoRef]); // Depend on the track itself and the ref

  useEffect(() => {
    if (feedbackToastDetails) {
      toast({
        title: feedbackToastDetails.title,
        description: feedbackToastDetails.description,
        variant: feedbackToastDetails.variant || 'default',
      });
      setFeedbackToastDetails(null);
    }
  }, [feedbackToastDetails, toast]);


  const handleToggleMute = async () => {
    if (localParticipant) {
      await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
    }
  };

  const handleToggleVideo = async () => {
    if (localParticipant) {
      await localParticipant.setCameraEnabled(!isCameraEnabled);
    }
  };

  const handleShareScreen = async () => {
    localParticipant.setScreenShareEnabled(!localParticipant.isScreenShareEnabled);
  };

  const handleEndCall = () => {
    setFeedbackToastDetails({ title: "Appel Terminé", description: "Vous avez quitté la réunion.", variant: "destructive" });
    // LiveKitRoom handles disconnecting on unmount
    router.push('/');
  };

  const handleToggleFeatureParticipant = (participantId: string) => {
    const currentlyFeatured = featuredParticipantId === participantId;
    setFeaturedParticipantId(currentId => (currentId === participantId ? null : participantId));

    if (currentlyFeatured) {
      setFeedbackToastDetails({ title: "Returned to Gallery View" });
    } else {
      // Find participant from local or remote participants
      const participantToFeature = participantId === localParticipant?.identity ?
        { id: localParticipant.identity, name: displayName || "You", isRemote: false, avatarFallback: displayName?.charAt(0).toUpperCase() || "Y" } :
        remoteParticipants.find(p => p.identity === participantId);

      setFeedbackToastDetails({ title: `${participantToFeature?.name || 'Participant'} is now featured` });
    }
  };

  // Determine camera permission status based on cameraTrack availability
  const hasCameraPermission = cameraTrack !== undefined || cameraTrack === null ? true : (cameraTrack === undefined ? null : false);


  const mappedRemoteParticipants: Participant[] = remoteParticipants.map(rp => ({
    id: rp.identity,
    name: rp.name || rp.identity, // Utiliser le nom si disponible, sinon l'identité
    avatarFallback: (rp.name || rp.identity).charAt(0).toUpperCase() || '?', // Générer le fallback
    avatarUrl: rp.metadata ? JSON.parse(rp.metadata)?.avatar : undefined, // Supposant que metadata est JSON et contient 'avatar'
    isMuted: !rp.isMicrophoneEnabled, // Accéder à l'état muet via la publication de piste
    isVideoOff: !rp.isCameraEnabled, // Accéder à l'état vidéo désactivée via la publication de piste
    isRemote: true,
    isScreenSharing: rp.isScreenShareEnabled,
    isHandRaised: getParticipantHandUp(rp),
  }));

  const currentParticipantsCount = mappedRemoteParticipants.length + 1;

  const userParticipant: Participant = {
    id: localParticipant?.identity || 'local-user', // Use localParticipant identity if available
    name: displayName || "You",
    avatarFallback: displayName ? displayName.charAt(0).toUpperCase() : 'U',
    isMuted: !isMicrophoneEnabled,
    isVideoOff: !isCameraEnabled,
    isHandRaised: getParticipantHandUp(localParticipant),
    isScreenSharing: localParticipant.isScreenShareEnabled,
    isRemote: false,
  };

  const allParticipantsForLayout = [userParticipant, ...mappedRemoteParticipants];


  const mainContentClasses = cn(
    "flex-1 flex p-1 sm:p-2 md:p-3 overflow-hidden relative",
    activeSidePanel ? "md:mr-[320px] lg:mr-[384px]" : "" // Adjust margin when side panel is open on larger screens
  );

  const sidePanelWidthClass = "w-full max-w-xs sm:max-w-sm"; // Consistent with SidePanelContainer


  if (featuredParticipantId) {
    const featuredP = allParticipantsForLayout.find(p => p.id === featuredParticipantId);
    const otherParticipants = allParticipantsForLayout.filter(p => p.id !== featuredParticipantId);

    return (
      <div className="flex h-screen w-screen bg-gray-900 text-white relative overflow-hidden select-none">
        <div className={cn(mainContentClasses, "flex-col md:flex-row")}>
          {featuredP && (
            <div className="flex-grow h-3/5 md:h-full md:w-3/4 p-1 flex items-center justify-center relative">
              <VideoTile
                key={featuredP.id}
                participantId={featuredP.id}
                screenShareTrack={featuredP.id === (localParticipant?.identity || 'local-user') && featuredP.isScreenSharing ? localParticipant?.getTrackPublication(Track.Source.ScreenShare)?.videoTrack : remoteParticipants.find(p => p.identity === featuredP.id)?.getTrackPublication(Track.Source.ScreenShare)?.videoTrack} // Pass screen share track
                name={featuredP.name}
                isMuted={featuredP.isMuted}
                isLocal={!featuredP.isRemote}
                isVideoOff={featuredP.isVideoOff}
                avatarFallback={featuredP.avatarFallback}
                avatarUrl={featuredP.avatarUrl}
                isUser={featuredP.id === (localParticipant?.identity || 'local-user')} // Use localParticipant identity
                isMainScreen={true}
                hasCameraPermission={featuredP.id === (localParticipant?.identity || 'local-user') ? hasCameraPermission : undefined} // Use localParticipant identity
                onToggleFeature={handleToggleFeatureParticipant}
                isCurrentlyFeatured={true}
              />
            </div>
          )}
          {(otherParticipants.length > 0 || !featuredP) && (
            <ScrollArea className="flex-grow w-full md:w-auto md:max-w-[200px] lg:max-w-[240px] h-2/5 md:h-full p-1 min-h-0 md:border-l border-gray-700/50">
              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-1 gap-1 sm:gap-2">
                {otherParticipants.map((participant) => (
                  <div key={participant.id} className="aspect-video bg-gray-800 rounded-lg relative overflow-hidden shadow-md">
                    <VideoTile
                      key={participant.id}
                      participantId={participant.id}
                      screenShareTrack={participant.id === (localParticipant?.identity || 'local-user') && participant.isScreenSharing ? localParticipant?.getTrackPublication(Track.Source.ScreenShare)?.videoTrack : remoteParticipants.find(p => p.identity === participant.id)?.getTrackPublication(Track.Source.ScreenShare)?.videoTrack} // Pass screen share track
                      name={participant.name}
                      isMuted={participant.isMuted}
                      isLocal={!participant.isRemote}
                      isVideoOff={participant.isVideoOff}
                      avatarFallback={participant.avatarFallback}
                      avatarUrl={participant.avatarUrl}
                      isUser={participant.id === (localParticipant?.identity || 'local-user')} // Use localParticipant identity
                      isMainScreen={false}
                      hasCameraPermission={participant.id === (localParticipant?.identity || 'local-user') ? hasCameraPermission : undefined} // Use localParticipant identity
                      onToggleFeature={handleToggleFeatureParticipant}
                      isCurrentlyFeatured={false}
                    />
                  </div>
                ))}
                 {otherParticipants.length === 0 && featuredP && (
                    <div className="text-center text-gray-500 text-xs p-4 h-full flex items-center justify-center">No other <br/>participants.</div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>

        {activeSidePanel && (
          <SidePanelContainer
            isOpen={activeSidePanel !== null}
            onClose={() => setActiveSidePanel(null)}
            title={
              activeSidePanel === 'info' ? "Informations sur la réunion" :
              activeSidePanel === 'chat' ? "Messages dans l'appel" :
              `Participants (${currentParticipantsCount})`
            }
            className={sidePanelWidthClass}
          >
            {activeSidePanel === 'info' && (
              <MeetingInfoContent meetingCode={meetingCode} handleCopyMeetingLink={handleCopyMeetingLink} />
            )}
            {activeSidePanel === 'chat' && (
              <ChatContent
                chatMessage={chatMessage}
                setChatMessage={setChatMessage}
                handleSendChatMessage={handleSendChatMessage}
                handleChatInputKeyDown={handleChatInputKeyDown}
                displayName={displayName}
                messages={messages}
                pinnedMessageIds={pinnedMessageIds}
                handlePinMessage={handlePinMessage}
                handleUnpinMessageFromBanner={handleUnpinMessageFromBanner}
              />
            )}
            {activeSidePanel === 'participants' && (
              <ParticipantsContent
                currentParticipantsCount={currentParticipantsCount}
                displayName={displayName}
                remoteParticipants={mappedRemoteParticipants} // Pass mapped remote participants
              />
            )}
          </SidePanelContainer>
        )}

        <ControlsBar
          participant={localParticipant}
          isMuted={!isMicrophoneEnabled} // Use state from hook
          isVideoOff={!isCameraEnabled} // Use state from hook
          handleToggleMute={handleToggleMute}
          handleToggleVideo={handleToggleVideo}
          handleShareScreen={handleShareScreen}
          handleEndCall={handleEndCall}
          toggleSidePanel={(panel) => setActiveSidePanel(activeSidePanel === panel ? null : panel)}
          currentTimeState={currentTimeState}
          meetingCode={meetingCode}
          activeSidePanel={activeSidePanel}
          currentParticipantsCount={currentParticipantsCount}
        />
      </div>
    );
  } else { // Gallery View
    return (
      <div className="flex h-screen w-screen bg-gray-900 text-white relative overflow-hidden select-none">
        <div className={mainContentClasses}>
          <ScrollArea className="flex-1 w-full min-h-0">
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-1 sm:gap-2 p-1">
              {allParticipantsForLayout.map((participant) => (
                <div key={participant.id} className="aspect-video bg-gray-800 rounded-lg relative overflow-hidden shadow-md">
                  <VideoTile
                    participantId={participant.id}
                    screenShareTrack={participant.id === (localParticipant?.identity || 'local-user') && participant.isScreenSharing ? localParticipant?.getTrackPublication(Track.Source.ScreenShare)?.videoTrack : remoteParticipants.find(p => p.identity === participant.id)?.getTrackPublication(Track.Source.ScreenShare)?.videoTrack} // Pass screen share track
                    name={participant.name}
                    isMuted={participant.isMuted}
                    isLocal={!participant.isRemote}
                    isVideoOff={participant.isVideoOff}
                    avatarFallback={participant.avatarFallback}
                    avatarUrl={participant.avatarUrl}
                    isUser={participant.id === (localParticipant?.identity || 'local-user')} // Use localParticipant identity
                    isMainScreen={false}
                    hasCameraPermission={participant.id === (localParticipant?.identity || 'local-user') ? hasCameraPermission : undefined} // Use localParticipant identity
                    onToggleFeature={handleToggleFeatureParticipant}
                    isCurrentlyFeatured={false}
                  />
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {activeSidePanel && (
          <SidePanelContainer
            isOpen={activeSidePanel !== null}
            onClose={() => setActiveSidePanel(null)}
            title={
              activeSidePanel === 'info' ? "Informations sur la réunion" :
              activeSidePanel === 'chat' ? "Messages dans l'appel" :
              `Participants (${currentParticipantsCount})`
            }
            className={sidePanelWidthClass}
          >
            {activeSidePanel === 'info' && (
              <MeetingInfoContent meetingCode={meetingCode} handleCopyMeetingLink={handleCopyMeetingLink} />
            )}
            {activeSidePanel === 'chat' && (
              <ChatContent
                chatMessage={chatMessage}
                setChatMessage={setChatMessage}
                handleSendChatMessage={handleSendChatMessage}
                handleChatInputKeyDown={handleChatInputKeyDown}
                displayName={displayName}
                messages={messages}
                pinnedMessageIds={pinnedMessageIds}
                handlePinMessage={handlePinMessage}
                handleUnpinMessageFromBanner={handleUnpinMessageFromBanner}
              />
            )}
            {activeSidePanel === 'participants' && (
              <ParticipantsContent
                currentParticipantsCount={currentParticipantsCount}
                displayName={displayName}
                remoteParticipants={mappedRemoteParticipants} // Pass mapped remote participants
              />
            )}
          </SidePanelContainer>
        )}

        <ControlsBar
          participant={localParticipant}
          isMuted={!isMicrophoneEnabled} // Use state from hook
          isVideoOff={!isCameraEnabled} // Use state from hook
          handleToggleMute={handleToggleMute}
          handleToggleVideo={handleToggleVideo}
          handleShareScreen={handleShareScreen}
          handleEndCall={handleEndCall}
          toggleSidePanel={(panel) => setActiveSidePanel(activeSidePanel === panel ? null : panel)}
          currentTimeState={currentTimeState}
          meetingCode={meetingCode}
          activeSidePanel={activeSidePanel}
          currentParticipantsCount={currentParticipantsCount}
        />
      </div>
    );
  }
};

export default MeetingLayout;
