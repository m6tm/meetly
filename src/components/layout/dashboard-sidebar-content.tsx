"use client";

import {
	BarChart3,
	Briefcase,
	Clapperboard,
	ClipboardList,
	LogOut,
	Settings,
	Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { getUserFallBack } from "@/lib/utils";
import { userStore } from "@/stores/user.store";
import { signOut } from "@/utils/supabase/client";

/**
 * Composant de contenu pour la barre latérale du tableau de bord.
 * Gère l'affichage du logo, de la navigation groupée et du profil utilisateur.
 */
export default function DashboardSidebarContent() {
	const pathname = usePathname();
	const router = useRouter();
	const { user } = userStore();

	const isActive = (path: string) => pathname === path;

	const handleSignOut = async () => {
		await signOut();
		router.push("/signin");
	};

	const mainMenuItems = [
		{
			title: "Analytiques",
			url: "/dashboard",
			icon: BarChart3,
		},
		{
			title: "Réunions",
			url: "/dashboard/meetings",
			icon: Briefcase,
		},
		{
			title: "Enregistrements",
			url: "/dashboard/recordings",
			icon: Clapperboard,
		},
		{
			title: "Transcriptions",
			url: "/dashboard/transcriptions",
			icon: ClipboardList,
		},
	];

	const managementItems = [
		{
			title: "Équipe",
			url: "/dashboard/team",
			icon: Users,
		},
	];

	const settingsItems = [
		{
			title: "Paramètres",
			url: "/dashboard/settings",
			icon: Settings,
		},
	];

	return (
		<>
			<SidebarHeader className="h-16 border-b border-sidebar-border/50 px-4 flex items-center justify-center">
				<div className="flex items-center gap-3 transition-all duration-300 group-data-[collapsible=icon]:hidden">
					<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="currentColor"
							className="h-5 w-5"
						>
							<title>Meetly Logo</title>
							<path d="M4.5 4.5a3 3 0 00-3 3v9a3 3 0 003 3h15a3 3 0 003-3v-9a3 3 0 00-3-3h-15zm12.75 1.5a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-3a.75.75 0 01.75-.75zm-3.75 0a.75.75 0 01.75.75v6.75a.75.75 0 01-1.5 0V6.75a.75.75 0 01.75-.75zM7.5 12a.75.75 0 01.75-.75h3a.75.75 0 010 1.5h-3a.75.75 0 01-.75-.75zm-3 3.75a.75.75 0 01.75-.75h6.75a.75.75 0 010 1.5H5.25a.75.75 0 01-.75-.75z" />
						</svg>
					</div>
					<span className="font-bold text-xl tracking-tight text-foreground">
						Meetly
					</span>
				</div>
				{/* Icône pour l'état replié (carré aux couleurs du thème) avec le vrai logo */}
				<div className="hidden group-data-[collapsible=icon]:flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
						className="h-5 w-5"
					>
						<title>Meetly Logo</title>
						<path d="M4.5 4.5a3 3 0 00-3 3v9a3 3 0 003 3h15a3 3 0 003-3v-9a3 3 0 00-3-3h-15zm12.75 1.5a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-3a.75.75 0 01.75-.75zm-3.75 0a.75.75 0 01.75.75v6.75a.75.75 0 01-1.5 0V6.75a.75.75 0 01.75-.75zM7.5 12a.75.75 0 01.75-.75h3a.75.75 0 010 1.5h-3a.75.75 0 01-.75-.75zm-3 3.75a.75.75 0 01.75-.75h6.75a.75.75 0 010 1.5H5.25a.75.75 0 01-.75-.75z" />
					</svg>
				</div>
			</SidebarHeader>

			<SidebarContent className="py-4">
				<SidebarGroup>
					<SidebarGroupLabel className="px-6 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 group-data-[collapsible=icon]:hidden">
						Menu Principal
					</SidebarGroupLabel>
					<SidebarGroupContent className="px-3 group-data-[collapsible=icon]:px-2">
						<SidebarMenu className="group-data-[collapsible=icon]:items-center">
							{mainMenuItems.map((item) => (
								<SidebarMenuItem key={item.url}>
									<SidebarMenuButton
										asChild
										isActive={isActive(item.url)}
										tooltip={item.title}
										className="h-10 px-3 transition-colors hover:bg-sidebar-accent"
									>
										<Link href={item.url} className="flex items-center gap-3">
											<item.icon className="h-5 w-5" />
											<span className="font-medium">{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarGroup>
					<SidebarGroupLabel className="px-6 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 group-data-[collapsible=icon]:hidden">
						Gestion
					</SidebarGroupLabel>
					<SidebarGroupContent className="px-3 group-data-[collapsible=icon]:px-2">
						<SidebarMenu className="group-data-[collapsible=icon]:items-center">
							{managementItems.map((item) => (
								<SidebarMenuItem key={item.url}>
									<SidebarMenuButton
										asChild
										isActive={isActive(item.url)}
										tooltip={item.title}
										className="h-10 px-3 transition-colors hover:bg-sidebar-accent"
									>
										<Link href={item.url} className="flex items-center gap-3">
											<item.icon className="h-5 w-5" />
											<span className="font-medium">{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarGroup className="mt-auto">
					<SidebarGroupLabel className="px-6 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 group-data-[collapsible=icon]:hidden">
						Configuration
					</SidebarGroupLabel>
					<SidebarGroupContent className="px-3 group-data-[collapsible=icon]:px-2">
						<SidebarMenu className="group-data-[collapsible=icon]:items-center">
							{settingsItems.map((item) => (
								<SidebarMenuItem key={item.url}>
									<SidebarMenuButton
										asChild
										isActive={isActive(item.url)}
										tooltip={item.title}
										className="h-10 px-3 transition-colors hover:bg-sidebar-accent"
									>
										<Link href={item.url} className="flex items-center gap-3">
											<item.icon className="h-5 w-5" />
											<span className="font-medium">{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter className="p-3 border-t border-sidebar-border/50">
				<div className="flex items-center gap-3 px-1 group-data-[collapsible=icon]:justify-center">
					<div className="relative group/avatar">
						<Avatar className="h-9 w-9 border border-sidebar-border/50 ring-2 ring-transparent group-hover/avatar:ring-primary/20 transition-all rounded-xl">
							{user?.user_metadata.avatar_url && (
								<AvatarImage
									src={user.user_metadata.avatar_url}
									alt={user.user_metadata.name || "Utilisateur"}
									className="rounded-xl"
								/>
							)}
							<AvatarFallback className="bg-primary/10 text-primary font-bold rounded-xl">
								{getUserFallBack(user?.user_metadata.name || "")}
							</AvatarFallback>
						</Avatar>
					</div>

					<div className="flex-1 overflow-hidden group-data-[collapsible=icon]:hidden">
						<p className="text-sm font-semibold truncate text-foreground">
							{user?.user_metadata.name}
						</p>
						<p className="text-xs text-muted-foreground truncate">
							{user?.email}
						</p>
					</div>

					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 group-data-[collapsible=icon]:hidden transition-colors"
						onClick={handleSignOut}
						title="Se déconnecter"
					>
						<LogOut className="h-4 w-4" />
					</Button>
				</div>
			</SidebarFooter>
		</>
	);
}
