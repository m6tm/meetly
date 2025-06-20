
'use client';

import React from 'react';
import VideoTile from './video-tile';
import ControlsBar from './controls-bar';
import SidePanelContainer from './side-panel-container';
import MeetingInfoContent from './meeting-info-content';
import ChatContent from './chat-content';
import ParticipantsContent from './participants-content';
import type { Participant, Message } from './types';
import { ScrollArea } from '@/components/ui/scroll-area'; 

interface MeetingLayoutProps {
  userVideoRef: React.RefObject<HTMLVideoElement>;
  displayName: string;
  isUserVideoOff: boolean;
  isUserMuted: boolean;
  isUserHandRaised: boolean; 
  hasCameraPermission: boolean | null;
  remoteParticipants: Participant[];
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
  handleToggleMute: () => void;
  handleToggleVideo: () => void;
  handleShareScreen: () => void;
  handleRaiseHand: () => void;
  handleEndCall: () => void;
  pinnedMessageIds: string[];
  handlePinMessage: (messageId: string) => void;
  handleUnpinMessageFromBanner: (messageId: string) => void;
  featuredParticipantId: string | null;
  handleToggleFeatureParticipant: (participantId: string) => void;
}

const MeetingLayout: React.FC<MeetingLayoutProps> = ({
  userVideoRef,
  displayName,
  isUserVideoOff,
  isUserMuted,
  isUserHandRaised,
  hasCameraPermission,
  remoteParticipants,
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
  handleToggleMute,
  handleToggleVideo,
  handleShareScreen,
  handleRaiseHand,
  handleEndCall,
  pinnedMessageIds,
  handlePinMessage,
  handleUnpinMessageFromBanner,
  featuredParticipantId,
  handleToggleFeatureParticipant,
}) => {
  const currentParticipantsCount = remoteParticipants.length + 1; 

  const userParticipant: Participant = {
    id: 'local-user',
    name: displayName || "You", 
    avatarFallback: displayName ? displayName.charAt(0).toUpperCase() : 'U',
    isMuted: isUserMuted,
    isVideoOff: isUserVideoOff,
    isHandRaised: isUserHandRaised,
    isRemote: false,
  };

  const allParticipantsForLayout = [userParticipant, ...remoteParticipants];

  if (featuredParticipantId) {
    const featuredP = allParticipantsForLayout.find(p => p.id === featuredParticipantId);
    const otherParticipants = allParticipantsForLayout.filter(p => p.id !== featuredParticipantId);

    return (
      <div className="flex h-screen w-screen bg-gray-900 text-white relative overflow-hidden select-none">
        <div className="flex flex-1 p-2 md:p-4 overflow-hidden">
          {featuredP && (
            <div className="flex-grow-[3] h-full p-1 flex items-center justify-center relative">
              <VideoTile
                key={featuredP.id}
                participantId={featuredP.id}
                videoRef={featuredP.id === 'local-user' ? userVideoRef : undefined}
                name={featuredP.name}
                isMuted={featuredP.isMuted}
                isVideoOff={featuredP.isVideoOff}
                isHandRaised={featuredP.id === 'local-user' ? isUserHandRaised : featuredP.isHandRaised}
                avatarFallback={featuredP.avatarFallback}
                avatarUrl={featuredP.avatarUrl}
                isUser={featuredP.id === 'local-user'}
                isMainScreen={true}
                hasCameraPermission={featuredP.id === 'local-user' ? hasCameraPermission : undefined}
                onToggleFeature={handleToggleFeatureParticipant}
                isCurrentlyFeatured={true}
              />
            </div>
          )}
          {(otherParticipants.length > 0 || !featuredP) && ( 
            <ScrollArea className="flex-grow-[1] h-full w-full max-w-[200px] sm:max-w-[240px] p-1 min-h-0 border-l border-gray-700/50">
              <div className="grid grid-cols-1 gap-2">
                {otherParticipants.map((participant) => (
                  <div key={participant.id} className="aspect-video bg-gray-800 rounded-lg relative overflow-hidden shadow-md">
                    <VideoTile
                      participantId={participant.id}
                      videoRef={participant.id === 'local-user' ? userVideoRef : undefined} 
                      name={participant.name}
                      isMuted={participant.isMuted}
                      isVideoOff={participant.isVideoOff}
                      isHandRaised={participant.id === 'local-user' ? isUserHandRaised : participant.isHandRaised}
                      avatarFallback={participant.avatarFallback}
                      avatarUrl={participant.avatarUrl}
                      isUser={participant.id === 'local-user'}
                      isMainScreen={false}
                      hasCameraPermission={participant.id === 'local-user' ? hasCameraPermission : undefined}
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
                remoteParticipants={remoteParticipants}
              />
            )}
          </SidePanelContainer>
        )}
        
        <ControlsBar
          isMuted={isUserMuted}
          isVideoOff={isUserVideoOff}
          isHandRaised={isUserHandRaised}
          handleToggleMute={handleToggleMute}
          handleToggleVideo={handleToggleVideo}
          handleShareScreen={handleShareScreen}
          handleRaiseHand={handleRaiseHand}
          handleEndCall={handleEndCall}
          toggleSidePanel={(panel) => setActiveSidePanel(activeSidePanel === panel ? null : panel)}
          currentTimeState={currentTimeState}
          meetingCode={meetingCode}
          activeSidePanel={activeSidePanel}
          currentParticipantsCount={currentParticipantsCount}
        />
      </div>
    );
  } else {
    return (
      <div className="flex h-screen w-screen bg-gray-900 text-white relative overflow-hidden select-none">
        <div className="flex-1 flex flex-col p-2 md:p-4 overflow-hidden">
          <ScrollArea className="flex-1 w-full min-h-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 p-1">
              {allParticipantsForLayout.map((participant) => (
                <div key={participant.id} className="aspect-video bg-gray-800 rounded-lg relative overflow-hidden shadow-md">
                  <VideoTile
                    participantId={participant.id}
                    videoRef={participant.id === 'local-user' ? userVideoRef : undefined}
                    name={participant.name}
                    isMuted={participant.isMuted}
                    isVideoOff={participant.isVideoOff}
                    isHandRaised={participant.id === 'local-user' ? isUserHandRaised : participant.isHandRaised}
                    avatarFallback={participant.avatarFallback}
                    avatarUrl={participant.avatarUrl}
                    isUser={participant.id === 'local-user'}
                    isMainScreen={false}
                    hasCameraPermission={participant.id === 'local-user' ? hasCameraPermission : undefined}
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
                remoteParticipants={remoteParticipants}
              />
            )}
          </SidePanelContainer>
        )}
        
        <ControlsBar
          isMuted={isUserMuted}
          isVideoOff={isUserVideoOff}
          isHandRaised={isUserHandRaised}
          handleToggleMute={handleToggleMute}
          handleToggleVideo={handleToggleVideo}
          handleShareScreen={handleShareScreen}
          handleRaiseHand={handleRaiseHand}
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
