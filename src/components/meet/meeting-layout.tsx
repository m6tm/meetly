
'use client';

import React from 'react';
import VideoTile from './video-tile';
import ControlsBar from './controls-bar';
import SidePanelContainer from './side-panel-container';
import MeetingInfoContent from './meeting-info-content';
import ChatContent from './chat-content';
import ParticipantsContent from './participants-content';
import type { Participant } from './types';
import { Button } from '@/components/ui/button'; 
import { Maximize2 } from 'lucide-react'; 

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
  meetingCode: string;
  handleCopyMeetingLink: () => void;
  currentTimeState: string;
  handleToggleMute: () => void;
  handleToggleVideo: () => void;
  handleShareScreen: () => void;
  handleRaiseHand: () => void;
  handleMoreOptions: () => void;
  handleEndCall: () => void;
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
  meetingCode,
  handleCopyMeetingLink,
  currentTimeState,
  handleToggleMute,
  handleToggleVideo,
  handleShareScreen,
  handleRaiseHand,
  handleMoreOptions,
  handleEndCall,
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

  return (
    <div className="flex h-screen w-screen bg-gray-900 text-white relative overflow-hidden select-none">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-2 md:p-4">
        {/* Video Area */}
        <div className="flex-1 grid grid-cols-12 gap-2">
          {/* Main Participant Video (You) */}
          <div className="col-span-12 md:col-span-9 lg:col-span-10 bg-gray-800 rounded-lg flex items-center justify-center relative overflow-hidden">
            <VideoTile
              videoRef={userVideoRef}
              name={userParticipant.name}
              isMuted={userParticipant.isMuted}
              isVideoOff={userParticipant.isVideoOff}
              avatarFallback={userParticipant.avatarFallback}
              isUser={true}
              isMainScreen={true}
              hasCameraPermission={hasCameraPermission}
            />
             <Button variant="ghost" size="icon" className="absolute bottom-3 right-3 bg-black/60 hover:bg-black/50 p-2 rounded-full">
                <Maximize2 className="h-5 w-5"/>
            </Button>
          </div>

          {/* Sidebar Participant */}
          {remoteParticipants.length > 0 && (
            <div className="hidden md:block md:col-span-3 lg:col-span-2 bg-gray-800 rounded-lg items-center justify-center relative overflow-hidden p-2">
              <VideoTile
                name={remoteParticipants[0].name}
                isMuted={remoteParticipants[0].isMuted}
                isVideoOff={remoteParticipants[0].isVideoOff}
                avatarFallback={remoteParticipants[0].avatarFallback}
                avatarUrl={remoteParticipants[0].avatarUrl}
                isMainScreen={false}
              />
            </div>
          )}
        </div>
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
