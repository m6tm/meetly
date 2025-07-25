import { ImageIcon, Loader2, Save, UserCog } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { TabsContent } from "../ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { User } from "@supabase/supabase-js";
import React, { useCallback, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseStorage } from "@/hooks/useSupabaseStorage";
import { validatorUploadProfile } from "@/validators/profile.validator";
import { userStore } from "@/stores/user.store";

export default function ProfileComponent() {
    const inputAvatarRef = React.useRef<HTMLInputElement>(null);
    const supabase = createClient();
    const { uploadAvatar } = useSupabaseStorage()
    const { toast } = useToast();
    const [updatingAvatar, setUpdatingAvatar] = React.useState(false);
    const [updatingProfile, setUpdatingProfile] = React.useState(false);
    const { user, setUser } = userStore();
    const [avatarVersion, setAvatarVersion] = React.useState(0);
    type FormData = {
        fullName: string;
        bio?: string;
    };

    const form = useForm<FormData>({
        defaultValues: {
            fullName: user?.user_metadata?.full_name || '',
            bio: user?.user_metadata?.bio || ''
        },
        mode: 'onChange'
    });

    useEffect(() => {
        if (user) {
            form.reset({
                fullName: user.user_metadata?.full_name || '',
                bio: user.user_metadata?.bio || ''
            })
        }
    }, [user])

    const handleSaveChanges = useCallback(async (data: FormData) => {
        try {
            setUpdatingProfile(true);

            // Validation côté client
            const result = validatorUploadProfile.safeParse({
                fullName: data.fullName,
                bio: data.bio
            });

            if (!result.success) {
                toast({
                    title: 'Validation Error',
                    description: result.error.errors[0].message,
                    variant: 'destructive',
                });
                return;
            }

            const { data: { user }, error } = await supabase.auth.updateUser({
                data: {
                    full_name: data.fullName.trim(),
                    bio: data.bio?.trim()
                }
            });

            if (error) {
                throw error;
            }

            setUser(user);

            toast({
                title: 'Success',
                description: 'Your profile has been updated successfully.',
            });
        } catch (error: any) {
            console.error('Error updating profile:', error);
            toast({
                title: 'Error',
                description: error.message || 'An error occurred while updating your profile.',
                variant: 'destructive',
            });
        } finally {
            setUpdatingProfile(false);
        }
    }, [setUser]);

    const handleAvatarChange = async () => {
        const file = inputAvatarRef.current?.files?.[0];
        if (!file) return;
        if (file.type !== 'image/png') {
            toast({
                title: 'Error',
                description: 'Only PNG files are allowed',
                variant: 'destructive',
            })
            return
        }
        setUpdatingAvatar(true);
        const response = await uploadAvatar(file, `avatars/${user!.id}.${file.name.split('.').pop()}`);
        setUpdatingAvatar(false);
        if (!response) {
            toast({
                title: 'Error',
                description: 'Error uploading avatar',
                variant: 'destructive',
            });
            return;
        }
        if (!response.success) {
            toast({
                title: 'Error',
                description: response.error,
                variant: 'destructive',
            });
            return;
        }
        if (!response.data?.publicUrl) {
            toast({
                title: 'Error',
                description: 'Error getting public URL',
                variant: 'destructive',
            });
            return;
        }
        const { data: { user: newUser } } = await supabase.auth.updateUser({
            data: {
                avatar_url: response.data.publicUrl,
                picture: response.data.publicUrl,
            }
        })
        setUser(newUser);
        setAvatarVersion(prev => prev + 1);
        toast({
            title: 'Avatar Updated',
            description: 'Your avatar has been updated.',
        });
    }

    return (
        <TabsContent value="profile">
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center"><UserCog className="mr-2 h-5 w-5 text-primary" />Profile Settings</CardTitle>
                    <CardDescription>Update your personal information and profile picture.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <Avatar className="h-24 w-24">
                            <AvatarImage
                                src={user?.user_metadata?.avatar_url ? `${user.user_metadata.avatar_url}?v=${avatarVersion}` : ''}
                                alt="User Avatar"
                                data-ai-hint="user avatar"
                                key={`avatar-${avatarVersion}`}
                            />
                            <AvatarFallback>{
                                (user?.user_metadata?.full_name || '')
                                    .split(' ')
                                    .map((name: string) => name.charAt(0).toUpperCase())
                                    .join('') || 'U'
                            }</AvatarFallback>
                        </Avatar>
                        <input type="file" ref={inputAvatarRef} disabled={updatingAvatar} onChange={handleAvatarChange} accept=".png" className="hidden" />
                        <div className="flex-grow space-y-2">
                            <Button disabled={updatingAvatar} variant="outline" onClick={() => inputAvatarRef.current?.click()}><ImageIcon className="mr-2 h-4 w-4" />
                                {updatingAvatar ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Change Avatar'}
                            </Button>
                            <p className="text-xs text-muted-foreground">Only PNG files are allowed. Max size of 500K</p>
                        </div>
                    </div>
                    <Separator />
                    <form id="profile-form" onSubmit={form.handleSubmit(handleSaveChanges)} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full Name *</Label>
                                <Input
                                    id="fullName"
                                    placeholder="Your full name"
                                    {...form.register("fullName", {
                                        required: 'Full name is required',
                                        minLength: { value: 3, message: 'Full name must be at least 3 characters' },
                                        maxLength: { value: 50, message: 'Full name must be at most 50 characters' },
                                        validate: (value) => value.trim().length >= 3 || 'Full name must be at least 3 characters'
                                    })}
                                    disabled={updatingProfile}
                                />
                                {form.formState.errors.fullName && (
                                    <p className="text-sm text-destructive">{form.formState.errors.fullName.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" type="email" defaultValue={user?.email} disabled placeholder="Your email address" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="bio">Bio</Label>
                                <span className="text-xs text-muted-foreground">
                                    {(form.watch('bio') || '').length}/500
                                </span>
                            </div>
                            <textarea
                                id="bio"
                                className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Tell us a little about yourself"
                                disabled={updatingProfile}
                                maxLength={500}
                                {...form.register("bio", {
                                    maxLength: { value: 500, message: 'Bio must be at most 500 characters' }
                                })}
                            />
                            {form.formState.errors.bio && (
                                <p className="text-sm text-destructive">{form.formState.errors.bio.message}</p>
                            )}
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="border-t px-6 py-4 flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                        * Required fields
                    </div>
                    <Button
                        type="submit"
                        form="profile-form"
                        disabled={updatingProfile || !form.formState.isDirty}
                        className="ml-auto"
                    >
                        <Save className="mr-2 h-4 w-4" />
                        {updatingProfile ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : 'Save Changes'}
                    </Button>
                </CardFooter>
            </Card>
        </TabsContent>
    )
}