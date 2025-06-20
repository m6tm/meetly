
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import type { Message } from './types';
import { cn } from "@/lib/utils";

interface ChatContentProps {
  chatMessage: string;
  setChatMessage: (message: string) => void;
  handleSendChatMessage: (e: React.FormEvent | React.KeyboardEvent<HTMLTextAreaElement>) => void;
  handleChatInputKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  displayName: string;
  messages: Message[];
}

const ChatContent: React.FC<ChatContentProps> = ({
  chatMessage,
  setChatMessage,
  handleSendChatMessage,
  handleChatInputKeyDown,
  displayName,
  messages,
}) => {
  const chatContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <>
      <div className="p-4 flex-shrink-0">
        <div className="bg-gray-700/70 p-3 rounded-md text-xs text-gray-300">
          <p>Vous pouvez épingler un message pour que les personnes qui rejoindront la réunion plus tard puissent le voir. Si vous quittez l'appel, vous ne pourrez plus accéder à ce chat.</p>
        </div>
      </div>
      <div ref={chatContainerRef} className="flex-grow p-3 space-y-2 overflow-y-auto text-sm">
        {messages.map((msg, index) => {
          const prevMessage = messages[index - 1];
          const showSenderName = !msg.isSelf && (!prevMessage || prevMessage.senderName !== msg.senderName || prevMessage.isSelf);
          
          return (
            <div
              key={msg.id}
              className={cn(
                "flex flex-col w-full",
                msg.isSelf ? "items-end" : "items-start"
              )}
            >
              {showSenderName && (
                <span className="text-xs text-gray-400 mb-0.5 px-2">
                  {msg.senderName}
                </span>
              )}
              <div
                className={cn(
                  "max-w-[75%] p-2.5 shadow",
                  msg.isSelf
                    ? "bg-blue-600 text-white rounded-l-xl rounded-tr-xl"
                    : "bg-gray-600 text-white rounded-r-xl rounded-tl-xl"
                )}
              >
                <p className="whitespace-pre-wrap break-words">{msg.text}</p>
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
