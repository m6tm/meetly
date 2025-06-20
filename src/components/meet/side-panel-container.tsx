
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
  className?: string;
}

const SidePanelContainer: React.FC<SidePanelContainerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className,
}) => {
  return (
    <div className={cn(
        "absolute top-0 right-0 bottom-16 bg-gray-800/95 backdrop-blur-sm p-0 flex flex-col transition-transform duration-300 ease-in-out z-30 border-l border-gray-700",
        // Removed conflicting height classes (e.g., h-full, md:h-auto, md:bottom-0).
        // Relies on top-0 and bottom-16 to define its vertical span correctly above the ControlsBar.
        isOpen ? "translate-x-0" : "translate-x-full",
        className
      )}>
        <div className="p-3 sm:p-4 border-b border-gray-700 flex items-center justify-between flex-shrink-0">
          <h3 className="text-md sm:text-lg font-medium text-white">{title}</h3>
          <Button onClick={onClose} variant="ghost" size="icon" className="text-gray-400 hover:text-white h-7 w-7 sm:h-8 sm:w-8">
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
        {children}
    </div>
  );
};

export default SidePanelContainer;
