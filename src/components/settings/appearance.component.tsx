"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { TabsContent } from "../ui/tabs";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { Palette, Sun, Moon, Loader2 } from "lucide-react";
import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { updateAppearanceAction, getAppearanceAction } from "@/actions/account.actions";
import { useToast } from "@/hooks/use-toast";
import { Theme } from "@/generated/prisma";

export default function AppearanceComponent() {
    const [currentTheme, setCurrentTheme] = useState<Theme>(Theme.SYSTEM);
    const [language, setLanguage] = useState("en");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const loadAppearance = async () => {
            try {
                const response = await getAppearanceAction();
                if (response.success && response.data) {
                    setCurrentTheme(response.data.theme as Theme);
                    setLanguage(response.data.language || "en");
                    applyTheme(response.data.theme);
                }
            } catch (error) {
                console.error('Failed to load appearance settings:', error);
                toast({
                    title: "Error",
                    description: "Failed to load appearance settings.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        loadAppearance();
    }, [toast]);

    const applyTheme = (theme: Theme) => {
        if (typeof window === 'undefined') return;

        if (theme === Theme.DARK) {
            document.documentElement.classList.add('dark');
        } else if (theme === Theme.LIGHT) {
            document.documentElement.classList.remove('dark');
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
    };

    const handleThemeChange = async (themeValue: Theme) => {
        setCurrentTheme(themeValue);
        applyTheme(themeValue);
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        try {
            const response = await updateAppearanceAction({
                theme: currentTheme,
                language
            });

            if (response.success) {
                toast({
                    title: "Success",
                    description: "Appearance settings saved successfully.",
                });
            } else {
                throw new Error(response.error || 'Failed to save appearance settings');
            }
        } catch (error) {
            console.error('Failed to save appearance settings:', error);
            toast({
                title: "Error",
                description: "Failed to save appearance settings.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };
    if (isLoading) {
        return (
            <TabsContent value="appearance">
                <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Palette className="mr-2 h-5 w-5 text-primary" />
                            Appearance Settings
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </CardContent>
                </Card>
            </TabsContent>
        );
    }

    return (
        <TabsContent value="appearance">
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Palette className="mr-2 h-5 w-5 text-primary" />
                        Appearance Settings
                    </CardTitle>
                    <CardDescription>Customize the look and feel of the application.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="theme">Theme</Label>
                        <Select
                            value={currentTheme}
                            onValueChange={handleThemeChange}
                            disabled={isSaving}
                        >
                            <SelectTrigger id="theme" className="w-full sm:w-[280px]">
                                <SelectValue placeholder="Select theme" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={Theme.LIGHT}>
                                    <div className="flex items-center">
                                        <Sun className="mr-2 h-4 w-4" />
                                        Light
                                    </div>
                                </SelectItem>
                                <SelectItem value={Theme.DARK}>
                                    <div className="flex items-center">
                                        <Moon className="mr-2 h-4 w-4" />
                                        Dark
                                    </div>
                                </SelectItem>
                                <SelectItem value={Theme.SYSTEM}>System Default</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">Choose your preferred interface theme.</p>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <Label htmlFor="language">Language</Label>
                        <Select
                            value={language}
                            onValueChange={setLanguage}
                            disabled={isSaving}
                        >
                            <SelectTrigger id="language" className="w-full sm:w-[280px]">
                                <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="fr">Français</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">Select your display language.</p>
                    </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button
                        onClick={handleSaveChanges}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Appearance
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </TabsContent>
    )
}