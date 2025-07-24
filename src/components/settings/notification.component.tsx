
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { TabsContent } from "../ui/tabs";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { Bell } from "lucide-react";
import { Save } from "lucide-react";

export default function NotificationComponent() {
    const handleSaveChanges = (tab: string) => {
        console.log(tab);
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
                        <Checkbox id="email-meeting-reminders" defaultChecked />
                        <Label htmlFor="email-meeting-reminders" className="font-normal">Meeting Reminders</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="email-transcription-updates" defaultChecked />
                        <Label htmlFor="email-transcription-updates" className="font-normal">Transcription Updates</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="email-team-updates" />
                        <Label htmlFor="email-team-updates" className="font-normal">Team Activity Updates</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="email-newsletter" />
                        <Label htmlFor="email-newsletter" className="font-normal">Product News & Updates</Label>
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
                <CardFooter className="border-t px-6 py-4">
                    <Button onClick={() => handleSaveChanges("Notification")}><Save className="mr-2 h-4 w-4" />Save Notifications</Button>
                </CardFooter>
            </Card>
        </TabsContent>
    )
}