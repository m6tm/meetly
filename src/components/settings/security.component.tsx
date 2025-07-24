
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { TabsContent } from "../ui/tabs";
import { Save, ShieldCheck } from "lucide-react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

export default function SecurityComponent() {
    const handleSaveChanges = (tab: string) => {
        console.log(tab);
    };

    return (
        <TabsContent value="security">
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center"><ShieldCheck className="mr-2 h-5 w-5 text-primary" />Security Settings</CardTitle>
                    <CardDescription>Manage your password and account security.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input id="current-password" type="password" placeholder="Enter your current password" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" placeholder="Enter a new password" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input id="confirm-password" type="password" placeholder="Confirm your new password" />
                    </div>
                    <Button variant="outline">Change Password</Button>
                    <Separator />
                    <div>
                        <h4 className="font-medium mb-2">Two-Factor Authentication (2FA)</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                            Secure your account by enabling two-factor authentication.
                        </p>
                        <Button variant="outline" disabled>Enable 2FA (Coming Soon)</Button>
                    </div>
                    <Separator />
                    <div>
                        <h4 className="font-medium mb-2">Active Sessions</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                            View and manage devices where you are currently logged in.
                        </p>
                        <ul className="space-y-2 text-sm">
                            <li className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
                                <span>Chrome on macOS (Current session)</span>
                                <Button variant="link" size="sm" className="text-destructive p-0 h-auto">Log out</Button>
                            </li>
                            <li className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
                                <span>Safari on iPhone</span>
                                <Button variant="link" size="sm" className="text-destructive p-0 h-auto">Log out</Button>
                            </li>
                        </ul>
                        <Button variant="outline" className="mt-3">Log out all other sessions</Button>
                    </div>

                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button onClick={() => handleSaveChanges("Security")}><Save className="mr-2 h-4 w-4" />Save Security Settings</Button>
                </CardFooter>
            </Card>
        </TabsContent>
    )
}