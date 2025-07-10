import { getPrisma } from "@/lib/prisma";
import { inngest } from "../client";

export type RecordingStartData = {
    egressId: string;
    meetingId: string;
    meet_name: string;
    filepath: string;
}

export const startRecording = inngest.createFunction(
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
