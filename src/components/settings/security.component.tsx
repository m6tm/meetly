
"use client"

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { TabsContent } from "../ui/tabs";
import { ShieldCheck, Loader2, LogOut, Monitor, Smartphone } from "lucide-react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useToast } from "@/hooks/use-toast";
import { changePasswordValidator } from "@/validators/settings.validators";
import { z } from "zod";
import {
    changePasswordAction,
    getActiveSessionsAction,
    revokeSessionAction,
    signOutOfAllSessionsAction,
    type SessionData
} from "@/actions/settings-security.actions";

type FormData = z.infer<typeof changePasswordValidator>;

const getDeviceIcon = (userAgent: string | null) => {
    if (!userAgent) return <Monitor className="h-4 w-4 mr-2" />;
    if (userAgent.match(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i)) {
        return <Smartphone className="h-4 w-4 mr-2" />;
    }
    return <Monitor className="h-4 w-4 mr-2" />;
};

const formatDate = (date: Date | null) => {
    if (!date) return 'Unknown';
    return date.toLocaleString();
};

export default function SecurityComponent() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingSessions, setIsLoadingSessions] = useState(true);
    const [sessions, setSessions] = useState<SessionData[]>([]);
    const [isRevoking, setIsRevoking] = useState<{ [key: string]: boolean }>({});
    const [isSigningOutAll, setIsSigningOutAll] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<FormData>({
        resolver: zodResolver(changePasswordValidator),
    });

    const loadSessions = async () => {
        setIsLoadingSessions(true);
        try {
            const result = await getActiveSessionsAction();
            if (result.success && result.data) {
                setSessions(result.data);
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to load active sessions",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error loading sessions:", error);
            toast({
                title: "Error",
                description: "An error occurred while loading sessions",
                variant: "destructive",
            });
        } finally {
            setIsLoadingSessions(false);
        }
    };

    useEffect(() => {
        loadSessions();
    }, []);

    const handleRevokeSession = async (sessionId: string) => {
        if (isRevoking[sessionId]) return;

        setIsRevoking(prev => ({ ...prev, [sessionId]: true }));
        try {
            const result = await revokeSessionAction(sessionId);
            if (result.success) {
                toast({
                    title: "Success",
                    description: "Session revoked successfully",
                });
                await loadSessions();
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to revoke session",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error revoking session:", error);
            toast({
                title: "Error",
                description: "An error occurred while revoking the session",
                variant: "destructive",
            });
        } finally {
            setIsRevoking(prev => ({ ...prev, [sessionId]: false }));
        }
    };

    const handleSignOutAll = async () => {
        if (isSigningOutAll) return;

        setIsSigningOutAll(true);
        try {
            const result = await signOutOfAllSessionsAction();
            if (result.success) {
                toast({
                    title: "Success",
                    description: "Signed out of all other sessions",
                });
                await loadSessions();
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to sign out of all sessions",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error signing out of all sessions:", error);
            toast({
                title: "Error",
                description: "An error occurred while signing out of all sessions",
                variant: "destructive",
            });
        } finally {
            setIsSigningOutAll(false);
        }
    };

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        try {
            const result = await changePasswordAction({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
                confirmPassword: data.confirmPassword,
            });

            if (result.success) {
                toast({
                    title: "Success",
                    description: result.error || "Password updated successfully",
                });
                reset();
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to update password",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "An unexpected error occurred",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <TabsContent value="security">
            <form onSubmit={handleSubmit(onSubmit)}>
                <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <ShieldCheck className="mr-2 h-5 w-5 text-primary" />
                            Security Settings
                        </CardTitle>
                        <CardDescription>Manage your password and account security.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <h4 className="font-medium">Change Password</h4>
                            <div className="space-y-2">
                                <Label htmlFor="current-password">Current Password</Label>
                                <Input
                                    id="current-password"
                                    type="password"
                                    placeholder="Enter your current password"
                                    {...register("currentPassword")}
                                    disabled={isLoading}
                                />
                                {errors.currentPassword && (
                                    <p className="text-sm text-destructive">{errors.currentPassword.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-password">New Password</Label>
                                <Input
                                    id="new-password"
                                    type="password"
                                    placeholder="Enter a new password"
                                    {...register("newPassword")}
                                    disabled={isLoading}
                                />
                                {errors.newPassword && (
                                    <p className="text-sm text-destructive">{errors.newPassword.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">Confirm New Password</Label>
                                <Input
                                    id="confirm-password"
                                    type="password"
                                    placeholder="Confirm your new password"
                                    {...register("confirmPassword")}
                                    disabled={isLoading}
                                />
                                {errors.confirmPassword && (
                                    <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                                )}
                            </div>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    'Update Password'
                                )}
                            </Button>
                        </div>

                        <Separator />

                        <div>
                            <h4 className="font-medium mb-2">Two-Factor Authentication (2FA)</h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                Secure your account by enabling two-factor authentication.
                            </p>
                            <Button variant="outline" disabled>
                                Enable 2FA (Coming Soon)
                            </Button>
                        </div>

                        <Separator />

                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">Active Sessions</h4>
                            <Button
                                variant="outline"
                                size="sm"
                                type="button"
                                onClick={handleSignOutAll}
                                disabled={isSigningOutAll || isLoadingSessions || sessions.length <= 1}
                            >
                                {isSigningOutAll ? (
                                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                ) : (
                                    <LogOut className="mr-2 h-3 w-3" />
                                )}
                                Log out all other sessions
                            </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                            View and manage devices where you are currently logged in.
                        </p>

                        {isLoadingSessions ? (
                            <div className="flex justify-center py-4">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : sessions.length === 0 ? (
                            <div className="bg-muted/30 p-4 rounded-md">
                                <p className="text-sm text-muted-foreground text-center">
                                    No active sessions found
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {sessions.map((session) => (
                                    <div
                                        key={session.id}
                                        className={`flex items-center justify-between p-3 rounded-md ${session.isCurrent ? 'bg-primary/5 border border-primary/20' : 'bg-muted/30'}`}
                                    >
                                        <div className="flex items-center">
                                            {getDeviceIcon(session.user_agent)}
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {session.user_agent ? session.user_agent.split('(')[0].trim() : 'Unknown Device'} {session.isCurrent && '(Current Session)'}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Last active: {formatDate(session.updated_at)}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    IP: {session.ip || 'Unknown IP'}
                                                </p>
                                            </div>
                                        </div>
                                        {!session.isCurrent && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:text-destructive/80"
                                                onClick={() => handleRevokeSession(session.id)}
                                                disabled={isRevoking[session.id]}
                                            >
                                                {isRevoking[session.id] ? (
                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                ) : (
                                                    'Revoke'
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </form>
        </TabsContent>
    );
}