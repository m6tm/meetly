
'use client';

import type { ReactNode } from 'react';
import React, { useState, useEffect } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarInset,
} from '@/components/ui/sidebar';
import DashboardHeader from '@/components/layout/dashboard-header';
import DashboardSidebarContent from '@/components/layout/dashboard-sidebar-content';
import GlobalSearchModal from '@/components/layout/global-search-modal'; // Import the new component

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon" variant="sidebar">
        <SidebarContent>
          <DashboardSidebarContent onSearchClick={() => setIsSearchModalOpen(true)} />
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onOpenChange={setIsSearchModalOpen}
      />
    </SidebarProvider>
  );
}
