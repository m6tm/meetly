'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

import LobbyView from '@/components/meet/lobby-view';
import MeetingLayout from '@/components/meet/meeting-layout';
import type { Participant, Message } from '@/components/meet/types';

const initialParticipantsData: Participant[] = [
  { id: 'p2', name: 'Daniel MABOA', avatarFallback: 'DM', isRemote: true, avatarUrl: 'https://placehold.co/100x100.png', isVideoOff: false },
  { id: 'p3', name: 'Chloé Dubois', avatarFallback: 'CD', isRemote: true, avatarUrl: 'https://placehold.co/100x100.png', isVideoOff: true },
  { id: 'p4', name: 'Alexandre Petit', avatarFallback: 'AP', isRemote: true, avatarUrl: 'https://placehold.co/100x100.png', isVideoOff: false },
  { id: 'p5', name: 'Sofia Rossi', avatarFallback: 'SR', isRemote: true, avatarUrl: 'https://placehold.co/100x100.png', isVideoOff: true },
  { id: 'p6', name: 'Liam Smith', avatarFallback: 'LS', isRemote: true, avatarUrl: 'https://placehold.co/100x100.png', isVideoOff: false },
  { id: 'p7', name: 'Olivia Brown', avatarFallback: 'OB', isRemote: true, avatarUrl: 'https://placehold.co/100x100.png', isVideoOff: true },
  { id: 'p8', name: 'Noah Garcia', avatarFallback: 'NG', isRemote: true, avatarUrl: 'https://placehold.co/100x100.png', isVideoOff: false },
  { id: 'p9', name: 'Emma Wilson', avatarFallback: 'EW', isRemote: true, avatarUrl: 'https://placehold.co/100x100.png', isVideoOff: false },
  { id: 'p10', name: 'James Johnson', avatarFallback: 'JJ', isRemote: true, avatarUrl: 'https://placehold.co/100x100.png', isVideoOff: true },
  { id: 'p11', name: 'Isabella Martinez', avatarFallback: 'IM', isRemote: true, avatarUrl: 'https://placehold.co/100x100.png', isVideoOff: false },
  { id: 'p12', name: 'William Anderson', avatarFallback: 'WA', isRemote: true, avatarUrl: 'https://placehold.co/100x100.png', isVideoOff: true },
  { id: 'p13', name: 'Sophia Thomas', avatarFallback: 'ST', isRemote: true, avatarUrl: 'https://placehold.co/100x100.png', isVideoOff: false },
  { id: 'p14', name: 'Logan Jackson', avatarFallback: 'LJ', isRemote: true, avatarUrl: 'https://placehold.co/100x100.png', isVideoOff: true },
  { id: 'p15', name: 'Ava White', avatarFallback: 'AW', isRemote: true, avatarUrl: 'https://placehold.co/100x100.png', isVideoOff: false },
  { id: 'p16', name: 'Lucas Taylor', avatarFallback: 'LT', isRemote: true, avatarUrl: 'https://placehold.co/100x100.png', isVideoOff: true },
  { id: 'p17', name: 'Mia Moore', avatarFallback: 'MM', isRemote: true, avatarUrl: 'https://placehold.co/100x100.png', isVideoOff: false },
  { id: 'p18', name: 'Ethan Lee', avatarFallback: 'EL', isRemote: true, avatarUrl: 'https://placehold.co/100x100.png', isVideoOff: true },
  { id: 'p19', name: 'Chloe King', avatarFallback: 'CK', isRemote: true, avatarUrl: 'https://placehold.co/100x100.png', isVideoOff: false },
  { id: 'p20', name: 'Benjamin Wright', avatarFallback: 'BW', isRemote: true, avatarUrl: 'https://placehold.co/100x100.png', isVideoOff: false },
  { id: 'p21', name: 'Harper Scott', avatarFallback: 'HS', isRemote: true, avatarUrl: 'https://placehold.co/100x100.png', isVideoOff: true },
  { id: 'p22', name: 'Elijah Green', avatarFallback: 'EG', isRemote: true, avatarUrl: 'https://placehold.co/100x100.png', isVideoOff: false },
  { id: 'p23', name: 'Abigail Adams', avatarFallback: 'AA', isRemote: true, avatarUrl: 'https://placehold.co/100x100.png', isVideoOff: true },
  { id: 'p24', name: 'Henry Baker', avatarFallback: 'HB', isRemote: true, avatarUrl: 'https://placehold.co/100x100.png', isVideoOff: false },
  { id: 'p25', name: 'Ella Carter', avatarFallback: 'EC', isRemote: true, avatarUrl: 'https://placehold.co/100x100.png', isVideoOff: true },
];


function Main() {
  const [isInLobby, setIsInLobby] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const lobbyVideoRef = useRef<HTMLVideoElement>(null);
  const userVideoRef = useRef<HTMLVideoElement>(null);
  
  const [lobbyIsMuted, setLobbyIsMuted] = useState(false);
  const [lobbyIsVideoOff, setLobbyIsVideoOff] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  
  const [activeSidePanel, setActiveSidePanel] = useState<'chat' | 'participants' | 'info' | null>(null);
  
  const { toast } = useToast();
  const router = useRouter();
  const [currentTimeState, setCurrentTimeState] = useState('20:11'); 
  const meetingCode = 'zom-ygez-wrc'; 
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [pinnedMessageIds, setPinnedMessageIds] = useState<string[]>([]);
  
  const [permissionErrorDetails, setPermissionErrorDetails] = useState<{ title: string, description: string } | null>(null);
  const [joinMeetingToastDetails, setJoinMeetingToastDetails] = useState<{ title: string, description: string } | null>(null);
  const [participants, setParticipants] = useState<Participant[]>(initialParticipantsData);
  const [feedbackToastDetails, setFeedbackToastDetails] = useState<{ title: string, description?: string, variant?: "default" | "destructive" } | null>(null);

  const [featuredParticipantId, setFeaturedParticipantId] = useState<string | null>(null);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (!isInLobby && hasCameraPermission === true && !localStream) {
      let active = true;
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          if (active) {
            setLocalStream(stream);
          } else {
            stream.getTracks().forEach(track => track.stop());
          }
        })
        .catch(error => {
          console.error('Error accessing camera/mic for meeting:', error);
          if (active) {
            setHasCameraPermission(false);
            setPermissionErrorDetails({
              title: 'Accès aux appareils refusé',
              description: 'Veuillez activer les permissions pour la caméra et le microphone.',
            });
          }
        });
      return () => {
        active = false;
        if (localStream) {
            setLocalStream(currentStream => {
                if (currentStream) {
                    currentStream.getTracks().forEach(track => track.stop());
                }
                return null;
            });
        }
      };
    } else if (isInLobby && localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
  }, [isInLobby, hasCameraPermission, localStream]);

  useEffect(() => {
    if (localStream && userVideoRef.current) {
      if (userVideoRef.current.srcObject !== localStream) {
        userVideoRef.current.srcObject = localStream;
      }
      localStream.getAudioTracks().forEach(track => track.enabled = !isMuted);
      localStream.getVideoTracks().forEach(track => track.enabled = !isVideoOff);
    } else if (!localStream && userVideoRef.current) {
      userVideoRef.current.srcObject = null;
    }
  }, [localStream, userVideoRef, isMuted, isVideoOff]);

  useEffect(() => {
    let lobbyStreamInstance: MediaStream | null = null;
    const setupLobbyStream = async () => {
      if (isInLobby) { 
        if (hasCameraPermission === false) return; 

        try {
          lobbyStreamInstance = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          if (hasCameraPermission === null) setHasCameraPermission(true); 

          if (lobbyVideoRef.current) {
            lobbyVideoRef.current.srcObject = lobbyStreamInstance;
            lobbyStreamInstance.getAudioTracks().forEach(track => track.enabled = !lobbyIsMuted);
            lobbyStreamInstance.getVideoTracks().forEach(track => track.enabled = !lobbyIsVideoOff);
          }
        } catch (error) {
          console.error('Error accessing camera/mic for lobby:', error);
          if (hasCameraPermission !== true) { 
             setHasCameraPermission(false);
             setPermissionErrorDetails({
                title: 'Accès aux appareils refusé (Salle d\'attente)',
                description: 'Veuillez activer les permissions pour la caméra et le microphone.',
             });
          }
        }
      }
    };
    setupLobbyStream();
    return () => {
      if (lobbyStreamInstance) {
        lobbyStreamInstance.getTracks().forEach(track => track.stop());
      }
      if (lobbyVideoRef.current && lobbyVideoRef.current.srcObject === lobbyStreamInstance) {
        lobbyVideoRef.current.srcObject = null;
      }
    };
  }, [isInLobby, lobbyIsMuted, lobbyIsVideoOff, hasCameraPermission]);

  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    }
  }, [localStream]);


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
    if (hasCameraPermission !== true) {
        setPermissionErrorDetails({
            title: "Permissions requises",
            description: "Veuillez autoriser l'accès à la caméra et au microphone pour rejoindre la réunion."
        });
        return;
    }

    setIsMuted(lobbyIsMuted); 
    setIsVideoOff(lobbyIsVideoOff); 
    setIsInLobby(false); 
    setJoinMeetingToastDetails({
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
    setFeedbackToastDetails({ title: newMutedState ? "Microphone coupé (Salle d'attente)" : "Microphone activé (Salle d'attente)" });
  };

  const handleLobbyToggleVideo = () => {
    const newVideoOffState = !lobbyIsVideoOff;
    setLobbyIsVideoOff(newVideoOffState);
    if (lobbyVideoRef.current && lobbyVideoRef.current.srcObject) {
        const stream = lobbyVideoRef.current.srcObject as MediaStream;
        stream.getVideoTracks().forEach(track => track.enabled = !newVideoOffState);
    }
    setFeedbackToastDetails({ title: newVideoOffState ? "Vidéo désactivée (Salle d'attente)" : "Vidéo activée (Salle d'attente)" });
  };

  const handleToggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    setFeedbackToastDetails({ title: newMutedState ? "Microphone coupé" : "Microphone activé" });
  };

  const handleToggleVideo = () => {
    const newVideoOffState = !isVideoOff;
    setIsVideoOff(newVideoOffState);
    setFeedbackToastDetails({ title: newVideoOffState ? "Vidéo désactivée" : "Vidéo activée" });
  };
  
  const handleToggleFeatureParticipant = (participantId: string) => {
    const currentlyFeatured = featuredParticipantId === participantId;
    setFeaturedParticipantId(currentId => (currentId === participantId ? null : participantId));
    
    if (currentlyFeatured) {
      setFeedbackToastDetails({ title: "Returned to Gallery View" });
    } else {
      const allCurrentParticipants = [
        { id: 'local-user', name: displayName || "You", isRemote: false, avatarFallback: displayName?.charAt(0).toUpperCase() || "Y" },
        ...participants
      ];
      const participantToFeature = allCurrentParticipants.find(p => p.id === participantId);
      setFeedbackToastDetails({ title: `${participantToFeature?.name || 'Participant'} is now featured` });
    }
  };

  const handleShareScreen = () => setFeedbackToastDetails({ title: "Partage d'écran", description: "Partage d'écran démarré (simulé)." });
  
  const handleRaiseHand = () => {
    const newHandRaisedState = !isHandRaised;
    setIsHandRaised(newHandRaisedState);
    setFeedbackToastDetails({ title: newHandRaisedState ? "Main levée" : "Main baissée" });
  };
  
  const handleEndCall = () => {
    setFeedbackToastDetails({ title: "Appel Terminé", description: "Vous avez quitté la réunion.", variant: "destructive" });
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
    }
    router.push('/'); 
  };

  const toggleSidePanel = (panel: 'chat' | 'participants' | 'info') => {
    setActiveSidePanel(current => (current === panel ? null : panel));
  };

  const handleCopyMeetingLink = async () => {
    const link = `https://meet.example.com/${meetingCode}`;
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
      isUserHandRaised={isHandRaised}
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
      handleEndCall={handleEndCall}
      pinnedMessageIds={pinnedMessageIds}
      handlePinMessage={handlePinMessage}
      handleUnpinMessageFromBanner={handleUnpinMessageFromBanner}
      featuredParticipantId={featuredParticipantId}
      handleToggleFeatureParticipant={handleToggleFeatureParticipant}
    />
  );
}

export default function MeetPage() {
  return (
    <Main />
  )
}
