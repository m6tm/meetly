
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

import LobbyView from '@/components/meet/lobby-view';
import MeetingLayout from '@/components/meet/meeting-layout';
import type { Participant, Message } from '@/components/meet/types';

const initialParticipantsData: Participant[] = [
  { id: 'p2', name: 'Daniel MABOA', avatarFallback: 'DM', isRemote: true, avatarUrl: 'https://placehold.co/100x100.png' },
];


export default function MeetPage() {
  const [isInLobby, setIsInLobby] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const lobbyVideoRef = useRef<HTMLVideoElement>(null);
  const userVideoRef = useRef<HTMLVideoElement>(null);
  
  const [lobbyIsMuted, setLobbyIsMuted] = useState(false);
  const [lobbyIsVideoOff, setLobbyIsVideoOff] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  const [activeSidePanel, setActiveSidePanel] = useState<'chat' | 'participants' | 'info' | null>(null);
  
  const { toast } = useToast();
  const router = useRouter();
  const [currentTimeState, setCurrentTimeState] = useState('20:11'); 
  const meetingCode = 'zom-ygez-wrc'; 
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<Participant[]>(initialParticipantsData);
  const [pinnedMessageId, setPinnedMessageId] = useState<string | null>(null);


  useEffect(() => {
    let streamInstance: MediaStream | null = null;

    const getCameraAndMicPermission = async (
      videoElementRef: React.RefObject<HTMLVideoElement>,
      useMutedConfig: boolean,
      useVideoOffConfig: boolean
    ) => {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
        setHasCameraPermission(false);
        console.warn("MediaDevices API not available.");
        return null;
      }
      try {
        streamInstance = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setHasCameraPermission(true);
        if (videoElementRef.current) {
          videoElementRef.current.srcObject = streamInstance;
          streamInstance.getAudioTracks().forEach(track => track.enabled = !useMutedConfig);
          streamInstance.getVideoTracks().forEach(track => track.enabled = !useVideoOffConfig);
        }
        return streamInstance;
      } catch (error) {
        console.error('Error accessing camera/mic:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Accès aux appareils refusé',
          description: 'Veuillez activer les permissions pour la caméra et le microphone dans les paramètres de votre navigateur.',
        });
        return null;
      }
    };

    if (isInLobby) {
      getCameraAndMicPermission(lobbyVideoRef, lobbyIsMuted, lobbyIsVideoOff);
    } else if (userVideoRef.current && !isVideoOff && hasCameraPermission !== false) {
       getCameraAndMicPermission(userVideoRef, isMuted, isVideoOff);
    }


    return () => {
      if (streamInstance) {
        streamInstance.getTracks().forEach(track => track.stop());
      }
      if (lobbyVideoRef.current) lobbyVideoRef.current.srcObject = null;
      if (userVideoRef.current) userVideoRef.current.srcObject = null;
    };
  }, [isInLobby, isVideoOff, isMuted, lobbyIsVideoOff, lobbyIsMuted, toast, hasCameraPermission]); 


  const handleJoinMeeting = () => {
    if (!displayName.trim()) {
      toast({
        title: "Nom Requis",
        description: "Veuillez entrer votre nom pour participer à la réunion.",
        variant: "destructive",
      });
      return;
    }
    setIsMuted(lobbyIsMuted); 
    setIsVideoOff(lobbyIsVideoOff); 
    setIsInLobby(false);
    toast({
      title: "Réunion Rejointe",
      description: `Bienvenue, ${displayName}!`,
    });
  };

  const handleLobbyToggleMute = () => {
    const newMutedState = !lobbyIsMuted;
    setLobbyIsMuted(newMutedState);
    if (lobbyVideoRef.current && lobbyVideoRef.current.srcObject) {
        const stream = lobbyVideoRef.current.srcObject as MediaStream;
        stream.getAudioTracks().forEach(track => track.enabled = !newMutedState);
    }
    toast({ title: newMutedState ? "Microphone coupé (Salle d'attente)" : "Microphone activé (Salle d'attente)" });
  };

  const handleLobbyToggleVideo = () => {
    const newVideoOffState = !lobbyIsVideoOff;
    setLobbyIsVideoOff(newVideoOffState);
    if (lobbyVideoRef.current && lobbyVideoRef.current.srcObject) {
        const stream = lobbyVideoRef.current.srcObject as MediaStream;
        stream.getVideoTracks().forEach(track => track.enabled = !newVideoOffState);
    }
    toast({ title: newVideoOffState ? "Vidéo désactivée (Salle d'attente)" : "Vidéo activée (Salle d'attente)" });
  };

  const handleToggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    if (userVideoRef.current && userVideoRef.current.srcObject) {
      const stream = userVideoRef.current.srcObject as MediaStream;
      stream.getAudioTracks().forEach(track => track.enabled = !newMutedState);
    }
    toast({ title: newMutedState ? "Microphone coupé" : "Microphone activé" });
  };

  const handleToggleVideo = () => {
    const newVideoOffState = !isVideoOff;
    setIsVideoOff(newVideoOffState);
     if (userVideoRef.current && userVideoRef.current.srcObject) {
      const stream = userVideoRef.current.srcObject as MediaStream;
      stream.getVideoTracks().forEach(track => track.enabled = !newVideoOffState);
    }
    toast({ title: newVideoOffState ? "Vidéo désactivée" : "Vidéo activée" });
  };

  const handleShareScreen = () => toast({ title: "Partage d'écran", description: "Partage d'écran démarré (simulé)." });
  const handleRaiseHand = () => toast({ title: "Lever la main", description: "Vous avez levé la main." });
  const handleMoreOptions = () => toast({ title: "Plus d'options", description: "Fonctionnalité non implémentée." });
  
  const handleEndCall = () => {
    toast({ title: "Appel Terminé", description: "Vous avez quitté la réunion.", variant: "destructive" });
    router.push('/'); 
  };

  const toggleSidePanel = (panel: 'chat' | 'participants' | 'info') => {
    setActiveSidePanel(current => (current === panel ? null : panel));
  };

  const handleCopyMeetingLink = () => {
    const link = `https://meet.example.com/${meetingCode}`;
    navigator.clipboard.writeText(link)
      .then(() => toast({ title: "Lien copié", description: "Le lien de la réunion a été copié dans le presse-papiers." }))
      .catch(err => {
        console.error('Failed to copy: ', err);
        toast({ title: "Erreur", description: "Impossible de copier le lien.", variant: "destructive" });
      });
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
      isPinned: false,
    };

    setMessages(prevMessages => [...prevMessages, newMessage]);
    setChatMessage('');

    // Simulate receiving a message after a short delay for demo
    if (newMessage.text.toLowerCase() !== "message reçu!") { // Avoid loop
        setTimeout(() => {
          const receivedMessage: Message = {
            id: (Date.now() + 1).toString(),
            senderName: 'Daniel MABOA',
            text: 'Message reçu!',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSelf: false,
            isPinned: false,
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
    setPinnedMessageId(messageId);
    // Optionally, update the messages array to mark isPinned, though `pinnedMessageId` is the source of truth
    setMessages(prevMessages => 
      prevMessages.map(msg => 
        msg.id === messageId ? { ...msg, isPinned: true } : { ...msg, isPinned: false }
      )
    );
    toast({ title: "Message épinglé", description: "Le message a été épinglé en haut du chat." });
  };

  const handleUnpinMessage = () => {
    setMessages(prevMessages => 
      prevMessages.map(msg => 
        msg.id === pinnedMessageId ? { ...msg, isPinned: false } : msg
      )
    );
    setPinnedMessageId(null);
    toast({ title: "Message désépinglé", description: "Le message n'est plus épinglé." });
  };


  if (isInLobby) {
    return (
      <LobbyView
        displayName={displayName}
        setDisplayName={setDisplayName}
        lobbyVideoRef={lobbyVideoRef}
        lobbyIsMuted={lobbyIsMuted}
        lobbyIsVideoOff={lobbyIsVideoOff}
        hasCameraPermission={hasCameraPermission}
        handleLobbyToggleMute={handleLobbyToggleMute}
        handleLobbyToggleVideo={handleLobbyToggleVideo}
        handleJoinMeeting={handleJoinMeeting}
      />
    );
  }

  return (
    <MeetingLayout
      userVideoRef={userVideoRef}
      displayName={displayName}
      isUserVideoOff={isVideoOff}
      isUserMuted={isMuted}
      hasCameraPermission={hasCameraPermission}
      remoteParticipants={participants}
      activeSidePanel={activeSidePanel}
      setActiveSidePanel={setActiveSidePanel}
      chatMessage={chatMessage}
      setChatMessage={setChatMessage}
      handleSendChatMessage={handleSendChatMessage}
      handleChatInputKeyDown={handleChatInputKeyDown}
      messages={messages}
      meetingCode={meetingCode}
      handleCopyMeetingLink={handleCopyMeetingLink}
      currentTimeState={currentTimeState}
      handleToggleMute={handleToggleMute}
      handleToggleVideo={handleToggleVideo}
      handleShareScreen={handleShareScreen}
      handleRaiseHand={handleRaiseHand}
      handleMoreOptions={handleMoreOptions}
      handleEndCall={handleEndCall}
      pinnedMessageId={pinnedMessageId}
      handlePinMessage={handlePinMessage}
      handleUnpinMessage={handleUnpinMessage}
    />
  );
}

