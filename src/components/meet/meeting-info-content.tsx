
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Copy, Phone } from 'lucide-react';

interface MeetingInfoContentProps {
  meetingCode: string;
  handleCopyMeetingLink: () => void;
}

const ORIIN_URL = process.env.NEXT_PUBLIC_APP_URL

const MeetingInfoContent: React.FC<MeetingInfoContentProps> = ({
  meetingCode,
  handleCopyMeetingLink,
}) => {
  return (
    <div className="flex-grow p-3 sm:p-4 space-y-3 sm:space-y-4 text-xs sm:text-sm overflow-y-auto text-white">
      <h4 className="font-semibold text-gray-300">Informations de connexion</h4>
      <p className="break-all text-gray-200 text-xs sm:text-sm">{`${ORIIN_URL}`}/meet/{meetingCode}</p>
      <Button 
        variant="ghost" 
        className="w-full border border-gray-600 hover:bg-gray-700 text-gray-200 hover:text-white h-9 sm:h-10 text-xs sm:text-sm" 
        onClick={handleCopyMeetingLink}
      >
        <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" /> Copier l'adresse
      </Button>
      <Separator className="my-3 sm:my-4 bg-gray-700" />
      <p className="text-xs sm:text-sm text-gray-400">Les pièces jointes s'affichent ici.</p>
    </div>
  );
};

export default MeetingInfoContent;
