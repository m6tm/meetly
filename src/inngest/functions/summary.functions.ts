import { getPrisma } from "@/lib/prisma";
import { inngest } from "../client";
import { SummaryStartData } from "@/types/meetly.types";
import { GeminiAiAdapter } from '@inngest/ai';
import { summaryPrompt } from "./prompts";


const summaryStart = inngest.createFunction(
    {
        id: "summary-start",
        name: "Summary start request - Save state",
        retries: 3
    },
    { event: "summary/start.request" },
    async ({ event, step }) => {
        const { recordingId, transcription, retry_count } = event.data as SummaryStartData;
        const prisma = getPrisma()
        let _error: Error | null = null;

        if (retry_count > 3) {
            await prisma.meetingRecording.update({
                where: {
                    id: recordingId
                },
                data: {
                    transcription_status: "TRANSCRIPTION_FAILLED"
                }
            })
            _error = new Error("Too many retries");
            return {
                success: false,
                error: _error,
                data: null
            }
        }

        const aiModel = await step.run("summary.processing.get-model", async () => {
            try {
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
                            parts: [
                                {
                                    text: summaryPrompt("French", transcription)
                                }
                            ]
                        }
                    }
                })
            } catch (error) {
                console.error(error)
                await inngest.send({
                    name: "summary/start.request",
                    data: {
                        recordingId,
                        transcription,
                        retry_count: (retry_count || 0) + 1
                    }
                })
                _error = error as Error;
                return null;
            }
        })

        if (!aiModel) {
            await inngest.send({
                name: "summary/start.request",
                data: {
                    recordingId,
                    transcription,
                    retry_count: (retry_count || 0) + 1
                }
            })
            _error = new Error("AI model not found");
            return {
                success: false,
                error: _error,
                data: null
            }
        }

        const result = await step.ai.infer('summary.processing', {
            model: aiModel,
            body: {
                contents: [
                    {
                        role: 'model',
                        parts: [
                            {
                                text: summaryPrompt("French", transcription)
                            }
                        ]
                    },
                    {
                        role: "user",
                        parts: [{
                            text: `Summarize the following transcription: ${transcription}`
                        }]
                    },
                ]
            }
        })

        const part = result.candidates?.[0]?.content?.parts?.[0];
        const summary = part && 'text' in part ? part.text : null;

        await step.run('final-state-save-transcription', async () => {
            try {
                return await prisma.meetingRecording.update({
                    where: {
                        id: recordingId
                    },
                    data: {
                        transcription_status: "TRANSCRIPTION_COMPLETED",
                        transcription,
                        summary
                    }
                })
            } catch (error) {
                console.error(error)
                await inngest.send({
                    name: "summary/start.request",
                    data: {
                        recordingId,
                        transcription,
                        retry_count: (retry_count || 0) + 1
                    }
                })
                _error = error as Error;
                return null;
            }
        })

        return {
            success: _error ? false : true,
            error: _error,
            data: summary
        }
    }
);

const summaryFunctions = [summaryStart];
export default summaryFunctions