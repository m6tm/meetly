
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { TabsContent } from "../ui/tabs";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { Bell, Loader2 } from "lucide-react";
import { Save } from "lucide-react";
import { NotificationPreference, NotificationType } from "@/generated/prisma";
import { useCallback, useEffect, useState } from "react";
import { getNotificationPreferencesAction, updateNotificationPreferencesAction } from "@/actions/settings-notifications.actions";
import { useForm, Controller } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

export type NotificationForm = {
    meetingReminder: boolean;
    transcriptionUpdate: boolean;
    teamActivity: boolean;
    newsletter: boolean;
}

export default function NotificationComponent() {
    const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast()
    const form = useForm<NotificationForm>({
        defaultValues: {
            meetingReminder: false,
            transcriptionUpdate: false,
            teamActivity: false,
            newsletter: false,
        },
        mode: "onSubmit"
    })

    const handleGetPreferences = useCallback(async () => {
        setIsLoading(true);
        const response = await getNotificationPreferencesAction();
        if (!response.success || !response.data) {
            toast({
                title: "Error",
                description: "Failed to load notification preferences.",
                variant: "destructive",
            })
            return;
        }
        setPreferences(response.data!);
        form.reset({
            meetingReminder: response.data.find((p) => p.type === NotificationType.MEETING_REMINDER)?.enabled || false,
            transcriptionUpdate: response.data.find((p) => p.type === NotificationType.TRANSCRIPTION_UPDATE)?.enabled || false,
            teamActivity: response.data.find((p) => p.type === NotificationType.TEAM_ACTIVITY)?.enabled || false,
            newsletter: response.data.find((p) => p.type === NotificationType.NEWS_UPDATE)?.enabled || false,
        })
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (preferences.length === 0) handleGetPreferences();
    }, [handleGetPreferences]);

    const handleSaveChanges = async (data: NotificationForm) => {
        setIsSubmitting(true);
        try {
            const response = await updateNotificationPreferencesAction(data);
            if (response.success) {
                toast({
                    title: "Success",
                    description: "Notification preferences updated successfully.",
                    variant: "default",
                });
                await handleGetPreferences();
            } else {
                toast({
                    title: "Error",
                    description: response.error || "Failed to update notification preferences.",
                    variant: "destructive",
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <TabsContent value="notifications">
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center"><Bell className="mr-2 h-5 w-5 text-primary" />Notification Settings</CardTitle>
                    <CardDescription>Manage how you receive notifications.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-1">
                        <h4 className="font-medium">Email Notifications</h4>
                        <p className="text-xs text-muted-foreground">Receive updates directly in your inbox.</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Controller
                            name="meetingReminder"
                            control={form.control}
                            render={({ field }) => (
                                <Checkbox
                                    id="email-meeting-reminders"
                                    checked={field.value}
                                    disabled={isLoading || isSubmitting}
                                    onCheckedChange={field.onChange}
                                    className="cursor-pointer"
                                />
                            )}
                        />
                        <Label htmlFor="email-meeting-reminders" className="font-normal cursor-pointer">Meeting Reminders</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Controller
                            name="transcriptionUpdate"
                            control={form.control}
                            render={({ field }) => (
                                <Checkbox
                                    id="email-transcription-updates"
                                    disabled={isLoading || isSubmitting}
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="cursor-pointer"
                                />
                            )}
                        />
                        <Label htmlFor="email-transcription-updates" className="font-normal cursor-pointer">Transcription Updates</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Controller
                            name="teamActivity"
                            control={form.control}
                            render={({ field }) => (
                                <Checkbox
                                    id="email-team-updates"
                                    disabled={isLoading || isSubmitting}
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="cursor-pointer"
                                />
                            )}
                        />
                        <Label htmlFor="email-team-updates" className="font-normal cursor-pointer">Team Activity Updates</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Controller
                            name="newsletter"
                            control={form.control}
                            render={({ field }) => (
                                <Checkbox
                                    id="email-newsletter"
                                    disabled={isLoading || isSubmitting}
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="cursor-pointer"
                                />
                            )}
                        />
                        <Label htmlFor="email-newsletter" className="font-normal cursor-pointer">Product News & Updates</Label>
                    </div>
                    <Separator />
                    <div className="space-y-1">
                        <h4 className="font-medium">Push Notifications</h4>
                        <p className="text-xs text-muted-foreground">Get real-time alerts on your devices (requires app installation or browser permission).</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="push-all" disabled />
                        <Label htmlFor="push-all" className="font-normal text-muted-foreground">Enable All Push Notifications (Coming Soon)</Label>
                    </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4 flex justify-end">
                    <Button
                        type="button"
                        onClick={form.handleSubmit(handleSaveChanges)}
                        disabled={isSubmitting || isLoading}
                    >
                        {isSubmitting || isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="mr-2 h-4 w-4" />
                        )}
                        {isSubmitting ? "Saving..." : isLoading ? "Loading..." : "Save Changes"}
                    </Button>
                </CardFooter>
            </Card>
        </TabsContent>
    )
}