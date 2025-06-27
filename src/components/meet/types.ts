import { ReceivedChatMessage } from "@livekit/components-react";

export type Participant = {
  id: string;
  name: string;
  avatarFallback: string;
  avatarUrl?: string;
  isMuted: boolean;
  isVideoOff: boolean;
  isRemote: boolean; // To differentiate between local user and others
  isScreenSharing: boolean;
  isHandRaised: boolean;
};

export type Message = {
  senderName: string;
  text: string;
  timestamp: string; // or Date
  isSelf: boolean;
};

export type MeetlyReceivedChatMessage = Omit<ReceivedChatMessage, 'message'> & {
  message: Message;
};

