
"use client";

import { Button } from "@/components/ui/button";
import { CalendarPlus, Users, Repeat, CalendarIcon, Loader2, KeyRound, Eye, EyeOff } from "lucide-react";
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
import { createMeet, CreateMeetType, updateMeet, UpdateMeetType } from "@/actions/meetly-manager";
import { Meeting } from "@/app/dashboard/meetings/page";

interface ScheduleMeetingModalProps {
  initialValues?: (Partial<CreateMeetType> & { id: string });
  resetValues?: (values: Meeting | null, refresh?: boolean) => void;
}

export default function ScheduleMeetingModal({ initialValues, resetValues }: ScheduleMeetingModalProps) {
    const [meetingName, setMeetingName] = React.useState(initialValues?.name ?? "");
    const [meetingDate, setMeetingDate] = React.useState<Date | undefined>(initialValues?.date ?? undefined);
    const [meetingTime, setMeetingTime] = React.useState(initialValues?.time ?? "");
    const [invitees, setInvitees] = React.useState<string>(
      Array.isArray(initialValues?.invitees)
        ? initialValues?.invitees.join("\n")
        : initialValues?.invitees ?? ""
    );
    const [isRecurring, setIsRecurring] = React.useState(initialValues?.isRecurring ?? false);
    const [accessKey, setAccessKey] = React.useState(initialValues?.accessKey ?? "");
    const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
    const [isDatePopoverOpen, setIsDatePopoverOpen] = React.useState(!!initialValues);
    const [isDialogOpen, setIsDialogOpen] = React.useState(!!initialValues);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [waitingRefresh, setWaitingRefresh] = React.useState<boolean>(false);
    const { toast } = useToast();

    const resetForm = () => {
      setMeetingName("");
      setMeetingDate(undefined);
      setMeetingTime("");
      setInvitees("");
      setIsRecurring(false);
      setAccessKey("");
      setError(null)
    };

    const handleSchedule = async () => {
      setIsLoading(true);
      const data: CreateMeetType & { id?: string; } = {
          name: meetingName,
          date: meetingDate as Date,
          time: meetingTime,
          invitees: invitees.split(/[\n,]+/).map(email => email.trim()).filter(email => email),
          isRecurring,
          accessKey: accessKey,
      }
      if (!!initialValues) data.id = initialValues.id;

      const response = !!initialValues ? await updateMeet(data as UpdateMeetType) : await createMeet(data)

      setIsLoading(false);
      if (response.success) {
        toast({
            title: "Meeting Scheduled",
            description: "Your meeting has been successfully scheduled.",
        });
        if (resetValues) resetValues(null, true)
        setIsDialogOpen(false);
        resetForm();
        setError(null);
      }
      if (!response.success) {
          toast({
              title: "Failed to Schedule Meeting",
              description: response.error || "An error occurred while scheduling the meeting.",
              variant: "destructive",
          });
        setError(response.error)
        setWaitingRefresh(false)
      }
    };
    
    const handleOpenDialog = (open: boolean) => {
        if (open) {
        resetForm(); // Reset form when dialog opens
        } else {
          if (resetValues) resetValues(null, waitingRefresh)
        }
        setIsDialogOpen(open);
    }
    
    return (
        <Dialog open={isDialogOpen} onOpenChange={handleOpenDialog}>
        {
          !initialValues && (
            <DialogTrigger asChild>
              <Button className="w-full">
                <CalendarPlus className="mr-2 h-5 w-5" /> Schedule a Meeting
              </Button>
            </DialogTrigger>
          )
        }  
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <CalendarPlus className="mr-2 h-5 w-5 text-primary" />
                Schedule New Meeting
              </DialogTitle>
              <DialogDescription>
                Fill in the details below to schedule your new meeting. Click save when you&apos;re done.
              </DialogDescription>
                { error && <p className="text-red-500">{ error }</p> }
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
                  autoComplete="off"
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
                      disabled={(date: Date) => isLoading || date < new Date(new Date().setHours(0, 0, 0, 0))}
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
                <Label htmlFor="access-key" className="text-right">
                  <KeyRound className="inline-block h-4 w-4 mr-1" />
                  Password
                </Label>
                <div className="col-span-3 relative">
                  <Input
                    id="access-key"
                    type={isPasswordVisible ? "text" : "password"}
                    value={accessKey}
                    onChange={(e) => setAccessKey(e.target.value)}
                    placeholder="Optional"
                    className="pr-10"
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                   <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute inset-y-0 right-0 h-full px-3"
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                    aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                  >
                    {isPasswordVisible ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
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
