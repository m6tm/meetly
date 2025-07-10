import { inngest } from "@/inngest/client";
import { startRecording } from "@/inngest/functions/recordings.functions";
import { serve } from "inngest/next";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        startRecording,
    ],
});
