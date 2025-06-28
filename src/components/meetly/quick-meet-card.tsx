
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, ScreenShare } from "lucide-react";
import { useRouter } from 'next/navigation';

const QuickMeetCard = () => {
  const router = useRouter();

  const handleShareScreen = () => {
    console.log("Share Screen button clicked");
    // Placeholder for actual screen sharing logic
    // Potentially router.push('/share-screen') or similar dedicated page
  };

  const handleQuickMeet = () => {
    router.push('/meet');
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-center space-x-3 mb-2">
          <Video className="h-8 w-8 text-primary" />
          <CardTitle className="text-2xl">Instant Meetings</CardTitle>
        </div>
        <CardDescription>Start or join a meeting instantly.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button className="w-full" size="lg" onClick={handleQuickMeet}>
          <Video className="mr-2 h-5 w-5" /> Quick Meet
        </Button>
        <p className="text-sm text-muted-foreground">
          High-quality audio/video powered by LiveKit.
        </p>
      </CardContent>
    </Card>
  );
};

export default QuickMeetCard;
