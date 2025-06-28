'use client';

import React, { useState, useEffect } from 'react';
import VideoTile from './video-tile';
import ControlsBar from './controls-bar';
import SidePanelContainer from './side-panel-container';
import MeetingInfoContent from './meeting-info-content';
import ChatContent from './chat-content';
import ParticipantsContent from './participants-content';
import type { Participant, Message, MeetlyReceivedChatMessage } from './types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useChat, useLocalParticipant, useRemoteParticipants } from '@livekit/components-react';
import { LocalParticipant, RemoteParticipant, Track } from 'livekit-client';
import { useRouter } from 'next/navigation';
import { getParticipantAvatar, getParticipantHandUp, getParticipantJoined, getParticipantName, getParticipantRole } from '@/lib/meetly-tools';
import { useToast } from '@/hooks/use-toast';

interface MeetingLayoutProps {
  displayName: string;
  activeSidePanel: 'chat' | 'participants' | 'info' | null;
  setActiveSidePanel: (panel: 'chat' | 'participants' | 'info' | null) => void;
  meetingCode: string;
  handleCopyMeetingLink: () => void;
  isAuthed: boolean;
}

const MeetingLayout: React.FC<MeetingLayoutProps> = ({
  activeSidePanel,
  setActiveSidePanel,
  displayName,
  meetingCode,
  handleCopyMeetingLink,
  isAuthed,
}) => {
  const { localParticipant, isCameraEnabled, isMicrophoneEnabled, cameraTrack } = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();
  const router = useRouter();
  const { toast } = useToast();

  const { send, chatMessages } = useChat()
  const [chatMessage, setChatMessage] = useState('');
  const [pinnedMessageIds, setPinnedMessageIds] = useState<string[]>([]);

  const [featuredParticipantId, setFeaturedParticipantId] = useState<string | null>(null);

  const handleSendChatMessage = async (e: React.FormEvent | React.KeyboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const newMessage: Message = {
      senderName: displayName || 'Vous',
      text: chatMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSelf: true
    };
    await send(JSON.stringify(newMessage));
    setChatMessage('');
  };

  const handleChatInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendChatMessage(e);
    }
  };

  const handleUnpinMessageFromBanner = (messageId: string) => {
    setPinnedMessageIds(prevIds => prevIds.filter(id => id !== messageId));
  };

  const handlePinMessage = (messageId: string) => {
    setPinnedMessageIds(prevIds => {
      if (prevIds.includes(messageId)) {
        return prevIds.filter(id => id !== messageId);
      } else {
        return [...prevIds, messageId];
      }
    });
  };

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
    try {
      await localParticipant.setScreenShareEnabled(!localParticipant.isScreenShareEnabled);
    } catch (error) {
        console.error('Screen share failed:', error);
        let message = 'Failed to start screen sharing.';
        if (error instanceof Error && error.message.includes('permissions policy')) {
            message = 'Screen sharing is not allowed by your browser or system settings. Please check the permissions policy.';
        } else if (error instanceof Error) {
            message = `An error occurred: ${error.message}`;
        }
        toast({
            variant: 'destructive',
            title: 'Screen Share Error',
            description: message,
        });
    }
  };

  const handleEndCall = () => {
    router.push(isAuthed ? '/dashboard' : '/')
  };

  const handleToggleFeatureParticipant = (participantId: string) => {
    const currentlyFeatured = featuredParticipantId === participantId;
    setFeaturedParticipantId(currentId => (currentId === participantId ? null : participantId));

    if (!currentlyFeatured) {
      // Find participant from local or remote participants
      const participantToFeature = participantId === localParticipant?.identity ?
        { id: localParticipant.identity, name: displayName || "You", isRemote: false, avatarFallback: displayName?.charAt(0).toUpperCase() || "Y" } :
        remoteParticipants.find(p => p.identity === participantId);
    }
  };

  // Determine camera permission status based on cameraTrack availability
  const hasCameraPermission = cameraTrack !== undefined || cameraTrack === null ? true : (cameraTrack === undefined ? null : false);

  const mappedRemoteParticipants: Participant[] = remoteParticipants.filter(participant => {
    if (getParticipantJoined(participant)) return participant
  }).map(rp => ({
    id: rp.identity,
    name: getParticipantName(rp), // Utiliser le nom si disponible, sinon l'identité
    avatarFallback: getParticipantName(rp)?.charAt(0).toUpperCase() || '?', // Générer le fallback
    avatarUrl: getParticipantAvatar(rp), // Supposant que metadata est JSON et contient 'avatar'
    isMuted: !rp.isMicrophoneEnabled, // Accéder à l'état muet via la publication de piste
    isVideoOff: !rp.isCameraEnabled, // Accéder à l'état vidéo désactivée via la publication de piste
    participant: rp,
    isRemote: true,
    isScreenSharing: rp.isScreenShareEnabled,
    isHandRaised: getParticipantHandUp(rp),
    role: getParticipantRole(rp),
  }));

  const currentParticipantsCount = mappedRemoteParticipants.length + 1;

  const userParticipant: Participant = {
    id: localParticipant?.identity || 'local-user', // Use localParticipant identity if available
    name: displayName || "You",
    avatarFallback: displayName ? displayName.charAt(0).toUpperCase() : 'U',
    avatarUrl: getParticipantAvatar(localParticipant),
    isMuted: !isMicrophoneEnabled,
    isVideoOff: !isCameraEnabled,
    participant: localParticipant,
    isHandRaised: getParticipantHandUp(localParticipant),
    isScreenSharing: localParticipant.isScreenShareEnabled,
    isRemote: false,
    role: getParticipantRole(localParticipant),
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
                messages={
                  chatMessages.map(message => ({
                    ...message,
                    message: JSON.parse(message.message) as MeetlyReceivedChatMessage
                  })) as never[] as MeetlyReceivedChatMessage[]
                }
                pinnedMessageIds={pinnedMessageIds}
                handlePinMessage={handlePinMessage}
                handleUnpinMessageFromBanner={handleUnpinMessageFromBanner}
              />
            )}
            {activeSidePanel === 'participants' && (
              <ParticipantsContent
                allParticipants={allParticipantsForLayout} // Pass mapped remote participants
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
                messages={
                  chatMessages.map(message => ({
                    ...message,
                    message: JSON.parse(message.message) as MeetlyReceivedChatMessage
                  })) as never[] as MeetlyReceivedChatMessage[]
                }
                pinnedMessageIds={pinnedMessageIds}
                handlePinMessage={handlePinMessage}
                handleUnpinMessageFromBanner={handleUnpinMessageFromBanner}
              />
            )}
            {activeSidePanel === 'participants' && (
              <ParticipantsContent
                allParticipants={allParticipantsForLayout}
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
          meetingCode={meetingCode}
          activeSidePanel={activeSidePanel}
          currentParticipantsCount={currentParticipantsCount}
        />
      </div>
    );
  }
};

export default MeetingLayout;
