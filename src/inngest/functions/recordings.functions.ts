import { getPrisma } from "@/lib/prisma";
import { inngest } from "../client";
import { RecordingStartData, StopRecordingPayload } from "@/types/meetly.types";

const startRecording = inngest.createFunction(
    {
        id: "recording-start",
        name: "Start recording request - Save state",
        retries: 3
    },
    { event: "recording/start.request" },
    async ({ event, step }) => {
        const { egressId, meetingId, meet_name, filepath, retry_count } = event.data as RecordingStartData;
        const prisma = getPrisma()
        let _error: Error | null = null;

        if (retry_count > 3) {
            await prisma.meetingRecordingPath.deleteMany({
                where: {
                    meetRecording: {
                        meetingId,
                        egressId
                    }
                }
            })
            await prisma.meetingRecording.update({
                where: {
                    egressId,
                    meetingId
                },
                data: {
                    recording_status: "RECORDING_FAILLED"
                }
            })
            await prisma.meeting.update({
                where: {
                    id: meetingId
                },
                data: {
                    egressId: null
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
                return await prisma.meeting.update({
                    where: {
                        id: meetingId
                    },
                    data: {
                        egressId
                    }
                });
            } catch (error) {
                console.error(error)
                await inngest.send({
                    name: "recording/start.request",
                    data: {
                        egressId,
                        meetingId,
                        meet_name,
                        filepath,
                        retry_count: (retry_count || 0) + 1
                    }
                })
                _error = error as Error;
                return null;
            }
        });

        const meetingRecordingUpdated = await step.run("creating-new-meeting-recording", async () => {
            try {
                const response = await prisma.meetingRecording.create({
                    data: {
                        meetingId: meetingId,
                        egressId,
                        recordDate: new Date(),
                        name: meet_name,
                    }
                })
                return response;
            } catch (error) {
                console.error(error)
                await inngest.send({
                    name: "recording/start.request",
                    data: {
                        egressId,
                        meetingId,
                        meet_name,
                        filepath,
                        retry_count: (retry_count || 0) + 1
                    }
                })
                _error = error as Error;
                return null;
            }
        });

        if (!meetingRecordingUpdated) {
            _error = new Error("Meeting recording not found");
            return {
                success: false,
                error: _error,
                data: null
            }
        }

        await step.run("creating-new-meeting-recording-path", async () => {
            try {
                return await prisma.meetingRecordingPath.create({
                    data: {
                        meetingRecordingId: meetingRecordingUpdated.id,
                        createdAt: new Date(),
                        filename: `${meet_name}.mp4`,
                        filepath,
                    }
                })
            } catch (error) {
                console.error(error)
                await inngest.send({
                    name: "recording/start.request",
                    data: {
                        egressId,
                        meetingId,
                        meet_name,
                        filepath,
                        retry_count: (retry_count || 0) + 1
                    }
                })
                _error = error as Error;
                return null;
            }
        });

        return {
            success: _error ? false : true,
            error: _error,
            data: null
        }
    }
);

const stopRecording = inngest.createFunction(
    {
        id: "recording-stop",
        name: "Stop recording request - Save state",
        retries: 3
    },
    { event: "recording/stop.request" },
    async ({ event, step }) => {
        const { egressId, meetingId, duration, retry_count } = event.data as StopRecordingPayload;
        let _error: Error | null = null;
        const prisma = getPrisma()

        if (retry_count > 3) {
            await prisma.meetingRecording.update({
                where: {
                    egressId,
                    meetingId
                },
                data: {
                    recording_status: "RECORDING_FAILLED"
                }
            })
            _error = new Error("Too many retries");
            return {
                success: false,
                error: _error,
                data: null
            }
        }

        const meetingRecording = await step.run("update-meeting-recording", async () => {
            try {
                return await prisma.meetingRecording.findFirst({
                    where: {
                        egressId,
                        meetingId
                    },
                    select: {
                        id: true,
                    }
                })
            } catch (error) {
                console.error(error)
                await inngest.send({
                    name: "recording/stop.request",
                    data: {
                        egressId,
                        meetingId,
                        duration,
                        retry_count: (retry_count || 0) + 1
                    }
                })
                _error = error as Error;
                return null
            }
        });

        if (!meetingRecording) {
            await inngest.send({
                name: "recording/stop.request",
                data: {
                    egressId,
                    meetingId,
                    duration,
                    retry_count: (retry_count || 0) + 1
                }
            })
            _error = new Error("Meeting recording not found");
            return {
                success: false,
                error: _error,
                data: null
            }
        }

        await step.run("mark-meeting-recording-as-completed", async () => {
            try {
                return await prisma.meetingRecording.update({
                    where: {
                        egressId,
                        meetingId
                    },
                    data: {
                        recording_status: "RECORDING_COMPLETED"
                    }
                })
            } catch (error) {
                console.error(error)
                await inngest.send({
                    name: "recording/stop.request",
                    data: {
                        egressId,
                        meetingId,
                        duration,
                        retry_count: (retry_count || 0) + 1
                    }
                })
                _error = error as Error;
                return null
            }
        })

        await step.run("update-recordings-path", async () => {
            try {
                return await prisma.meetingRecordingPath.updateMany({
                    where: {
                        meetingRecordingId: meetingRecording.id
                    },
                    data: {
                        saveDate: new Date(),
                        duration: duration ?? "0"
                    }
                });
            } catch (error) {
                console.error(error)
                await inngest.send({
                    name: "recording/stop.request",
                    data: {
                        egressId,
                        meetingId,
                        duration,
                        retry_count: (retry_count || 0) + 1
                    }
                })
                _error = error as Error;
                return null
            }
        })

        await step.run("clear-meeting", async () => {
            try {
                return await prisma.meeting.update({
                    where: {
                        id: meetingId
                    },
                    data: {
                        egressId: null
                    }
                })
            } catch (error) {
                console.error(error)
                await inngest.send({
                    name: "recording/stop.request",
                    data: {
                        egressId,
                        meetingId,
                        duration,
                        retry_count: (retry_count || 0) + 1
                    }
                })
                _error = error as Error;
                return null
            }
        })

        return {
            success: _error ? false : true,
            error: _error,
            data: null
        }
    }
);

const recordingFunctions = [startRecording, stopRecording];

export default recordingFunctions
