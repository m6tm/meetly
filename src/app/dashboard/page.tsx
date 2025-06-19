
'use client';

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Video, CalendarPlus, Mail, Users, Repeat, CalendarIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const [meetingName, setMeetingName] = React.useState("");
  const [meetingDate, setMeetingDate] = React.useState<Date | undefined>(undefined);
  const [meetingTime, setMeetingTime] = React.useState("");
  const [invitees, setInvitees] = React.useState("");
  const [isRecurring, setIsRecurring] = React.useState(false);
  const [isDatePopoverOpen, setIsDatePopoverOpen] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    setMeetingName("");
    setMeetingDate(undefined);
    setMeetingTime("");
    setInvitees("");
    setIsRecurring(false);
  };

  const handleSchedule = async () => {
    setIsLoading(true);
    console.log("Scheduling Meeting from Dashboard with details:", { 
      meetingName, 
      meetingDate: meetingDate ? format(meetingDate, "PPP") : "Not selected", 
      meetingTime,
      invitees: invitees.split(/[\n,]+/).map(email => email.trim()).filter(email => email),
      isRecurring 
    });

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsLoading(false);
    toast({
      title: "Meeting Scheduled",
      description: "Your meeting has been successfully scheduled from the dashboard.",
    });
    setIsDialogOpen(false); // Close dialog on success
    // resetForm(); // Optionally reset form fields
  };
  
  const handleOpenDialog = (open: boolean) => {
    if (open) {
      resetForm(); // Reset form when dialog opens
    }
    setIsDialogOpen(open);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back, John!</h1>
          <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your meetings today.</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-5 w-5" />
          New Meeting
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Video className="mr-2 h-6 w-6 text-primary" />
              Start Instant Meeting
            </CardTitle>
            <CardDescription>Launch a new meeting right away.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Start Now</Button>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <CalendarPlus className="mr-2 h-6 w-6 text-primary" />
              Schedule a Meeting
            </CardTitle>
            <CardDescription>Plan a meeting for a future date and time.</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={isDialogOpen} onOpenChange={handleOpenDialog}>
              <DialogTrigger asChild>
                <Button className="w-full" variant="outline">Schedule</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center">
                    <CalendarPlus className="mr-2 h-5 w-5 text-primary" />
                    Schedule New Meeting
                  </DialogTitle>
                  <DialogDescription>
                    Fill in the details below to schedule your new meeting. Click save when you&apos;re done.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="meeting-name-dashboard" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="meeting-name-dashboard"
                      value={meetingName}
                      onChange={(e) => setMeetingName(e.target.value)}
                      placeholder="Project Kick-off"
                      className="col-span-3"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="meeting-date-trigger-dashboard" className="text-right">
                      Date
                    </Label>
                    <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          id="meeting-date-trigger-dashboard"
                          variant={"outline"}
                          className={cn(
                            "col-span-3 justify-start text-left font-normal",
                            !meetingDate && "text-muted-foreground"
                          )}
                          disabled={isLoading}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {meetingDate ? format(meetingDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={meetingDate}
                          onSelect={(date) => {
                            setMeetingDate(date);
                            setIsDatePopoverOpen(false);
                          }}
                          initialFocus
                          disabled={isLoading}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="meeting-time-dashboard" className="text-right">
                      Time
                    </Label>
                    <Input
                      id="meeting-time-dashboard"
                      type="time"
                      value={meetingTime}
                      onChange={(e) => setMeetingTime(e.target.value)}
                      className="col-span-3"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="invitees-dashboard" className="text-right pt-2">
                      <Users className="inline-block h-4 w-4 mr-1" />
                      Invitees
                    </Label>
                    <Textarea
                      id="invitees-dashboard"
                      value={invitees}
                      onChange={(e) => setInvitees(e.target.value)}
                      placeholder="Enter email addresses, separated by commas or new lines"
                      className="col-span-3 min-h-[80px]"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="recurring-dashboard" className="text-right col-start-1 col-span-1 flex items-center justify-end">
                      <Repeat className="inline-block h-4 w-4 mr-1" />
                      Recurring
                    </Label>
                    <div className="col-span-3 flex items-center space-x-2">
                       <Checkbox
                        id="recurring-dashboard"
                        checked={isRecurring}
                        onCheckedChange={(checked) => setIsRecurring(checked as boolean)}
                        disabled={isLoading}
                      />
                      <Label htmlFor="recurring-dashboard" className="text-sm font-normal text-muted-foreground">
                        Is this a recurring meeting?
                      </Label>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isLoading}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleSchedule} disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-shadow lg:col-span-1 md:col-span-2">
           <CardHeader>
            <CardTitle className="flex items-center text-xl">
              Upcoming Meetings
            </CardTitle>
            <CardDescription>Your scheduled events for today.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                <div>
                  <p className="font-medium">Project Alpha Sync</p>
                  <p className="text-sm text-muted-foreground">10:00 AM - 11:00 AM</p>
                </div>
                <Button variant="ghost" size="sm">Join</Button>
              </li>
              <li className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                <div>
                  <p className="font-medium">Team Brainstorm</p>
                  <p className="text-sm text-muted-foreground">2:00 PM - 3:00 PM</p>
                </div>
                <Button variant="ghost" size="sm">Join</Button>
              </li>
               <li className="text-center text-sm text-muted-foreground pt-2">
                No more meetings today.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle>Recent Recordings</CardTitle>
          <CardDescription>Quickly access your latest meeting recordings.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Marketing Strategy Q3", date: "Yesterday", duration: "45 min", thumbnail: "https://placehold.co/600x400.png", hint: "business team" },
              { title: "Dev Team Standup", date: "2 days ago", duration: "15 min", thumbnail: "https://placehold.co/600x400.png", hint: "code screen" },
              { title: "Client Onboarding Call", date: "July 15, 2024", duration: "60 min", thumbnail: "https://placehold.co/600x400.png", hint: "presentation slide" },
            ].map((rec, index) => (
              <div key={index} className="border rounded-lg overflow-hidden group">
                <div className="aspect-video bg-muted overflow-hidden">
                   <Image src={rec.thumbnail} alt={rec.title} width={600} height={400} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" data-ai-hint={rec.hint} />
                </div>
                <div className="p-3">
                  <h3 className="font-semibold truncate">{rec.title}</h3>
                  <p className="text-sm text-muted-foreground">{rec.date} &bull; {rec.duration}</p>
                  <Button variant="link" size="sm" className="px-0 mt-1">Watch Recording</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    