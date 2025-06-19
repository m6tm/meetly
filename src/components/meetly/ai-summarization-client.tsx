"use client";

import type * as z from "zod";
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { summarizeMeeting, type SummarizeMeetingInput, type SummarizeMeetingOutput } from "@/ai/flows/summarize-meeting";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Brain, AlertTriangle, ClipboardList, CheckCircle, ListOrdered, Disc } from "lucide-react";

const defaultTranscript = `Alice: Good morning, everyone. Let's start with the project update. Bob, how are the UI designs coming along?
Bob: Morning, Alice. The mockups for the dashboard are complete. I've shared them in the design channel. We need feedback by EOD tomorrow.
Charlie: Sounds good, Bob. I'll take a look. On the backend side, API integrations are 90% done. We hit a small snag with the payment gateway.
Alice: Okay, Charlie. What's the plan for the payment gateway issue?
Charlie: I'm working with their support team. Expecting a resolution by Friday. This might push our beta launch by a day or two.
Alice: Understood. Let's aim to mitigate that. Key decision: Bob to finalize UI based on feedback by Wednesday next week. Charlie to provide an update on payment gateway by Monday. Action item for me: update stakeholders on potential beta launch adjustment.
Bob: Roger that.
Charlie: Will do.`;

const AISummarizationClient = () => {
  const [transcript, setTranscript] = useState<string>(defaultTranscript);
  const [summaryResult, setSummaryResult] = useState<SummarizeMeetingOutput | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSummarization = async () => {
    if (!transcript.trim()) {
      setError("Transcript cannot be empty.");
      toast({
        title: "Invalid Input",
        description: "Please provide a meeting transcript.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setSummaryResult(null);

    try {
      const input: SummarizeMeetingInput = { transcript };
      const result = await summarizeMeeting(input);
      setSummaryResult(result);
    } catch (e: any) {
      console.error("Summarization error:", e);
      const errorMessage = e.message || "An unexpected error occurred during summarization.";
      setError(errorMessage);
      toast({
        title: "Summarization Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 w-full">
      <CardHeader>
        <div className="flex items-center space-x-3 mb-2">
          <Brain className="h-8 w-8 text-primary" />
          <CardTitle className="text-2xl">AI Smart Summaries</CardTitle>
        </div>
        <CardDescription>
          Generate intelligent summaries from meeting transcripts, highlighting key points and decisions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="meeting-transcript" className="text-sm font-medium">Meeting Transcript</Label>
          <Textarea
            id="meeting-transcript"
            placeholder="Paste your meeting transcript here..."
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="mt-1 min-h-[150px]"
          />
        </div>
        <Button onClick={handleSummarization} disabled={isLoading || !transcript.trim()} className="w-full sm:w-auto">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Brain className="mr-2 h-4 w-4" />
          )}
          Generate Summary
        </Button>
      </CardContent>
      {(summaryResult || error) && (
        <CardFooter className="flex flex-col items-start space-y-4 pt-4 border-t">
          {error && (
             <div className="w-full p-4 rounded-md bg-destructive/10 text-destructive border border-destructive/30">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                <h4 className="font-semibold">Error</h4>
              </div>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}
          {summaryResult && (
            <div className="w-full space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-primary mb-2 flex items-center"><ClipboardList className="mr-2 h-5 w-5" />Summary:</h4>
                <div className="p-3 bg-muted/50 rounded-md text-sm leading-relaxed">
                  {summaryResult.summary}
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-primary mb-2 flex items-center"><Disc className="mr-2 h-5 w-5" />Key Discussion Points:</h4>
                <div className="p-3 bg-muted/50 rounded-md text-sm leading-relaxed">
                  {summaryResult.keyDiscussionPoints}
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-primary mb-2 flex items-center"><CheckCircle className="mr-2 h-5 w-5" />Decisions Made:</h4>
                 <div className="p-3 bg-muted/50 rounded-md text-sm leading-relaxed">
                  {summaryResult.decisionsMade}
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-primary mb-2 flex items-center"><ListOrdered className="mr-2 h-5 w-5" />Action Items:</h4>
                <div className="p-3 bg-muted/50 rounded-md text-sm leading-relaxed">
                   {summaryResult.actionItems}
                </div>
              </div>
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default AISummarizationClient;
