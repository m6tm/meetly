'use server';

/**
 * @fileOverview AI-powered meeting summarization flow.
 *
 * - summarizeMeeting - A function that summarizes a meeting transcript.
 * - SummarizeMeetingInput - The input type for the summarizeMeeting function.
 * - SummarizeMeetingOutput - The return type for the summarizeMeeting function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeMeetingInputSchema = z.object({
  transcript: z
    .string()
    .describe('The transcript of the meeting to be summarized.'),
});
export type SummarizeMeetingInput = z.infer<typeof SummarizeMeetingInputSchema>;

const SummarizeMeetingOutputSchema = z.object({
  summary: z.string().describe('The summary of the meeting.'),
  keyDiscussionPoints: z
    .string()
    .describe('Key discussion points from the meeting.'),
  decisionsMade: z.string().describe('Decisions made during the meeting.'),
  actionItems: z.string().describe('Action items from the meeting.'),
});
export type SummarizeMeetingOutput = z.infer<typeof SummarizeMeetingOutputSchema>;

export async function summarizeMeeting(
  input: SummarizeMeetingInput
): Promise<SummarizeMeetingOutput> {
  return summarizeMeetingFlow(input);
}

const summarizeMeetingPrompt = ai.definePrompt({
  name: 'summarizeMeetingPrompt',
  input: {schema: SummarizeMeetingInputSchema},
  output: {schema: SummarizeMeetingOutputSchema},
  prompt: `You are an AI assistant that summarizes meetings.

  Given the following meeting transcript, please provide a summary, key discussion points, decisions made, and action items.

  Transcript: {{{transcript}}}

  Summary:
  Key Discussion Points:
  Decisions Made:
  Action Items:`,
});

const summarizeMeetingFlow = ai.defineFlow(
  {
    name: 'summarizeMeetingFlow',
    inputSchema: SummarizeMeetingInputSchema,
    outputSchema: SummarizeMeetingOutputSchema,
  },
  async input => {
    const {output} = await summarizeMeetingPrompt(input);
    return output!;
  }
);
