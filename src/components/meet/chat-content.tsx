
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';

interface ChatContentProps {
  chatMessage: string;
  setChatMessage: (message: string) => void;
  handleSendChatMessage: (e: React.FormEvent | React.KeyboardEvent<HTMLTextAreaElement>) => void;
  handleChatInputKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  displayName: string; // To show who is typing or for dummy messages
}

const ChatContent: React.FC<ChatContentProps> = ({
  chatMessage,
  setChatMessage,
  handleSendChatMessage,
  handleChatInputKeyDown,
  displayName,
}) => {
  // Dummy messages for display
  const messages = [
    { id: '1', sender: 'Alice', text: 'Bonjour à tous ! Prêts pour la discussion ?' },
    { id: '2', sender: displayName || 'Vous', text: 'Salut Alice ! Oui, impatient.' },
  ];

  return (
    <>
      <div className="p-4 flex-shrink-0">
        <div className="bg-gray-700/70 p-3 rounded-md text-xs text-gray-300">
          <p>Vous pouvez épingler un message pour que les personnes qui rejoindront la réunion plus tard puissent le voir. Si vous quittez l'appel, vous ne pourrez plus accéder à ce chat.</p>
        </div>
      </div>
      <div className="flex-grow p-3 space-y-3 overflow-y-auto text-sm text-white">
        {messages.map((msg) => (
          <p key={msg.id}><span className={`font-semibold ${msg.sender === (displayName || 'Vous') ? 'text-green-400' : 'text-blue-400'}`}>{msg.sender}:</span> {msg.text}</p>
        ))}
      </div>
      <form onSubmit={handleSendChatMessage} className="p-3 border-t border-gray-700 flex-shrink-0">
        <div className="relative flex items-center">
          <Textarea
            placeholder="Envoyer un message"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            onKeyDown={handleChatInputKeyDown}
            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 text-sm rounded-lg p-2 pr-12 resize-none min-h-[40px] max-h-[120px] overflow-y-auto block w-full"
            rows={1}
          />
          <Button type="submit" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white" disabled={!chatMessage.trim()}>
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </>
  );
};

export default ChatContent;
