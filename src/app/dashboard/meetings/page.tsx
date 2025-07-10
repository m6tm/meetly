'use client';

import React, { useCallback, useEffect, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreHorizontal, PlusCircle, Trash2, Edit3, Video, Loader2, FileText } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { format, parseISO, parse } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { cancelMeetingAction, fetchMeetingsAction, MeetingsResponse } from '@/actions/meetly-manager';
import { useRouter } from 'next/navigation';
import ScheduleMeetingModal from '@/components/meetly/schedule-modal';
import { User } from '@supabase/supabase-js';
import { MeetingKind } from '@/generated/prisma';


// Define the Meeting type (can be moved to a types file if used elsewhere)
export type Meeting = {
  id: string;
  title: string;
  date: string; // Keep as ISO string for data, format for display
  time: string;
  attendees: string[];
  kind: MeetingKind;
  status: 'Scheduled' | 'Past' | 'Cancelled';
  isRecurring?: boolean; // Add isRecurring to the type
  accessKey?: string;
  code: string;
  user: User;
  hasRecording: boolean;
  original_meet: MeetingsResponse['meetings'][number];
};

// Placeholder data for meetings - use ISO strings for dates
const initialMeetingsData: Meeting[] = [];

export default function MeetingsPage() {
  const [meetings, setMeetings] = React.useState<Meeting[]>(initialMeetingsData);
  const [titleFilter, setTitleFilter] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'all' | Meeting['status']>('all');
  const [typeFilter, setTypeFilter] = React.useState<'all' | Meeting['kind']>('SCHEDULE');

  // State for the Schedule/Edit Meeting Dialog
  const [currentEditingMeeting, setCurrentEditingMeeting] = React.useState<Meeting | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [actionPending, setActionPending] = useState<string | null>(null); // Modified state type
  const { toast } = useToast();
  const router = useRouter()

  const handleFetchMeetings = useCallback(async () => {
    setIsFetching(true)
    const response = await fetchMeetingsAction()
    setIsFetching(false)
    if (!response.success) {
      toast({
        title: "Erreur de récupération",
        description: response.error,
        action: (
          <Button
            variant="outline"
            onClick={handleFetchMeetings}
          >
            Réessayer
          </Button>
        ),
      });
    }
    if (response.success && response.data) {
      const meetFormated: Meeting[] = response.data.meetings.map(meeting => {
        const now = new Date();
        let status: Meeting['status'];
        if (meeting.cancelled) {
          status = 'Cancelled';
        } else if (meeting.date < now) {
          status = 'Past';
        } else {
          status = 'Scheduled';
        }
        return {
          id: meeting.id,
          title: meeting.name,
          date: meeting.date.toISOString(),
          time: meeting.time,
          attendees: meeting.invitees.map(invite => invite.email),
          kind: meeting.kind,
          isRecurring: meeting.isRecurring,
          accessKey: meeting.accessKey ?? undefined,
          status,
          code: meeting.code,
          user: response.data!.user,
          hasRecording: meeting.meetingRecordings.length > 0,
          original_meet: meeting
        };
      })
      setMeetings(meetFormated)
    }
  }, []);

  useEffect(() => {
    if (isFetching) handleFetchMeetings()
  }, []);

  const handleCancel = (meetingId: string) => {
    setActionPending(meetingId) // Pass meetingId
    handleCancelMeeting(meetingId)
  }

  const handleCancelMeeting = async (meetingId: string) => {
    const response = await cancelMeetingAction(meetingId)
    setActionPending(null) // Reset to null
    if (response.success) {
      const fetchResponse = await fetchMeetingsAction(); // Capture the result of the fetch
      if (fetchResponse.success && fetchResponse.data) {
        const meetFormated: Meeting[] = fetchResponse.data.meetings.map(meeting => {
          const now = new Date();
          let status: Meeting['status'];
          if (meeting.cancelled) {
            status = 'Cancelled';
          } else if (meeting.date < now) {
            status = 'Past';
          } else {
            status = 'Scheduled';
          }
          return {
            id: meeting.id,
            title: meeting.name,
            date: meeting.date.toISOString(),
            time: meeting.time,
            attendees: meeting.invitees.map(invite => invite.email),
            isRecurring: meeting.isRecurring,
            accessKey: meeting.accessKey ?? undefined,
            kind: meeting.kind,
            status,
            code: meeting.code,
            user: fetchResponse.data!.user, // Use user from the fetch response
            hasRecording: meeting.meetingRecordings.length > 0,
            original_meet: meeting
          };
        });
        setMeetings(meetFormated); // Update the state with the new data
      } else {
        // Handle case where refetch fails after successful cancellation
        toast({
          title: "Meeting Cancelled, but failed to refresh list",
          description: fetchResponse.error || "An unknown error occurred while refreshing.",
          variant: "destructive"
        });
      }
      toast({
        title: "Meeting Cancelled",
        description: "The meeting has been marked as cancelled.",
      });
      return;
    }
    toast({
      title: "Error occured",
      description: response.error,
      variant: "destructive"
    });
  };

  const handleEditMeetingClick = (meeting: Meeting) => {
    setCurrentEditingMeeting(meeting);
  };

  const handleJoinMeeting = (meetingId: string) => {
    const meeting = meetings.find(meet => meet.id === meetingId)
    if (!meeting) return
    router.push(`/meet/${meeting.code}`)
  };

  const handleTranscribeMeeting = (meetingId: string) => {
    // Placeholder for transcription logic
    toast({ title: "Transcription Started", description: `Transcription process initiated for meeting ${meetingId}` });
  };

  const resetMeets = (newState: Meeting | null, refresh?: boolean) => {
    setCurrentEditingMeeting(newState)
    if (refresh) handleFetchMeetings()
  }

  const columns: ColumnDef<Meeting>[] = React.useMemo(
    () => [
      {
        accessorKey: 'title',
        header: 'Title',
        cell: ({ row }) => <div className="font-medium">{row.getValue('title')}</div>,
      },
      {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ row }) => {
          const dateString = row.getValue('date') as string;
          try {
            if (!dateString) return "N/A";
            return format(parseISO(dateString), 'MM/dd/yyyy');
          } catch (e) {
            console.error("Error formatting date:", dateString, e);
            return dateString; // fallback to raw string on error
          }
        },
      },
      {
        accessorKey: 'time',
        header: 'Time',
        cell: ({ row }) => {
          const timeString = row.getValue('time') as string;
          if (!timeString) return "N/A";
          try {
            // Parse the time string (HH:mm) using an arbitrary reference date
            const referenceDate = new Date(2000, 0, 1); // January 1, 2000
            const parsedTime = parse(timeString, 'HH:mm', referenceDate);
            return format(parsedTime, 'h:mm a'); // Format to 12-hour with AM/PM
          } catch (e) {
            console.error("Error formatting time:", timeString, e);
            return timeString; // fallback to raw string on error
          }
        }
      },
      {
        accessorKey: 'attendees',
        header: 'Attendees',
        cell: ({ row }) => {
          const attendees = row.getValue('attendees') as string[];
          if (!attendees || attendees.length === 0) return <span className="text-muted-foreground">None</span>;
          return attendees.length > 2
            ? `${attendees.slice(0, 2).join(', ')} + ${attendees.length - 2} more`
            : attendees.join(', ');
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.getValue('status') as Meeting['status'];
          return (
            <Badge
              variant={
                status === 'Scheduled'
                  ? 'default'
                  : status === 'Past'
                    ? 'secondary'
                    : 'destructive'
              }
            >
              {status}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const meeting = row.original;
          return (
            <div className="text-right">
              {meeting.status === 'Scheduled' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mr-2"
                  onClick={() => handleJoinMeeting(meeting.id)}
                >
                  <Video className="mr-1 h-4 w-4" />
                  Join
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    {actionPending === meeting.original_meet.id ? ( // Check if actionPending matches current meeting ID
                      <Loader2 className='animate-ping' />
                    ) : (
                      <MoreHorizontal className="h-4 w-4" />
                    )}
                    <span className="sr-only">More actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {meeting.status === 'Scheduled' && (
                    <>
                      {(meeting.original_meet.userId === meeting.user.id) && (
                        <DropdownMenuItem
                          onClick={() => handleEditMeetingClick(meeting)}
                          className='cursor-pointer'
                        >
                          <Edit3 className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive cursor-pointer"
                        onClick={() => handleCancel(meeting.original_meet.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Cancel
                      </DropdownMenuItem>
                    </>
                  )}
                  {meeting.status === 'Past' && meeting.hasRecording && (
                    <DropdownMenuItem
                      onClick={() => handleTranscribeMeeting(meeting.id)}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Transcribe Now
                    </DropdownMenuItem>
                  )}
                  {(meeting.status === 'Cancelled' || (meeting.status === 'Past' && !meeting.hasRecording)) && (
                    <DropdownMenuItem disabled>
                      No actions available
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [meetings, actionPending] // Dependencies for useMemo, if any state/props used inside columns definition change
  );

  const filteredMeetings = React.useMemo(() => {
    return meetings
      .filter(meeting =>
        titleFilter ? meeting.title.toLowerCase().includes(titleFilter.toLowerCase()) : true
      )
      .filter(meeting =>
        typeFilter !== 'all' ? meeting.kind === typeFilter : true
      )
      .filter(meeting =>
        statusFilter !== 'all' ? meeting.status === statusFilter : true
      );
  }, [meetings, titleFilter, statusFilter, typeFilter]);

  const resetValues = (_: Meeting | null, refresh?: boolean) => {
    if (refresh) handleFetchMeetings()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Your Meetings
          </h1>
          <p className="text-muted-foreground">
            Manage your scheduled and past meetings.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={() => router.push('/meet')}>
            <PlusCircle className="mr-2 h-5 w-5" />
            New Meeting
          </Button>
          <ScheduleMeetingModal {...{
            resetValues
          }} />
        </div>
        {
          currentEditingMeeting && (
            <ScheduleMeetingModal {...{
              initialValues: {
                id: currentEditingMeeting.original_meet.id,
                name: currentEditingMeeting.original_meet.name,
                date: currentEditingMeeting.original_meet.date,
                time: currentEditingMeeting.original_meet.time,
                invitees: currentEditingMeeting.original_meet.invitees.map(invite => invite.email),
                isRecurring: currentEditingMeeting.original_meet.isRecurring,
                accessKey: currentEditingMeeting.accessKey ?? undefined,
              },
              resetValues: resetMeets,
            }} />
          )
        }
      </div>

      <Card className="shadow-md overflow-x-auto">
        <CardHeader>
          <CardTitle>Meeting List</CardTitle>
          <CardDescription>
            Overview of all your scheduled and past meetings. Apply filters to narrow down your search.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-2 py-4">
            <Input
              placeholder="Filter by title..."
              value={titleFilter}
              onChange={(event) => setTitleFilter(event.target.value)}
              className="max-w-xs w-full sm:w-auto"
            />
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | Meeting['status'])}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="Past">Past</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as 'all' | Meeting['kind'])}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="INSTANT">Instant</SelectItem>
                <SelectItem value="SCHEDULE">Scheduled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DataTable columns={!isFetching ? columns : []} data={filteredMeetings} initialPageSize={5} />
        </CardContent>
      </Card>
    </div>
  );
}
