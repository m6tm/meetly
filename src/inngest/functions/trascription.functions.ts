import { getPrisma } from "@/lib/prisma";
import { inngest } from "../client";
import { TranscriptionStartData } from "@/types/meetly.types";
import { GeminiAiAdapter } from '@inngest/ai';
import { transcriptionPrompt } from "./prompts";
import { downloadFile } from "@/actions/s3-actions";


const transcriptionStart = inngest.createFunction(
    {
        id: "transcription-start",
        name: "Transcription start request - Save state",
        retries: 3
    },
    { event: "transcription/start.request" },
    async ({ event, step }) => {
        const { recordingId, retry_count } = event.data as TranscriptionStartData;
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

        await step.run("update-meeting", async () => {
            try {
                return await prisma.meetingRecording.update({
                    where: {
                        id: recordingId
                    },
                    data: {
                        transcription_status: "TRANSCRIPTION_IN_PROGRESS"
                    }
                })
            } catch (error) {
                console.error(error)
                await inngest.send({
                    name: "transcription/start.request",
                    data: {
                        recordingId,
                        retry_count: (retry_count || 0) + 1
                    }
                })
                _error = error as Error;
                return null;
            }
        });

        const recordingPath = await step.run("get-recording-path", async () => {
            try {
                return await prisma.meetingRecordingPath.findUnique({
                    where: {
                        meetingRecordingId: recordingId
                    },
                    select: {
                        filepath: true
                    }
                })
            } catch (error) {
                console.error(error)
                await inngest.send({
                    name: "transcription/start.request",
                    data: {
                        recordingId,
                        retry_count: (retry_count || 0) + 1
                    }
                })
                _error = error as Error;
                return null;
            }
        })

        if (!recordingPath) {
            _error = new Error("Recording path not found");
            inngest.send({
                name: "transcription/start.request",
                data: {
                    recordingId,
                    retry_count: (retry_count || 0) + 1
                }
            })
            return {
                success: false,
                error: _error,
                data: null
            }
        }

        const downloadFileResponse = await step.run("get-file-base64", async () => {
            try {
                return await downloadFile(process.env.AWS_S3_BUCKET!, recordingPath.filepath, 'ogg')
            } catch (error) {
                console.error(error)
                await inngest.send({
                    name: "transcription/start.request",
                    data: {
                        recordingId,
                        retry_count: (retry_count || 0) + 1
                    }
                })
                _error = error as Error;
                return null;
            }
        })

        if (!downloadFileResponse || (!downloadFileResponse.success && !downloadFileResponse.file && !downloadFileResponse.contentType)) {
            _error = new Error("Download file not found");
            inngest.send({
                name: "transcription/start.request",
                data: {
                    recordingId,
                    retry_count: (retry_count || 0) + 1
                }
            })
            return {
                success: false,
                error: _error,
                data: null
            }
        }

        const aiModel = await step.run("transcription.processing.get-model", async () => {
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
                                    text: transcriptionPrompt("French")
                                }
                            ]
                        }
                    }
                })
            } catch (error) {
                console.error(error)
                await inngest.send({
                    name: "transcription/start.request",
                    data: {
                        recordingId,
                        retry_count: (retry_count || 0) + 1
                    }
                })
                _error = error as Error;
                return null;
            }
        })

        if (!aiModel) {
            await inngest.send({
                name: "transcription/start.request",
                data: {
                    recordingId,
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

        const result = await step.ai.infer('transcription.processing', {
            model: aiModel,
            body: {
                contents: [
                    {
                        role: "user",
                        parts: [{
                            text: "Transcribe the following audio"
                        }]
                    },
                    {
                        role: "user",
                        parts: [{
                            inlineData: {
                                data: downloadFileResponse.file!.replace(/^data:audio\/\w+;base64,/, ""),
                                mimeType: downloadFileResponse.contentType!
                            }
                        }]
                    }
                ]
            }
        })

        const part = result.candidates?.[0]?.content?.parts?.[0];
        const transcription = part && 'text' in part ? part.text : null;

        await step.run('final-state-save-transcription', async () => {
            try {
                return await prisma.meetingRecording.update({
                    where: {
                        id: recordingId
                    },
                    data: {
                        transcription_status: "TRANSCRIPTION_COMPLETED",
                        transcription: transcription
                    }
                })
            } catch (error) {
                console.error(error)
                await inngest.send({
                    name: "transcription/start.request",
                    data: {
                        recordingId,
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
            data: transcription
        }
    }
);

const transcriptionFunctions = [transcriptionStart];
export default transcriptionFunctions