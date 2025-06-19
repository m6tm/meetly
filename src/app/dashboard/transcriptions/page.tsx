
'use client';

import React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreHorizontal, Eye, AlertTriangle, RefreshCcw, Loader2, FileText } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { format, parseISO } from 'date-fns';
import { useToast } from "@/hooks/use-toast";

// Define the TranscribedMeeting type
export type TranscribedMeeting = {
  id: string;
  title: string;
  date: string; // ISO string for data, format for display
  time: string;
  transcriptionStatus: 'Pending' | 'Completed' | 'Failed' | 'Processing';
  summaryAvailable?: boolean;
};

// Placeholder data for transcribed meetings
const initialTranscribedMeetingsData: TranscribedMeeting[] = [
  {
    id: 'tm1',
    title: 'Project Alpha Review Q3',
    date: '2024-08-10T00:00:00.000Z',
    time: '14:00',
    transcriptionStatus: 'Completed',
    summaryAvailable: true,
  },
  {
    id: 'tm2',
    title: 'Client Onboarding - New Horizons',
    date: '2024-08-12T00:00:00.000Z',
    time: '10:30',
    transcriptionStatus: 'Pending',
  },
  {
    id: 'tm3',
    title: 'Engineering All-Hands',
    date: '2024-08-05T00:00:00.000Z',
    time: '16:00',
    transcriptionStatus: 'Failed',
  },
  {
    id: 'tm4',
    title: 'Marketing Brainstorm Session',
    date: '2024-08-15T00:00:00.000Z',
    time: '11:00',
    transcriptionStatus: 'Processing',
  },
  {
    id: 'tm5',
    title: 'Sales Strategy Meeting',
    date: '2024-08-18T00:00:00.000Z',
    time: '09:00',
    transcriptionStatus: 'Completed',
    summaryAvailable: false, // Example where summary might not be ready or applicable
  },
   {
    id: 'tm6',
    title: 'Product Feedback Call',
    date: '2024-08-20T00:00:00.000Z',
    time: '13:00',
    transcriptionStatus: 'Completed',
    summaryAvailable: true,
  },
  {
    id: 'tm7',
    title: 'UX Research Sync',
    date: '2024-08-22T00:00:00.000Z',
    time: '15:00',
    transcriptionStatus: 'Pending',
  },
];

export default function TranscriptionsPage() {
  const [transcribedMeetings, setTranscribedMeetings] = React.useState<TranscribedMeeting[]>(initialTranscribedMeetingsData);
  const [titleFilter, setTitleFilter] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'all' | TranscribedMeeting['transcriptionStatus']>('all');
  const { toast } = useToast();

  const handleViewDetails = (meetingId: string) => {
    console.log('View details for meeting:', meetingId);
    // Placeholder: Logic to navigate to a details page or show a modal
    toast({ title: "Loading Details", description: `Fetching transcription details for meeting ${meetingId}` });
  };

  const handleRetryTranscription = (meetingId: string) => {
    console.log('Retry transcription for meeting:', meetingId);
    // Placeholder: Logic to retry transcription
    setTranscribedMeetings(prevMeetings =>
      prevMeetings.map(m =>
        m.id === meetingId ? { ...m, transcriptionStatus: 'Processing' } : m
      )
    );
    toast({ title: "Retrying Transcription", description: `Transcription process re-initiated for meeting ${meetingId}` });
    // Simulate processing then success/failure
    setTimeout(() => {
        setTranscribedMeetings(prevMeetings =>
            prevMeetings.map(m =>
              m.id === meetingId ? { ...m, transcriptionStatus: Math.random() > 0.3 ? 'Completed' : 'Failed' } : m
            )
          );
        toast({title: "Transcription Status Updated", description: `Meeting ${meetingId} status updated.`});
    }, 2000);
  };

  const columns: ColumnDef<TranscribedMeeting>[] = React.useMemo(
    () => [
      {
        accessorKey: 'title',
        header: 'Meeting Title',
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
            return dateString;
          }
        },
      },
      {
        accessorKey: 'time',
        header: 'Time',
        cell: ({ row }) => {
            const timeString = row.getValue('time') as string;
            if (!timeString) return "N/A";
            const [hours, minutes] = timeString.split(':');
            const date = new Date();
            date.setHours(parseInt(hours, 10));
            date.setMinutes(parseInt(minutes, 10));
            return format(date, 'h:mm a');
        }
      },
      {
        accessorKey: 'transcriptionStatus',
        header: 'Transcription Status',
        cell: ({ row }) => {
          const status = row.getValue('transcriptionStatus') as TranscribedMeeting['transcriptionStatus'];
          let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default';
          let icon = null;
          let badgeClasses = "";

          switch (status) {
            case 'Completed':
              variant = 'default'; // Greenish
              badgeClasses = 'bg-green-500/20 text-green-700 border-green-500/30 hover:bg-green-500/30 dark:bg-green-700/30 dark:text-green-300 dark:border-green-700/40';
              icon = <FileText className="mr-1.5 h-3.5 w-3.5" />;
              break;
            case 'Pending':
              variant = 'secondary'; // Bluish
              badgeClasses = 'bg-blue-500/20 text-blue-700 border-blue-500/30 hover:bg-blue-500/30 dark:bg-blue-700/30 dark:text-blue-300 dark:border-blue-700/40';
              icon = <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />;
              break;
            case 'Failed':
              variant = 'destructive'; // Reddish
              badgeClasses = 'bg-red-500/20 text-red-700 border-red-500/30 hover:bg-red-500/30 dark:bg-red-700/30 dark:text-red-300 dark:border-red-700/40';
              icon = <AlertTriangle className="mr-1.5 h-3.5 w-3.5" />;
              break;
            case 'Processing':
              variant = 'outline'; // Yellowish/Orangeish
              badgeClasses = 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30 hover:bg-yellow-500/30 dark:bg-yellow-700/30 dark:text-yellow-300 dark:border-yellow-700/40';
              icon = <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />;
              break;
          }
          return (
            <Badge variant={variant} className={badgeClasses}>
              {icon}
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
              {meeting.transcriptionStatus === 'Completed' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewDetails(meeting.id)}
                >
                  <Eye className="mr-1 h-4 w-4" />
                  View Details
                </Button>
              )}
              {meeting.transcriptionStatus === 'Failed' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRetryTranscription(meeting.id)}
                >
                  <RefreshCcw className="mr-1 h-4 w-4" />
                  Retry
                </Button>
              )}
              {(meeting.transcriptionStatus === 'Pending' || meeting.transcriptionStatus === 'Processing') && (
                 <Button variant="ghost" size="sm" disabled>
                   {meeting.transcriptionStatus}...
                 </Button>
              )}
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [transcribedMeetings]
  );

  const filteredData = React.useMemo(() => {
    return transcribedMeetings
      .filter(meeting =>
        titleFilter ? meeting.title.toLowerCase().includes(titleFilter.toLowerCase()) : true
      )
      .filter(meeting =>
        statusFilter !== 'all' ? meeting.transcriptionStatus === statusFilter : true
      );
  }, [transcribedMeetings, titleFilter, statusFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Meeting Transcriptions
        </h1>
        <p className="text-muted-foreground">
          Track the status of your meeting transcriptions.
        </p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Transcription Queue</CardTitle>
          <CardDescription>
            Overview of all meetings submitted for transcription.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-2 py-4">
            <Input
              placeholder="Filter by meeting title..."
              value={titleFilter}
              onChange={(event) => setTitleFilter(event.target.value)}
              className="max-w-xs w-full sm:w-auto"
            />
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | TranscribedMeeting['transcriptionStatus'])}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Processing">Processing</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DataTable columns={columns} data={filteredData} initialPageSize={5} />
        </CardContent>
      </Card>
    </div>
  );
}
