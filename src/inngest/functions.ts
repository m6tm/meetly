import { inngest } from "./client";

export const processUserData = inngest.createFunction(
    {
        id: "process-user-data",
        name: "Process User Data",
        retries: 3 // Nombre de tentatives en cas d'échec
    },
    { event: "user/data.process" },
    async ({ event, step }) => {
        const { userId, email } = event.data;

        // Validation des données
        const validatedData = await step.run("validate-data", async () => {
            if (!userId || !email) {
                throw new Error("Données utilisateur invalides");
            }
            return { userId, email };
        });

        // Traitement des données
        const processedData = await step.run("process-data", async () => {
            // Simuler un traitement
            await new Promise(resolve => setTimeout(resolve, 1000));
            return {
                ...validatedData,
                processedAt: new Date().toISOString(),
                status: "processed"
            };
        });

        // Envoi d'email (exemple)
        await step.run("send-notification", async () => {
            console.log(`Notification envoyée à ${email}`);
            return { emailSent: true };
        });

        return processedData;
    }
);
