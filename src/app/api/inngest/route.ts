import { inngest } from "@/inngest/client";
import recordingFunctions from "@/inngest/functions/recordings.functions";
import transcriptionFunctions from "@/inngest/functions/trascription.functions";
import { serve } from "inngest/next";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        ...recordingFunctions,
        ...transcriptionFunctions,
    ],
});
