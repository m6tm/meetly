"use client";

import type { ReactNode } from "react";
import DashboardHeader from "@/components/layout/dashboard-header";
import DashboardSidebarContent from "@/components/layout/dashboard-sidebar-content";
import {
	Sidebar,
	SidebarInset,
	SidebarProvider,
} from "@/components/ui/sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
	return (
		<SidebarProvider defaultOpen>
			<Sidebar collapsible="icon" variant="sidebar">
				<DashboardSidebarContent />
			</Sidebar>
			<SidebarInset className="flex flex-col">
				<DashboardHeader />
				<main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
