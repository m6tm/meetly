
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
  id: string;
  senderName: string;
  text: string;
  timestamp: string; // or Date
  isSelf: boolean;
};

