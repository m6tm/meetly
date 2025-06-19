
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
// GlobalSearchModal import removed

export default function DashboardLayout({ children }: { children: ReactNode }) {
  // isSearchModalOpen state removed

  // useEffect for Ctrl+K removed

  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon" variant="sidebar">
        <SidebarContent>
          <DashboardSidebarContent />
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        {/* onSearchClick prop removed from DashboardHeader */}
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
      {/* GlobalSearchModal instance removed */}
    </SidebarProvider>
  );
}

