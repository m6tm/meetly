
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Pin, PinOff, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";
import { MeetlyReceivedChatMessage } from './types';
import { getParticipantName } from '@/lib/meetly-tools';

interface ChatContentProps {
  chatMessage: string;
  setChatMessage: (message: string) => void;
  handleSendChatMessage: (e: React.FormEvent | React.KeyboardEvent<HTMLTextAreaElement>) => void;
  handleChatInputKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  displayName: string;
  messages: MeetlyReceivedChatMessage[];
  pinnedMessageIds: string[];
  handlePinMessage: (messageId: string) => void;
  handleUnpinMessageFromBanner: (messageId: string) => void;
}

const ChatContent: React.FC<ChatContentProps> = ({
  chatMessage,
  setChatMessage,
  handleSendChatMessage,
  handleChatInputKeyDown,
  displayName,
  messages,
  pinnedMessageIds,
  handlePinMessage,
  handleUnpinMessageFromBanner,
}) => {
  const chatContainerRef = React.useRef<HTMLDivElement>(null);
  const [highlightedMessageId, setHighlightedMessageId] = React.useState<string | null>(null);
  
  const pinnedMessagesInChat = messages.filter(msg => pinnedMessageIds.includes(msg.id));
  const [currentPinnedIndex, setCurrentPinnedIndex] = React.useState(0);

  React.useEffect(() => {
    if (pinnedMessagesInChat.length === 0) {
      setCurrentPinnedIndex(0);
    } else if (currentPinnedIndex >= pinnedMessagesInChat.length) {
      setCurrentPinnedIndex(Math.max(0, pinnedMessagesInChat.length - 1));
    }
  }, [pinnedMessagesInChat, currentPinnedIndex]);

  const displayedPinnedMessage = pinnedMessagesInChat.length > 0 ? pinnedMessagesInChat[currentPinnedIndex] : null;

  const handlePrevPinned = () => {
    setCurrentPinnedIndex(prev => (prev - 1 + pinnedMessagesInChat.length) % pinnedMessagesInChat.length);
  };

  const handleNextPinned = () => {
    setCurrentPinnedIndex(prev => (prev + 1) % pinnedMessagesInChat.length);
  };

  React.useEffect(() => {
    if (highlightedMessageId) {
      return; 
    }
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const threshold = 50; 
      if (scrollHeight - clientHeight <= scrollTop + threshold) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }
  }, [messages, highlightedMessageId]);

  const scrollToAndHighlightMessage = (messageId: string) => {
    const element = document.getElementById(`message-${messageId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedMessageId(messageId);
      setTimeout(() => {
        setHighlightedMessageId(null);
      }, 5000); 
    }
  };

  return (
    <>
      {displayedPinnedMessage && (
        <div className="p-2 sm:p-3 border-b border-gray-700 flex-shrink-0 bg-gray-700/50">
          <div
            className="flex items-start justify-between gap-2 cursor-pointer hover:bg-gray-700/70 rounded p-1.5 sm:p-2 -m-1.5 sm:-m-2"
            onClick={() => scrollToAndHighlightMessage(displayedPinnedMessage.id)}
            title="Cliquer pour aller au message"
          >
            <div className="flex-grow min-w-0">
              <div className="text-xs text-blue-300 mb-0.5 sm:mb-1 flex items-center">
                <Pin className="h-3 w-3 mr-1 sm:mr-1.5" />
                Écrit par {displayedPinnedMessage.from && getParticipantName(displayedPinnedMessage.from)}
              </div>
              <p className="text-xs sm:text-sm text-gray-100 whitespace-pre-wrap break-words line-clamp-2 sm:line-clamp-3">
                {displayedPinnedMessage.message.text}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white h-6 w-6 sm:h-7 sm:w-7 flex-shrink-0 self-start"
              onClick={(e) => {
                e.stopPropagation(); 
                handleUnpinMessageFromBanner(displayedPinnedMessage.id);
              }}
              title="Désépingler ce message"
            >
              <PinOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </div>
          {pinnedMessagesInChat.length > 1 && (
            <div className="flex items-center justify-center mt-1.5 sm:mt-2 space-x-1 sm:space-x-2">
              <Button variant="ghost" size="icon" onClick={handlePrevPinned} className="text-gray-300 hover:text-white h-6 w-6 sm:h-7 sm:w-7">
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <span className="text-xs text-gray-400">
                {currentPinnedIndex + 1} / {pinnedMessagesInChat.length}
              </span>
              <Button variant="ghost" size="icon" onClick={handleNextPinned} className="text-gray-300 hover:text-white h-6 w-6 sm:h-7 sm:w-7">
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          )}
        </div>
      )}

      <div
        ref={chatContainerRef}
        className={cn(
          "custom-scrollbar-chat",
          "flex-grow p-2 sm:p-3 space-y-1.5 sm:space-y-2 overflow-y-auto text-sm"
        )}
      >
        {messages.length === 0 && !displayedPinnedMessage && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
            <MessageCircle className="h-10 w-10 sm:h-12 sm:w-12 mb-2" />
            <p className="text-xs sm:text-sm">Aucun message pour le moment.</p>
            <p className="text-xs text-gray-400">Soyez le premier à envoyer un message !</p>
          </div>
        )}
        {messages.map((msg, index) => {
          const prevMessage = messages[index - 1];
          const showSenderName = (!msg.from || !msg.from.isLocal) && (!prevMessage || (prevMessage && prevMessage.from && msg.from && getParticipantName(prevMessage.from) !== getParticipantName(msg.from)) || (prevMessage.from && prevMessage.from.isLocal));
          const isCurrentlyPinned = pinnedMessageIds.includes(msg.id);

          return (
            <div
              key={msg.id}
              id={`message-${msg.id}`}
              className={cn(
                "flex flex-col w-full group relative transition-all duration-300 py-0.5 sm:py-1",
                msg.message.isSelf ? "items-end" : "items-start",
                msg.id === highlightedMessageId && "chat-message-highlight-active"
              )}
            >
              {showSenderName && (
                <span className="text-xs text-gray-400 mb-0.5 px-1.5 sm:px-2">
                  {msg.from && getParticipantName(msg.from)}
                </span>
              )}
              <div
                className={cn(
                  "max-w-[80%] sm:max-w-[75%] p-2 sm:p-2.5 shadow flex items-start gap-1 sm:gap-1.5", 
                  msg.message.isSelf
                    ? "bg-blue-600 text-white rounded-l-lg sm:rounded-l-xl rounded-tr-lg sm:rounded-tr-xl"
                    : "bg-gray-600 text-white rounded-r-lg sm:rounded-r-xl rounded-tl-lg sm:rounded-tl-xl"
                )}
              >
                {isCurrentlyPinned && (
                  <Pin className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-yellow-400 flex-shrink-0 self-start mt-0.5 sm:mt-1" />
                )}
                <p className="whitespace-pre-wrap break-words flex-grow text-xs sm:text-sm">{msg.message.text}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white h-4 w-4 sm:h-5 sm:w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 self-start"
                  onClick={() => handlePinMessage(msg.id)}
                  title={isCurrentlyPinned ? "Désépingler ce message" : "Épingler ce message"}
                >
                  {isCurrentlyPinned ? <PinOff className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> : <Pin className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
                </Button>
              </div>
              <span className={cn("text-xs text-gray-500 mt-0.5 sm:mt-1 px-1.5 sm:px-2", msg.message.isSelf ? "text-right w-full" : "text-left w-full")}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}
      </div>
      <form onSubmit={handleSendChatMessage} className="p-2 sm:p-3 border-t border-gray-700 flex-shrink-0">
        <div className="relative flex items-center">
          <Textarea
            placeholder="Envoyer un message"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            onKeyDown={handleChatInputKeyDown}
            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 text-xs sm:text-sm rounded-md sm:rounded-lg p-2 pr-10 sm:p-2.5 sm:pr-12 resize-none min-h-[40px] sm:min-h-[44px] max-h-[100px] sm:max-h-[120px] overflow-y-auto block w-full focus:ring-blue-500 focus:border-blue-500"
            rows={1}
          />
          <Button type="submit" variant="ghost" size="icon" className="absolute right-1 sm:right-1.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white h-7 w-7 sm:h-8 sm:w-8" disabled={!chatMessage.trim()}>
            <Send className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </form>
    </>
  );
};

export default ChatContent;
