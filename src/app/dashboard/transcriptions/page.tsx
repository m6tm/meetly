
'use client';

import React, { useEffect, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MoreHorizontal, Eye, AlertTriangle, RefreshCcw, Loader2, FileText, Printer, FileDown, Mail, ScrollText, ClipboardList, Disc, CheckCircle, ListOrdered } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { format, parseISO, parse } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from 'next/navigation';
import { fetchRecordingsAction } from '@/actions/meetly-manager';
import { formatToHumanReadable } from '@/lib/meetly-tools';
import { useRealtimeUpdates } from '@/hooks/use-realtime-update';
import { startTranscriptionAction } from '@/actions/meetly-meet-manager';

// Define the TranscribedMeeting type
export type TranscribedMeeting = {
  id: string;
  title: string;
  date: string; // ISO string for data, format for display
  time: string;
  transcriptionStatus: 'Pending' | 'Completed' | 'Failed' | 'Processing' | 'Deleted';
  summaryAvailable?: boolean;
  fullTranscription?: string | null;
  summary?: string;
};

export default function TranscriptionsPage() {
  const [transcribedMeetings, setTranscribedMeetings] = React.useState<TranscribedMeeting[]>([]);
  const [titleFilter, setTitleFilter] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'all' | TranscribedMeeting['transcriptionStatus']>('all');
  const { toast } = useToast();
  const params = useSearchParams();
  const recordingId = params.get('rec');

  const [isDetailsModalOpen, setIsDetailsModalOpen] = React.useState(false);
  const [selectedMeetingDetails, setSelectedMeetingDetails] = React.useState<TranscribedMeeting | null>(null);
  const [loading, setLoading] = useState(true)

  const handleFetchRecordings = React.useCallback(async () => {
    setLoading(true)
    const response = await fetchRecordingsAction();
    if (response.success && response.data) {
      const formattedRecordings = response.data.recordings.map(rec => {
        let transcriptionStatus: TranscribedMeeting['transcriptionStatus'] = 'Pending';

        if (rec.transcription_status === 'TRANSCRIPTION_PENDING') {
          transcriptionStatus = 'Pending';
        } else if (rec.transcription_status === 'TRANSCRIPTION_IN_PROGRESS') {
          transcriptionStatus = 'Processing';
        } else if (rec.transcription_status === 'TRANSCRIPTION_COMPLETED') {
          transcriptionStatus = 'Completed';
        } else if (rec.transcription_status === 'TRANSCRIPTION_FAILLED') {
          transcriptionStatus = 'Failed';
        }

        if (rec.deleted) {
          transcriptionStatus = 'Deleted';
        }

        return {
          id: rec.id,
          title: rec.meeting.name,
          date: rec.recordDate.toISOString(),
          time: format(rec.recordDate, 'HH:mm'),
          filepath: rec.meetingRecordingPath?.filepath,
          duration: formatToHumanReadable(Number(rec.meetingRecordingPath!.duration)),
          transcriptionStatus: transcriptionStatus,
          summaryAvailable: !!rec.summary,
          fullTranscription: rec.transcription,
          summary: rec.summary ?? undefined,
        };
      });
      setTranscribedMeetings(formattedRecordings);
    } else if (!response.success) {
      toast({ title: "Error fetching recordings", description: response.error, variant: "destructive" });
    }
    setLoading(false)
  }, [toast]);

  useRealtimeUpdates({
    channel: 'meeting-recording',
    table: 'meeting_recording',
    schema: 'meeting',
    event: 'UPDATE',
    callback: (payload) => {
      handleFetchRecordings();
    },
  }, []);

  useEffect(() => {
    handleFetchRecordings();
  }, []);

  const handleViewDetails = (meeting: TranscribedMeeting) => {
    if (meeting.transcriptionStatus === 'Completed') {
      setSelectedMeetingDetails(meeting);
      setIsDetailsModalOpen(true);
    } else {
      toast({
        title: "Transcription Not Ready",
        description: "Details are only available for completed transcriptions.",
        variant: "default" // Using default as it's informational rather than a system error
      });
    }
  };

  const handleRetryTranscription = async (meetingId: string, meetingTitle: string) => {
    setTranscribedMeetings(prevMeetings =>
      prevMeetings.map(m =>
        m.id === meetingId ? { ...m, transcriptionStatus: 'Processing' } : m
      )
    );
    toast({ title: "Retrying Transcription", description: `Transcription process re-initiated for meeting ${meetingTitle}` });
    const response = await startTranscriptionAction(meetingId)
    if (!response.success) {
      toast({ title: "Error starting transcription", description: response.error, variant: "destructive" });
      return
    }
  };

  const handleTranscription = async (meetingId: string, meetingTitle: string) => {
    setTranscribedMeetings(prevMeetings =>
      prevMeetings.map(m =>
        m.id === meetingId ? { ...m, transcriptionStatus: 'Processing' } : m
      )
    );
    toast({ title: "Transcribing", description: `Transcription process started for meeting ${meetingTitle}` });
    const response = await startTranscriptionAction(meetingId)
    if (!response.success) {
      toast({ title: "Error starting transcription", description: response.error, variant: "destructive" });
      return
    }
  };

  const handleExportPDF = () => {
    if (!selectedMeetingDetails) return;
    toast({ title: "Export PDF", description: `Preparing PDF for "${selectedMeetingDetails.title}" (simulated).` });
  };

  const handleExportMarkdown = () => {
    if (!selectedMeetingDetails) return;
    toast({ title: "Export Markdown", description: `Preparing Markdown for "${selectedMeetingDetails.title}" (simulated).` });
  };

  const handleSendEmail = () => {
    if (!selectedMeetingDetails) return;
    toast({ title: "Send by Email", description: `Preparing email for "${selectedMeetingDetails.title}" (simulated).` });
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
        accessorKey: 'transcriptionStatus',
        header: 'Transcription Status',
        cell: ({ row }) => {
          const status = row.getValue('transcriptionStatus') as TranscribedMeeting['transcriptionStatus'];
          let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default';
          let icon = null;
          let badgeClasses = "";

          switch (status) {
            case 'Completed':
              variant = 'default';
              badgeClasses = 'bg-green-500/20 text-green-700 border-green-500/30 hover:bg-green-500/30 dark:bg-green-700/30 dark:text-green-300 dark:border-green-700/40';
              icon = <FileText className="mr-1.5 h-3.5 w-3.5" />;
              break;
            case 'Pending':
              variant = 'secondary';
              badgeClasses = 'bg-blue-500/20 text-blue-700 border-blue-500/30 hover:bg-blue-500/30 dark:bg-blue-700/30 dark:text-blue-300 dark:border-blue-700/40';
              icon = <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />;
              break;
            case 'Failed':
              variant = 'destructive';
              badgeClasses = 'bg-red-500/20 text-red-700 border-red-500/30 hover:bg-red-500/30 dark:bg-red-700/30 dark:text-red-300 dark:border-red-700/40';
              icon = <AlertTriangle className="mr-1.5 h-3.5 w-3.5" />;
              break;
            case 'Processing':
              variant = 'outline';
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
                  onClick={() => handleViewDetails(meeting)}
                >
                  <Eye className="mr-1 h-4 w-4" />
                  View Details
                </Button>
              )}
              {meeting.transcriptionStatus === 'Failed' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRetryTranscription(meeting.id, meeting.title)}
                >
                  <RefreshCcw className="mr-1 h-4 w-4" />
                  Retry
                </Button>
              )}
              {meeting.transcriptionStatus === 'Pending' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTranscription(meeting.id, meeting.title)}>
                  Transcribe
                </Button>
              )}
              {meeting.transcriptionStatus === 'Processing' && (
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
          <DataTable columns={columns} data={filteredData} initialPageSize={5} loading={loading} />
        </CardContent>
      </Card>

      {selectedMeetingDetails && (
        <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
          <DialogContent className="h-screen w-screen max-w-none sm:max-w-none rounded-none flex flex-col p-0">
            <DialogHeader className="p-4 border-b flex-shrink-0">
              <DialogTitle className="flex items-center text-xl">
                <ScrollText className="mr-3 h-7 w-7 text-primary" />
                Transcription: {selectedMeetingDetails.title}
              </DialogTitle>
              {selectedMeetingDetails.date && selectedMeetingDetails.time && (
                <DialogDescription>
                  Meeting Date: {format(parseISO(selectedMeetingDetails.date), 'PPP')}
                  {' at '}
                  { /* Ensure time is also formatted consistently if it comes from data */}
                  {(() => {
                    try {
                      const referenceDate = new Date(2000, 0, 1);
                      const parsedTime = parse(selectedMeetingDetails.time, 'HH:mm', referenceDate);
                      return format(parsedTime, 'p');
                    } catch {
                      return selectedMeetingDetails.time; // fallback
                    }
                  })()}
                </DialogDescription>
              )}
            </DialogHeader>

            <ScrollArea className="flex-grow p-6 bg-muted/30">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center"><FileText className="mr-2 h-5 w-5" />Full Transcription</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[calc(100vh-280px)] lg:h-[calc(100vh-240px)]"> {/* Adjust height as needed */}
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {selectedMeetingDetails.fullTranscription || "No full transcription available."}
                      </p>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-1 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center"><BrainIcon className="mr-2 h-5 w-5" />AI Summary & Insights</CardTitle> {/* Assuming BrainIcon or similar */}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedMeetingDetails.summaryAvailable ? (
                      <>
                        {selectedMeetingDetails.summary && (
                          <div>
                            <h4 className="font-semibold text-primary mb-1 flex items-center"><ClipboardList className="mr-2 h-4 w-4" />Summary:</h4>
                            <p className="text-sm">{selectedMeetingDetails.summary}</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">AI summary is not available for this meeting.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>

            <DialogFooter className="p-4 border-t flex-shrink-0 bg-background flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2">
              <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)} className="w-full sm:w-auto">Close</Button>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button onClick={handleExportPDF} className="w-full sm:w-auto"><Printer className="mr-2 h-4 w-4" />Export PDF</Button>
                <Button onClick={handleExportMarkdown} className="w-full sm:w-auto"><FileDown className="mr-2 h-4 w-4" />Export Markdown</Button>
                <Button onClick={handleSendEmail} className="w-full sm:w-auto"><Mail className="mr-2 h-4 w-4" />Send by Email</Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Helper icons (can be moved to a separate file if they grow)
const BrainIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v1.13a1 1 0 0 0 .8.98C15.62 7.11 17.5 9.63 17.5 12.5c0 3.15-2.5 5.5-5.5 5.5S6.5 15.65 6.5 12.5c0-2.88 1.88-5.39 4.7-5.89a1 1 0 0 0 .8-.98V4.5A2.5 2.5 0 0 1 12 2a2.5 2.5 0 0 1 2.5-2.5M12.5 18a3.5 3.5 0 0 1-3.5-3.5c0-.5.44-1.15.66-1.4a6.5 6.5 0 0 0 5.68 0c.22.25.66.9.66 1.4a3.5 3.5 0 0 1-3.5 3.5Z" /><path d="M4.5 12.5c0-3.15 2.5-5.5 5.5-5.5M14 18.5c-1.5 0-2.5-.5-2.5-1.5a2.49 2.49 0 0 1 .37-1.3" /><path d="M10 18.5c1.5 0 2.5-.5 2.5-1.5a2.49 2.49 0 0 0-.37-1.3" /><path d="M19.5 12.5c0-3.15-2.5-5.5-5.5-5.5" />
  </svg>
);

const TargetIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
  </svg>
);
