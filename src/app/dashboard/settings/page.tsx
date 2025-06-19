
'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserCog, CreditCard, Palette, Bell, ShieldCheck, Save, Image as ImageIcon, Moon, Sun, AlertTriangle, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function SettingsPage() {
  const { toast } = useToast();
  const [currentTheme, setCurrentTheme] = React.useState("system");
  const [isCloseAccountDialogOpen, setIsCloseAccountDialogOpen] = React.useState(false);
  const [closeAccountConfirmationText, setCloseAccountConfirmationText] = React.useState("");
  const [isClosingAccount, setIsClosingAccount] = React.useState(false);

  const confirmationPhrase = "supprimer mon compte";

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark');
      setCurrentTheme(isDark ? "dark" : "light");
    }
  }, []);


  const handleSaveChanges = (section: string) => {
    // Placeholder for actual save logic
    console.log(`Saving changes for ${section}...`);
    toast({
      title: `${section} Settings Saved`,
      description: `Your ${section.toLowerCase()} settings have been updated.`,
    });
  };

  const handleThemeChange = (themeValue: string) => {
    setCurrentTheme(themeValue);
    if (typeof window !== 'undefined') {
        if (themeValue === "dark") {
            document.documentElement.classList.add("dark");
        } else if (themeValue === "light") {
            document.documentElement.classList.remove("dark");
        } else { // system
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                 document.documentElement.classList.add("dark");
            } else {
                 document.documentElement.classList.remove("dark");
            }
        }
    }
     handleSaveChanges("Appearance");
  };

  const handleConfirmCloseAccount = async () => {
    if (closeAccountConfirmationText !== confirmationPhrase) {
      toast({
        title: "Confirmation Incorrecte",
        description: `Veuillez taper "${confirmationPhrase}" pour confirmer.`,
        variant: "destructive",
      });
      return;
    }
    setIsClosingAccount(true);
    console.log("Demande de fermeture de compte confirmée.");
    // Simuler un appel API
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Compte Fermé",
      description: "Votre compte a été marqué pour fermeture.",
      variant: "destructive"
    });
    setIsClosingAccount(false);
    setIsCloseAccountDialogOpen(false);
    setCloseAccountConfirmationText("");
    // Ici, vous redirigeriez l'utilisateur ou mettriez à jour l'état de l'application
  };


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
          <UserCog className="mr-3 h-8 w-8 text-primary" /> Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your account settings, preferences, and more.
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 mb-6">
          <TabsTrigger value="profile"><UserCog className="mr-2 h-4 w-4 sm:hidden md:inline-block" />Profile</TabsTrigger>
          <TabsTrigger value="account"><CreditCard className="mr-2 h-4 w-4 sm:hidden md:inline-block" />Account</TabsTrigger>
          <TabsTrigger value="appearance"><Palette className="mr-2 h-4 w-4 sm:hidden md:inline-block" />Appearance</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="mr-2 h-4 w-4 sm:hidden md:inline-block" />Notifications</TabsTrigger>
          <TabsTrigger value="security"><ShieldCheck className="mr-2 h-4 w-4 sm:hidden md:inline-block" />Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center"><UserCog className="mr-2 h-5 w-5 text-primary" />Profile Settings</CardTitle>
              <CardDescription>Update your personal information and profile picture.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="https://placehold.co/200x200.png" alt="User Avatar" data-ai-hint="user avatar" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="flex-grow space-y-2">
                  <Button variant="outline"><ImageIcon className="mr-2 h-4 w-4" />Change Avatar</Button>
                  <p className="text-xs text-muted-foreground">JPG, GIF or PNG. Max size of 800K</p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" defaultValue="John Doe" placeholder="Your full name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" defaultValue="john.doe@example.com" placeholder="Your email address" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <textarea
                  id="bio"
                  className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Tell us a little about yourself"
                  defaultValue="Passionate about meetings and productivity."
                />
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button onClick={() => handleSaveChanges("Profile")}><Save className="mr-2 h-4 w-4" />Save Profile</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center"><CreditCard className="mr-2 h-5 w-5 text-primary" />Account Settings</CardTitle>
              <CardDescription>Manage your subscription, billing, and account details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Subscription Plan</Label>
                <p className="text-sm text-foreground font-semibold">Pro Plan</p>
                <Link href="/dashboard/subscription">
                  <Button variant="outline" size="sm">
                    Manage Subscription
                  </Button>
                </Link>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Billing Information</Label>
                <p className="text-sm text-muted-foreground">Your next bill is on August 1, 2024 for $19.99.</p>
                <Link href="/dashboard/billing-history">
                  <Button variant="link" className="p-0 h-auto">View Billing History</Button>
                </Link>
              </div>
              <Separator />
              <div className="space-y-2">
                 <Label className="text-destructive font-medium block mb-1">Danger Zone</Label>
                 <AlertDialog open={isCloseAccountDialogOpen} onOpenChange={setIsCloseAccountDialogOpen}>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Close Account</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center">
                          <AlertTriangle className="mr-2 h-5 w-5 text-destructive" />
                          Êtes-vous absolument sûr ?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action est irréversible et supprimera définitivement votre compte et toutes vos données.
                          Pour confirmer, veuillez taper "<span className="font-semibold text-destructive">{confirmationPhrase}</span>" dans le champ ci-dessous.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="py-4">
                        <Label htmlFor="close-account-confirm-input" className="sr-only">
                          Texte de confirmation
                        </Label>
                        <Input
                          id="close-account-confirm-input"
                          type="text"
                          value={closeAccountConfirmationText}
                          onChange={(e) => setCloseAccountConfirmationText(e.target.value)}
                          placeholder={confirmationPhrase}
                          className={closeAccountConfirmationText !== "" && closeAccountConfirmationText !== confirmationPhrase ? "border-destructive focus-visible:ring-destructive" : ""}
                          disabled={isClosingAccount}
                        />
                        {closeAccountConfirmationText !== "" && closeAccountConfirmationText !== confirmationPhrase && (
                          <p className="text-xs text-destructive mt-1">Le texte ne correspond pas.</p>
                        )}
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => { setCloseAccountConfirmationText(""); setIsClosingAccount(false); }} disabled={isClosingAccount}>
                          Annuler
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleConfirmCloseAccount}
                          disabled={closeAccountConfirmationText !== confirmationPhrase || isClosingAccount}
                          className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                        >
                          {isClosingAccount ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : null}
                          {isClosingAccount ? "Fermeture..." : "Je comprends, fermer mon compte"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                 <p className="text-xs text-muted-foreground mt-1">Closing your account is irreversible.</p>
              </div>
            </CardContent>
             <CardFooter className="border-t px-6 py-4">
              <Button onClick={() => handleSaveChanges("Account")}><Save className="mr-2 h-4 w-4" />Save Account Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center"><Palette className="mr-2 h-5 w-5 text-primary" />Appearance Settings</CardTitle>
              <CardDescription>Customize the look and feel of the application.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select value={currentTheme} onValueChange={handleThemeChange}>
                  <SelectTrigger id="theme" className="w-full sm:w-[280px]">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light"><Sun className="mr-2 h-4 w-4 inline-block" />Light</SelectItem>
                    <SelectItem value="dark"><Moon className="mr-2 h-4 w-4 inline-block" />Dark</SelectItem>
                    <SelectItem value="system">System Default</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Choose your preferred interface theme.</p>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger id="language" className="w-full sm:w-[280px]">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English (United States)</SelectItem>
                    <SelectItem value="es">Español (España)</SelectItem>
                    <SelectItem value="fr">Français (France)</SelectItem>
                    <SelectItem value="de">Deutsch (Deutschland)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Select your display language.</p>
              </div>
               <Separator />
                <div className="flex items-center space-x-2">
                    <Checkbox id="compact-mode" />
                    <Label htmlFor="compact-mode" className="font-normal">Enable Compact Mode</Label>
                </div>
                 <p className="text-xs text-muted-foreground pl-6">Reduces padding and font sizes for a denser interface.</p>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button onClick={() => handleSaveChanges("Appearance")}><Save className="mr-2 h-4 w-4" />Save Appearance</Button>
            </CardFooter>
          </Card>
        </TabsContent>

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
      </Tabs>
    </div>
  );
}
    
