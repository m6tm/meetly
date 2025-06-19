import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, ScreenShare, ArrowRight } from "lucide-react";

const QuickMeetCard = () => {
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
        <Button className="w-full" size="lg">
          <Video className="mr-2 h-5 w-5" /> Quick Meet
        </Button>
        <Button variant="outline" className="w-full">
          <ScreenShare className="mr-2 h-5 w-5" /> Share Screen
        </Button>
        <p className="text-sm text-muted-foreground">
          High-quality audio/video powered by LiveKit.
        </p>
      </CardContent>
    </Card>
  );
};

export default QuickMeetCard;
