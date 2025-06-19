
'use client';

import React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreHorizontal, PlayCircle, FileText, Trash2, Loader2, AlertTriangle, CheckCircle, Clock, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { format, parseISO, parse } from 'date-fns';
import { useToast } from "@/hooks/use-toast";

// Define the RecordedMeeting type
export type RecordedMeeting = {
  id: string;
  title: string;
  date: string; // ISO string for data, format for display
  time: string; // HH:mm
  duration: string; // e.g., "45 min"
  recordingStatus: 'Recorded' | 'Transcription Pending' | 'Transcribed' | 'Transcription Failed';
  videoUrl?: string;
};

// Placeholder data for recorded meetings
const initialRecordingsData: RecordedMeeting[] = [
  {
    id: 'rec1',
    title: 'Quarterly Business Review Q3',
    date: '2024-08-10T00:00:00.000Z',
    time: '14:00',
    duration: '1h 32min',
    recordingStatus: 'Transcribed',
    videoUrl: 'https://placehold.co/static/videos/video-placeholder.mp4', // Placeholder video URL
  },
  {
    id: 'rec2',
    title: 'Product Strategy Session',
    date: '2024-08-12T00:00:00.000Z',
    time: '10:30',
    duration: '58min',
    recordingStatus: 'Recorded',
    videoUrl: 'https://placehold.co/static/videos/video-placeholder.mp4',
  },
  {
    id: 'rec3',
    title: 'Engineering Standup - Sprint Planning',
    date: '2024-08-15T00:00:00.000Z',
    time: '09:00',
    duration: '25min',
    recordingStatus: 'Transcription Pending',
  },
  {
    id: 'rec4',
    title: 'Client Call - Acme Corp Follow-up',
    date: '2024-08-16T00:00:00.000Z',
    time: '11:00',
    duration: '45min',
    recordingStatus: 'Transcription Failed',
    videoUrl: 'https://placehold.co/static/videos/video-placeholder.mp4',
  },
  {
    id: 'rec5',
    title: 'Marketing Campaign Brainstorm',
    date: '2024-08-18T00:00:00.000Z',
    time: '15:00',
    duration: '1h 15min',
    recordingStatus: 'Recorded',
  },
];

export default function RecordingsPage() {
  const [recordings, setRecordings] = React.useState<RecordedMeeting[]>(initialRecordingsData);
  const [titleFilter, setTitleFilter] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'all' | RecordedMeeting['recordingStatus']>('all');
  const { toast } = useToast();

  const [isPlayerModalOpen, setIsPlayerModalOpen] = React.useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = React.useState<string | undefined>(undefined);
  const [currentVideoTitle, setCurrentVideoTitle] = React.useState<string>('');


  const handlePlayVideo = (recording: RecordedMeeting) => {
    console.log('Play video:', recording.id, recording.videoUrl);
    if (recording.videoUrl) {
      setCurrentVideoUrl(recording.videoUrl);
      setCurrentVideoTitle(recording.title);
      setIsPlayerModalOpen(true);
    } else {
      toast({ title: "Video Not Available", description: `No video URL found for recording: ${recording.title}`, variant: "destructive" });
    }
  };

  const handleStartTranscription = (recordingId: string) => {
    console.log('Start transcription for:', recordingId);
    setRecordings(prev => 
      prev.map(rec => rec.id === recordingId ? { ...rec, recordingStatus: 'Transcription Pending' } : rec)
    );
    toast({ title: "Transcription Started", description: `Transcription process initiated for recording: ${recordingId}` });
    
    // Simulate transcription process
    setTimeout(() => {
      setRecordings(prev => 
        prev.map(rec => {
          if (rec.id === recordingId) {
            const success = Math.random() > 0.3; // Simulate success/failure
            return { ...rec, recordingStatus: success ? 'Transcribed' : 'Transcription Failed' };
          }
          return rec;
        })
      );
      toast({ title: "Transcription Update", description: `Transcription status updated for recording: ${recordingId}` });
    }, 3000);
  };
  
  const handleDeleteRecording = (recordingId: string) => {
    console.log('Delete recording:', recordingId);
    setRecordings(prev => prev.filter(rec => rec.id !== recordingId));
    toast({ title: "Recording Deleted", description: `Recording ${recordingId} has been removed.`, variant: "destructive" });
  };

  const columns: ColumnDef<RecordedMeeting>[] = React.useMemo(
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
                const referenceDate = new Date(2000, 0, 1);
                const parsedTime = parse(timeString, 'HH:mm', referenceDate);
                return format(parsedTime, 'h:mm a');
            } catch (e) {
                return timeString; 
            }
        }
      },
      {
        accessorKey: 'duration',
        header: 'Duration',
      },
      {
        accessorKey: 'recordingStatus',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.getValue('recordingStatus') as RecordedMeeting['recordingStatus'];
          let icon = null;
          let badgeClasses = "";

          switch (status) {
            case 'Recorded':
              icon = <PlayCircle className="mr-1.5 h-3.5 w-3.5" />;
              badgeClasses = 'bg-blue-500/20 text-blue-700 border-blue-500/30 hover:bg-blue-500/30 dark:bg-blue-700/30 dark:text-blue-300 dark:border-blue-700/40';
              break;
            case 'Transcription Pending':
              icon = <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />;
              badgeClasses = 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30 hover:bg-yellow-500/30 dark:bg-yellow-700/30 dark:text-yellow-300 dark:border-yellow-700/40';
              break;
            case 'Transcribed':
              icon = <CheckCircle className="mr-1.5 h-3.5 w-3.5" />;
              badgeClasses = 'bg-green-500/20 text-green-700 border-green-500/30 hover:bg-green-500/30 dark:bg-green-700/30 dark:text-green-300 dark:border-green-700/40';
              break;
            case 'Transcription Failed':
              icon = <AlertTriangle className="mr-1.5 h-3.5 w-3.5" />;
              badgeClasses = 'bg-red-500/20 text-red-700 border-red-500/30 hover:bg-red-500/30 dark:bg-red-700/30 dark:text-red-300 dark:border-red-700/40';
              break;
            default:
              icon = <Clock className="mr-1.5 h-3.5 w-3.5" />
          }
          return (
            <Badge variant="outline" className={badgeClasses}>
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
          const recording = row.original;
          return (
            <div className="text-right whitespace-nowrap">
              <Button
                variant="outline"
                size="sm"
                className="mr-2"
                onClick={() => handlePlayVideo(recording)}
                disabled={!recording.videoUrl && recording.recordingStatus !== 'Transcription Pending'}
              >
                <PlayCircle className="mr-1 h-4 w-4" />
                Play
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">More actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {recording.recordingStatus === 'Recorded' && (
                    <DropdownMenuItem onClick={() => handleStartTranscription(recording.id)}>
                      <FileText className="mr-2 h-4 w-4" /> Start Transcription
                    </DropdownMenuItem>
                  )}
                  {recording.recordingStatus === 'Transcription Failed' && (
                     <DropdownMenuItem onClick={() => handleStartTranscription(recording.id)}> 
                      <FileText className="mr-2 h-4 w-4" /> Retry Transcription
                    </DropdownMenuItem>
                  )}
                  {recording.recordingStatus === 'Transcribed' && (
                     <DropdownMenuItem onClick={() => toast({ title: "View Transcription", description: "Navigating to transcription details (simulated)." })}>
                      <FileText className="mr-2 h-4 w-4" /> View Transcription
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => handleDeleteRecording(recording.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Recording
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [] 
  );

  const filteredRecordings = React.useMemo(() => {
    return recordings
      .filter(rec =>
        titleFilter ? rec.title.toLowerCase().includes(titleFilter.toLowerCase()) : true
      )
      .filter(rec =>
        statusFilter !== 'all' ? rec.recordingStatus === statusFilter : true
      );
  }, [recordings, titleFilter, statusFilter]);


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Meeting Recordings
        </h1>
        <p className="text-muted-foreground">
          Access and manage your recorded meetings and their transcriptions.
        </p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Recording List</CardTitle>
          <CardDescription>
            Overview of all your meeting recordings.
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
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | RecordedMeeting['recordingStatus'])}>
              <SelectTrigger className="w-full sm:w-[220px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Recorded">Recorded</SelectItem>
                <SelectItem value="Transcription Pending">Transcription Pending</SelectItem>
                <SelectItem value="Transcribed">Transcribed</SelectItem>
                <SelectItem value="Transcription Failed">Transcription Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DataTable columns={columns} data={filteredRecordings} initialPageSize={5} />
        </CardContent>
      </Card>

      <Dialog open={isPlayerModalOpen} onOpenChange={setIsPlayerModalOpen}>
        <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl p-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="flex items-center">
              <PlayCircle className="mr-2 h-6 w-6 text-primary" />
              Playing: {currentVideoTitle}
            </DialogTitle>
            <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
            </DialogClose>
          </DialogHeader>
          <div className="p-4 bg-muted/30">
            {currentVideoUrl ? (
              <video
                src={currentVideoUrl}
                controls
                autoPlay
                className="w-full aspect-video rounded-md shadow-md"
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <p className="text-muted-foreground text-center py-10">No video to display.</p>
            )}
          </div>
          <DialogFooter className="p-4 border-t">
            <Button variant="outline" onClick={() => setIsPlayerModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

