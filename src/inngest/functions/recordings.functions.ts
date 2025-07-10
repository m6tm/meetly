import { getPrisma } from "@/lib/prisma";
import { inngest } from "../client";

export type RecordingStartData = {
    egressId: string;
    meetingId: string;
    meet_name: string;
    filepath: string;
}

const startRecording = inngest.createFunction(
    {
        id: "recording-start",
        name: "Start recording request - Save state",
        retries: 3
    },
    { event: "recording/start.request" },
    async ({ event, step }) => {
        const { egressId, meetingId, meet_name, filepath } = event.data as RecordingStartData;
        const prisma = getPrisma()

        await step.run("update-meeting", async () => {
            try {
                await prisma.meeting.update({
                    where: {
                        id: meetingId
                    },
                    data: {
                        egressId
                    }
                });
            } catch (error) {
                console.error(error)
                throw error;
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
                throw error;
            }
        });

        await step.run("creating-new-meeting-recording-path", async () => {
            try {
                await prisma.meetingRecordingPath.create({
                    data: {
                        meetingRecordingId: meetingRecordingUpdated.id,
                        createdAt: new Date(),
                        filename: `${meet_name}.mp4`,
                        filepath,
                    }
                })
            } catch (error) {
                console.error(error)
                throw error;
            }
        });
    }
);

export type StopRecordingPayload = {
    egressId: string;
    meetingId: string;
    datas: Array<{
        filename: string;
        filepath: string;
        size: bigint;
        duration: bigint;
    }>
}

const stopRecording = inngest.createFunction(
    {
        id: "recording-stop",
        name: "Stop recording request - Save state",
        retries: 3
    },
    { event: "recording/stop.request" },
    async ({ event, step }) => {
        const { egressId, meetingId, datas } = event.data as StopRecordingPayload;
        const prisma = getPrisma()

        const meetingRecording = await step.run("update-meeting-recording", async () => {
            try {
                return await prisma.meetingRecording.findFirst({
                    where: {
                        egressId,
                    },
                    select: {
                        id: true,
                    }
                })
            } catch (error) {
                console.error(error)
                throw error;
            }
        });

        if (!meetingRecording) {
            throw new Error("Meeting recording not found");
        }

        await step.run("mark-meeting-recording-as-completed", async () => {
            try {
                await prisma.meetingRecording.update({
                    where: {
                        egressId,
                    },
                    data: {
                        recording_status: "RECORDING_COMPLETED"
                    }
                })
            } catch (error) {
                console.error(error)
                throw error;
            }
        })

        await step.run("update-recordings-path", async () => {
            try {
                await prisma.meetingRecordingPath.updateMany({
                    where: {
                        meetingRecordingId: meetingRecording.id
                    },
                    data: {
                        saveDate: new Date(),
                    }
                });
            } catch (error) {
                console.error(error)
                throw error;
            }
        })

        await step.run("clear-meeting", async () => {
            try {
                await prisma.meeting.update({
                    where: {
                        id: meetingId
                    },
                    data: {
                        egressId: null
                    }
                })
            } catch (error) {
                console.error(error)
                throw error;
            }
        })
    }
);

const recordingFunctions = [startRecording, stopRecording];

export default recordingFunctions
