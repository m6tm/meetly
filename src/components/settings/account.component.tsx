import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/card";
import { TabsContent } from "../ui/tabs";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { Input } from "../ui/input";
import { CreditCard } from "lucide-react";
import { Loader2 } from "lucide-react";
import { Save } from "lucide-react";
import React from "react";
import { useToast } from "@/hooks/use-toast";

export default function AccountComponent() {
    const [isCloseAccountDialogOpen, setIsCloseAccountDialogOpen] = React.useState(false);
    const [isClosingAccount, setIsClosingAccount] = React.useState(false);
    const [closeAccountConfirmationText, setCloseAccountConfirmationText] = React.useState("");
    const confirmationPhrase = "je comprends, fermer mon compte";
    const { toast } = useToast();

    const handleSaveChanges = (tab: string) => {
        console.log(tab);
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

    return (
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
    )
}