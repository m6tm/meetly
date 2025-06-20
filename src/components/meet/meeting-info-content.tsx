
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Copy, Phone } from 'lucide-react';

interface MeetingInfoContentProps {
  meetingCode: string;
  handleCopyMeetingLink: () => void;
}

const MeetingInfoContent: React.FC<MeetingInfoContentProps> = ({
  meetingCode,
  handleCopyMeetingLink,
}) => {
  return (
    <div className="flex-grow p-4 space-y-4 text-sm overflow-y-auto text-white">
      <h4 className="font-semibold text-gray-300">Informations de connexion</h4>
      <p className="break-all text-gray-200">https://meet.example.com/{meetingCode}</p>
      <Button variant="outline" className="w-full border-gray-600 hover:bg-gray-700 text-gray-200 hover:text-white" onClick={handleCopyMeetingLink}>
        <Copy className="h-4 w-4 mr-2" /> Copier l'adresse
      </Button>
      <Separator className="my-4 bg-gray-700" />
      <p className="text-sm text-gray-400">Les pièces jointes Google Agenda s'affichent ici (fonctionnalité à venir).</p>
      <p className="text-sm text-gray-400">Appelez le : (ZA) +27 10 823 0320</p>
      <p className="text-sm text-gray-400">Code : 720 887 903 7626#</p>
      <Button variant="link" className="p-0 text-blue-400 hover:text-blue-300 flex items-center">
        <Phone className="h-4 w-4 mr-2" /> Autres numéros de téléphone
      </Button>
    </div>
  );
};

export default MeetingInfoContent;

