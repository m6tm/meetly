
'use client';

import React from 'react';
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
  // New detailed fields:
  fullTranscription?: string;
  summary?: string;
  keyDiscussionPoints?: string;
  decisionsMade?: string;
  actionItems?: string;
  objectives?: string;
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
    fullTranscription: `Alice: Good morning, team. Let's dive into the Q3 review for Project Alpha. Bob, can you start with the frontend progress?
Bob: Sure, Alice. We've completed the user authentication module and the dashboard redesign. User feedback on the new UI has been largely positive. We're on track with the timeline. Some minor bugs reported are being addressed.
Alice: Excellent. Charlie, how about the backend?
Charlie: Backend development is 95% complete. All core APIs are deployed and stable. We had a slight delay with the third-party payment gateway integration due to their API update, but we've caught up. Performance metrics are looking good.
Alice: Great to hear. Diana, marketing updates?
Diana: Marketing campaigns for Q3 exceeded targets by 15%. Lead generation is strong. We're preparing the launch campaign for Project Alpha's beta release. Content strategy is finalized.
Alice: Fantastic work, Diana. Key decisions from this meeting: 1. Frontend team to prioritize bug fixes identified this week. 2. Backend to conduct final stress tests before beta. 3. Marketing to finalize beta launch communication plan by end of next week.
Bob: Understood.
Charlie: Will do.
Diana: Sounds good.
Alice: Any other points? (Silence) Okay, let's wrap up. Good progress everyone. Objectives for Q4 will be to successfully launch beta, gather user feedback, and iterate quickly. Action items are clear. Thanks all.`,
    summary: "The Project Alpha Q3 review meeting confirmed significant progress across frontend, backend, and marketing. Frontend completed major UI updates with positive feedback. Backend is nearly finished, overcoming a slight delay. Marketing exceeded Q3 targets and is readying the beta launch campaign. Key decisions involved prioritizing bug fixes, final backend testing, and finalizing launch communication. Q4 objectives focus on beta launch and iteration.",
    keyDiscussionPoints: "- Frontend: User authentication and dashboard redesign complete, positive feedback.\n- Backend: 95% complete, payment gateway integration issues resolved, good performance.\n- Marketing: Q3 targets exceeded, beta launch campaign preparation underway.",
    decisionsMade: "- Frontend to prioritize current bug fixes.\n- Backend to conduct final stress tests.\n- Marketing to finalize beta launch communication plan next week.",
    actionItems: "- Bob's team: Address all reported minor bugs by end of week.\n- Charlie's team: Perform comprehensive stress testing by Wednesday.\n- Diana's team: Submit final beta launch communication plan by Friday week.",
    objectives: "Review Q3 progress for Project Alpha, align on current status, and ensure readiness for the upcoming beta launch. Define immediate next steps for each department.",
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
    fullTranscription: "Sales strategy meeting full text...",
  },
   {
    id: 'tm6',
    title: 'Product Feedback Call',
    date: '2024-08-20T00:00:00.000Z',
    time: '13:00',
    transcriptionStatus: 'Completed',
    summaryAvailable: true,
    fullTranscription: "Full transcript of product feedback call...",
    summary: "Summary of product feedback.",
    keyDiscussionPoints: "- Feature X feedback\n- UI concerns",
    decisionsMade: "- Log UI concerns for design review.",
    actionItems: "- PM to create tickets for feedback.",
    objectives: "Gather user feedback on new features.",
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

  const [isDetailsModalOpen, setIsDetailsModalOpen] = React.useState(false);
  const [selectedMeetingDetails, setSelectedMeetingDetails] = React.useState<TranscribedMeeting | null>(null);

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

  const handleRetryTranscription = (meetingId: string) => {
    console.log('Retry transcription for meeting:', meetingId);
    setTranscribedMeetings(prevMeetings =>
      prevMeetings.map(m =>
        m.id === meetingId ? { ...m, transcriptionStatus: 'Processing' } : m
      )
    );
    toast({ title: "Retrying Transcription", description: `Transcription process re-initiated for meeting ${meetingId}` });
    setTimeout(() => {
        setTranscribedMeetings(prevMeetings =>
            prevMeetings.map(m =>
              m.id === meetingId ? { ...m, transcriptionStatus: Math.random() > 0.3 ? 'Completed' : 'Failed', summaryAvailable: m.id === meetingId && Math.random() > 0.3 ? true : m.summaryAvailable } : m
            )
          );
        toast({title: "Transcription Status Updated", description: `Meeting ${meetingId} status updated.`});
    }, 2000);
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
                const [hours, minutes] = timeString.split(':');
                const date = new Date(0); // Use a fixed base date
                date.setUTCHours(parseInt(hours, 10));
                date.setUTCMinutes(parseInt(minutes, 10));
                return format(date, 'h:mm a'); // Format to 12-hour with AM/PM
            } catch (e) {
                console.error("Error formatting time:", timeString, e);
                return timeString;
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
                  {format(parseISO(`1970-01-01T${selectedMeetingDetails.time}:00Z`), 'p')}
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
                            <p className="text-sm bg-background p-2 rounded-md">{selectedMeetingDetails.summary}</p>
                          </div>
                        )}
                        {selectedMeetingDetails.objectives && (
                          <div>
                            <h4 className="font-semibold text-primary mb-1 flex items-center"><TargetIcon className="mr-2 h-4 w-4" />Objectives:</h4> {/* Assuming TargetIcon */}
                            <p className="text-sm bg-background p-2 rounded-md">{selectedMeetingDetails.objectives}</p>
                          </div>
                        )}
                        {selectedMeetingDetails.keyDiscussionPoints && (
                          <div>
                            <h4 className="font-semibold text-primary mb-1 flex items-center"><Disc className="mr-2 h-4 w-4" />Key Discussion Points:</h4>
                            <p className="text-sm whitespace-pre-wrap bg-background p-2 rounded-md">{selectedMeetingDetails.keyDiscussionPoints}</p>
                          </div>
                        )}
                        {selectedMeetingDetails.decisionsMade && (
                          <div>
                            <h4 className="font-semibold text-primary mb-1 flex items-center"><CheckCircle className="mr-2 h-4 w-4" />Decisions Made:</h4>
                            <p className="text-sm whitespace-pre-wrap bg-background p-2 rounded-md">{selectedMeetingDetails.decisionsMade}</p>
                          </div>
                        )}
                        {selectedMeetingDetails.actionItems && (
                          <div>
                            <h4 className="font-semibold text-primary mb-1 flex items-center"><ListOrdered className="mr-2 h-4 w-4" />Action Items:</h4>
                            <p className="text-sm whitespace-pre-wrap bg-background p-2 rounded-md">{selectedMeetingDetails.actionItems}</p>
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
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v1.13a1 1 0 0 0 .8.98C15.62 7.11 17.5 9.63 17.5 12.5c0 3.15-2.5 5.5-5.5 5.5S6.5 15.65 6.5 12.5c0-2.88 1.88-5.39 4.7-5.89a1 1 0 0 0 .8-.98V4.5A2.5 2.5 0 0 1 12 2a2.5 2.5 0 0 1 2.5-2.5M12.5 18a3.5 3.5 0 0 1-3.5-3.5c0-.5.44-1.15.66-1.4a6.5 6.5 0 0 0 5.68 0c.22.25.66.9.66 1.4a3.5 3.5 0 0 1-3.5 3.5Z"/><path d="M4.5 12.5c0-3.15 2.5-5.5 5.5-5.5M14 18.5c-1.5 0-2.5-.5-2.5-1.5a2.49 2.49 0 0 1 .37-1.3"/><path d="M10 18.5c1.5 0 2.5-.5 2.5-1.5a2.49 2.49 0 0 0-.37-1.3"/><path d="M19.5 12.5c0-3.15-2.5-5.5-5.5-5.5"/>
  </svg>
);

const TargetIcon = (props: React.SVGProps<SVGSVGElement>) => (
 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
);

