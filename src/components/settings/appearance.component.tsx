import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { TabsContent } from "../ui/tabs";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Separator } from "../ui/separator";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { Palette, Sun, Moon } from "lucide-react";
import { Save } from "lucide-react";
import React from "react";

export default function AppearanceComponent() {
    const [currentTheme, setCurrentTheme] = React.useState("system");

    const handleSaveChanges = (tab: string) => {
        console.log(tab);
    };

    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            const isDark = document.documentElement.classList.contains('dark');
            setCurrentTheme(isDark ? "dark" : "light");
        }
    }, []);

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
    return (

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
    )
}