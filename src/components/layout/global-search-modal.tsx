
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Home, Briefcase, Clapperboard, ClipboardList, BarChart3, Users, Settings, Search, CornerDownLeft } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';

interface SearchItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  keywords?: string[];
}

const allSearchItems: SearchItem[] = [
  { id: 'home', label: 'Dashboard Home', path: '/dashboard', icon: Home, keywords: ['overview', 'main'] },
  { id: 'meetings', label: 'Meetings', path: '/dashboard/meetings', icon: Briefcase, keywords: ['schedule', 'calendar', 'events'] },
  { id: 'recordings', label: 'Recordings', path: '/dashboard/recordings', icon: Clapperboard, keywords: ['videos', 'playbacks', 'archives'] },
  { id: 'transcriptions', label: 'Transcriptions', path: '/dashboard/transcriptions', icon: ClipboardList, keywords: ['text', 'notes', 'logs'] },
  { id: 'analytics', label: 'Analytics', path: '/dashboard/analytics', icon: BarChart3, keywords: ['stats', 'reports', 'data'] },
  { id: 'team', label: 'Team Management', path: '/dashboard/team', icon: Users, keywords: ['members', 'users', 'roles'] },
  { id: 'settings', label: 'Settings', path: '/dashboard/settings', icon: Settings, keywords: ['configuration', 'profile', 'preferences'] },
];

interface GlobalSearchModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function GlobalSearchModal({ isOpen, onOpenChange }: GlobalSearchModalProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState<SearchItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setFilteredItems(allSearchItems.slice(0, 7)); 
      setActiveIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const results = allSearchItems.filter(
        (item) =>
          item.label.toLowerCase().includes(lowerSearchTerm) ||
          item.path.toLowerCase().includes(lowerSearchTerm) ||
          (item.keywords && item.keywords.some(kw => kw.toLowerCase().includes(lowerSearchTerm)))
      );
      setFilteredItems(results.slice(0, 7));
    } else {
      setFilteredItems(allSearchItems.slice(0, 7));
    }
    setActiveIndex(0);
    resultRefs.current = [];
  }, [searchTerm]);

  const handleNavigation = useCallback((path: string) => {
    router.push(path);
    onOpenChange(false);
  }, [router, onOpenChange]);
  
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Always prevent default for Enter key
      if (filteredItems.length > 0 && filteredItems[activeIndex]) {
        handleNavigation(filteredItems[activeIndex].path);
      }
      // If no items, Enter does nothing further, modal stays open
    } else if (event.key === 'ArrowDown') {
      if (filteredItems.length > 0) {
        event.preventDefault();
        setActiveIndex((prev) => (prev + 1) % filteredItems.length);
      }
    } else if (event.key === 'ArrowUp') {
      if (filteredItems.length > 0) {
        event.preventDefault();
        setActiveIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
      }
    }
  }, [activeIndex, filteredItems, handleNavigation]);

  useEffect(() => {
    if (resultRefs.current[activeIndex]) {
      resultRefs.current[activeIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [activeIndex]);


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 gap-0 overflow-hidden shadow-2xl">
        <div className="flex items-center px-4 py-3 border-b">
          <Search className="h-5 w-5 mr-3 text-muted-foreground flex-shrink-0" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search pages and actions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-9 border-none shadow-none focus-visible:ring-0 text-base p-0 flex-grow"
          />
        </div>
        
        <ScrollArea className="max-h-[calc(100vh-200px)] min-h-[200px] sm:max-h-[400px] overflow-y-auto">
          {filteredItems.length > 0 ? (
            <div className="p-2">
              <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Pages</p>
              {filteredItems.map((item, index) => (
                <Button
                  key={item.id}
                  ref={(el) => (resultRefs.current[index] = el)}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start h-auto py-2.5 px-2 text-sm items-center",
                    index === activeIndex ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
                  )}
                  onClick={() => handleNavigation(item.path)}
                >
                  <item.icon className="h-4 w-4 mr-3 text-muted-foreground flex-shrink-0" />
                  <span className="flex-grow text-left">{item.label}</span>
                   {index === activeIndex && (
                    <CornerDownLeft className="h-4 w-4 ml-2 text-muted-foreground flex-shrink-0" />
                  )}
                </Button>
              ))}
            </div>
          ) : (
             searchTerm && (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No results found for &quot;{searchTerm}&quot;.
              </div>
            )
          )}
           {!searchTerm && filteredItems.length === 0 && ( // This case should ideally not happen if initial items are set.
            <div className="p-6 text-center text-sm text-muted-foreground">
              Start typing to search.
            </div>
          )}
        </ScrollArea>

         <div className="px-4 py-3 text-xs text-muted-foreground border-t flex items-center justify-between">
          <div className='flex items-center gap-1'>
            <CornerDownLeft className="h-3.5 w-3.5"/> Go to Page
          </div>
          <div>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">↑</kbd> <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">↓</kbd> to navigate, <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">↵</kbd> to select
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
