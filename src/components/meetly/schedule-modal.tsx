"use client";

import { Button } from "@/components/ui/button";
import { CalendarPlus, Users, Repeat, CalendarIcon, Loader2 } from "lucide-react";
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
import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function ScheduleMeetingModal() {
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
        console.log("Scheduling Meeting with details:", { 
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
        description: "Your meeting has been successfully scheduled.",
        });
        setIsDialogOpen(false); // Close dialog on success
        // resetForm(); // Optionally reset form fields after successful scheduling
    };
    
    const handleOpenDialog = (open: boolean) => {
        if (open) {
        resetForm(); // Reset form when dialog opens
        }
        setIsDialogOpen(open);
    }
    
    return (
        <Dialog open={isDialogOpen} onOpenChange={handleOpenDialog}>
          <DialogTrigger asChild>
            <Button className="w-full" size="lg">
              <CalendarPlus className="mr-2 h-5 w-5" /> Schedule a Meeting
            </Button>
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
                <Label htmlFor="meeting-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="meeting-name"
                  value={meetingName}
                  onChange={(e) => setMeetingName(e.target.value)}
                  placeholder="Project Kick-off"
                  className="col-span-3"
                  disabled={isLoading}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="meeting-date-trigger" className="text-right">
                  Date
                </Label>
                <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="meeting-date-trigger"
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
                <Label htmlFor="meeting-time" className="text-right">
                  Time
                </Label>
                <Input
                  id="meeting-time"
                  type="time"
                  value={meetingTime}
                  onChange={(e) => setMeetingTime(e.target.value)}
                  className="col-span-3"
                  disabled={isLoading}
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="invitees" className="text-right pt-2">
                  <Users className="inline-block h-4 w-4 mr-1" />
                  Invitees
                </Label>
                <Textarea
                  id="invitees"
                  value={invitees}
                  onChange={(e) => setInvitees(e.target.value)}
                  placeholder="Enter email addresses, separated by commas or new lines"
                  className="col-span-3 min-h-[80px]"
                  disabled={isLoading}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="recurring" className="text-right col-start-1 col-span-1 flex items-center justify-end">
                  <Repeat className="inline-block h-4 w-4 mr-1" />
                  Recurring
                </Label>
                <div className="col-span-3 flex items-center space-x-2">
                   <Checkbox
                    id="recurring"
                    checked={isRecurring}
                    onCheckedChange={(checked) => setIsRecurring(checked as boolean)}
                    disabled={isLoading}
                  />
                  <Label htmlFor="recurring" className="text-sm font-normal text-muted-foreground">
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
    )
}