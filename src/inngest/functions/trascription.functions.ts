import { getPrisma } from "@/lib/prisma";
import { inngest } from "../client";
import { TranscriptionAiResult, TranscriptionStartData } from "@/types/meetly.types";
import { GeminiAiAdapter } from '@inngest/ai';
import { transcriptionPrompt } from "./prompts";
import { Inngest } from "inngest";

type TranscriptionResult = {
    success: boolean;
    error: Error | null;
    data: any | null;
};

const MAX_RETRIES = 3;

const transcriptionStart = inngest.createFunction(
    {
        id: "transcription-start",
        name: "Transcription start request",
        retries: MAX_RETRIES,
    },
    { event: "transcription/start.request" },
    async ({ event, step }): Promise<TranscriptionResult> => {
        const { recordingId, retry_count } = event.data as TranscriptionStartData;
        const prisma = getPrisma();

        if (retry_count > MAX_RETRIES) {
            await handleFailedTranscription(prisma, recordingId);
            return {
                success: false,
                error: new Error("Maximum retry attempts exceeded"),
                data: null,
            };
        }

        const updateResult = await updateMeetingStatus(step, prisma, recordingId, retry_count);
        if (!updateResult.success) {
            return updateResult;
        }

        const modelResult = await getAIModel(step, recordingId, retry_count);
        if (!modelResult.success) {
            return modelResult;
        }
        try {
            const result: TranscriptionAiResult = await step.ai.infer('transcription.processing', {
                model: modelResult.data,
                body: {
                    contents: [
                        {
                            parts: [
                                {
                                    text: "Write instructions for improving short term memory"
                                }
                            ]
                        }
                    ]
                }
            });

            return {
                success: true,
                error: null,
                data: result.data.candidates?.[0]?.content?.parts?.[0] ?? null
            };
        } catch (error) {
            await scheduleRetry(inngest, recordingId, retry_count);
            return {
                success: false,
                error: error as Error,
                data: null,
            };
        }
    }
);

async function handleFailedTranscription(prisma: any, recordingId: string) {
    await prisma.meetingRecording.update({
        where: { id: recordingId },
        data: { transcription_status: "TRANSCRIPTION_FAILED" }
    });
}

async function updateMeetingStatus(
    step: any,
    prisma: any,
    recordingId: string,
    retry_count: number
): Promise<TranscriptionResult> {
    try {
        await step.run("update-meeting", async () => {
            return await prisma.meetingRecording.update({
                where: { id: recordingId },
                data: { transcription_status: "TRANSCRIPTION_IN_PROGRESS" }
            });
        });
        return { success: true, error: null, data: null };
    } catch (error) {
        await scheduleRetry(inngest, recordingId, retry_count);
        return {
            success: false,
            error: error as Error,
            data: null,
        };
    }
}

async function getAIModel(
    step: any,
    recordingId: string,
    retry_count: number
): Promise<TranscriptionResult> {
    try {
        const model = await step.run("transcription.processing.get-model", async () => {
            return step.ai.models.gemini({
                model: "gemini-2.5-flash",
                apiKey: process.env.GEMINI_API_KEY,
                defaultParameters: {
                    safetySettings: [
                        {
                            threshold: GeminiAiAdapter.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                            category: GeminiAiAdapter.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT
                        }
                    ],
                    generationConfig: {
                        maxOutputTokens: 1000,
                        temperature: 0.7,
                        topP: 0.9,
                        topK: 40,
                    },
                    systemInstruction: {
                        role: "system",
                        parts: [{ text: transcriptionPrompt }]
                    }
                }
            });
        });

        if (!model) {
            await scheduleRetry(inngest, recordingId, retry_count);
            return {
                success: false,
                error: new Error("AI model initialization failed"),
                data: null,
            };
        }

        return { success: true, error: null, data: model };
    } catch (error) {
        await scheduleRetry(inngest, recordingId, retry_count);
        return {
            success: false,
            error: error as Error,
            data: null,
        };
    }
}

async function scheduleRetry(
    inngest: Inngest,
    recordingId: string,
    retry_count: number
) {
    await inngest.send({
        name: "transcription/start.request",
        data: {
            recordingId,
            retry_count: retry_count + 1
        }
    });
}

const transcriptionFunctions = [transcriptionStart];
export default transcriptionFunctions;