
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from "@/lib/utils";

interface SidePanelContainerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const SidePanelContainer: React.FC<SidePanelContainerProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  return (
    <div className={cn(
        "absolute top-0 right-0 bottom-16 w-full max-w-xs sm:max-w-sm bg-gray-800/95 backdrop-blur-sm p-0 flex flex-col transition-transform duration-300 ease-in-out z-30 border-l border-gray-700",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="p-4 border-b border-gray-700 flex items-center justify-between flex-shrink-0">
          <h3 className="text-lg font-medium text-white">{title}</h3>
          <Button onClick={onClose} variant="ghost" size="icon" className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </Button>
        </div>
        {children}
    </div>
  );
};

export default SidePanelContainer;

