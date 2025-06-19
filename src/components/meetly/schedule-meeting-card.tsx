
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarPlus, Mail, Users, Repeat } from "lucide-react";
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

const ScheduleMeetingCard = () => {
  const [meetingName, setMeetingName] = React.useState("");
  const [meetingDate, setMeetingDate] = React.useState("");
  const [meetingTime, setMeetingTime] = React.useState("");
  const [invitees, setInvitees] = React.useState("");
  const [isRecurring, setIsRecurring] = React.useState(false);

  const handleSchedule = () => {
    console.log("Schedule Meeting:", { 
      meetingName, 
      meetingDate, 
      meetingTime,
      invitees: invitees.split(/[\n,]+/).map(email => email.trim()).filter(email => email), // Split by newline or comma, trim, and filter empty strings
      isRecurring 
    });
    // Placeholder for actual scheduling logic
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-center space-x-3 mb-2">
          <CalendarPlus className="h-8 w-8 text-primary" />
          <CardTitle className="text-2xl">Plan Ahead</CardTitle>
        </div>
        <CardDescription>Schedule meetings and manage invitations.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Dialog>
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
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="meeting-date" className="text-right">
                  Date
                </Label>
                <Input
                  id="meeting-date"
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className="col-span-3"
                />
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
                  />
                  <Label htmlFor="recurring" className="text-sm font-normal text-muted-foreground">
                    Is this a recurring meeting?
                  </Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleSchedule}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <p className="text-sm text-muted-foreground">
          Set recurring meetings, send email invites, and secure with access codes.
        </p>
      </CardContent>
    </Card>
  );
};

export default ScheduleMeetingCard;
