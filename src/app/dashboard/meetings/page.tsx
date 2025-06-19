
'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MoreHorizontal, PlusCircle, Trash2, Edit3, Video } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

// Placeholder data for meetings
const meetingsData = [
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
];

export default function MeetingsPage() {
  const [meetings, setMeetings] = React.useState(meetingsData);

  const handleCancelMeeting = (meetingId: string) => {
    console.log('Cancel meeting:', meetingId);
    // Placeholder: Update meeting status to "Cancelled"
    setMeetings((prevMeetings) =>
      prevMeetings.map((m) =>
        m.id === meetingId ? { ...m, status: 'Cancelled' } : m
      )
    );
    // In a real app, you'd call an API here
  };

  const handleEditMeeting = (meetingId: string) => {
    console.log('Edit meeting:', meetingId);
    // Placeholder: Open an edit modal or navigate to an edit page
  };

  const handleJoinMeeting = (meetingId: string) => {
    console.log('Join meeting:', meetingId);
    // Placeholder: Logic to join the meeting
  };

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
            Overview of all your scheduled and past meetings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="hidden md:table-cell">Attendees</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {meetings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No meetings found.
                  </TableCell>
                </TableRow>
              ) : (
                meetings.map((meeting) => (
                  <TableRow key={meeting.id}>
                    <TableCell className="font-medium">{meeting.title}</TableCell>
                    <TableCell>{new Date(meeting.date).toLocaleDateString()}</TableCell>
                    <TableCell>{meeting.time}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {meeting.attendees.length > 2
                        ? `${meeting.attendees.slice(0, 2).join(', ')} + ${meeting.attendees.length - 2} more`
                        : meeting.attendees.join(', ')}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          meeting.status === 'Scheduled'
                            ? 'default'
                            : meeting.status === 'Past'
                              ? 'secondary'
                              : 'destructive'
                        }
                      >
                        {meeting.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
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
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
