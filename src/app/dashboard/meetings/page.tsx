
'use client';

import React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreHorizontal, PlusCircle, Trash2, Edit3, Video, CalendarPlus, Users, Repeat, CalendarIcon, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";


// Define the Meeting type (can be moved to a types file if used elsewhere)
export type Meeting = {
  id: string;
  title: string;
  date: string;
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
  {
    id: 'm6',
    title: 'Product Roadmap Discussion',
    date: '2024-09-10',
    time: '03:00 PM',
    attendees: ['lead.dev@example.com', 'product.manager@example.com'],
    status: 'Scheduled',
  },
  {
    id: 'm7',
    title: 'Sprint Retrospective',
    date: '2024-09-12',
    time: '10:30 AM',
    attendees: ['scrum.master@example.com', 'dev.team@example.com'],
    status: 'Past',
  },
  {
    id: 'm8',
    title: 'Budget Review Q4',
    date: '2024-09-15',
    time: '11:00 AM',
    attendees: ['finance.dept@example.com', 'ceo@example.com'],
    status: 'Scheduled',
  },
  {
    id: 'm9',
    title: 'User Feedback Session',
    date: '2024-09-18',
    time: '02:00 PM',
    attendees: ['ux.researcher@example.com', 'customer.support@example.com'],
    status: 'Scheduled',
  },
  {
    id: 'm10',
    title: 'Holiday Party Planning',
    date: '2024-09-20',
    time: '04:00 PM',
    attendees: ['hr.dept@example.com', 'social.committee@example.com'],
    status: 'Cancelled',
  },
];

export default function MeetingsPage() {
  const [meetings, setMeetings] = React.useState<Meeting[]>(initialMeetingsData);
  const [titleFilter, setTitleFilter] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'all' | Meeting['status']>('all');

  // State for the Schedule Meeting Dialog
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
    console.log("Scheduling Meeting from MeetingsPage with details:", {
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
    // Optionally add the new meeting to the meetings list:
    // const newMeeting: Meeting = { ... };
    // setMeetings(prev => [newMeeting, ...prev]);
    // resetForm(); // Reset form fields if needed
  };

  const handleOpenDialog = (open: boolean) => {
    if (open) {
      resetForm(); // Reset form when dialog opens
    }
    setIsDialogOpen(open);
  }

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
            return format(new Date(dateString), 'MM/dd/yyyy');
          } catch (e) {
            console.error("Error formatting date:", dateString, e);
            return dateString;
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
    []
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
        <Dialog open={isDialogOpen} onOpenChange={handleOpenDialog}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-5 w-5" />
              Schedule New Meeting
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
                <Label htmlFor="meeting-name-meetingspage" className="text-right">
                  Name
                </Label>
                <Input
                  id="meeting-name-meetingspage"
                  value={meetingName}
                  onChange={(e) => setMeetingName(e.target.value)}
                  placeholder="Project Kick-off"
                  className="col-span-3"
                  disabled={isLoading}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="meeting-date-trigger-meetingspage" className="text-right">
                  Date
                </Label>
                <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="meeting-date-trigger-meetingspage"
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
                <Label htmlFor="meeting-time-meetingspage" className="text-right">
                  Time
                </Label>
                <Input
                  id="meeting-time-meetingspage"
                  type="time"
                  value={meetingTime}
                  onChange={(e) => setMeetingTime(e.target.value)}
                  className="col-span-3"
                  disabled={isLoading}
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="invitees-meetingspage" className="text-right pt-2">
                  <Users className="inline-block h-4 w-4 mr-1" />
                  Invitees
                </Label>
                <Textarea
                  id="invitees-meetingspage"
                  value={invitees}
                  onChange={(e) => setInvitees(e.target.value)}
                  placeholder="Enter email addresses, separated by commas or new lines"
                  className="col-span-3 min-h-[80px]"
                  disabled={isLoading}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="recurring-meetingspage" className="text-right col-start-1 col-span-1 flex items-center justify-end">
                  <Repeat className="inline-block h-4 w-4 mr-1" />
                  Recurring
                </Label>
                <div className="col-span-3 flex items-center space-x-2">
                   <Checkbox
                    id="recurring-meetingspage"
                    checked={isRecurring}
                    onCheckedChange={(checked) => setIsRecurring(checked as boolean)}
                    disabled={isLoading}
                  />
                  <Label htmlFor="recurring-meetingspage" className="text-sm font-normal text-muted-foreground">
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
          <DataTable columns={columns} data={filteredMeetings} initialPageSize={5} />
        </CardContent>
      </Card>
    </div>
  );
}
