
'use client';

import React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreHorizontal, PlusCircle, Trash2, Edit3, Video } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { format } from 'date-fns'; // Added import for format

// Define the Meeting type (can be moved to a types file if used elsewhere)
export type Meeting = {
  id: string;
  title: string;
  date: string; // Keep as string to match existing data
  time: string;
  attendees: string[];
  status: 'Scheduled' | 'Past' | 'Cancelled';
};

// Placeholder data for meetings
const initialMeetingsData: Meeting[] = [
  {
    id: 'm1',
    title: 'Project Alpha Kick-off',
    date: '2024-08-15',
    time: '10:00 AM',
    attendees: ['john.doe@example.com', 'jane.smith@example.com'],
    status: 'Scheduled',
  },
  {
    id: 'm2',
    title: 'Weekly Sync - Engineering Team',
    date: '2024-08-19',
    time: '02:30 PM',
    attendees: [
      'bob.builder@example.com',
      'alice.dev@example.com',
      'charlie.qa@example.com',
    ],
    status: 'Scheduled',
  },
  {
    id: 'm3',
    title: 'Marketing Strategy Review',
    date: '2024-08-22',
    time: '11:00 AM',
    attendees: ['diana.prince@example.com', 'clark.kent@example.com'],
    status: 'Past',
  },
  {
    id: 'm4',
    title: 'Client Onboarding - Acme Corp',
    date: '2024-08-25',
    time: '09:00 AM',
    attendees: ['john.doe@example.com', 'client@acme.com'],
    status: 'Cancelled',
  },
   {
    id: 'm5',
    title: 'Q3 Planning Session',
    date: '2024-09-05',
    time: '01:00 PM',
    attendees: ['john.doe@example.com', 'jane.smith@example.com', 'diana.prince@example.com'],
    status: 'Scheduled',
  },
];

export default function MeetingsPage() {
  const [meetings, setMeetings] = React.useState<Meeting[]>(initialMeetingsData);
  const [titleFilter, setTitleFilter] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'all' | Meeting['status']>('all');

  const handleCancelMeeting = (meetingId: string) => {
    console.log('Cancel meeting:', meetingId);
    setMeetings((prevMeetings) =>
      prevMeetings.map((m) =>
        m.id === meetingId ? { ...m, status: 'Cancelled' } : m
      )
    );
  };

  const handleEditMeeting = (meetingId: string) => {
    console.log('Edit meeting:', meetingId);
    // Placeholder: Open an edit modal or navigate to an edit page
  };

  const handleJoinMeeting = (meetingId: string) => {
    console.log('Join meeting:', meetingId);
    // Placeholder: Logic to join the meeting
  };

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
            // Dates in initialMeetingsData are 'YYYY-MM-DD'
            // new Date() will parse this correctly.
            // Format explicitly to 'MM/dd/yyyy' to avoid locale mismatches.
            return format(new Date(dateString), 'MM/dd/yyyy');
          } catch (e) {
            console.error("Error formatting date:", dateString, e);
            return dateString; // Fallback to original string if formatting fails
          }
        },
      },
      {
        accessorKey: 'time',
        header: 'Time',
      },
      {
        accessorKey: 'attendees',
        header: 'Attendees',
        cell: ({ row }) => {
          const attendees = row.getValue('attendees') as string[];
          if (attendees.length === 0) return <span className="text-muted-foreground">None</span>;
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
            <div className="text-right whitespace-nowrap">
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
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">More actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {meeting.status === 'Scheduled' && (
                    <DropdownMenuItem
                      onClick={() => handleEditMeeting(meeting.id)}
                    >
                      <Edit3 className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {meeting.status === 'Scheduled' && (
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => handleCancelMeeting(meeting.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Cancel
                    </DropdownMenuItem>
                  )}
                  {meeting.status !== 'Scheduled' && (
                    <DropdownMenuItem disabled>No actions available</DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [] // Dependencies for memoization (handleCancelMeeting, handleEditMeeting, handleJoinMeeting are stable)
  );

  const filteredMeetings = React.useMemo(() => {
    return meetings
      .filter(meeting =>
        titleFilter ? meeting.title.toLowerCase().includes(titleFilter.toLowerCase()) : true
      )
      .filter(meeting =>
        statusFilter !== 'all' ? meeting.status === statusFilter : true
      );
  }, [meetings, titleFilter, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Your Meetings
          </h1>
          <p className="text-muted-foreground">
            Manage your scheduled and past meetings.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-5 w-5" />
          Schedule New Meeting
        </Button>
      </div>

      <Card className="shadow-md">
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
          </div>
          <DataTable columns={columns} data={filteredMeetings} />
        </CardContent>
      </Card>
    </div>
  );
}
