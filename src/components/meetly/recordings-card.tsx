import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HardDrive, AudioLines, MessagesSquare } from "lucide-react";

const RecordingsCard = () => {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-center space-x-3 mb-2">
          <HardDrive className="h-8 w-8 text-primary" />
          <CardTitle className="text-2xl">Meeting Hub</CardTitle>
        </div>
        <CardDescription>Access recordings, chat logs, and more.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button variant="outline" className="w-full">
          <AudioLines className="mr-2 h-5 w-5" /> View Recordings
        </Button>
        <p className="text-sm text-muted-foreground">
          Automated audio recording for every meeting.
        </p>
        <Button variant="outline" className="w-full">
          <MessagesSquare className="mr-2 h-5 w-5" /> Open Chat
        </Button>
         <p className="text-sm text-muted-foreground">
          In-meeting chat for real-time communication.
        </p>
      </CardContent>
    </Card>
  );
};

export default RecordingsCard;
