import { ParticipantRole } from "@/types/meetly.types";
import { ReceivedChatMessage } from "@livekit/components-react";
import { LocalParticipant, RemoteParticipant } from "livekit-client";

export type Participant = {
  id: string;
  name: string;
  avatarFallback: string;
  avatarUrl?: string;
  isMuted: boolean;
  isVideoOff: boolean;
  participant: LocalParticipant | RemoteParticipant;
  isRemote: boolean; // To differentiate between local user and others
  isScreenSharing: boolean;
  isHandRaised: boolean;
  role: ParticipantRole;
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
