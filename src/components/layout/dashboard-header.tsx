"use client";

import { Theme } from "@prisma/client";
import { Moon, Sun } from "lucide-react";
import Link from "next/link";
import React from "react";
import { updateThemeAction } from "@/actions/account.actions";
import { Notifications } from "@/components/notifications/notifications";
import { Button } from "@/components/ui/button";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { userStore } from "@/stores/user.store";

interface DashboardHeaderProps {
	pageTitle?: string;
}

export default function DashboardHeader({ pageTitle }: DashboardHeaderProps) {
	const { isMobile } = useSidebar();
	const [mounted, setMounted] = React.useState(false);
	React.useEffect(() => setMounted(true), []);

	const { appearance, setTheme } = userStore();
	const toggleTheme = async () => {
		const oldTheme = appearance?.theme ?? Theme.LIGHT;
		const newTheme = oldTheme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT;
		setTheme(newTheme);
		const response = await updateThemeAction(newTheme);
		if (!response.success || !response.data) {
			setTheme(oldTheme);
		}
	};

	return (
		<header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
			<SidebarTrigger />
			<div className="flex-1">
				{pageTitle && (
					<h1 className="text-lg font-semibold md:hidden">{pageTitle}</h1>
				)}
			</div>
			<div className="flex items-center gap-2">
				<Button
					variant="ghost"
					size="icon"
					onClick={toggleTheme}
					aria-label="Toggle theme"
				>
					{mounted &&
						(appearance?.theme === Theme.DARK ? (
							<Sun className="h-5 w-5" />
						) : (
							<Moon className="h-5 w-5" />
						))}
				</Button>

				<Notifications />
			</div>
		</header>
	);
}
