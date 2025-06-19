'use server';
/**
 * @fileOverview A meeting transcription AI agent.
 *
 * - transcribeMeeting - A function that handles the meeting transcription process.
 * - TranscribeMeetingInput - The input type for the transcribeMeeting function.
 * - TranscribeMeetingOutput - The return type for the transcribeMeeting function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranscribeMeetingInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "A audio recording of a meeting, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type TranscribeMeetingInput = z.infer<typeof TranscribeMeetingInputSchema>;

const TranscribeMeetingOutputSchema = z.object({
  transcription: z.string().describe('The transcription of the meeting audio.'),
});
export type TranscribeMeetingOutput = z.infer<typeof TranscribeMeetingOutputSchema>;

export async function transcribeMeeting(input: TranscribeMeetingInput): Promise<TranscribeMeetingOutput> {
  return transcribeMeetingFlow(input);
}

const transcribeMeetingPrompt = ai.definePrompt({
  name: 'transcribeMeetingPrompt',
  input: {schema: TranscribeMeetingInputSchema},
  output: {schema: TranscribeMeetingOutputSchema},
  prompt: `You are an AI expert at transcribing meeting audio.

You will use this information to transcribe the meeting audio and create a full text transcript.

Audio: {{media url=audioDataUri}}`,
});

const transcribeMeetingFlow = ai.defineFlow(
  {
    name: 'transcribeMeetingFlow',
    inputSchema: TranscribeMeetingInputSchema,
    outputSchema: TranscribeMeetingOutputSchema,
  },
  async input => {
    const {output} = await transcribeMeetingPrompt(input);
    return output!;
  }
);
