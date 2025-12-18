"use client";

import { LogIn } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import AlternativeMethodAuth from "./alternative-method";

export default function SignInForm() {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	return (
		<Card className="w-full max-w-md shadow-xl">
			<CardHeader className="space-y-1">
				<CardTitle className="text-2xl flex items-center">
					<LogIn className="mr-2 h-6 w-6" /> Sign In
				</CardTitle>
				<CardDescription>
					Sign in or create an account using your preferred method.
				</CardDescription>
			</CardHeader>
			<CardContent className="grid gap-4">
				{error && (
					<div className="p-3 rounded-md bg-destructive/10 text-destructive border border-destructive/30 text-sm">
						{error}
					</div>
				)}
				<div className="grid grid-cols-1 gap-3">
					<AlternativeMethodAuth
						{...{ isLoading, setError, setIsLoading, type: "signin" }}
					/>
				</div>
			</CardContent>
			<CardFooter className="flex flex-col gap-4 pt-2">
				<p className="text-sm text-muted-foreground text-center">
					<Link href="/" className="font-semibold text-primary hover:underline">
						&larr; Back to Home
					</Link>
				</p>
			</CardFooter>
		</Card>
	);
}
