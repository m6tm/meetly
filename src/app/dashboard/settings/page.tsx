
'use client';

import React, { useCallback, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserCog, CreditCard, Palette, Bell, ShieldCheck, Save, Moon, Sun, AlertTriangle, Loader2, Mail, Code, Eye, CheckCircle as CheckCircleIcon, UserPlus, Link as LinkIcon, KeyRound } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import ProfileComponent from '@/components/settings/profile.component';
import AccountComponent from '@/components/settings/account.component';

// Default content for Confirm Signup
const defaultConfirmSignupSubject = "Confirmez votre inscription sur Linked Pedia";
const defaultConfirmSignupBody = `<div style="text-align: center; margin-bottom: 30px;">
  <h1 style="color: #2c5aa0;">Linked Pedia</h1>
</div>
<p>Bonjour,</p>
<p>Merci de vous être inscrit(e) sur Linked Pedia. Pour activer votre compte et commencer à utiliser nos services, veuillez confirmer votre adresse email en cliquant sur le lien ci-dessous :</p>
<div style="text-align: center; margin: 30px 0;">
  <a href="{{ .ConfirmationURL }}" style="background-color: #2c5aa0; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Confirmer mon inscription</a>
</div>
<p>Si le bouton ne fonctionne pas, vous pouvez copier et coller ce lien dans votre navigateur :</p>
<p style="word-break: break-all; color: #666;">{{ .ConfirmationURL }}</p>
<p><strong>Important :</strong> Ce lien expirera dans 24 heures pour des raisons de sécurité.</p>
<p>Si vous n'avez pas créé de compte sur Linked Pedia, vous pouvez ignorer cet email.</p>`;

// Default content for Invite User
const defaultInviteUserSubject = "You're invited to join Meetly!";
const defaultInviteUserBody = `<div style="text-align: center; margin-bottom: 30px;">
  <h1 style="color: #2c5aa0;">Meetly</h1>
</div>
<p>Hello,</p>
<p>You have been invited to join Meetly. Click the link below to accept the invitation and set up your account:</p>
<div style="text-align: center; margin: 30px 0;">
  <a href="{{ .ConfirmationURL }}" style="background-color: #2c5aa0; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Accept Invitation</a>
</div>
<p>If the button does not work, copy and paste this link into your browser:</p>
<p style="word-break: break-all; color: #666;">{{ .ConfirmationURL }}</p>
<p>This invitation will expire in 7 days.</p>
<p>If you did not expect this invitation, you can ignore this email.</p>`;

// Default content for Magic Link
const defaultMagicLinkSubject = "Your Magic Link for Meetly";
const defaultMagicLinkBody = `<div style="text-align: center; margin-bottom: 30px;">
  <h1 style="color: #2c5aa0;">Meetly</h1>
</div>
<p>Hello,</p>
<p>Click the link below to sign in to your account on Meetly:</p>
<div style="text-align: center; margin: 30px 0;">
  <a href="{{ .ConfirmationURL }}" style="background-color: #2c5aa0; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Sign In Securely</a>
</div>
<p>If the button does not work, copy and paste this link into your browser:</p>
<p style="word-break: break-all; color: #666;">{{ .ConfirmationURL }}</p>
<p><strong>Important:</strong> This link is valid for 15 minutes and can only be used once.</p>
<p>If you did not request this link, please ignore this email or contact support if you have concerns.</p>`;

// Default content for Change Email
const defaultChangeEmailSubject = "Confirm Your New Email Address for Meetly";
const defaultChangeEmailBody = `<div style="text-align: center; margin-bottom: 30px;">
  <h1 style="color: #2c5aa0;">Meetly</h1>
</div>
<p>Hello,</p>
<p>You recently requested to change the email address associated with your account on Meetly to {{.Email}}.</p>
<p>To confirm this change, please click the link below:</p>
<div style="text-align: center; margin: 30px 0;">
  <a href="{{ .ConfirmationURL }}" style="background-color: #2c5aa0; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Confirm New Email</a>
</div>
<p>If the button does not work, copy and paste this link into your browser:</p>
<p style="word-break: break-all; color: #666;">{{ .ConfirmationURL }}</p>
<p>If you did not request this change, please contact our support team immediately.</p>`;

// Default content for Reset Password
const defaultResetPasswordSubject = "Reset Your Password for Meetly";
const defaultResetPasswordBody = `<div style="text-align: center; margin-bottom: 30px;">
  <h1 style="color: #2c5aa0;">Meetly</h1>
</div>
<p>Hello,</p>
<p>We received a request to reset your password for your account on Meetly.</p>
<p>Click the link below to set a new password:</p>
<div style="text-align: center; margin: 30px 0;">
  <a href="{{ .ConfirmationURL }}" style="background-color: #2c5aa0; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
</div>
<p>If the button does not work, copy and paste this link into your browser:</p>
<p style="word-break: break-all; color: #666;">{{ .ConfirmationURL }}</p>
<p>This link will expire in 1 hour. If you did not request a password reset, please ignore this email.</p>`;

// Default content for Reauthentication
const defaultReauthenticationSubject = "Verify Your Identity on Meetly";
const defaultReauthenticationBody = `<div style="text-align: center; margin-bottom: 30px;">
  <h1 style="color: #2c5aa0;">Meetly</h1>
</div>
<p>Hello,</p>
<p>To complete your recent request, we need to verify your identity. Please click the link below to continue:</p>
<div style="text-align: center; margin: 30px 0;">
  <a href="{{ .ConfirmationURL }}" style="background-color: #2c5aa0; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Identity</a>
</div>
<p>If the button does not work, copy and paste this link into your browser:</p>
<p style="word-break: break-all; color: #666;">{{ .ConfirmationURL }}</p>
<p>This link is valid for 10 minutes. If you did not initiate this action, please contact support immediately.</p>`;


const emailPlaceholders = [
  "{{.ConfirmationURL}}", "{{.Token}}", "{{.TokenHash}}", "{{.SiteURL}}",
  "{{.Email}}", "{{.Data}}", "{{.RedirectTo}}"
];


export default function SettingsPage() {
  const { toast } = useToast();
  const [currentTheme, setCurrentTheme] = React.useState("system");
  const [isCloseAccountDialogOpen, setIsCloseAccountDialogOpen] = React.useState(false);
  const [closeAccountConfirmationText, setCloseAccountConfirmationText] = React.useState("");
  const [isClosingAccount, setIsClosingAccount] = React.useState(false);

  const confirmationPhrase = "supprimer mon compte";

  // State for Email Templates
  const [activeEmailTemplateType, setActiveEmailTemplateType] = React.useState("confirmSignup");
  const [activeEditorView, setActiveEditorView] = React.useState("source");

  // State for "Confirm signup" template
  const [confirmSignupSubject, setConfirmSignupSubject] = React.useState(defaultConfirmSignupSubject);
  const [confirmSignupBody, setConfirmSignupBody] = React.useState(defaultConfirmSignupBody);

  // State for "Invite user" template
  const [inviteUserSubject, setInviteUserSubject] = React.useState(defaultInviteUserSubject);
  const [inviteUserBody, setInviteUserBody] = React.useState(defaultInviteUserBody);

  // State for "Magic Link" template
  const [magicLinkSubject, setMagicLinkSubject] = React.useState(defaultMagicLinkSubject);
  const [magicLinkBody, setMagicLinkBody] = React.useState(defaultMagicLinkBody);

  // State for "Change Email" template
  const [changeEmailSubject, setChangeEmailSubject] = React.useState(defaultChangeEmailSubject);
  const [changeEmailBody, setChangeEmailBody] = React.useState(defaultChangeEmailBody);

  // State for "Reset Password" template
  const [resetPasswordSubject, setResetPasswordSubject] = React.useState(defaultResetPasswordSubject);
  const [resetPasswordBody, setResetPasswordBody] = React.useState(defaultResetPasswordBody);

  // State for "Reauthentication" template
  const [reauthenticationSubject, setReauthenticationSubject] = React.useState(defaultReauthenticationSubject);
  const [reauthenticationBody, setReauthenticationBody] = React.useState(defaultReauthenticationBody);

  const [isSavingEmailTemplate, setIsSavingEmailTemplate] = React.useState(false);
  const inputAvatarRef = React.useRef<HTMLInputElement>(null);
  const [user, setUser] = React.useState<User | null>(null);
  const supabase = createClient();

  const handleFetchUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  }, []);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark');
      setCurrentTheme(isDark ? "dark" : "light");
    }
  }, []);

  React.useEffect(() => {
    handleFetchUser();
  }, []);


  const handleSaveChanges = (section: string) => {
    // Placeholder for actual save logic
    toast({
      title: `${section} Settings Saved`,
      description: `Your ${section.toLowerCase()} settings have been updated.`,
    });
  };

  const handleSaveEmailTemplate = async (templateName: string) => {
    setIsSavingEmailTemplate(true);
    let subjectToSave = '';
    let bodyToSave = '';

    switch (activeEmailTemplateType) {
      case 'confirmSignup':
        subjectToSave = confirmSignupSubject;
        bodyToSave = confirmSignupBody;
        break;
      case 'inviteUser':
        subjectToSave = inviteUserSubject;
        bodyToSave = inviteUserBody;
        break;
      case 'magicLink':
        subjectToSave = magicLinkSubject;
        bodyToSave = magicLinkBody;
        break;
      case 'changeEmail':
        subjectToSave = changeEmailSubject;
        bodyToSave = changeEmailBody;
        break;
      case 'resetPassword':
        subjectToSave = resetPasswordSubject;
        bodyToSave = resetPasswordBody;
        break;
      case 'reauthentication':
        subjectToSave = reauthenticationSubject;
        bodyToSave = reauthenticationBody;
        break;
      default:
        console.error("Unknown template type:", activeEmailTemplateType);
        setIsSavingEmailTemplate(false);
        return;
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast({
      title: "Email Template Saved",
      description: `The "${templateName.replace(/([A-Z])/g, ' $1').trim()}" template has been updated.`,
    });
    setIsSavingEmailTemplate(false);
  };

  const handleAddPlaceholder = (placeholder: string) => {
    switch (activeEmailTemplateType) {
      case 'confirmSignup':
        setConfirmSignupBody(prev => prev + placeholder);
        break;
      case 'inviteUser':
        setInviteUserBody(prev => prev + placeholder);
        break;
      case 'magicLink':
        setMagicLinkBody(prev => prev + placeholder);
        break;
      case 'changeEmail':
        setChangeEmailBody(prev => prev + placeholder);
        break;
      case 'resetPassword':
        setResetPasswordBody(prev => prev + placeholder);
        break;
      case 'reauthentication':
        setReauthenticationBody(prev => prev + placeholder);
        break;
    }
    toast({ title: "Placeholder Added", description: `${placeholder} added to body.` });
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

  const renderEmailEditor = (
    subject: string,
    onSubjectChange: (value: string) => void,
    body: string,
    onBodyChange: (value: string) => void,
    templateIdPrefix: string
  ) => (
    <div className="space-y-4">
      <div>
        <Label htmlFor={`${templateIdPrefix}-subject`} className="text-base">Subject heading</Label>
        <Input
          id={`${templateIdPrefix}-subject`}
          value={subject}
          onChange={(e) => onSubjectChange(e.target.value)}
          placeholder="Email Subject"
          className="mt-1"
          disabled={isSavingEmailTemplate}
        />
      </div>

      <div>
        <Label className="text-base mb-2 block">Message body</Label>
        <Tabs defaultValue={activeEditorView} onValueChange={(value) => setActiveEditorView(value)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-9 mb-1">
            <TabsTrigger value="source" className="text-xs"><Code className="mr-1.5 h-3.5 w-3.5" />Source</TabsTrigger>
            <TabsTrigger value="preview" className="text-xs"><Eye className="mr-1.5 h-3.5 w-3.5" />Preview</TabsTrigger>
          </TabsList>
          <TabsContent value="source" className="mt-0">
            <Textarea
              value={body}
              onChange={(e) => onBodyChange(e.target.value)}
              placeholder="Enter email HTML source..."
              className="min-h-[300px] font-mono text-xs border rounded-md p-2 focus-visible:ring-primary"
              disabled={isSavingEmailTemplate}
            />
          </TabsContent>
          <TabsContent value="preview" className="mt-0">
            <div
              className="min-h-[300px] border rounded-md p-4 bg-white text-black overflow-auto"
              dangerouslySetInnerHTML={{ __html: body }}
            />
          </TabsContent>
        </Tabs>
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Placeholders</Label>
        <div className="flex flex-wrap gap-2">
          {emailPlaceholders.map(placeholder => (
            <Button
              key={placeholder}
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => handleAddPlaceholder(placeholder)}
              disabled={isSavingEmailTemplate}
            >
              {placeholder}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2 p-3 border rounded-md bg-muted/30">
        <CheckCircleIcon className="h-5 w-5 text-green-600" />
        <p className="text-sm text-muted-foreground">Email content is unlikely to be marked as spam</p>
      </div>
    </div>
  );


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
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1 mb-4 h-auto">
          <TabsTrigger value="profile"><UserCog className="mr-2 h-4 w-4 hidden sm:inline-block" />Profile</TabsTrigger>
          <TabsTrigger value="account"><CreditCard className="mr-2 h-4 w-4 hidden sm:inline-block" />Account</TabsTrigger>
          <TabsTrigger value="appearance"><Palette className="mr-2 h-4 w-4 hidden sm:inline-block" />Appearance</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="mr-2 h-4 w-4 hidden sm:inline-block" />Notifications</TabsTrigger>
          <TabsTrigger value="security"><ShieldCheck className="mr-2 h-4 w-4 hidden sm:inline-block" />Security</TabsTrigger>
          <TabsTrigger value="email-templates"><Mail className="mr-2 h-4 w-4 hidden sm:inline-block" />Email Templates</TabsTrigger>
        </TabsList>

        <ProfileComponent user={user} handleFetchUser={handleFetchUser} />

        <AccountComponent />

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

        <TabsContent value="email-templates">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center"><Mail className="mr-2 h-5 w-5 text-primary" />Email Template Settings</CardTitle>
              <CardDescription>Manage and customize email templates sent by the application.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue={activeEmailTemplateType} onValueChange={(value) => setActiveEmailTemplateType(value)} className="w-full">
                <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1 mb-4 h-auto">
                  <TabsTrigger value="confirmSignup" className="text-xs sm:text-sm"><UserCog className="mr-2 h-4 w-4 hidden sm:inline-block" />Confirm signup</TabsTrigger>
                  <TabsTrigger value="inviteUser" className="text-xs sm:text-sm"><UserPlus className="mr-2 h-4 w-4 hidden sm:inline-block" />Invite user</TabsTrigger>
                  <TabsTrigger value="magicLink" className="text-xs sm:text-sm"><LinkIcon className="mr-2 h-4 w-4 hidden sm:inline-block" />Magic Link</TabsTrigger>
                  <TabsTrigger value="changeEmail" className="text-xs sm:text-sm"><Mail className="mr-2 h-4 w-4 hidden sm:inline-block" />Change Email</TabsTrigger>
                  <TabsTrigger value="resetPassword" className="text-xs sm:text-sm"><KeyRound className="mr-2 h-4 w-4 hidden sm:inline-block" />Reset Password</TabsTrigger>
                  <TabsTrigger value="reauthentication" className="text-xs sm:text-sm"><ShieldCheck className="mr-2 h-4 w-4 hidden sm:inline-block" />Reauthentication</TabsTrigger>
                </TabsList>

                <TabsContent value="confirmSignup" className="mt-0">
                  {renderEmailEditor(confirmSignupSubject, setConfirmSignupSubject, confirmSignupBody, setConfirmSignupBody, "confirm-signup")}
                </TabsContent>
                <TabsContent value="inviteUser" className="mt-0">
                  {renderEmailEditor(inviteUserSubject, setInviteUserSubject, inviteUserBody, setInviteUserBody, "invite-user")}
                </TabsContent>
                <TabsContent value="magicLink" className="mt-0">
                  {renderEmailEditor(magicLinkSubject, setMagicLinkSubject, magicLinkBody, setMagicLinkBody, "magic-link")}
                </TabsContent>
                <TabsContent value="changeEmail" className="mt-0">
                  {renderEmailEditor(changeEmailSubject, setChangeEmailSubject, changeEmailBody, setChangeEmailBody, "change-email")}
                </TabsContent>
                <TabsContent value="resetPassword" className="mt-0">
                  {renderEmailEditor(resetPasswordSubject, setResetPasswordSubject, resetPasswordBody, setResetPasswordBody, "reset-password")}
                </TabsContent>
                <TabsContent value="reauthentication" className="mt-0">
                  {renderEmailEditor(reauthenticationSubject, setReauthenticationSubject, reauthenticationBody, setReauthenticationBody, "reauthentication")}
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button
                onClick={() => handleSaveEmailTemplate(activeEmailTemplateType)}
                disabled={isSavingEmailTemplate}
              >
                {isSavingEmailTemplate ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}



