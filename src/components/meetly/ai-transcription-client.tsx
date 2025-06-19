"use client";

import type * as z from "zod";
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { transcribeMeeting, type TranscribeMeetingInput, type TranscribeMeetingOutput } from "@/ai/flows/transcribe-meeting";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileText, AlertTriangle } from "lucide-react";

// A very short, silent WAV file as a base64 data URI
const defaultAudioDataUri = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";

const AITranscriptionClient = () => {
  const [audioDataUri, setAudioDataUri] = useState<string>(defaultAudioDataUri);
  const [transcriptionResult, setTranscriptionResult] = useState<TranscribeMeetingOutput | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleTranscription = async () => {
    if (!audioDataUri.startsWith("data:audio/") || !audioDataUri.includes(";base64,")) {
      setError("Invalid audio data URI. Please ensure it's in the format 'data:audio/mime-type;base64,encoded_data'.");
      toast({
        title: "Invalid Input",
        description: "Audio data URI format is incorrect.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setTranscriptionResult(null);

    try {
      const input: TranscribeMeetingInput = { audioDataUri };
      const result = await transcribeMeeting(input);
      setTranscriptionResult(result);
    } catch (e: any) {
      console.error("Transcription error:", e);
      const errorMessage = e.message || "An unexpected error occurred during transcription.";
      setError(errorMessage);
      toast({
        title: "Transcription Failed",
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
          <FileText className="h-8 w-8 text-primary" />
          <CardTitle className="text-2xl">AI Transcription</CardTitle>
        </div>
        <CardDescription>
          Convert meeting audio recordings into text automatically. Paste an audio data URI below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="audio-data-uri" className="text-sm font-medium">Audio Data URI</Label>
          <Textarea
            id="audio-data-uri"
            placeholder="data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEA..."
            value={audioDataUri}
            onChange={(e) => setAudioDataUri(e.target.value)}
            className="mt-1 min-h-[100px] font-code text-xs"
            aria-describedby="audio-uri-description"
          />
          <p id="audio-uri-description" className="mt-1 text-xs text-muted-foreground">
            Provide a base64 encoded audio data URI (e.g., WAV, MP3). A short, silent WAV is pre-filled.
          </p>
        </div>
        <Button onClick={handleTranscription} disabled={isLoading || !audioDataUri} className="w-full sm:w-auto">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FileText className="mr-2 h-4 w-4" />
          )}
          Transcribe Audio
        </Button>
      </CardContent>
      {(transcriptionResult || error) && (
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
          {transcriptionResult && (
            <div className="w-full">
              <h4 className="text-lg font-semibold text-primary mb-2">Transcription:</h4>
              <div className="p-4 bg-muted/50 rounded-md max-h-60 overflow-y-auto">
                <p className="text-sm whitespace-pre-wrap">{transcriptionResult.transcription}</p>
              </div>
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default AITranscriptionClient;
