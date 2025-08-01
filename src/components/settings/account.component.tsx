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
import React, { useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { closeAccountAction, getAccountAction } from "@/actions/account.actions";
import { Account, AccountStatus } from "@/generated/prisma";
import { userStore } from "@/stores/user.store";

export default function AccountComponent() {
    const [isCloseAccountDialogOpen, setIsCloseAccountDialogOpen] = React.useState(false);
    const [isClosingAccount, setIsClosingAccount] = React.useState(false);
    const [closeAccountConfirmationText, setCloseAccountConfirmationText] = React.useState("");
    const [account, setAccount] = React.useState<Account | null>(null);
    const confirmationPhrase = "je comprends, fermer mon compte";
    const { user } = userStore();
    const { toast } = useToast();

    const fetchAccount = useCallback(async () => {
        const response = await getAccountAction()
        if (!response.success) {
            toast({
                title: "Erreur",
                description: response.error,
                variant: "destructive"
            });
            return;
        }
        setAccount(response.data);
    }, [user]);

    useEffect(() => {
        if (user) fetchAccount();
    }, [user]);

    const handleConfirmCloseAccount = useCallback(async () => {
        if (closeAccountConfirmationText !== confirmationPhrase) {
            toast({
                title: "Confirmation Incorrecte",
                description: `Veuillez taper "${confirmationPhrase}" pour confirmer.`,
                variant: "destructive",
            });
            return;
        }
        setIsClosingAccount(true);
        const response = await closeAccountAction()
        setIsClosingAccount(false);
        if (!response.success) {
            toast({
                title: "Erreur",
                description: response.error,
                variant: "destructive"
            });
            return;
        }
        setAccount(response.data);

        toast({
            title: "Compte Fermé",
            description: "Votre compte a été marqué pour fermeture.",
            variant: "destructive"
        });
        setIsCloseAccountDialogOpen(false);
        setCloseAccountConfirmationText("");
    }, [closeAccountConfirmationText]);

    return (
        <TabsContent value="account">
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center"><CreditCard className="mr-2 h-5 w-5 text-primary" />Account Settings</CardTitle>
                    <CardDescription>Manage your subscription, billing, and account details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label>Subscription Plan (Coming soon)</Label>
                        <p className="text-sm text-foreground font-semibold">Pro Plan</p>
                        <Link
                            // href="/dashboard/subscription"
                            href="#"
                        >
                            <Button variant="outline" size="sm" disabled>
                                Manage Subscription
                            </Button>
                        </Link>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                        <Label>Billing Information (Coming soon)</Label>
                        <p className="text-sm text-muted-foreground">Your next bill is on August 1, 2024 for $19.99.</p>
                        <Link
                            // href="/dashboard/billing-history"
                            href="#"
                        >
                            <Button variant="link" className="p-0 h-auto" disabled>View Billing History</Button>
                        </Link>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                        <Label className="text-destructive font-medium block mb-1">Danger Zone (Coming soon)</Label>
                        <AlertDialog open={isCloseAccountDialogOpen} onOpenChange={setIsCloseAccountDialogOpen}>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="destructive"
                                    // disabled={isClosingAccount || account?.status !== AccountStatus.ACTIVE}
                                    disabled={true}
                                >
                                    {isClosingAccount ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        "Close Account"
                                    )}
                                </Button>
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
            </Card>
        </TabsContent>
    )
}