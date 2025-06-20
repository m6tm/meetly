
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Pin, PinOff, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Message } from './types';
import { cn } from "@/lib/utils";

interface ChatContentProps {
  chatMessage: string;
  setChatMessage: (message: string) => void;
  handleSendChatMessage: (e: React.FormEvent | React.KeyboardEvent<HTMLTextAreaElement>) => void;
  handleChatInputKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  displayName: string;
  messages: Message[];
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
      // If current index is out of bounds (e.g., a message was unpinned)
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
      return; // Don't auto-scroll if a message is being highlighted
    }

    // Auto-scroll to bottom for new messages
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      // A threshold to prevent auto-scroll if user has scrolled up significantly
      const threshold = 50; 
      if (scrollHeight - clientHeight <= scrollTop + threshold) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }
  }, [messages, highlightedMessageId]); // Rerun on new messages, unless highlighting

  const scrollToAndHighlightMessage = (messageId: string) => {
    const element = document.getElementById(`message-${messageId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedMessageId(messageId);
      setTimeout(() => {
        setHighlightedMessageId(null);
      }, 5000); // Highlight duration
    }
  };

  return (
    <>
      {displayedPinnedMessage && (
        <div className="p-3 border-b border-gray-700 flex-shrink-0 bg-gray-700/50">
          <div
            className="flex items-start justify-between gap-2 cursor-pointer hover:bg-gray-700/70 rounded p-2 -m-2"
            onClick={() => scrollToAndHighlightMessage(displayedPinnedMessage.id)}
            title="Cliquer pour aller au message"
          >
            <div className="flex-grow">
              <div className="text-xs text-blue-300 mb-1 flex items-center">
                <Pin className="h-3 w-3 mr-1.5" />
                Épinglé par {displayedPinnedMessage.isSelf ? displayName : displayedPinnedMessage.senderName}
              </div>
              <p className="text-sm text-gray-100 whitespace-pre-wrap break-words line-clamp-3">
                {displayedPinnedMessage.text}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white h-7 w-7 flex-shrink-0 self-start"
              onClick={(e) => {
                e.stopPropagation(); 
                handleUnpinMessageFromBanner(displayedPinnedMessage.id);
              }}
              title="Désépingler ce message"
            >
              <PinOff className="h-4 w-4" />
            </Button>
          </div>
          {pinnedMessagesInChat.length > 1 && (
            <div className="flex items-center justify-center mt-2 space-x-2">
              <Button variant="ghost" size="icon" onClick={handlePrevPinned} className="text-gray-300 hover:text-white h-7 w-7">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <span className="text-xs text-gray-400">
                {currentPinnedIndex + 1} / {pinnedMessagesInChat.length}
              </span>
              <Button variant="ghost" size="icon" onClick={handleNextPinned} className="text-gray-300 hover:text-white h-7 w-7">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      )}

      <div
        ref={chatContainerRef}
        className={cn(
          "custom-scrollbar-chat",
          "flex-grow p-3 space-y-2 overflow-y-auto text-sm"
        )}
      >
        {messages.length === 0 && !displayedPinnedMessage && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <MessageCircle className="h-12 w-12 mb-2" />
            <p>Aucun message pour le moment.</p>
            <p className="text-xs">Soyez le premier à envoyer un message !</p>
          </div>
        )}
        {messages.map((msg, index) => {
          const prevMessage = messages[index - 1];
          const showSenderName = !msg.isSelf && (!prevMessage || prevMessage.senderName !== msg.senderName || prevMessage.isSelf);
          const isCurrentlyPinned = pinnedMessageIds.includes(msg.id);

          return (
            <div
              key={msg.id}
              id={`message-${msg.id}`}
              className={cn(
                "flex flex-col w-full group relative transition-all duration-300 py-1",
                msg.isSelf ? "items-end" : "items-start",
                msg.id === highlightedMessageId && "chat-message-highlight-active"
              )}
            >
              {showSenderName && (
                <span className="text-xs text-gray-400 mb-0.5 px-2">
                  {msg.senderName}
                </span>
              )}
              <div
                className={cn(
                  "max-w-[75%] p-2.5 shadow flex items-start gap-1.5", 
                  msg.isSelf
                    ? "bg-blue-600 text-white rounded-l-xl rounded-tr-xl"
                    : "bg-gray-600 text-white rounded-r-xl rounded-tl-xl"
                )}
              >
                {isCurrentlyPinned && (
                  <Pin className="h-3.5 w-3.5 text-yellow-400 flex-shrink-0 self-start mt-1" />
                )}
                <p className="whitespace-pre-wrap break-words flex-grow">{msg.text}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 self-start"
                  onClick={() => handlePinMessage(msg.id)}
                  title={isCurrentlyPinned ? "Désépingler ce message" : "Épingler ce message"}
                >
                  {isCurrentlyPinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                </Button>
              </div>
              <span className={cn("text-xs text-gray-500 mt-1 px-2", msg.isSelf ? "text-right w-full" : "text-left w-full")}>
                {msg.timestamp}
              </span>
            </div>
          );
        })}
      </div>
      <form onSubmit={handleSendChatMessage} className="p-3 border-t border-gray-700 flex-shrink-0">
        <div className="relative flex items-center">
          <Textarea
            placeholder="Envoyer un message"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            onKeyDown={handleChatInputKeyDown}
            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 text-sm rounded-lg p-2.5 pr-12 resize-none min-h-[44px] max-h-[120px] overflow-y-auto block w-full focus:ring-blue-500 focus:border-blue-500"
            rows={1}
          />
          <Button type="submit" variant="ghost" size="icon" className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white" disabled={!chatMessage.trim()}>
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </>
  );
};

export default ChatContent;
