
'use client';

import React from 'react';
import VideoTile from './video-tile';
import ControlsBar from './controls-bar';
import SidePanelContainer from './side-panel-container';
import MeetingInfoContent from './meeting-info-content';
import ChatContent from './chat-content';
import ParticipantsContent from './participants-content';
import type { Participant, Message } from './types';
import { ScrollArea } from '@/components/ui/scroll-area'; // Added ScrollArea

interface MeetingLayoutProps {
  userVideoRef: React.RefObject<HTMLVideoElement>;
  displayName: string;
  isUserVideoOff: boolean;
  isUserMuted: boolean;
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
  handleMoreOptions: () => void;
  handleEndCall: () => void;
  pinnedMessageIds: string[];
  handlePinMessage: (messageId: string) => void;
  handleUnpinMessageFromBanner: (messageId: string) => void;
}

const MeetingLayout: React.FC<MeetingLayoutProps> = ({
  userVideoRef,
  displayName,
  isUserVideoOff,
  isUserMuted,
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
  handleMoreOptions,
  handleEndCall,
  pinnedMessageIds,
  handlePinMessage,
  handleUnpinMessageFromBanner,
}) => {
  const currentParticipantsCount = remoteParticipants.length + 1; // +1 for the local user

  const userParticipant: Participant = {
    id: 'local-user',
    name: displayName,
    avatarFallback: displayName ? displayName.charAt(0).toUpperCase() : 'U',
    isMuted: isUserMuted,
    isVideoOff: isUserVideoOff,
    isRemote: false,
  };

  const allParticipantsForGrid = [userParticipant, ...remoteParticipants];

  return (
    <div className="flex h-screen w-screen bg-gray-900 text-white relative overflow-hidden select-none">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-2 md:p-4 overflow-hidden"> {/* Added overflow-hidden here */}
        {/* Video Area - Changed to a scrollable grid */}
        <ScrollArea className="flex-1 w-full min-h-0"> {/* Ensure ScrollArea can shrink */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 p-1">
            {allParticipantsForGrid.map((participant) => (
              <div key={participant.id} className="aspect-video bg-gray-800 rounded-lg relative overflow-hidden shadow-md">
                <VideoTile
                  videoRef={participant.id === 'local-user' ? userVideoRef : undefined}
                  name={participant.name}
                  isMuted={participant.isMuted}
                  isVideoOff={participant.isVideoOff}
                  avatarFallback={participant.avatarFallback}
                  avatarUrl={participant.avatarUrl}
                  isUser={participant.id === 'local-user'}
                  isMainScreen={false} // All tiles in grid are smaller
                  hasCameraPermission={participant.id === 'local-user' ? hasCameraPermission : undefined}
                />
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Side Panels Container */}
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
        handleToggleMute={handleToggleMute}
        handleToggleVideo={handleToggleVideo}
        handleShareScreen={handleShareScreen}
        handleRaiseHand={handleRaiseHand}
        handleMoreOptions={handleMoreOptions}
        handleEndCall={handleEndCall}
        toggleSidePanel={(panel) => setActiveSidePanel(activeSidePanel === panel ? null : panel)}
        currentTimeState={currentTimeState}
        meetingCode={meetingCode}
        activeSidePanel={activeSidePanel}
        currentParticipantsCount={currentParticipantsCount}
      />
    </div>
  );
};

export default MeetingLayout;
