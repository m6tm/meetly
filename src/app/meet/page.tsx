'use client';

import { LiveKitRoom } from '@livekit/components-react';
import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';

import LobbyView from '@/components/meet/lobby-view';
import MeetingLayout from '@/components/meet/meeting-layout';
import type { Participant, Message } from '@/components/meet/types';
import { createClient } from '@/utils/supabase/client';
import { useForm } from 'react-hook-form';
import { generateMeetTokenAction, MeetTokenDataType } from '@/actions/meetly-meet-manager';
import { generateMeetToken, getUserNameFromEmail } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';


const ORIGIN_URL = process.env.NEXT_PUBLIC_APP_URL
const LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL

type MeetPageProps = {
  userData: MeetTokenDataType
  token: string
}

function Main({ userData, token }: MeetPageProps) {
  const [isInLobby, setIsInLobby] = useState(true);
  const [displayName, setDisplayName] = useState(userData.participantName === 'undefined' ? '' : userData.participantName);
  
  const userVideoRef = useRef<HTMLVideoElement>(null);
  
  const [activeSidePanel, setActiveSidePanel] = useState<'chat' | 'participants' | 'info' | null>(null);
  
  const { toast } = useToast();
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [pinnedMessageIds, setPinnedMessageIds] = useState<string[]>([]);
  
  const [permissionErrorDetails, setPermissionErrorDetails] = useState<{ title: string, description: string } | null>(null);
  const [joinMeetingToastDetails, setJoinMeetingToastDetails] = useState<{ title: string, description: string } | null>(null);
  const [feedbackToastDetails, setFeedbackToastDetails] = useState<{ title: string, description?: string, variant?: "default" | "destructive" } | null>(null);

  // Handlers and state related to meeting controls and side panels remain in Main
  // as they control the state of the Main component and its children.

  useEffect(() => {
    if (permissionErrorDetails) {
      toast({
        variant: 'destructive',
        title: permissionErrorDetails.title,
        description: permissionErrorDetails.description,
      });
      setPermissionErrorDetails(null);
    }
  }, [permissionErrorDetails, toast]);

  useEffect(() => {
    if (joinMeetingToastDetails) {
      toast({
        title: joinMeetingToastDetails.title,
        description: joinMeetingToastDetails.description,
      });
      setJoinMeetingToastDetails(null);
    }
  }, [joinMeetingToastDetails, toast]);

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

  const handleJoinMeeting = () => {
    if (!displayName.trim()) {
      setPermissionErrorDetails({
        title: "Nom Requis",
        description: "Veuillez entrer votre nom pour participer à la réunion.",
      });
      return;
    }
    setIsInLobby(false);
    setJoinMeetingToastDetails({
      title: "Réunion Rejointe",
      description: `Bienvenue, ${displayName}!`,
    });
  };

  const toggleSidePanel = (panel: 'chat' | 'participants' | 'info') => {
    setActiveSidePanel(current => (current === panel ? null : panel));
  };

  const handleCopyMeetingLink = async () => {
    const link = `${ORIGIN_URL}/${userData.roomName}`;
    try {
      await navigator.clipboard.writeText(link);
      setFeedbackToastDetails({ title: "Lien copié", description: "Le lien de la réunion a été copié dans le presse-papiers." });
    } catch (err) {
      console.error('Failed to copy: ', err);
      setFeedbackToastDetails({ title: "Erreur", description: "Impossible de copier le lien.", variant: "destructive" });
    }
  };

  const handleSendChatMessage = (e: React.FormEvent | React.KeyboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderName: displayName || 'Vous',
      text: chatMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSelf: true,
    };

    setMessages(prevMessages => [...prevMessages, newMessage]);
    setChatMessage('');

    // Simulated response - remove this for actual chat
    if (newMessage.text.toLowerCase() !== "message reçu!") {
        setTimeout(() => {
          const receivedMessage: Message = {
            id: (Date.now() + 1).toString(),
            senderName: 'Daniel MABOA',
            text: 'Message reçu!',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSelf: false,
          };
          setMessages(prevMessages => [...prevMessages, receivedMessage]);
        }, 1000);
    }
  };

  const handleChatInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendChatMessage(e);
    }
  };

  const handlePinMessage = (messageId: string) => {
    setPinnedMessageIds(prevIds => {
      if (prevIds.includes(messageId)) {
        setFeedbackToastDetails({ title: "Message désépinglé", description: "Le message n'est plus épinglé." });
        return prevIds.filter(id => id !== messageId);
      } else {
        setFeedbackToastDetails({ title: "Message épinglé", description: "Le message a été épinglé." });
        return [...prevIds, messageId];
      }
    });
  };

  const handleUnpinMessageFromBanner = (messageId: string) => {
    setPinnedMessageIds(prevIds => prevIds.filter(id => id !== messageId));
    setFeedbackToastDetails({ title: "Message désépinglé", description: "Le message n'est plus épinglé." });
  };

  return (
    <LiveKitRoom
      token={token}
      serverUrl={LIVEKIT_URL!}
      connect={true}
      connectOptions={{
        autoSubscribe: true,
        // Add any other necessary connect options here
      }}
      // Add event handlers for LiveKit room events if needed (e.g., onConnected, onDisconnected)
    >
      {/* LiveKitRoom manages the connection and provides context for hooks */}
      {/* Children components will have access to LiveKit state via hooks */}
      {
        isInLobby ? (
          <LobbyView
            displayName={displayName}
            setDisplayName={setDisplayName}
            handleJoinMeeting={handleJoinMeeting}
          />
        ) : (
          <MeetingLayout
            userVideoRef={userVideoRef} // Passer la référence de la vidéo locale
            displayName={displayName}
            activeSidePanel={activeSidePanel}
            setActiveSidePanel={setActiveSidePanel}
            chatMessage={chatMessage}
            setChatMessage={setChatMessage}
            handleSendChatMessage={handleSendChatMessage}
            handleChatInputKeyDown={handleChatInputKeyDown}
            messages={messages}
            meetingCode={userData.roomName}
            handleCopyMeetingLink={handleCopyMeetingLink}
            // Handlers for meeting controls will be passed down from MeetingLayout
            pinnedMessageIds={pinnedMessageIds}
            handlePinMessage={handlePinMessage}
            handleUnpinMessageFromBanner={handleUnpinMessageFromBanner}
            // featuredParticipantId and handleToggleFeatureParticipant will be managed in MeetingLayout
          />
        )
      }
    </LiveKitRoom>
  );
}

export default function MeetPage() {
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState<string | undefined>(undefined)
  const router = useRouter();
  const searchParams = useSearchParams()
  const { toast } = useToast();
  const code = searchParams.get('code')

  const form = useForm<MeetTokenDataType>({
    defaultValues: {
      roomName: code ?? generateMeetToken(),
      participantName: 'undefined',
      metadata: {
        name: 'undefined',
        handUp: false,
        avatar: undefined,
        role: 'moderator',
        joined: 0
      }
    }
  });

  const handleCheckUser = React.useCallback(async () => {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      consle.log(user)
      if (user.email) {
        form.setValue('participantName', getUserNameFromEmail(user.email))
        form.setValue('metadata.name', getUserNameFromEmail(user.email))
      }
      if (user.user_metadata.avatar_url) form.setValue('metadata.avatar', user.user_metadata.avatar_url)
    }
    const response = await generateMeetTokenAction(form.getValues())
    if (response.success && response.data) {
      setToken(response.data)
    }
    if (!response.success || !response.data) {
      toast({
        variant: "destructive",
        title: "Erreur de génération de token",
        description: response.error ?? "Une erreur est survenue lors de la génération du token.",
        action: <Button onClick={() => router.refresh()}>Réessayer</Button>
      })
      return
    }
    setLoading(false)
  }, [router, form]); // Added form to dependencies

  useEffect(() => {
    if (loading) handleCheckUser();
  }, [loading, handleCheckUser]); // Added dependencies

  if (loading) return (
    <div className='flex h-screen items-center justify-center text-primary'>
      <Loader2 className='animate-spin size-10' />
    </div>
  )

  return (
    <Main {...{ userData: form.getValues(), token: token! }} />
  )
}
